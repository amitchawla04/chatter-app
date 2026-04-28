/**
 * /founder — private real-time pulse dashboard.
 *
 * Editor's deck: who's online, what's whispering, what's live, charter pulse,
 * thread activity, advisor status. Refreshes every 30s.
 *
 * Gated by Amit's verified email — anyone else gets 404.
 *
 * NOT a Pact violation: no public popularity counts surfaced; this is a
 * private operator surface, like a CEO dashboard. Visible to Amit only.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { CharterBadge } from "@/components/CharterBadge";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { relativeTime } from "@/lib/whisper";

export const revalidate = 30; // pulse refreshes every 30s

const FOUNDER_EMAILS = new Set([
  "amit.chawla@reward360.co",
  "amit.chawla+chatter@reward360.co",
]);

export default async function FounderDashboard() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email || !FOUNDER_EMAILS.has(user.email.toLowerCase())) {
    notFound();
  }

  const admin = createAdminClient();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since60s = new Date(Date.now() - 60_000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Parallel pulse queries
  const [
    { count: usersTotal },
    { count: charterTotal },
    { count: whispersTotal },
    { count: whispers24h },
    { count: liveEvents },
    { count: threadsTotal },
    { count: invitesUnused },
    { data: recentWhispers },
    { data: liveNow },
    { data: activeWatchers },
    { data: recentThreads },
    { data: recentSignups },
    { data: corrections24h },
  ] = await Promise.all([
    admin.from("users").select("id", { count: "exact", head: true }),
    admin
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("is_charter", true),
    admin.from("whispers").select("id", { count: "exact", head: true }),
    admin
      .from("whispers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since24h),
    admin
      .from("live_events")
      .select("id", { count: "exact", head: true })
      .eq("status", "live"),
    admin
      .from("village_threads")
      .select("id", { count: "exact", head: true })
      .eq("is_archived", false),
    admin
      .from("invite_codes")
      .select("code", { count: "exact", head: true })
      .eq("archived", false)
      .lt("used_count", 1),
    admin
      .from("whispers")
      .select(`
        id, content_text, modality, scope, created_at, is_whisper_tier, corroboration_count,
        users:author_id ( handle, is_charter ),
        topics:topic_id ( name, emoji )
      `)
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("live_events")
      .select("id, title, home_label, away_label, home_score, away_score, minute_label, kind, status")
      .in("status", ["live", "scheduled"])
      .order("starts_at", { ascending: true })
      .limit(5),
    admin
      .from("live_event_viewers")
      .select(`
        event_id, last_seen_at,
        events:event_id ( title ),
        users:user_id ( handle, is_charter )
      `)
      .gte("last_seen_at", since60s)
      .order("last_seen_at", { ascending: false })
      .limit(20),
    admin
      .from("village_threads")
      .select(`
        id, name, last_message_at, creator_id, is_archived,
        topics:topic_id ( name, emoji ),
        users:creator_id ( handle, is_charter )
      `)
      .eq("is_archived", false)
      .order("last_message_at", { ascending: false })
      .limit(6),
    admin
      .from("users")
      .select("id, handle, display_name, created_at, is_charter, age_verified_at, reciprocity_gate_crossed")
      .gte("created_at", since7d)
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("corrections")
      .select(`
        id, content, created_at,
        users:author_id ( handle, insider_tags ),
        whispers:whisper_id ( content_text )
      `)
      .gte("created_at", since24h)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  type Whisper = {
    id: string;
    content_text: string | null;
    modality: string;
    scope: string;
    created_at: string;
    is_whisper_tier: boolean;
    corroboration_count: number;
    users: { handle: string; is_charter: boolean | null } | null;
    topics: { name: string; emoji: string | null } | null;
  };
  type Watcher = {
    event_id: string;
    last_seen_at: string;
    events: { title: string } | null;
    users: { handle: string; is_charter: boolean | null } | null;
  };
  type Thread = {
    id: string;
    name: string;
    last_message_at: string;
    creator_id: string;
    topics: { name: string; emoji: string | null } | null;
    users: { handle: string; is_charter: boolean | null } | null;
  };
  type Signup = {
    id: string;
    handle: string;
    display_name: string;
    created_at: string;
    is_charter: boolean | null;
    age_verified_at: string | null;
    reciprocity_gate_crossed: boolean | null;
  };
  type Correction = {
    id: string;
    content: string;
    created_at: string;
    users: { handle: string; insider_tags: string[] | null } | null;
    whispers: { content_text: string | null } | null;
  };

  const typedWhispers = (recentWhispers ?? []) as unknown as Whisper[];
  const typedWatchers = (activeWatchers ?? []) as unknown as Watcher[];
  const typedThreads = (recentThreads ?? []) as unknown as Thread[];
  const typedSignups = (recentSignups ?? []) as unknown as Signup[];
  const typedCorrections = (corrections24h ?? []) as unknown as Correction[];

  // Group active watchers by event
  const watchersByEvent = new Map<string, Watcher[]>();
  for (const w of typedWatchers) {
    const arr = watchersByEvent.get(w.event_id) ?? [];
    arr.push(w);
    watchersByEvent.set(w.event_id, arr);
  }

  return (
    <main className="min-h-screen pb-28 bg-canvas">
      <header className="sticky top-0 z-40 bg-ink text-paper px-5 py-4 flex items-center justify-between border-b border-gold">
        <Link href="/home" className="text-paper/60 hover:text-paper transition mono-text text-xs">
          ← home
        </Link>
        <div className="flex items-center gap-2">
          <span className="display-italic text-xl text-paper">
            chatter<span className="text-gold">.</span>
          </span>
          <span className="mono-text text-[10px] uppercase tracking-wider text-gold">
            founder pulse
          </span>
        </div>
        <span className="mono-text text-[10px] text-paper/60">
          {new Date().toISOString().slice(11, 19)} UTC
        </span>
      </header>

      {/* Top metrics row */}
      <section className="px-5 py-6 border-b border-line bg-paper">
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-4">
          <Stat label="users" value={usersTotal ?? 0} sub={`${charterTotal ?? 0} charter`} />
          <Stat label="whispers" value={whispersTotal ?? 0} sub={`${whispers24h ?? 0} in 24h`} />
          <Stat label="threads" value={threadsTotal ?? 0} sub="active" />
          <Stat label="live now" value={liveEvents ?? 0} sub="events" />
          <Stat label="watchers" value={typedWatchers.length} sub="last 60s" />
          <Stat label="invites" value={invitesUnused ?? 0} sub="unused" />
          <Stat
            label="signups"
            value={typedSignups.length}
            sub="last 7d"
          />
        </div>
      </section>

      {/* Live events with watcher chips */}
      <section className="px-5 py-5 border-b border-line">
        <h2 className="label-text text-muted mb-4">live events</h2>
        {(liveNow ?? []).length === 0 ? (
          <p className="text-muted text-sm">no events live or scheduled.</p>
        ) : (
          <ul className="space-y-3">
            {(liveNow ?? []).map((e) => {
              const watchers = watchersByEvent.get((e as { id: string }).id) ?? [];
              return (
                <li
                  key={(e as { id: string }).id}
                  className="border-l-2 border-red pl-4 py-2"
                >
                  <Link
                    href={`/live/${(e as { id: string }).id}`}
                    className="block hover:bg-paper transition-colors px-2 -mx-2 py-1"
                  >
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <h3 className="text-ink display-italic text-lg">
                        {(e as { title: string }).title}
                      </h3>
                      <span
                        className={`mono-text text-[10px] uppercase tracking-wider ${
                          (e as { status: string }).status === "live"
                            ? "text-red"
                            : "text-muted"
                        }`}
                      >
                        {(e as { status: string }).status}
                      </span>
                    </div>
                    {(e as { kind: string }).kind === "match" && (
                      <p className="mono-text text-sm text-ink">
                        {(e as { home_label: string | null }).home_label}{" "}
                        <span className="text-red font-semibold">
                          {(e as { home_score: number | null }).home_score ?? "—"}
                        </span>
                        {" — "}
                        <span className="text-red font-semibold">
                          {(e as { away_score: number | null }).away_score ?? "—"}
                        </span>{" "}
                        {(e as { away_label: string | null }).away_label}
                        {(e as { minute_label: string | null }).minute_label && (
                          <span className="text-muted ml-2">
                            · {(e as { minute_label: string | null }).minute_label}
                          </span>
                        )}
                      </p>
                    )}
                    {watchers.length > 0 && (
                      <p className="mt-2 mono-text text-[11px] text-gold">
                        {watchers.length} watching ·{" "}
                        <span className="text-muted">
                          {watchers
                            .slice(0, 5)
                            .map((w) => `@${w.users?.handle ?? "?"}`)
                            .join(", ")}
                          {watchers.length > 5 && ` +${watchers.length - 5}`}
                        </span>
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent whispers — last 8 */}
      <section className="px-5 py-5 border-b border-line">
        <h2 className="label-text text-muted mb-4">latest whispers</h2>
        <ul className="space-y-4">
          {typedWhispers.map((w) => (
            <li key={w.id} className="border-l border-line pl-4">
              <Link href={`/w/${w.id}`} className="block hover:bg-paper transition-colors">
                <div className="flex items-center gap-2 mb-1 mono-text text-[10px] text-muted">
                  {w.topics?.emoji && <span>{w.topics.emoji}</span>}
                  <span className="text-ink">{w.topics?.name}</span>
                  <span className="opacity-50">·</span>
                  <span>@{w.users?.handle}</span>
                  {w.users?.is_charter && <CharterBadge size="sm" />}
                  <span className="opacity-50">·</span>
                  <span className="text-blue uppercase">{w.scope}</span>
                  {w.is_whisper_tier && (
                    <>
                      <span className="opacity-50">·</span>
                      <span className="text-red">🤫 whisper</span>
                    </>
                  )}
                  <span className="opacity-50">·</span>
                  <span>{relativeTime(w.created_at)}</span>
                </div>
                <p className="display-italic text-base text-ink leading-snug line-clamp-2">
                  &ldquo;{w.content_text ?? "[media]"}&rdquo;
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Active threads */}
      <section className="px-5 py-5 border-b border-line">
        <h2 className="label-text text-muted mb-4">active threads</h2>
        {typedThreads.length === 0 ? (
          <p className="text-muted text-sm">no threads yet.</p>
        ) : (
          <ul className="space-y-2">
            {typedThreads.map((t) => (
              <li key={t.id} className="flex items-baseline justify-between border-b border-line/50 py-2">
                <div className="flex items-center gap-2 mono-text text-xs">
                  {t.topics?.emoji && <span>{t.topics.emoji}</span>}
                  <span className="text-ink">{t.name}</span>
                  <span className="opacity-50">·</span>
                  <span className="text-muted">@{t.users?.handle}</span>
                  {t.users?.is_charter && <CharterBadge size="sm" />}
                </div>
                <span className="mono-text text-[10px] text-muted">
                  {relativeTime(t.last_message_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Insider corrections — last 24h */}
      <section className="px-5 py-5 border-b border-line">
        <h2 className="label-text text-muted mb-4">insider corrections · 24h</h2>
        {typedCorrections.length === 0 ? (
          <p className="text-muted text-sm">no corrections in the last 24 hours.</p>
        ) : (
          <ul className="space-y-3">
            {typedCorrections.map((c) => (
              <li key={c.id} className="border-l-2 border-gold pl-4 py-1">
                <p className="text-sm text-ink mb-1">{c.content}</p>
                <p className="mono-text text-[10px] text-muted">
                  @{c.users?.handle}
                  {c.users?.insider_tags && c.users.insider_tags.length > 0 && (
                    <span className="text-gold italic">
                      {" "}
                      · {c.users.insider_tags[0].replace(/_/g, " ")}
                    </span>
                  )}
                  {" · "}
                  {relativeTime(c.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Recent signups */}
      <section className="px-5 py-5 border-b border-line">
        <h2 className="label-text text-muted mb-4">signups · last 7d</h2>
        {typedSignups.length === 0 ? (
          <p className="text-muted text-sm">no new signups this week.</p>
        ) : (
          <ul className="space-y-2">
            {typedSignups.map((s) => (
              <li key={s.id} className="flex items-baseline justify-between border-b border-line/50 py-2">
                <div className="flex items-center gap-2 mono-text text-xs">
                  <span className="text-ink">@{s.handle}</span>
                  <span className="text-muted">{s.display_name}</span>
                  {s.is_charter && <CharterBadge size="sm" />}
                  {s.reciprocity_gate_crossed ? (
                    <span className="text-red text-[10px]">✓ gate-crossed</span>
                  ) : s.age_verified_at ? (
                    <span className="text-gold text-[10px]">age-verified</span>
                  ) : (
                    <span className="text-muted text-[10px]">pending onboarding</span>
                  )}
                </div>
                <span className="mono-text text-[10px] text-muted">
                  {relativeTime(s.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Health */}
      <section className="px-5 py-5">
        <h2 className="label-text text-muted mb-4">health</h2>
        <div className="grid grid-cols-2 gap-3 mono-text text-[11px]">
          <div className="border border-line p-3">
            <div className="text-muted mb-1">live URL</div>
            <a
              href="https://chatter-ten-lemon.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-red hover:text-ink transition"
            >
              chatter-ten-lemon.vercel.app
            </a>
          </div>
          <div className="border border-line p-3">
            <div className="text-muted mb-1">supabase project</div>
            <span className="text-ink">kpgsrntbmzdqvspcyekf</span>
          </div>
          <div className="border border-line p-3">
            <div className="text-muted mb-1">refresh</div>
            <span className="text-ink">every 30s · auto</span>
          </div>
          <div className="border border-line p-3">
            <div className="text-muted mb-1">repos</div>
            <a
              href="https://github.com/amitchawla04/chatter-app"
              target="_blank"
              rel="noreferrer"
              className="text-red hover:text-ink transition block"
            >
              chatter-app
            </a>
            <a
              href="https://github.com/amitchawla04/chatter-meta"
              target="_blank"
              rel="noreferrer"
              className="text-red hover:text-ink transition block"
            >
              chatter-meta
            </a>
          </div>
        </div>
      </section>

      <TabBar />
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div>
      <div className="display-text text-2xl text-ink mono-text tabular-nums">{value}</div>
      <div className="label-text text-[10px] text-muted">{label}</div>
      {sub && (
        <div className="mono-text text-[10px] text-muted/70 mt-0.5">{sub}</div>
      )}
    </div>
  );
}
