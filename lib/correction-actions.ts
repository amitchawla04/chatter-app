"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRate } from "@/lib/rate-limit";
import { notifyUser } from "@/lib/push";
import { sendCorrectionEmail } from "@/lib/email";

/**
 * Submit an insider correction to a whisper.
 * Any user with insider_tags can submit. In Phase 2, we'll weight by
 * topic-scoped vouches + require ≥ 3 corroborating corrections to surface.
 */
export async function submitCorrection(params: {
  whisperId: string;
  content: string;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "sign-in required", requiresAuth: true };

  const content = params.content.trim();
  if (!content || content.length > 280) {
    return { ok: false, error: "corrections are 1-280 chars" };
  }

  const rate = await checkRate("correction", user.id);
  if (!rate.allowed) return { ok: false, error: rate.message ?? "rate limited" };

  const admin = createAdminClient();

  // Insider-gate: user must have at least one insider_tag (MVP gate,
  // topic-scoped vouch check comes in Phase 2)
  const { data: me } = await admin
    .from("users")
    .select("insider_tags")
    .eq("id", user.id)
    .maybeSingle();

  const hasInsiderTags =
    (me as { insider_tags?: string[] | null } | null)?.insider_tags?.length;
  if (!hasInsiderTags) {
    return {
      ok: false,
      error:
        "only users with verified insider credentials can push back on whispers. earn vouches first.",
    };
  }

  // Can't correct yourself
  const { data: whisper } = await admin
    .from("whispers")
    .select("author_id")
    .eq("id", params.whisperId)
    .maybeSingle();
  if (whisper && (whisper as { author_id: string }).author_id === user.id) {
    return { ok: false, error: "can't correct your own whisper" };
  }

  const { error } = await admin.from("corrections").insert({
    whisper_id: params.whisperId,
    author_id: user.id,
    content,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "you already pushed back on this whisper" };
    }
    return { ok: false, error: error.message };
  }

  // Notify the original whisper author (push + email)
  if (whisper) {
    const authorId = (whisper as { author_id: string }).author_id;
    const [{ data: me }, { data: author }] = await Promise.all([
      admin
        .from("users")
        .select("handle, insider_tags")
        .eq("id", user.id)
        .maybeSingle(),
      admin.from("users").select("email").eq("id", authorId).maybeSingle(),
    ]);
    const insiderHandle = (me as { handle: string } | null)?.handle ?? "an insider";
    const insiderTag =
      (me as { insider_tags: string[] | null } | null)?.insider_tags?.[0]?.replace(
        /_/g,
        " ",
      ) ?? null;
    notifyUser(authorId, {
      kind: "correction.posted",
      title: `@${insiderHandle} pushed back on your whisper`,
      body: content.slice(0, 100),
      url: `/w/${params.whisperId}`,
    }).catch(() => {});
    const authorEmail = (author as { email: string | null } | null)?.email;
    if (authorEmail) {
      sendCorrectionEmail({
        to: authorEmail,
        insiderHandle,
        insiderTag,
        correctionText: content,
        whisperUrl: `https://chatter-ten-lemon.vercel.app/w/${params.whisperId}`,
      }).catch(() => {});
    }
  }

  revalidatePath(`/w/${params.whisperId}`);
  return { ok: true };
}
