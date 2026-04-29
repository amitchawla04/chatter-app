/**
 * Search — across topics, whispers, users.
 * Server-rendered with `?q=` param.
 */
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { SearchBar } from "@/components/SearchBar";
import { WhisperCard } from "@/components/WhisperCard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  joinRowToWhisperRow,
  type WhisperJoinRow,
  bestInsiderCredential,
} from "@/lib/whisper";
import { fetchEchoedIds, fetchSavedIds } from "@/lib/queries";

export const revalidate = 30;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const admin = createAdminClient();

  // Sanitize the query — reject Postgres OR injection by stripping commas/parens/quotes
  const safe = q.replace(/[,()'"]/g, "").slice(0, 100);

  const [topics, whispers, users, suggestionTopics] = await Promise.all([
    safe
      ? admin
          .from("topics")
          .select("id, name, emoji, type, description")
          .ilike("name", `%${safe}%`)
          .limit(12)
      : Promise.resolve({ data: [] }),
    safe
      ? admin
          .from("whispers")
          .select(`
            id, author_id, topic_id, modality, content_text, content_transcript, content_media_url,
            content_duration_sec, scope, kind, is_whisper_tier,
            echo_count, pass_count, corroboration_count, created_at,
            users:author_id ( handle, display_name, insider_tags, trust_score, is_charter ),
            topics:topic_id ( id, name, emoji, type )
          `)
          .or(`content_text.ilike.%${safe}%,content_transcript.ilike.%${safe}%`)
          .eq("scope", "public")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(15)
      : Promise.resolve({ data: [] }),
    safe
      ? admin
          .from("users")
          .select("id, handle, display_name, insider_tags")
          .or(`handle.ilike.%${safe}%,display_name.ilike.%${safe}%`)
          .limit(10)
      : Promise.resolve({ data: [] }),
    // Always fetch suggestions for the empty state
    !safe
      ? admin
          .from("topics")
          .select("id, name, emoji, type")
          .order("heat_score", { ascending: false, nullsFirst: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
  ]);

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = Boolean(user);
  const whisperList = ((whispers.data ?? []) as unknown as WhisperJoinRow[]).map(joinRowToWhisperRow);
  const ids = whisperList.map((w) => w.id);
  const [echoedIds, savedIds] = await Promise.all([
    fetchEchoedIds(ids),
    fetchSavedIds(ids),
  ]);

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/explore" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <h1 className="display-italic text-xl text-ink">search</h1>
        <div className="w-4" />
      </header>

      <div className="px-5 pt-5 pb-3">
        <SearchBar initial={q} />
      </div>

      {!q ? (
        <section className="px-5 py-8">
          <div className="text-center mb-8">
            <SearchIcon size={28} strokeWidth={1.3} className="text-muted mx-auto mb-4" />
            <p className="display-italic text-lg text-ink mb-1">find a topic, whisper, or person.</p>
            <p className="mono-text text-xs text-muted">try a team · show · person · keyword</p>
          </div>
          {(suggestionTopics.data ?? []).length > 0 && (
            <>
              <h2 className="label-text text-muted mb-3 text-center">trending now</h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {(suggestionTopics.data ?? []).map((t) => (
                  <Link
                    key={(t as { id: string }).id}
                    href={`/t/${(t as { id: string }).id}`}
                    className="topic-chip"
                  >
                    {(t as { emoji: string | null }).emoji && (
                      <span>{(t as { emoji: string | null }).emoji}</span>
                    )}
                    <span>{(t as { name: string }).name}</span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        <>
          {(topics.data ?? []).length > 0 && (
            <section className="border-b border-line">
              <h2 className="label-text text-muted px-5 pt-5 pb-3">
                topics · {(topics.data ?? []).length}
              </h2>
              <div className="px-5 pb-5 space-y-2">
                {(topics.data ?? []).map((t) => (
                  <Link
                    key={t.id}
                    href={`/t/${t.id}`}
                    className="flex items-center gap-3 p-3 border border-line hover:border-red bg-paper transition-colors"
                  >
                    {t.emoji && <span className="text-xl">{t.emoji}</span>}
                    <div className="flex-1">
                      <div className="display-italic text-base text-ink">{t.name}</div>
                      <div className="mono-text text-[10px] text-muted">{t.type}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {(users.data ?? []).length > 0 && (
            <section className="border-b border-line">
              <h2 className="label-text text-muted px-5 pt-5 pb-3">
                people · {(users.data ?? []).length}
              </h2>
              <div className="px-5 pb-5 space-y-2">
                {(users.data ?? []).map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-3 border border-line bg-paper"
                  >
                    <div className="w-9 h-9 rounded-full bg-line flex items-center justify-center text-sm text-ink">
                      {u.display_name?.[0]?.toUpperCase() ?? "·"}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-ink">@{u.handle}</div>
                      {u.insider_tags && u.insider_tags.length > 0 && (
                        <div className="mono-text text-[10px] italic text-gold">
                          {bestInsiderCredential(u.insider_tags as string[])}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {whisperList.length > 0 && (
            <section>
              <h2 className="label-text text-muted px-5 pt-5 pb-3">
                whispers · {whisperList.length}
              </h2>
              {whisperList.map((w) => (
                <WhisperCard
                  key={w.id}
                  whisper={w}
                  rankingRule={`matches "${q}"`}
                  initiallyEchoed={echoedIds.has(w.id)}
                  initiallySaved={savedIds.has(w.id)}
                  isAuthed={isAuthed}
                />
              ))}
            </section>
          )}

          {(topics.data ?? []).length === 0 &&
            (users.data ?? []).length === 0 &&
            whisperList.length === 0 && (
              <section className="px-5 py-12 text-center">
                <p className="display-italic text-lg text-ink mb-2">
                  nothing whispers for &ldquo;{q}&rdquo;.
                </p>
                <p className="mono-text text-xs text-muted mb-6">
                  try a different word, a related topic, or check spelling.
                </p>
                <Link
                  href="/search"
                  className="mono-text text-[11px] text-red hover:text-ink transition uppercase tracking-wider"
                >
                  ← back to trending
                </Link>
              </section>
            )}
        </>
      )}

      <TabBar />
    </main>
  );
}
