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
    .upsert({ blocker_id: me.id, blocked_id: targetUserId }, { onConflict: "blocker_id,blocked_id" });
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
