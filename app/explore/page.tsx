/**
 * /explore — browse topics by vertical + trending.
 * v0.2 · hero verticals as chip-row filter + card grid.
 */

import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60;

const VERTICALS: Array<{ key: string; label: string; types: string[] }> = [
  { key: "all", label: "All", types: [] },
  { key: "sports", label: "Sports", types: ["team", "player", "league", "competition", "event"] },
  { key: "shows", label: "Shows", types: ["show"] },
  { key: "music", label: "Music", types: ["person"] },
  { key: "tech", label: "Tech", types: ["brand"] },
  { key: "places", label: "Places", types: ["place"] },
  { key: "culture", label: "Culture", types: ["other"] },
];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const params = await searchParams;
  const selected = VERTICALS.find((v) => v.key === params.v) ?? VERTICALS[0];

  const admin = createAdminClient();
  let query = admin.from("topics").select("id, name, emoji, type, description").limit(60);

  if (selected.types.length > 0) {
    query = query.in("type", selected.types);
  }

  const { data: topics } = await query.order("name");

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <h1 className="display-italic text-xl text-ink">explore</h1>
        <Link
          href="/search"
          className="text-muted hover:text-red transition-colors"
          aria-label="Search"
        >
          <SearchIcon size={18} strokeWidth={1.5} />
        </Link>
      </header>

      {/* Vertical chip-row filter */}
      <div className="px-5 pt-5 pb-4 border-b border-line">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 no-scrollbar">
          {VERTICALS.map((v) => (
            <Link
              key={v.key}
              href={v.key === "all" ? "/explore" : `/explore?v=${v.key}`}
              data-selected={v.key === selected.key}
              className="topic-chip whitespace-nowrap"
            >
              {v.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Topic grid */}
      <section className="px-5 py-5">
        <p className="label-text text-muted mb-4">
          {selected.key === "all" ? "all topics" : `${selected.label} · ${topics?.length ?? 0}`}
        </p>
        {topics && topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topics.map((t) => (
              <Link
                key={t.id}
                href={`/t/${t.id}`}
                className="block border border-line hover:border-gold/40 transition-colors p-4"
              >
                <div className="flex items-start gap-3">
                  {t.emoji && <span className="text-2xl">{t.emoji}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="display-italic text-lg text-ink">{t.name}</div>
                    <div className="mono-text text-[10px] text-muted uppercase tracking-wider mt-0.5">
                      {t.type}
                    </div>
                    {t.description && (
                      <div className="body-text text-xs text-ink/70 mt-2 line-clamp-2">
                        {t.description}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted text-sm">
            No topics in this vertical yet.
          </p>
        )}
      </section>

      <TabBar />
    </main>
  );
}
