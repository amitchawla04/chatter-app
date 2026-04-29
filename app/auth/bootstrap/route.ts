/**
 * Post-verify bootstrap — create shell public.users row for the authenticated user.
 * Runs idempotently on every sign-in.
 *
 * Separated from the OTP verify call because verify runs client-side in the browser;
 * this runs server-side with the service-role key to insert the row.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail, sendCharterRedemptionEmail } from "@/lib/email";

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
    .select("id, handle, is_charter")
    .eq("id", authUser.id)
    .maybeSingle();

  // Check for charter code stashed by /onboard/beta redeem flow
  const ck = await cookies();
  const betaCode = ck.get("chatter_beta_code")?.value;
  let activatedCharter = false;
  if (betaCode) {
    const { data: invite } = await admin
      .from("invite_codes")
      .select("code, max_uses, used_count, expires_at, archived")
      .eq("code", betaCode)
      .maybeSingle();
    const valid =
      invite &&
      !invite.archived &&
      (!invite.expires_at || new Date(invite.expires_at) > new Date()) &&
      (invite.max_uses == null || invite.used_count < invite.max_uses);
    if (valid) {
      await admin
        .from("invite_codes")
        .update({ used_count: (invite.used_count ?? 0) + 1 })
        .eq("code", betaCode);
      activatedCharter = true;
    }
    ck.delete("chatter_beta_code");
  }

  if (existing) {
    // Existing user — only flip charter if redeemed code AND not already charter
    if (activatedCharter && !existing.is_charter) {
      await admin.from("users").update({ is_charter: true }).eq("id", authUser.id);
      if (authUser.email) {
        sendCharterRedemptionEmail({
          to: authUser.email,
          handle: existing.handle,
        }).catch(() => {});
      }
    }
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
    is_charter: activatedCharter,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Welcome / charter email — fire-and-forget
  if (authUser.email) {
    if (activatedCharter) {
      sendCharterRedemptionEmail({
        to: authUser.email,
        handle: shellHandle,
      }).catch(() => {});
    } else {
      sendWelcomeEmail({
        to: authUser.email,
        displayName: emailLocal,
        handle: shellHandle,
        isCharter: false,
      }).catch(() => {});
    }
  }

  return NextResponse.json({
    ok: true,
    existing: false,
    handle: shellHandle,
    charter: activatedCharter,
  });
}
