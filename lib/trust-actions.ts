"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getMe() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function blockUser(targetUserId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };
  if (me.id === targetUserId) return { ok: false, error: "can't block yourself" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("blocks")
    .upsert({ blocker_id: me.id, blocked_id: targetUserId, mode: "block" }, { onConflict: "blocker_id,blocked_id" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/home");
  revalidatePath("/settings/privacy");
  return { ok: true };
}

export async function muteUser(targetUserId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };
  if (me.id === targetUserId) return { ok: false, error: "can't mute yourself" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("blocks")
    .upsert({ blocker_id: me.id, blocked_id: targetUserId, mode: "mute" }, { onConflict: "blocker_id,blocked_id" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/home");
  revalidatePath("/settings/privacy");
  return { ok: true };
}

export async function unblockUser(targetUserId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };
  const admin = createAdminClient();
  const { error } = await admin
    .from("blocks")
    .delete()
    .eq("blocker_id", me.id)
    .eq("blocked_id", targetUserId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/privacy");
  return { ok: true };
}

export async function addHiddenWord(rawWord: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };
  const word = rawWord.trim().toLowerCase();
  if (!word || word.length > 60) return { ok: false, error: "1–60 chars" };
  const admin = createAdminClient();
  const { error } = await admin
    .from("hidden_words")
    .upsert({ user_id: me.id, word }, { onConflict: "user_id,word" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/privacy");
  revalidatePath("/home");
  return { ok: true };
}

export async function removeHiddenWord(word: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };
  const admin = createAdminClient();
  const { error } = await admin
    .from("hidden_words")
    .delete()
    .eq("user_id", me.id)
    .eq("word", word);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/privacy");
  return { ok: true };
}

export async function submitInsiderClaim(input: {
  tag: string;
  evidenceUrl?: string;
  evidenceNote?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };

  const tag = input.tag.trim();
  if (!tag || tag.length < 2 || tag.length > 60) return { ok: false, error: "Tag must be 2–60 chars" };

  const admin = createAdminClient();
  const { data: dup } = await admin
    .from("insider_claims")
    .select("id")
    .eq("user_id", me.id)
    .eq("tag", tag)
    .in("status", ["pending", "approved"])
    .maybeSingle();
  if (dup) return { ok: false, error: "You already have a claim for this credential" };

  const { data, error } = await admin
    .from("insider_claims")
    .insert({
      user_id: me.id,
      tag,
      evidence_url: input.evidenceUrl?.trim() || null,
      evidence_note: input.evidenceNote?.trim() || null,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "insert failed" };
  revalidatePath("/you/credentials");
  revalidatePath("/founder/insider-claims");
  return { ok: true, id: (data as { id: string }).id };
}

async function getModerator() {
  const me = await getMe();
  if (!me) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from("users")
    .select("id, is_moderator")
    .eq("id", me.id)
    .maybeSingle();
  return data && (data as { is_moderator: boolean }).is_moderator ? me : null;
}

export async function reviewInsiderClaim(input: {
  claimId: string;
  decision: "approved" | "rejected";
  note?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const mod = await getModerator();
  if (!mod) return { ok: false, error: "moderator-only" };

  const admin = createAdminClient();
  const { data: claim } = await admin
    .from("insider_claims")
    .select("id, user_id, tag, status")
    .eq("id", input.claimId)
    .maybeSingle();
  if (!claim) return { ok: false, error: "claim not found" };
  const c = claim as { id: string; user_id: string; tag: string; status: string };
  if (c.status !== "pending") return { ok: false, error: "already reviewed" };

  await admin
    .from("insider_claims")
    .update({
      status: input.decision,
      reviewed_by: mod.id,
      reviewed_at: new Date().toISOString(),
      reviewer_note: input.note?.trim() || null,
    })
    .eq("id", c.id);

  if (input.decision === "approved") {
    const { data: userRow } = await admin
      .from("users")
      .select("insider_tags")
      .eq("id", c.user_id)
      .maybeSingle();
    const existing = ((userRow as { insider_tags: string[] | null } | null)?.insider_tags ?? []);
    if (!existing.includes(c.tag)) {
      await admin
        .from("users")
        .update({ insider_tags: [...existing, c.tag] })
        .eq("id", c.user_id);
    }
  }

  revalidatePath("/founder/insider-claims");
  revalidatePath("/you/credentials");
  return { ok: true };
}

/** Mute a topic for a duration. duration='1h'|'24h'|'7d'|'forever'. */
export async function muteTopic(input: {
  topicId: string;
  duration: "1h" | "24h" | "7d" | "forever";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };
  let expiresAt: string | null = null;
  if (input.duration === "1h") {
    expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  } else if (input.duration === "24h") {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  } else if (input.duration === "7d") {
    expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("topic_mutes")
    .upsert(
      { user_id: me.id, topic_id: input.topicId, expires_at: expiresAt },
      { onConflict: "user_id,topic_id" },
    );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/home");
  revalidatePath(`/t/${input.topicId}`);
  revalidatePath("/settings/privacy");
  return { ok: true };
}

export async function unmuteTopic(topicId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };
  const admin = createAdminClient();
  const { error } = await admin
    .from("topic_mutes")
    .delete()
    .eq("user_id", me.id)
    .eq("topic_id", topicId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/home");
  revalidatePath(`/t/${topicId}`);
  revalidatePath("/settings/privacy");
  return { ok: true };
}

/** Archive a pass — author hides it from the inbox. */
export async function archivePass(passId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };
  const admin = createAdminClient();
  const { error } = await admin
    .from("passes")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", passId)
    .eq("to_user_id", me.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/passes");
  return { ok: true };
}

/** Thank the sender of a pass — sends a tiny acknowledgement back. */
export async function thankPassSender(passId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };
  const admin = createAdminClient();

  const { data: pass } = await admin
    .from("passes")
    .select("from_user_id, to_user_id, thanked_at")
    .eq("id", passId)
    .maybeSingle();
  if (!pass) return { ok: false, error: "pass not found" };
  const row = pass as { from_user_id: string; to_user_id: string; thanked_at: string | null };
  if (row.to_user_id !== me.id) return { ok: false, error: "not yours to thank" };
  if (row.thanked_at) return { ok: true };

  await admin
    .from("passes")
    .update({ thanked_at: new Date().toISOString() })
    .eq("id", passId);

  // Push notify the sender — they'll see "@you thanked you for the pass"
  const { notifyUser } = await import("@/lib/push");
  const { data: meRow } = await admin.from("users").select("handle").eq("id", me.id).maybeSingle();
  const handle = (meRow as { handle: string } | null)?.handle ?? "someone";
  notifyUser(row.from_user_id, {
    kind: "pass.thanked",
    title: `@${handle} appreciated your pass`,
    body: "thanks for the whisper.",
    url: "/passes",
  }).catch(() => {});

  revalidatePath("/passes");
  return { ok: true };
}

export async function vouchFor(input: {
  topicId: string;
  targetUserId?: string | null;
  text: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await getMe();
  if (!me) return { ok: false, error: "sign-in required" };

  const text = input.text.trim();
  if (!text || text.length > 280) return { ok: false, error: "Vouch text must be 1–280 chars" };

  const admin = createAdminClient();
  const { error } = await admin.from("vouches").insert({
    topic_id: input.topicId,
    author_id: me.id,
    content_text: text,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/t/${input.topicId}`);
  return { ok: true };
}
