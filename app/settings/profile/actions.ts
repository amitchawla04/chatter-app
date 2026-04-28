"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveProfile(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not signed in" };

  const display_name = ((formData.get("display_name") as string | null) ?? "").trim().slice(0, 60);
  const bio = ((formData.get("bio") as string | null) ?? "").trim().slice(0, 280);
  const pronouns = ((formData.get("pronouns") as string | null) ?? "").trim().slice(0, 30);
  const location = ((formData.get("location") as string | null) ?? "").trim().slice(0, 60);

  if (!display_name) {
    return { ok: false, error: "display name can't be empty" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({
      display_name,
      bio: bio || null,
      pronouns: pronouns || null,
      location: location || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/you");
  revalidatePath("/settings");
  return { ok: true };
}
