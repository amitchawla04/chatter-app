"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function toggleTune(topicId: string, tune: boolean) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not signed in" };

  const admin = createAdminClient();
  if (tune) {
    const { error } = await admin
      .from("tunes")
      .upsert({ user_id: user.id, topic_id: topicId }, { onConflict: "user_id,topic_id" });
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await admin
      .from("tunes")
      .delete()
      .eq("user_id", user.id)
      .eq("topic_id", topicId);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/t/${topicId}`);
  revalidatePath("/home");
  return { ok: true };
}
