/**
 * Magic-link callback route.
 * Supabase Auth redirects here with a ?code param; we exchange for a session
 * and set cookies. Then route the user to onboarding (first time) or home.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/onboarding";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/sign-in?error=missing_code`);
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/auth/sign-in?error=exchange_failed`);
  }

  // Ensure a public.users row exists for this auth.user.
  // If it's their first sign-in, create a shell row — they'll pick a handle
  // on /onboarding/handle.
  const authUser = data.session.user;
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("users")
    .select("id, handle, reciprocity_gate_crossed")
    .eq("id", authUser.id)
    .maybeSingle();

  if (!existing) {
    // Create a shell user row — handle will be claimed in onboarding
    const shellHandle = await generateShellHandle(admin);
    const shellName = authUser.email?.split("@")[0] ?? "chatter-user";
    await admin.from("users").insert({
      id: authUser.id,
      email: authUser.email,
      display_name: shellName,
      handle: shellHandle,
      reciprocity_gate_crossed: false,
    });

    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // Returning user — straight to home (or deep-linked next)
  return NextResponse.redirect(`${origin}${nextParam}`);
}

/**
 * Generate a unique temporary handle on first sign-in.
 * User will claim a real one during onboarding.
 */
async function generateShellHandle(
  admin: ReturnType<typeof createAdminClient>,
): Promise<string> {
  for (let tries = 0; tries < 6; tries++) {
    const candidate = `new_${Math.random().toString(36).slice(2, 10)}`;
    const { data } = await admin
      .from("users")
      .select("handle")
      .eq("handle", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  // Last-resort fallback
  return `new_${Date.now().toString(36)}`;
}
