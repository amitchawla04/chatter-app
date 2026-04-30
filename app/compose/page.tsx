/**
 * Compose page — server component.
 * Loads user's tuned topics + renders the compose form (client component).
 */
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ComposeForm } from "@/components/ComposeForm";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; quoteId?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const admin = createAdminClient();

  // Quote-whisper (6.18): if ?quoteId is set, fetch the parent's preview
  let quote: {
    id: string;
    excerpt: string;
    author_handle: string;
    topic_name: string;
    topic_emoji: string | null;
  } | null = null;
  if (params.quoteId) {
    const { data: q } = await admin
      .from("whispers")
      .select(
        "id, content_text, content_transcript, topic_id, modality, users:author_id(handle), topics:topic_id(name, emoji, id)",
      )
      .eq("id", params.quoteId)
      .maybeSingle();
    if (q) {
      const row = q as unknown as {
        id: string;
        content_text: string | null;
        content_transcript: string | null;
        modality: string;
        topic_id: string;
        users: { handle: string } | null;
        topics: { name: string; emoji: string | null; id: string } | null;
      };
      quote = {
        id: row.id,
        excerpt:
          (row.content_text ??
            row.content_transcript ??
            `[${row.modality}]`).slice(0, 240),
        author_handle: row.users?.handle ?? "someone",
        topic_name: row.topics?.name ?? "",
        topic_emoji: row.topics?.emoji ?? null,
      };
    }
  }
  const { data: tunes } = await admin
    .from("tunes")
    .select("topic_id, topics:topic_id(id, name, emoji)")
    .eq("user_id", user.id)
    .limit(12);

  type TuneRow = { topic_id: string; topics: { id: string; name: string; emoji: string | null } };
  const tunedTopics = ((tunes ?? []) as unknown as TuneRow[])
    .map((t) => t.topics)
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  // Fallback: if user hasn't tuned anything yet, offer a sampling of popular topics
  let available = tunedTopics;
  if (available.length === 0) {
    const { data: fallback } = await admin
      .from("topics")
      .select("id, name, emoji")
      .order("tuned_in_count", { ascending: false, nullsFirst: false })
      .limit(8);
    available = (fallback ?? []) as typeof available;
  }

  // If ?topic=X is passed and the topic isn't in the user's available list, surface it too
  if (params.topic && !available.find((t) => t.id === params.topic)) {
    const { data: addl } = await admin
      .from("topics")
      .select("id, name, emoji")
      .eq("id", params.topic)
      .maybeSingle();
    if (addl) available = [addl, ...available];
  }

  return (
    <ComposeForm
      topics={available}
      initialTopicId={params.topic ?? quote?.id ?? available[0]?.id ?? ""}
      quote={quote}
    />
  );
}
