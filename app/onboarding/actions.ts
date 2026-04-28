"use server";

/**
 * Server actions for onboarding.
 * Persists selected topics as `tunes` rows for the authenticated user,
 * then routes to handle claim (step 2 of 2).
 */
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveTunes(topicIds: string[]) {
  if (!Array.isArray(topicIds) || topicIds.length < 5) {
    return { ok: false, error: "pick at least 5 topics" };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const admin = createAdminClient();

  // Replace existing tunes with current selection (idempotent)
  await admin.from("tunes").delete().eq("user_id", user.id);
  const rows = topicIds.map((topic_id) => ({ user_id: user.id, topic_id }));
  const { error } = await admin.from("tunes").insert(rows);
  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function claimHandle(formData: FormData) {
  const handle = (formData.get("handle") as string | null)?.trim()?.toLowerCase() ?? "";
  const displayName = ((formData.get("displayName") as string | null) ?? "").trim();

  if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    return { ok: false, error: "3-20 chars · letters, numbers, underscore" };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const admin = createAdminClient();

  // Is the handle taken by someone else?
  const { data: existing } = await admin
    .from("users")
    .select("id")
    .eq("handle", handle)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: `@${handle} is taken. try another.` };
  }

  const { error } = await admin
    .from("users")
    .update({
      handle,
      display_name: displayName || handle,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
