/**
 * Founder bypass route — temporary, for testing while real email provider is wired.
 * Visit:
 *   https://chatter.today/auth/bypass?email=YOUR_EMAIL&s=BYPASS_SECRET
 * The route generates a server-side session for that email + redirects to onboarding.
 *
 * This bypasses Supabase email entirely — no rate limit, no spam folder.
 * Disable in production (delete this file) once Resend SMTP is wired.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BYPASS_SECRET = process.env.BYPASS_SECRET ?? "chatter-2026-04-28-temp";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  const secret = url.searchParams.get("s");

  if (secret !== BYPASS_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Ensure user exists in auth.users with email confirmed (skips email step)
  let userId: string | null = null;

  // Try to find existing
  const { data: existingByEmail } = await admin.auth.admin.listUsers();
  const found = existingByEmail.users?.find((u) => u.email?.toLowerCase() === email);

  if (found) {
    userId = found.id;
    // Make sure email is confirmed
    if (!found.email_confirmed_at) {
      await admin.auth.admin.updateUserById(found.id, { email_confirm: true });
    }
  } else {
    // Create new
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    if (createErr || !created.user) {
      return NextResponse.json(
        { error: createErr?.message ?? "could not create user" },
        { status: 500 },
      );
    }
    userId = created.user.id;
  }

  // 2. Generate a magic link, extract the token_hash, server-side-verify it.
  // This sets the auth cookies on this response — user is signed in.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (linkErr || !linkData.properties?.action_link) {
    return NextResponse.json(
      { error: linkErr?.message ?? "could not generate link", linkData },
      { status: 500 },
    );
  }

  // Parse the token_hash + type from the Supabase action_link
  // Format: {SUPABASE_URL}/auth/v1/verify?token=HASH&type=magiclink&redirect_to=...
  const actionLink = new URL(linkData.properties.action_link);
  const tokenHash =
    actionLink.searchParams.get("token") ??
    linkData.properties.hashed_token ??
    null;
  if (!tokenHash) {
    return NextResponse.json({ error: "no token_hash in generated link" }, { status: 500 });
  }

  // 3. Server-side verifyOtp — this sets the session cookie on the response
  const supabase = await createServerClient();
  const { error: verifyErr } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });

  if (verifyErr) {
    return NextResponse.json(
      { error: `verify failed: ${verifyErr.message}`, hint: "Try magic-link URL directly", actionLink: linkData.properties.action_link },
      { status: 500 },
    );
  }

  // 4. Bootstrap public.users row if not present
  if (userId) {
    const { data: existing } = await admin
      .from("users")
      .select("id, handle, age_verified_at")
      .eq("id", userId)
      .maybeSingle();

    if (!existing) {
      const shellHandle = `new_${Math.random().toString(36).slice(2, 10)}`;
      await admin.from("users").insert({
        id: userId,
        email,
        display_name: email.split("@")[0],
        handle: shellHandle,
        reciprocity_gate_crossed: false,
      });
    }

    // Decide where to send them
    const target = !existing
      ? "/onboarding/age"
      : !existing?.age_verified_at
        ? "/onboarding/age"
        : "/home";
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.redirect(new URL("/onboarding/age", req.url));
}
