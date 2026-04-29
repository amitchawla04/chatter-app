/**
 * /v/[id] — village thread detail.
 * Members-only · max 12 participants enforced by DB trigger.
 */
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { ThreadComposer } from "@/components/ThreadComposer";
import { CharterBadge } from "@/components/CharterBadge";
import { fetchThreadDetail, fetchCurrentUserRow } from "@/lib/queries";
import { relativeTime } from "@/lib/whisper";
import { leaveThread, markThreadRead } from "@/lib/thread-actions";
import { ThreadCreatorTools } from "@/components/ThreadCreatorTools";
import { ThreadPresence } from "@/components/ThreadPresence";

export const revalidate = 0;

export default async function ThreadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await fetchCurrentUserRow();
  if (!me) redirect(`/auth/sign-in?next=/v/${id}`);

  const detail = await fetchThreadDetail(id);
  if (!detail) notFound();

  // Mark this thread as read on view (fire-and-forget)
  markThreadRead(id).catch(() => {});

  const isCreator = detail.creator_id === me.id;

  return (
    <main className="min-h-screen pb-44">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/v" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <div className="flex flex-col items-center">
          <ChatterMark size="sm" />
        </div>
        <form
          action={async () => {
            "use server";
            await leaveThread(id);
            redirect("/v");
          }}
        >
          <button
            type="submit"
            className="text-muted hover:text-warn transition mono-text text-[10px] uppercase tracking-wider"
          >
            leave
          </button>
        </form>
      </header>

      <section className="px-5 pt-5 pb-4 border-b border-line">
        <div className="flex items-center gap-2 mb-2 mono-text text-xs text-muted">
          {detail.topic_emoji && <span>{detail.topic_emoji}</span>}
          <Link
            href={`/t/${detail.topic_id}`}
            className="text-ink hover:text-red transition"
          >
            {detail.topic_name}
          </Link>
          <span className="opacity-40">·</span>
          <span>{detail.participants.length} villagers</span>
          {isCreator && (
            <>
              <span className="opacity-40">·</span>
              <span className="text-gold italic">you created this</span>
            </>
          )}
        </div>
        <h1 className="display-text text-2xl tracking-tighter text-ink mb-3">
          {detail.name}
        </h1>
        <ul className="flex flex-wrap gap-1.5">
          {detail.participants.map((p) => (
            <li
              key={p.user_id}
              className="inline-flex items-center gap-1 px-2 py-0.5 border border-line text-[11px] mono-text"
            >
              @{p.handle}
              {p.is_charter && <CharterBadge size="sm" />}
              {isCreator && p.user_id !== me.id && (
                <ThreadCreatorTools
                  threadId={id}
                  memberUserId={p.user_id}
                  memberHandle={p.handle}
                  variant="kick"
                />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Realtime presence — who is in the room right now */}
      <ThreadPresence threadId={id} currentUserHandle={me.handle as string} currentUserId={me.id as string} />

      {/* Pinned message strip — creator-pinned context */}
      {detail.pinned_message && (
        <section className="px-5 py-3 border-b border-line bg-gold/10">
          <p className="mono-text text-[10px] uppercase tracking-wider text-gold mb-1">
            📌 pinned by creator
          </p>
          <p className="body-text text-sm text-ink leading-snug">
            {detail.pinned_message.content_text}
          </p>
          <p className="mono-text text-[10px] text-muted mt-1">
            @{detail.pinned_message.author_handle}
            {isCreator && (
              <ThreadCreatorTools
                threadId={id}
                messageId={null}
                variant="unpin"
              />
            )}
          </p>
        </section>
      )}

      <section className="px-5 py-4">
        {detail.messages.length === 0 ? (
          <p className="text-center text-muted text-sm py-12">
            no messages yet · break the silence.
          </p>
        ) : (
          <ul className="space-y-3">
            {detail.messages.map((m) => (
              <li
                key={m.id}
                className={`max-w-[85%] ${
                  m.is_self ? "ml-auto" : ""
                }`}
              >
                <div
                  className={`px-3 py-2 group relative ${
                    m.is_self
                      ? "bg-red text-paper"
                      : "bg-paper border border-line text-ink"
                  }`}
                >
                  <p className="body-text text-sm leading-snug whitespace-pre-wrap">
                    {m.content_text}
                  </p>
                  {isCreator && detail.pinned_message?.id !== m.id && (
                    <ThreadCreatorTools
                      threadId={id}
                      messageId={m.id}
                      variant="pin"
                    />
                  )}
                </div>
                <p
                  className={`mono-text text-[10px] text-muted mt-1 ${
                    m.is_self ? "text-right" : ""
                  }`}
                >
                  {!m.is_self && (
                    <>
                      <span className="text-ink">@{m.author_handle}</span>
                      {m.author_is_charter && (
                        <span className="text-gold italic"> · charter</span>
                      )}
                      {" · "}
                    </>
                  )}
                  {relativeTime(m.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ThreadComposer threadId={id} />

      <TabBar />
    </main>
  );
}
