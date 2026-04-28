/**
 * /v — index of village threads the current user belongs to.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { fetchMyThreads, fetchCurrentUserRow } from "@/lib/queries";
import { relativeTime } from "@/lib/whisper";

export const revalidate = 0;

export default async function VillageThreadsIndex() {
  const me = await fetchCurrentUserRow();
  if (!me) redirect("/auth/sign-in?next=/v");

  const threads = await fetchMyThreads();

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/you" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <ChatterMark size="sm" />
        <Link
          href="/v/new"
          className="text-red hover:text-ink transition"
          aria-label="New thread"
        >
          <Plus size={20} strokeWidth={1.8} />
        </Link>
      </header>

      <section className="px-5 pt-6 pb-4 border-b border-line">
        <h1 className="display-text text-3xl tracking-tighter text-ink mb-2">
          village threads
        </h1>
        <p className="body-text text-sm text-muted">
          small group conversations · max 12 villagers per thread · scoped to one topic.
        </p>
      </section>

      <section>
        {threads.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-muted text-sm mb-6">
              no threads yet. start one with up to 11 villagers.
            </p>
            <Link href="/v/new" className="btn-primary inline-flex">
              new thread
            </Link>
          </div>
        ) : (
          <ul>
            {threads.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/v/${t.id}`}
                  className="block px-5 py-4 border-b border-line hover:bg-line/30 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {t.topic_emoji && (
                          <span className="text-base">{t.topic_emoji}</span>
                        )}
                        <h3 className="text-ink font-medium truncate">{t.name}</h3>
                        {t.is_creator && (
                          <span className="mono-text text-[9px] uppercase tracking-wider text-gold">
                            creator
                          </span>
                        )}
                      </div>
                      <p className="mono-text text-[11px] text-muted">
                        {t.topic_name} · {t.participant_count}{" "}
                        {t.participant_count === 1 ? "villager" : "villagers"}
                      </p>
                    </div>
                    <span className="mono-text text-[10px] text-muted shrink-0 mt-1">
                      {relativeTime(t.last_message_at)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <TabBar />
    </main>
  );
}
