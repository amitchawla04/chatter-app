"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveCustomFeed(params: { name: string; topicIds: string[] }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in required" };

  if (!params.name.trim() || params.topicIds.length === 0)
    return { ok: false, error: "name + topics required" };

  const admin = createAdminClient();
  const { error } = await admin.from("custom_feeds").upsert(
    {
      user_id: user.id,
      name: params.name.trim(),
      topic_ids: params.topicIds,
    },
    { onConflict: "user_id,name" },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/you/feeds");
  return { ok: true };
}

export async function deleteCustomFeed(id: string) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in required" };

  const admin = createAdminClient();
  await admin.from("custom_feeds").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/you/feeds");
  return { ok: true };
}
