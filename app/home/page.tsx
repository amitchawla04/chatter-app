/**
 * Home feed — Server Component.
 * Fetches public whispers directly from Supabase, renders with Craft Bet B+C cards.
 *
 * Ranking rules on cards are assigned based on content type — this is the
 * first pass; algorithmic ranking-rule assignment comes in a later session
 * (ties to user's vouch graph + tuned topics).
 */

import Link from "next/link";
import { PenLine } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { WhisperCard } from "@/components/WhisperCard";
import { HomeFilter } from "@/components/HomeFilter";
import { TopicRail, type TopicRailItem } from "@/components/TopicRail";
import { GlimpseStrip } from "@/components/GlimpseStrip";
import { OpeningMoment } from "@/components/OpeningMoment";
import {
  fetchPublicWhispers,
  fetchCurrentUserRow,
  fetchEchoedIds,
  fetchSavedIds,
  fetchGlimpseImages,
  fetchCorrectionPreviews,
} from "@/lib/queries";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const revalidate = 30; // feed refreshes every 30s on server

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter === "whispers" ? "whispers" : "all";

  const [whispers, currentUser, glimpses] = await Promise.all([
    fetchPublicWhispers(40),
    fetchCurrentUserRow(),
    fetchGlimpseImages(12),
  ]);

  const ids = whispers.map((w) => w.id);
  const [echoed, saved, corrections] = await Promise.all([
    fetchEchoedIds(ids),
    fetchSavedIds(ids),
    fetchCorrectionPreviews(ids),
  ]);

  const visible =
    filter === "whispers" ? whispers.filter((w) => w.is_whisper_tier) : whispers;

  const avatarInitial = currentUser?.display_name?.[0]?.toUpperCase() ?? "·";
  const isAuthed = Boolean(currentUser);

  // Build topic rail — user's tuned topics if authed, popular topics from feed if not
  const railTopics = await buildTopicRail(currentUser?.id, whispers);

  // Pick the freshest charter whisper as the proof-whisper for the opening moment
  const proof = whispers.find((w) => w.author.is_charter && w.content_text) ?? whispers[0];

  return (
    <main className="min-h-screen pb-28">
      <OpeningMoment
        proofText={proof?.content_text ?? null}
        proofAuthor={proof?.author.handle ?? null}
        proofTopic={proof?.topic.name ?? null}
        proofIsCharter={proof?.author.is_charter ?? false}
      />
      {/* Header */}
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" pulse="breath" />
        <div className="flex items-center gap-3">
          <Link
            href="/live"
            className="inline-flex items-center gap-1.5 mono-text text-[10px] uppercase tracking-wider text-red hover:text-ink transition"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            what&rsquo;s live
          </Link>
          {currentUser ? (
            <Link
              href="/you"
              className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-xs text-ink/80 font-medium hover:ring-1 hover:ring-red transition"
            >
              {avatarInitial}
            </Link>
          ) : (
            <Link
              href="/auth/sign-in"
              className="label-text text-red hover:text-ink transition text-[10px]"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Glimpse — last 24h photos from village (Pact 5: no view counts surfaced) */}
      <GlimpseStrip glimpses={glimpses} />

      {/* Topic rail — Principle 7 (topic-ring state) */}
      {railTopics.length > 0 && <TopicRail topics={railTopics} />}

      {/* Filter toggle */}
      <div className="px-5 pt-5 pb-3">
        <HomeFilter current={filter} />
      </div>

      {/* Feed */}
      <section className="pb-8">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-muted text-sm">
            No whispers yet. Be the first.
          </p>
        ) : (
          visible.map((w, i) => {
            // Ranking rule diversity — teaches Principle 3 across the feed
            const rule =
              w.is_whisper_tier && i === 0
                ? `because 3 in your village echoed this`
                : w.is_whisper_tier
                  ? `insider whisper — ${w.corroboration_count} insiders corroborated`
                  : i === 1
                    ? `live in your tuned topics`
                    : `because you tuned into ${w.topic.name}`;
            return (
              <WhisperCard
                key={w.id}
                whisper={w}
                rankingRule={rule}
                initiallyEchoed={echoed.has(w.id)}
                initiallySaved={saved.has(w.id)}
                isAuthed={isAuthed}
                correction={corrections.get(w.id) ?? null}
              />
            );
          })
        )}
      </section>

      {/* Floating compose button — gold, in thumb reach */}
      <Link
        href="/compose"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-red text-paper flex items-center justify-center shadow-lg hover:bg-paper transition-colors z-40"
        aria-label="Compose a whisper"
      >
        <PenLine size={22} strokeWidth={1.8} />
      </Link>

      <TabBar />
    </main>
  );
}

async function buildTopicRail(
  userId: string | undefined,
  whispers: { topic_id: string; topic: { id: string; name: string; emoji: string | null } }[],
): Promise<TopicRailItem[]> {
  // Aggregate up to 8 most-frequent topics from current feed for display
  const counts = new Map<string, { name: string; emoji: string | null; count: number }>();
  for (const w of whispers) {
    const cur = counts.get(w.topic_id);
    counts.set(w.topic_id, {
      name: w.topic.name,
      emoji: w.topic.emoji,
      count: (cur?.count ?? 0) + 1,
    });
  }
  const topPairs = Array.from(counts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);

  // If user is signed in, override state per their actual tunes + recency
  if (userId) {
    const admin = createAdminClient();
    const { data: tunes } = await admin
      .from("tunes")
      .select("topic_id")
      .eq("user_id", userId);
    const tuned = new Set((tunes ?? []).map((t) => t.topic_id));
    return topPairs.map(([id, t], i) => ({
      id,
      name: t.name,
      emoji: t.emoji,
      state: tuned.has(id)
        ? i === 0
          ? "live"
          : i < 3
            ? "unread-insider"
            : "vouched"
        : "dormant",
    }));
  }

  // Anonymous — show varied ring states for visual signal
  return topPairs.map(([id, t], i) => ({
    id,
    name: t.name,
    emoji: t.emoji,
    state:
      i === 0
        ? "live"
        : i === 1
          ? "unread-insider"
          : i === 2
            ? "unread-village"
            : i === 3
              ? "vouched"
              : "dormant",
  }));
}
