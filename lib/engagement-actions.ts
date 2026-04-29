"use server";

/**
 * Engagement server actions — echo, save, pass, delete.
 * Each is idempotent where possible. RLS + service-role safe.
 */
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRate } from "@/lib/rate-limit";
import { notifyUser } from "@/lib/push";
import { sendPassReceivedEmail } from "@/lib/email";

async function getAuthUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Toggle echo on a whisper. */
export async function toggleEcho(whisperId: string, desired: boolean) {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "sign-in required", requiresAuth: true };

  // Rate-limit only the on-toggle (un-echo is free; spam vector is mass-echoing)
  if (desired) {
    const rate = await checkRate("echo", user.id);
    if (!rate.allowed) return { ok: false, error: rate.message ?? "rate limited" };
  }

  const admin = createAdminClient();

  if (desired) {
    const { error } = await admin
      .from("echoes")
      .upsert(
        { whisper_id: whisperId, user_id: user.id },
        { onConflict: "whisper_id,user_id" },
      );
    if (error) return { ok: false, error: error.message };

    // Maintain denormalized count on whispers (manual increment — simpler than RPC)
    const { data: cur } = await admin
      .from("whispers")
      .select("echo_count")
      .eq("id", whisperId)
      .maybeSingle();
    if (cur) {
      await admin
        .from("whispers")
        .update({ echo_count: (cur.echo_count ?? 0) + 1 })
        .eq("id", whisperId);
    }
  } else {
    await admin
      .from("echoes")
      .delete()
      .eq("whisper_id", whisperId)
      .eq("user_id", user.id);

    const { data: cur } = await admin
      .from("whispers")
      .select("echo_count")
      .eq("id", whisperId)
      .maybeSingle();
    if (cur) {
      await admin
        .from("whispers")
        .update({ echo_count: Math.max(0, (cur.echo_count ?? 1) - 1) })
        .eq("id", whisperId);
    }
  }

  revalidatePath("/home");
  revalidatePath("/you");
  return { ok: true };
}

/** Toggle save/bookmark on a whisper. */
export async function toggleSave(whisperId: string, desired: boolean) {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "sign-in required", requiresAuth: true };

  const admin = createAdminClient();

  if (desired) {
    const { error } = await admin
      .from("saves")
      .upsert(
        { whisper_id: whisperId, user_id: user.id },
        { onConflict: "user_id,whisper_id" },
      );
    if (error) return { ok: false, error: error.message };
  } else {
    await admin
      .from("saves")
      .delete()
      .eq("whisper_id", whisperId)
      .eq("user_id", user.id);
  }

  revalidatePath("/saved");
  return { ok: true };
}

/** Pass a whisper to a specific user with an optional note. */
export async function passWhisper(params: {
  whisperId: string;
  toUserId: string;
  note?: string;
}) {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "sign-in required", requiresAuth: true };

  if (user.id === params.toUserId) {
    return { ok: false, error: "can't pass to yourself" };
  }

  const rate = await checkRate("pass", user.id);
  if (!rate.allowed) return { ok: false, error: rate.message ?? "rate limited" };

  const admin = createAdminClient();

  const { error } = await admin.from("passes").insert({
    whisper_id: params.whisperId,
    from_user_id: user.id,
    to_user_id: params.toUserId,
    note: params.note?.slice(0, 200) ?? null,
  });
  if (error) return { ok: false, error: error.message };

  // Bump pass_count denormalized counter
  const { data: cur } = await admin
    .from("whispers")
    .select("pass_count, content_text")
    .eq("id", params.whisperId)
    .maybeSingle();
  if (cur) {
    await admin
      .from("whispers")
      .update({ pass_count: (cur.pass_count ?? 0) + 1 })
      .eq("id", params.whisperId);
  }

  // Push notify recipient — Pact-permitted (passes, not engagement metrics)
  const [{ data: from }, { data: recipient }] = await Promise.all([
    admin.from("users").select("handle").eq("id", user.id).maybeSingle(),
    admin.from("users").select("email").eq("id", params.toUserId).maybeSingle(),
  ]);
  const fromHandle = (from as { handle: string } | null)?.handle ?? "someone";
  const excerpt = cur?.content_text?.slice(0, 200) ?? "(media whisper)";
  notifyUser(params.toUserId, {
    kind: "pass.received",
    title: "@" + fromHandle + " passed you a whisper",
    body: params.note ? `note: "${params.note.slice(0, 80)}"` : excerpt.slice(0, 100),
    url: "/passes",
  }).catch(() => {});
  // Email recipient (signal-bearing, not engagement)
  const recipientEmail = (recipient as { email: string | null } | null)?.email;
  if (recipientEmail) {
    sendPassReceivedEmail({
      to: recipientEmail,
      fromHandle,
      whisperExcerpt: excerpt,
      note: params.note,
      whisperUrl: `https://chatter-ten-lemon.vercel.app/w/${params.whisperId}`,
    }).catch(() => {});
  }

  revalidatePath("/passes");
  revalidatePath("/home");
  return { ok: true };
}

/** Soft-delete own whisper. */
export async function deleteOwnWhisper(whisperId: string) {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "sign-in required", requiresAuth: true };

  const admin = createAdminClient();

  const { error } = await admin
    .from("whispers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", whisperId)
    .eq("author_id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/home");
  revalidatePath("/you");
  return { ok: true };
}

/** Author hides a reply to their whisper (X3 reply agency). */
export async function hideReply(replyId: string) {
  const user = await getAuthUser();
  if (!user) return { ok: false, error: "sign-in required", requiresAuth: true };

  const admin = createAdminClient();

  // Verify the reply's parent whisper is authored by this user
  const { data: reply } = await admin
    .from("whispers")
    .select("id, parent_id")
    .eq("id", replyId)
    .maybeSingle();

  if (!reply?.parent_id) return { ok: false, error: "not a reply" };

  const { data: parent } = await admin
    .from("whispers")
    .select("author_id")
    .eq("id", reply.parent_id)
    .maybeSingle();

  if (parent?.author_id !== user.id) {
    return { ok: false, error: "only the original author can hide replies" };
  }

  const { error } = await admin
    .from("whispers")
    .update({ hidden_by_author_at: new Date().toISOString() })
    .eq("id", replyId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/w/${reply.parent_id}`);
  return { ok: true };
}
