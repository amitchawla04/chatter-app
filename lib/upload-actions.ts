"use server";

/**
 * Media upload server action — accepts a File via FormData, stores to
 * Supabase Storage under the user's UID prefix, returns public URL.
 */
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKETS = {
  image: "whisper-images",
  voice: "whisper-voice",
  video: "whisper-video",
} as const;

const EXTENSIONS = {
  image: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" } as Record<string, string>,
  voice: { "audio/webm": "webm", "audio/mp4": "m4a", "audio/mpeg": "mp3", "audio/wav": "wav" } as Record<string, string>,
  video: { "video/webm": "webm", "video/mp4": "mp4" } as Record<string, string>,
};

export async function uploadMedia(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("file");
  const kind = formData.get("kind") as keyof typeof BUCKETS | null;

  if (!(file instanceof File)) {
    return { ok: false, error: "no file" };
  }
  if (!kind || !BUCKETS[kind]) {
    return { ok: false, error: "invalid kind" };
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not signed in" };

  const ext = EXTENSIONS[kind][file.type] ?? "bin";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(BUCKETS[kind])
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error) return { ok: false, error: error.message };

  const { data } = admin.storage.from(BUCKETS[kind]).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
