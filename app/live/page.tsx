/**
 * What's Live — calendar of live + upcoming events across user's tuned topics
 * (or all events for anon users). Retention Loop 1 surface.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { MascotIcon, type MascotName } from "@/components/MascotIcon";
import { createAdminClient } from "@/lib/supabase/admin";
import { relativeTime } from "@/lib/whisper";

export const revalidate = 30;

interface LiveEvent {
  id: string;
  topic_id: string;
  kind: "match" | "awards" | "news" | "premiere" | "space";
  status: "scheduled" | "live" | "finished";
  title: string;
  subtitle: string | null;
  starts_at: string;
  topics?: { name: string; emoji: string | null } | null;
}

const kindMascot: Record<LiveEvent["kind"], MascotName> = {
  match: "moment-match",
  awards: "moment-awards",
  news: "moment-news",
  premiere: "moment-premiere",
  space: "moment-space",
};

export default async function WhatsLivePage() {
  const admin = createAdminClient();

  const { data } = await admin
    .from("live_events")
    .select(`
      id, topic_id, kind, status, title, subtitle, starts_at,
      topics:topic_id ( name, emoji )
    `)
    .in("status", ["live", "scheduled"])
    .order("status", { ascending: true })
    .order("starts_at", { ascending: true });

  const events = (data ?? []) as unknown as LiveEvent[];
  const live = events.filter((e) => e.status === "live");
  const upcoming = events.filter((e) => e.status === "scheduled");

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <h1 className="display-italic text-xl text-ink">what&rsquo;s live</h1>
        <div className="w-4" />
      </header>

      <section className="px-5 py-5">
        <h2 className="label-text text-red mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
          live now · {live.length}
        </h2>
        {live.length === 0 ? (
          <p className="text-muted text-sm py-6">nothing live right now.</p>
        ) : (
          <div className="space-y-3">
            {live.map((e) => (
              <Link
                key={e.id}
                href={`/live/${e.id}`}
                className="block border border-line p-4 hover:border-red bg-paper transition-colors"
              >
                <div className="flex items-start gap-3">
                  <MascotIcon name={kindMascot[e.kind] ?? "moment-space"} size={48} alt={e.kind} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 mono-text text-[10px] uppercase tracking-wider text-muted">
                      <span>{e.kind}</span>
                      <span className="text-red">· LIVE</span>
                      {e.topics?.name && <span className="text-gold">· {e.topics.name}</span>}
                    </div>
                    <div className="display-italic text-lg text-ink">{e.title}</div>
                    {e.subtitle && (
                      <div className="mono-text text-[11px] text-muted mt-1">{e.subtitle}</div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 py-5 border-t border-line">
        <h2 className="label-text text-muted mb-3">upcoming · {upcoming.length}</h2>
        {upcoming.length === 0 ? (
          <p className="text-muted text-sm py-4">nothing scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((e) => {
              return (
                <Link
                  key={e.id}
                  href={`/live/${e.id}`}
                  className="block border border-line p-4 hover:border-line/60 bg-paper transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <MascotIcon name={kindMascot[e.kind] ?? "moment-space"} size={42} alt={e.kind} className="opacity-80" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 mono-text text-[10px] uppercase tracking-wider text-muted">
                        <span>{e.kind}</span>
                        <span>· in {relativeTime(e.starts_at).replace("-", "")}</span>
                        {e.topics?.name && <span className="text-gold">· {e.topics.name}</span>}
                      </div>
                      <div className="display-italic text-lg text-ink">{e.title}</div>
                      {e.subtitle && (
                        <div className="mono-text text-[11px] text-muted mt-1">
                          {e.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <TabBar />
    </main>
  );
}
