"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const FOUNDER_EMAILS = new Set([
  "amit.chawla@reward360.co",
  "amit.chawla+chatter@reward360.co",
]);

async function getFounder() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email || !FOUNDER_EMAILS.has(user.email.toLowerCase())) return null;
  return user;
}

export async function createInviteCode(params: {
  cohort?: string;
  notes?: string;
  maxUses?: number;
  prefix?: string;
}) {
  const founder = await getFounder();
  if (!founder) return { ok: false, error: "founder-only" };

  const code = generateCode(params.prefix ?? "CHTR");

  const admin = createAdminClient();
  const { error } = await admin.from("invite_codes").insert({
    code,
    created_by: founder.id,
    cohort: params.cohort ?? "charter",
    notes: params.notes ?? null,
    max_uses: params.maxUses ?? 1,
    used_count: 0,
    archived: false,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/founder/invites");
  return { ok: true, code };
}

export async function archiveInviteCode(code: string) {
  const founder = await getFounder();
  if (!founder) return { ok: false, error: "founder-only" };

  const admin = createAdminClient();
  await admin.from("invite_codes").update({ archived: true }).eq("code", code);
  revalidatePath("/founder/invites");
  return { ok: true };
}

function generateCode(prefix: string): string {
  const random = Math.random().toString(36).replace(/[^a-z0-9]/g, "").slice(0, 8).toUpperCase();
  return `${prefix}-${random}`;
}
