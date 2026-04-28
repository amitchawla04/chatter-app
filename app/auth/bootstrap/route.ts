/**
 * Post-verify bootstrap — create shell public.users row for the authenticated user.
 * Runs idempotently on every sign-in.
 *
 * Separated from the OTP verify call because verify runs client-side in the browser;
 * this runs server-side with the service-role key to insert the row.
 */
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return NextResponse.json({ ok: false, error: "not authenticated" }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("users")
    .select("id, handle")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true, existing: true, handle: existing.handle });
  }

  // First-time: create shell row with temporary handle
  const shellHandle = `new_${Math.random().toString(36).slice(2, 10)}`;
  const emailLocal = authUser.email?.split("@")[0] ?? "chatter-user";

  const { error } = await admin.from("users").insert({
    id: authUser.id,
    email: authUser.email,
    display_name: emailLocal,
    handle: shellHandle,
    reciprocity_gate_crossed: false,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, existing: false, handle: shellHandle });
}
