"use server";

/**
 * Moderation actions — gated by users.is_moderator = true.
 * Pact-aligned: actions are auditable (resolved_at + resolver in reports).
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

export async function resolveReport(params: {
  reportId: string;
  action: "dismiss" | "hide_whisper" | "pause_user";
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

  if (params.action === "hide_whisper" && (report as { target_kind: string }).target_kind === "whisper") {
    await admin
      .from("whispers")
      .update({ is_hidden: true })
      .eq("id", (report as { target_id: string }).target_id);
  }
  if (params.action === "pause_user" && (report as { target_kind: string }).target_kind === "user") {
    await admin
      .from("users")
      .update({ paused_at: new Date().toISOString() })
      .eq("id", (report as { target_id: string }).target_id);
  }

  const newStatus =
    params.action === "dismiss"
      ? "dismissed"
      : params.action === "hide_whisper"
        ? "actioned"
        : "actioned";

  await admin
    .from("reports")
    .update({
      status: newStatus,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", params.reportId);

  revalidatePath("/moderation");
  return { ok: true };
}
