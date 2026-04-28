"use server";

/**
 * Whisper actions: edit (overrides D2 per founder "no gaps" directive 2026-04-28),
 * pin (IP12), unpin.
 *
 * Edit policy: 15-minute window after creation to prevent post-echo bait-and-switch.
 * Pin: max 3 pinned per author (mirrors common pattern).
 */
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const EDIT_WINDOW_SECONDS = 15 * 60;
const MAX_PINS = 3;

async function authedUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function editWhisper(whisperId: string, newContent: string) {
  const user = await authedUser();
  if (!user) return { ok: false, error: "sign-in required" };
  const content = newContent.trim();
  if (!content || content.length > 280)
    return { ok: false, error: "1-280 chars" };

  const admin = createAdminClient();
  const { data: w } = await admin
    .from("whispers")
    .select("id, author_id, created_at, edit_count")
    .eq("id", whisperId)
    .maybeSingle();

  if (!w) return { ok: false, error: "not found" };
  if (w.author_id !== user.id) return { ok: false, error: "not your whisper" };

  const ageSec = (Date.now() - new Date(w.created_at).getTime()) / 1000;
  if (ageSec > EDIT_WINDOW_SECONDS) {
    return {
      ok: false,
      error: `edit window closed (15 min after post). older whispers can only be deleted.`,
    };
  }

  const { error } = await admin
    .from("whispers")
    .update({
      content_text: content,
      edited_at: new Date().toISOString(),
      edit_count: (w.edit_count ?? 0) + 1,
    })
    .eq("id", whisperId);

  if (error) return { ok: false, error: error.message };
  revalidatePath(`/w/${whisperId}`);
  revalidatePath("/home");
  revalidatePath("/you");
  return { ok: true };
}

export async function togglePin(whisperId: string, desired: boolean) {
  const user = await authedUser();
  if (!user) return { ok: false, error: "sign-in required" };

  const admin = createAdminClient();
  const { data: w } = await admin
    .from("whispers")
    .select("id, author_id, pinned_at")
    .eq("id", whisperId)
    .maybeSingle();
  if (!w || w.author_id !== user.id)
    return { ok: false, error: "can only pin your own whispers" };

  if (desired) {
    const { count } = await admin
      .from("whispers")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .not("pinned_at", "is", null);
    if ((count ?? 0) >= MAX_PINS)
      return { ok: false, error: `max ${MAX_PINS} pinned · unpin one first` };

    await admin
      .from("whispers")
      .update({ pinned_at: new Date().toISOString() })
      .eq("id", whisperId);
  } else {
    await admin.from("whispers").update({ pinned_at: null }).eq("id", whisperId);
  }

  revalidatePath("/you");
  revalidatePath(`/w/${whisperId}`);
  return { ok: true };
}
