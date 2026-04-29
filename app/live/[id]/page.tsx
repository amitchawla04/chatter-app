/**
 * Live Event Mode — `/live/{event_id}`
 * Match Day · Awards · Premiere · Breaking News themes (kind enum dispatches register).
 * Hero score/title + event timeline + topic-scoped whisper feed + sticky composer.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trophy, Tv, Newspaper, Mic2 } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { WhisperCard } from "@/components/WhisperCard";
import { WatchTogether } from "@/components/WatchTogether";
import { MomentWhisper } from "@/components/MomentWhisper";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { fetchTopicWhispers, fetchEchoedIds, fetchSavedIds } from "@/lib/queries";
import { relativeTime } from "@/lib/whisper";

export const revalidate = 10;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("live_events")
    .select("title, subtitle, status, home_label, away_label, home_score, away_score, minute_label, kind")
    .eq("id", id)
    .maybeSingle();
  if (!data) {
    return { title: "event not found · chatter" };
  }
  const e = data as {
    title: string;
    subtitle: string | null;
    status: string;
    home_label: string | null;
    away_label: string | null;
    home_score: number | null;
    away_score: number | null;
    minute_label: string | null;
    kind: string;
  };
  const score =
    e.kind === "match" && e.home_score !== null && e.away_score !== null
      ? ` · ${e.home_label} ${e.home_score} — ${e.away_score} ${e.away_label}${e.minute_label ? ` · ${e.minute_label}` : ""}`
      : "";
  const liveTag = e.status === "live" ? "🔴 LIVE · " : "";
  const title = `${liveTag}${e.title}${score} · chatter`;
  const description = e.subtitle ?? `live whispers from ${e.title}`;
  const ogImage = `/api/og/event/${id}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

interface LiveEvent {
  id: string;
  topic_id: string;
  kind: "match" | "awards" | "news" | "premiere" | "space";
  status: "scheduled" | "live" | "finished";
  title: string;
  subtitle: string | null;
  home_label: string | null;
  away_label: string | null;
  home_score: number | null;
  away_score: number | null;
  minute_label: string | null;
  starts_at: string;
}

interface Moment {
  id: string;
  kind: "goal" | "yellow" | "red" | "sub" | "break" | "highlight" | "other";
  minute_label: string | null;
  side: "home" | "away" | null;
  description: string;
  occurred_at: string;
}

const kindIcon = {
  match: Trophy,
  awards: Trophy,
  premiere: Tv,
  news: Newspaper,
  space: Mic2,
} as const;

export default async function LiveEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: event } = await admin
    .from("live_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();
  const e = event as unknown as LiveEvent;

  const [{ data: momentsRaw }, { data: topicRaw }, whispers] = await Promise.all([
    admin
      .from("live_event_moments")
      .select("*")
      .eq("event_id", id)
      .order("occurred_at", { ascending: true }),
    admin.from("topics").select("id, name, emoji").eq("id", e.topic_id).maybeSingle(),
    fetchTopicWhispers(e.topic_id, 30),
  ]);

  const moments = (momentsRaw ?? []) as Moment[];
  const topic = topicRaw as { id: string; name: string; emoji: string | null } | null;

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = Boolean(user);
  const ids = whispers.map((w) => w.id);
  const [echoedIds, savedIds] = await Promise.all([
    fetchEchoedIds(ids),
    fetchSavedIds(ids),
  ]);

  const Icon = kindIcon[e.kind] ?? Trophy;

  return (
    <main className="min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/home" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <div className="flex items-center gap-2">
          <ChatterMark size="sm" />
          {e.status === "live" && (
            <span className="inline-flex items-center gap-1.5 mono-text text-[10px] uppercase tracking-wider text-red">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
              live
            </span>
          )}
        </div>
        <div className="w-4" />
      </header>

      {/* Hero — varies by event kind */}
      {e.kind === "match" ? (
        <section className="px-5 py-7 border-b border-line text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-xs mono-text text-muted">
            <Icon size={14} strokeWidth={1.5} />
            <span>{e.subtitle}</span>
          </div>

          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-right flex-1">
              <div className="display-italic text-xl text-ink">{e.home_label}</div>
            </div>
            <div className="display-text text-5xl text-ink mono-text tracking-tight">
              {e.home_score ?? "—"} <span className="text-muted/60">·</span> {e.away_score ?? "—"}
            </div>
            <div className="text-left flex-1">
              <div className="display-italic text-xl text-ink">{e.away_label}</div>
            </div>
          </div>

          {e.minute_label && (
            <p className="mono-text text-sm text-red font-medium">{e.minute_label}</p>
          )}
        </section>
      ) : (
        <section className="px-5 py-8 border-b border-line text-center">
          <div className="flex items-center justify-center gap-2 mb-3 text-xs mono-text text-muted">
            <Icon size={14} strokeWidth={1.5} />
            <span>{e.subtitle}</span>
          </div>
          <h1 className="display-italic text-3xl sm:text-4xl text-ink mb-2">{e.title}</h1>
          {e.minute_label && (
            <p className="mono-text text-sm text-red font-medium">{e.minute_label}</p>
          )}
        </section>
      )}

      {/* Watch-together presence — only renders if 1+ viewers active in last 60s */}
      <WatchTogether eventId={e.id} isAuthed={isAuthed} />

      {/* Event timeline */}
      {moments.length > 0 && (
        <section className="px-5 py-5 border-b border-line">
          <h2 className="label-text text-muted mb-3">timeline</h2>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
            {moments.map((m) => (
              <div
                key={m.id}
                className={`flex-shrink-0 px-3 py-2 border bg-paper text-xs mono-text ${
                  m.kind === "goal"
                    ? "border-l-2 border-l-red border-line text-ink"
                    : m.kind === "red"
                      ? "border-l-2 border-l-warn border-line text-ink"
                      : m.kind === "yellow"
                        ? "border-l-2 border-l-gold border-line text-ink"
                        : "border-line text-ink/80"
                }`}
              >
                {m.minute_label && (
                  <span className="text-red font-medium mr-1">{m.minute_label}</span>
                )}
                <span className="uppercase text-[10px] mr-1.5 text-muted">{m.kind}</span>
                <span>{m.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Topic-scoped feed */}
      <section>
        <h2 className="label-text text-muted px-5 pt-5 pb-3">
          live whispers · {topic?.name ?? "this event"}
        </h2>
        {whispers.length === 0 ? (
          <p className="px-5 py-12 text-center text-muted text-sm">
            No whispers yet. Be the first to react.
          </p>
        ) : (
          whispers.map((w) => (
            <WhisperCard
              key={w.id}
              whisper={w}
              rankingRule={`live · ${e.title}`}
              initiallyEchoed={echoedIds.has(w.id)}
              initiallySaved={savedIds.has(w.id)}
              isAuthed={isAuthed}
            />
          ))
        )}
      </section>

      {/* Moment-whisper — opens inline mini composer with event context, auto-triggers on score change */}
      <MomentWhisper
        eventId={e.id}
        eventTopicId={e.topic_id}
        eventTitle={e.title}
        isAuthed={isAuthed}
        homeLabel={e.home_label}
        awayLabel={e.away_label}
        homeScore={e.home_score}
        awayScore={e.away_score}
        minuteLabel={e.minute_label}
        status={e.status}
      />

      <TabBar />
    </main>
  );
}
