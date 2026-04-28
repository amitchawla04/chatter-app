"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRate } from "@/lib/rate-limit";

export async function postReply(params: {
  parentId: string;
  topicId: string;
  content: string;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in required", requiresAuth: true };

  const content = params.content.trim();
  if (!content || content.length > 280) {
    return { ok: false, error: "replies are 1-280 chars" };
  }

  const rate = await checkRate("reply", user.id);
  if (!rate.allowed) return { ok: false, error: rate.message ?? "rate limited" };

  const admin = createAdminClient();

  // If parent requires approval, mark this reply as hidden_by_author_at immediately.
  // Author can approve it later via the queue (Phase 2 surface).
  const { data: parent } = await admin
    .from("whispers")
    .select("require_reply_approval, scope")
    .eq("id", params.parentId)
    .maybeSingle();

  const needsApproval =
    (parent as { require_reply_approval?: boolean } | null)?.require_reply_approval ?? false;

  const { error } = await admin.from("whispers").insert({
    author_id: user.id,
    topic_id: params.topicId,
    parent_id: params.parentId,
    modality: "text",
    content_text: content,
    scope: (parent as { scope?: string })?.scope ?? "public",
    kind: "opinion",
    hidden_by_author_at: needsApproval ? new Date().toISOString() : null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/w/${params.parentId}`);
  return { ok: true };
}
