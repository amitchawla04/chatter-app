"use server";

/**
 * Village thread actions — small group conversations (max 12).
 * Pact alignment:
 *  - Default scope is private to participants (not "public" or "network").
 *  - No popularity counts surfaced.
 *  - Creator can leave; thread persists until last participant leaves.
 */

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRate } from "@/lib/rate-limit";

export async function createThread(params: {
  name: string;
  topicId: string;
  inviteHandles?: string[];
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in required", requiresAuth: true };

  const name = params.name.trim();
  if (!name || name.length > 60) {
    return { ok: false, error: "thread name must be 1-60 chars" };
  }

  if (!params.topicId) {
    return { ok: false, error: "pick a topic — threads are topic-scoped" };
  }

  const admin = createAdminClient();
  const { data: thread, error: tErr } = await admin
    .from("village_threads")
    .insert({
      name,
      creator_id: user.id,
      topic_id: params.topicId,
    })
    .select("id")
    .single();

  if (tErr || !thread) return { ok: false, error: tErr?.message ?? "create failed" };

  // Add creator as participant
  await admin.from("village_thread_participants").insert({
    thread_id: thread.id,
    user_id: user.id,
    role: "creator",
  });

  // Resolve invitees by handle
  const invites = (params.inviteHandles ?? [])
    .map((h) => h.trim().replace(/^@/, ""))
    .filter(Boolean)
    .slice(0, 11); // creator + 11 = 12 max

  if (invites.length > 0) {
    const { data: users } = await admin
      .from("users")
      .select("id, handle")
      .in("handle", invites);
    const rows = (users ?? [])
      .filter((u) => u.id !== user.id)
      .map((u) => ({ thread_id: thread.id, user_id: u.id, role: "member" as const }));
    if (rows.length > 0) {
      await admin.from("village_thread_participants").insert(rows);
    }
  }

  revalidatePath("/v");
  return { ok: true, threadId: thread.id };
}

export async function postToThread(params: { threadId: string; content: string }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in required", requiresAuth: true };

  const content = params.content.trim();
  if (!content || content.length > 280) {
    return { ok: false, error: "messages are 1-280 chars" };
  }

  const rate = await checkRate("reply", user.id);
  if (!rate.allowed) return { ok: false, error: rate.message ?? "rate limited" };

  const admin = createAdminClient();

  // Verify membership
  const { data: member } = await admin
    .from("village_thread_participants")
    .select("user_id")
    .eq("thread_id", params.threadId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) return { ok: false, error: "not a thread member" };

  // Get thread topic for FK
  const { data: thread } = await admin
    .from("village_threads")
    .select("topic_id")
    .eq("id", params.threadId)
    .maybeSingle();
  const topicId = (thread as { topic_id: string } | null)?.topic_id;
  if (!topicId) return { ok: false, error: "thread missing topic" };

  const { error: wErr } = await admin.from("whispers").insert({
    author_id: user.id,
    topic_id: topicId,
    thread_id: params.threadId,
    modality: "text",
    content_text: content,
    scope: "private",
    kind: "opinion",
  });

  if (wErr) return { ok: false, error: wErr.message };

  await admin
    .from("village_threads")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", params.threadId);

  revalidatePath(`/v/${params.threadId}`);
  return { ok: true };
}

export async function inviteToThread(params: { threadId: string; handle: string }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in required" };

  const admin = createAdminClient();

  // Verify the inviter is a member
  const { data: member } = await admin
    .from("village_thread_participants")
    .select("user_id")
    .eq("thread_id", params.threadId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) return { ok: false, error: "not a thread member" };

  const handle = params.handle.trim().replace(/^@/, "");
  const { data: target } = await admin
    .from("users")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();
  if (!target) return { ok: false, error: `no user @${handle}` };

  const { error } = await admin
    .from("village_thread_participants")
    .insert({ thread_id: params.threadId, user_id: target.id, role: "member" });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/v/${params.threadId}`);
  return { ok: true };
}

export async function leaveThread(threadId: string) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in required" };

  const admin = createAdminClient();
  await admin
    .from("village_thread_participants")
    .delete()
    .eq("thread_id", threadId)
    .eq("user_id", user.id);

  // If last participant left, archive the thread
  const { count } = await admin
    .from("village_thread_participants")
    .select("user_id", { count: "exact", head: true })
    .eq("thread_id", threadId);
  if ((count ?? 0) === 0) {
    await admin.from("village_threads").update({ is_archived: true }).eq("id", threadId);
  }

  revalidatePath("/v");
  return { ok: true };
}
