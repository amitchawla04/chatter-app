"use server";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function verifyAge(params: {
  band: "under_13" | "13_17" | "18_plus";
  parentEmail?: string;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "not signed in" };

  // COPPA: under-13 cannot use Chatter. Sign them out.
  if (params.band === "under_13") {
    const admin = createAdminClient();
    await admin.from("users").delete().eq("id", user.id);
    await supabase.auth.signOut();
    return { ok: true, blocked: true };
  }

  const isTeen = params.band === "13_17";

  const admin = createAdminClient();
  const { error } = await admin
    .from("users")
    .update({
      is_teen_account: isTeen,
      age_verified_at: new Date().toISOString(),
      parent_supervision_email: isTeen ? params.parentEmail ?? null : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  return { ok: true, blocked: false };
}
