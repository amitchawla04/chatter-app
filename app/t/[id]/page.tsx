/**
 * Topic page — /t/{topicId}
 * Shows topic hero + topic-scoped whisper feed.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PenLine } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { WhisperCard } from "@/components/WhisperCard";
import { TuneInButton } from "@/components/TuneInButton";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { fetchTopicWhispers, fetchEchoedIds, fetchSavedIds } from "@/lib/queries";
import { topicTint } from "@/lib/topic-tint";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("topics")
    .select("name, emoji, description, tuned_in_count")
    .eq("id", id)
    .maybeSingle();
  if (!data) {
    return { title: "topic not found · chatter" };
  }
  const t = data as { name: string; emoji: string | null; description: string | null; tuned_in_count: number | null };
  const title = `${t.emoji ?? "·"} ${t.name} · chatter`;
  const description =
    t.description ??
    `whispers about ${t.name} from people who actually know · ${t.tuned_in_count ?? 0} tuned in`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: topic } = await admin
    .from("topics")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!topic) {
    notFound();
  }

  const whispers = await fetchTopicWhispers(id, 40);
  const ids = whispers.map((w) => w.id);
  const [echoedIds, savedIds] = await Promise.all([
    fetchEchoedIds(ids),
    fetchSavedIds(ids),
  ]);

  // Is the current user tuned in to this topic?
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let tunedIn = false;
  if (user) {
    const { data: tune } = await admin
      .from("tunes")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("topic_id", id)
      .maybeSingle();
    tunedIn = Boolean(tune);
  }
  const isAuthed = Boolean(user);

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/home" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>

      {/* Topic hero — tinted accent derived from emoji */}
      <section
        className="px-5 pt-10 pb-7 border-b border-line transition-colors"
        style={topicTint(topic.emoji).bgStyle}
      >
        <div className="flex items-center gap-3 mb-3">
          {topic.emoji && <span className="text-5xl drop-shadow-sm">{topic.emoji}</span>}
          <div>
            <h1 className="display-text text-3xl sm:text-4xl text-ink leading-tight">
              {topic.name}
            </h1>
            <p className="mono-text text-xs text-muted mt-1">
              {topic.type} · {topic.tuned_in_count ?? 0} tuned in · {whispers.length} whispers
            </p>
          </div>
        </div>
        {topic.description && (
          <p className="body-text text-ink/80 text-sm mb-4">{topic.description}</p>
        )}
        {user && <TuneInButton topicId={id} initiallyTuned={tunedIn} />}
      </section>

      <section className="pb-8">
        {whispers.length === 0 ? (
          <p className="py-16 text-center text-muted text-sm">
            No whispers on {topic.name} yet.
          </p>
        ) : (
          whispers.map((w, i) => {
            const rule =
              w.is_whisper_tier && i === 0
                ? `insider whisper — ${w.corroboration_count} insiders corroborated`
                : i === 0
                  ? `live in ${topic.name}`
                  : `because you're on ${topic.name}`;
            return (
              <WhisperCard
                key={w.id}
                whisper={w}
                rankingRule={rule}
                initiallyEchoed={echoedIds.has(w.id)}
                initiallySaved={savedIds.has(w.id)}
                isAuthed={isAuthed}
              />
            );
          })
        )}
      </section>

      <Link
        href={`/compose?topic=${id}`}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-red text-paper flex items-center justify-center shadow-lg hover:bg-paper transition-colors z-40"
        aria-label={`Whisper to ${topic.name}`}
      >
        <PenLine size={22} strokeWidth={1.8} />
      </Link>

      <TabBar />
    </main>
  );
}
