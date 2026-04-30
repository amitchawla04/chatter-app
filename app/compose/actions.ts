"use server";

/**
 * Compose server action — insert a new whisper into Supabase.
 * Flips the reciprocity_gate_crossed flag on first whisper (decision memo v1.1).
 */
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRate } from "@/lib/rate-limit";

export async function postWhisper(formData: FormData) {
  const content = ((formData.get("content") as string | null) ?? "").trim();
  const topicId = (formData.get("topicId") as string | null) ?? "";
  const requestedScope = ((formData.get("scope") as string | null) ?? "public") as
    | "private"
    | "circle"
    | "network"
    | "public";
  const requestedModality = ((formData.get("modality") as string | null) ?? "text") as
    | "text"
    | "voice"
    | "image"
    | "video"
    | "breath";
  const ttlRaw = (formData.get("ttl") as string | null) ?? "";
  const isSpoiler = (formData.get("is_spoiler") as string | null) === "on";
  const requireReplyApproval =
    (formData.get("require_reply_approval") as string | null) === "on";
  const mediaUrl = (formData.get("media_url") as string | null) ?? null;
  const mediaDurationRaw = formData.get("media_duration") as string | null;
  const mediaDuration = mediaDurationRaw ? parseInt(mediaDurationRaw, 10) : null;
  const quoteId = ((formData.get("quote_id") as string | null) ?? "").trim() || null;

  const isBreath = requestedModality === "breath";
  // Breath rules: 60-char cap, village-locked, 24h TTL
  const charLimit = isBreath ? 60 : 280;
  const scope = isBreath ? "circle" : requestedScope;
  const storedModality = isBreath ? "text" : requestedModality; // breath = text-variant under the hood
  const isMediaWhisper = storedModality === "voice" || storedModality === "image" || storedModality === "video";

  // For voice/image/video: content can be empty (caption optional), but media URL required
  if (!isMediaWhisper && (!content || content.length > charLimit)) {
    return {
      ok: false,
      error: isBreath
        ? "breaths are 1-60 characters."
        : "whispers are 1-280 characters.",
    };
  }
  if (isMediaWhisper && !mediaUrl) {
    return { ok: false, error: "media required for voice/image/video whisper." };
  }
  if (content.length > charLimit) {
    return { ok: false, error: `caption max ${charLimit} chars.` };
  }
  if (!topicId) {
    return { ok: false, error: "pick a topic for this whisper." };
  }

  // Scope-derived TTL per Chatter principle: more intimate → more ephemeral
  // public → permanent only (public-vanishing is weird)
  // circle / network → default 24h, user can override
  // private → default view_once, user can override
  // breath → 24h always
  let ttl: "permanent" | "24h" | "view_once";
  if (isBreath) {
    ttl = "24h";
  } else if (scope === "public") {
    ttl = "permanent";
  } else if (ttlRaw === "view_once" || ttlRaw === "24h" || ttlRaw === "permanent") {
    ttl = ttlRaw as typeof ttl;
  } else {
    ttl = scope === "private" ? "view_once" : "24h";
  }

  let expiresAt: string | null = null;
  if (ttl === "24h") {
    expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // Rate limit: 10 whispers/hour per user (Pact-aligned spam prevention)
  const rate = await checkRate("whisper", user.id);
  if (!rate.allowed) {
    return { ok: false, error: rate.message ?? "rate limited. try again later." };
  }

  const admin = createAdminClient();

  const { error: insertError } = await admin.from("whispers").insert({
    author_id: user.id,
    topic_id: topicId,
    modality: storedModality,
    content_text: content || null,
    content_media_url: mediaUrl,
    content_duration_sec: mediaDuration,
    scope,
    kind: quoteId ? "quote" : "opinion",
    is_whisper_tier: false,
    is_breath: isBreath,
    is_spoiler: isSpoiler,
    require_reply_approval: requireReplyApproval,
    ttl,
    expires_at: expiresAt,
    quote_id: quoteId,
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  // First-whisper flips the reciprocity gate (decision memo v1.1)
  await admin
    .from("users")
    .update({ reciprocity_gate_crossed: true, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .eq("reciprocity_gate_crossed", false);

  // Bust the home feed cache so our whisper appears immediately
  revalidatePath("/home");
  revalidatePath(`/t/${topicId}`);
  revalidatePath("/you");

  return { ok: true };
}
