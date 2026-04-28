"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

/**
 * Redeem a charter invite code.
 * Stores the code in a cookie so the next sign-in flow flips is_charter=true
 * automatically once they verify email.
 */
export async function redeemBetaCode(code: string) {
  if (!/^[A-Z0-9-]{4,24}$/.test(code)) {
    return { ok: false, error: "code format invalid" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invite_codes")
    .select("code, max_uses, used_count, expires_at, archived")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "couldn't verify code · try again" };
  }
  if (!data) {
    return { ok: false, error: "code not found · check spelling" };
  }
  if (data.archived) {
    return { ok: false, error: "this code is no longer active" };
  }
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { ok: false, error: "this code has expired" };
  }
  if (data.max_uses != null && data.used_count >= data.max_uses) {
    return { ok: false, error: "this code is fully redeemed" };
  }

  // Stash for sign-in flow (so the post-verify hook can grant charter)
  const ck = await cookies();
  ck.set("chatter_beta_code", code, {
    maxAge: 60 * 30, // 30 minutes
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  return { ok: true, next: "/auth/sign-in" };
}
