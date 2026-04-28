/**
 * Test-only fast-onboard endpoint. Marks a user as age-verified + reciprocity-gate-crossed
 * with a stable handle, so Playwright can skip the onboarding flow.
 *
 * Gated by BYPASS_SECRET — same secret as /auth/bypass. Delete alongside
 * `/auth/bypass/route.ts` once Resend SMTP is wired and email reliability is proven.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BYPASS_SECRET = process.env.BYPASS_SECRET ?? "chatter-2026-04-28-temp";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("s");
  if (secret !== BYPASS_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("users")
    .update({
      age_verified_at: new Date().toISOString(),
      reciprocity_gate_crossed: true,
      handle: `pwtest_${email.split("@")[0].slice(0, 12).replace(/[^a-z0-9_]/gi, "")}`,
    })
    .eq("email", email)
    .select("id, handle")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, user: data });
}
