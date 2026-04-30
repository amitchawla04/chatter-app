"use server";

/**
 * Moderation actions — gated by users.is_moderator = true.
 * Pact-aligned: every action emits an audit row to mod_actions (TM4) so the
 * mod's own activity log is queryable + reviewable. Pact 11: moderation
 * decisions are visible to the affected user via the appeal flow.
 */
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getModerator() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = createAdminClient();
  const { data: row } = await admin
    .from("users")
    .select("id, is_moderator")
    .eq("id", user.id)
    .maybeSingle();
  if (!row || !(row as { is_moderator: boolean }).is_moderator) return null;
  return user;
}

async function audit(params: {
  modId: string;
  action: string;
  targetKind: string;
  targetId: string;
  reportId?: string | null;
  note?: string | null;
}) {
  const admin = createAdminClient();
  await admin.from("mod_actions").insert({
    mod_id: params.modId,
    action: params.action,
    target_kind: params.targetKind,
    target_id: params.targetId,
    report_id: params.reportId ?? null,
    note: params.note ?? null,
  });
}

export async function resolveReport(params: {
  reportId: string;
  action: "dismiss" | "hide_whisper" | "pause_user";
  note?: string;
}) {
  const mod = await getModerator();
  if (!mod) return { ok: false, error: "moderator-only" };

  const admin = createAdminClient();

  const { data: report } = await admin
    .from("reports")
    .select("target_kind, target_id")
    .eq("id", params.reportId)
    .maybeSingle();
  if (!report) return { ok: false, error: "report not found" };
  const r = report as { target_kind: string; target_id: string };

  if (params.action === "hide_whisper" && r.target_kind === "whisper") {
    await admin.from("whispers").update({ is_hidden: true }).eq("id", r.target_id);
  }
  if (params.action === "pause_user" && r.target_kind === "user") {
    await admin
      .from("users")
      .update({ paused_at: new Date().toISOString() })
      .eq("id", r.target_id);
  }

  const newStatus = params.action === "dismiss" ? "dismissed" : "actioned";

  await admin
    .from("reports")
    .update({
      status: newStatus,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", params.reportId);

  await audit({
    modId: mod.id,
    action: params.action,
    targetKind: r.target_kind,
    targetId: r.target_id,
    reportId: params.reportId,
    note: params.note,
  });

  revalidatePath("/moderation");
  revalidatePath("/moderation/log");
  return { ok: true };
}

/**
 * TM2 — apply / clear a [CLAIM UNDER REVIEW] or [UNDER REVIEW] label on a
 * whisper. Visible to all readers; signals "this is being investigated."
 */
export async function setWhisperReviewStatus(params: {
  whisperId: string;
  status: "claim_under_review" | "under_review" | null;
  reportId?: string | null;
  note?: string | null;
}) {
  const mod = await getModerator();
  if (!mod) return { ok: false, error: "moderator-only" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("whispers")
    .update({
      review_status: params.status,
      review_set_at: params.status ? new Date().toISOString() : null,
      review_set_by: params.status ? mod.id : null,
    })
    .eq("id", params.whisperId);
  if (error) return { ok: false, error: error.message };

  await audit({
    modId: mod.id,
    action: params.status ? `label_${params.status}` : "clear_review_label",
    targetKind: "whisper",
    targetId: params.whisperId,
    reportId: params.reportId ?? null,
    note: params.note ?? null,
  });

  revalidatePath("/home");
  revalidatePath(`/w/${params.whisperId}`);
  revalidatePath("/moderation");
  revalidatePath("/moderation/log");
  return { ok: true };
}

/** TM3 — escalate a report to admin. Founder is admin by convention. */
export async function escalateReport(params: {
  reportId: string;
  note?: string;
}) {
  const mod = await getModerator();
  if (!mod) return { ok: false, error: "moderator-only" };
  const admin = createAdminClient();

  const { data: report } = await admin
    .from("reports")
    .select("target_kind, target_id, escalated_at")
    .eq("id", params.reportId)
    .maybeSingle();
  if (!report) return { ok: false, error: "report not found" };
  const r = report as { target_kind: string; target_id: string; escalated_at: string | null };
  if (r.escalated_at) return { ok: false, error: "already escalated" };

  await admin
    .from("reports")
    .update({
      escalated_at: new Date().toISOString(),
      escalated_by: mod.id,
      escalation_note: params.note ?? null,
    })
    .eq("id", params.reportId);

  await audit({
    modId: mod.id,
    action: "escalate",
    targetKind: r.target_kind,
    targetId: r.target_id,
    reportId: params.reportId,
    note: params.note,
  });

  revalidatePath("/moderation");
  revalidatePath("/moderation/log");
  return { ok: true };
}
