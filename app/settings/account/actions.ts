"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function togglePause(pause: boolean) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not signed in" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({
      paused_at: pause ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings/account");
  return { ok: true };
}

export async function requestAccountDeletion() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not signed in" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({
      deletion_requested_at: new Date().toISOString(),
      paused_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  // Sign out so the user can't keep posting after deletion request
  await supabase.auth.signOut();
  return { ok: true };
}
