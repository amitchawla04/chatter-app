"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function submitReport(params: {
  targetKind: "whisper" | "user" | "topic";
  targetId: string;
  reason: string;
  context?: string;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in to report", requiresAuth: true };

  const admin = createAdminClient();
  const { error } = await admin.from("reports").insert({
    reporter_id: user.id,
    target_kind: params.targetKind,
    target_id: params.targetId,
    reason: params.reason,
    context: params.context ?? null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
