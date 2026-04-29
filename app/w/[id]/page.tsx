/**
 * Whisper detail — `/w/{id}`
 * Parent whisper + replies thread + reply composer + insider-correction strip.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { WhisperCard } from "@/components/WhisperCard";
import { ReplyComposer } from "@/components/ReplyComposer";
import { CorrectionButton } from "@/components/CorrectionButton";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";
import {
  joinRowToWhisperRow,
  relativeTime,
  bestInsiderCredential,
  type WhisperJoinRow,
} from "@/lib/whisper";
import { fetchEchoedIds, fetchSavedIds } from "@/lib/queries";

export const revalidate = 15;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin
    .from("whispers")
    .select(
      "content_text, content_media_url, modality, users:author_id(handle, is_charter), topics:topic_id(name, emoji)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) {
    return {
      title: "whisper not found · chatter",
      description: "this whisper doesn't exist or has vanished.",
    };
  }
  const row = data as unknown as {
    content_text: string | null;
    content_media_url: string | null;
    modality: string;
    users: { handle: string; is_charter: boolean | null } | null;
    topics: { name: string; emoji: string | null } | null;
  };
  const handle = row.users?.handle ?? "someone";
  const charter = row.users?.is_charter ? " ✦" : "";
  const topic = row.topics?.name ?? "chatter";
  const emoji = row.topics?.emoji ?? "🤫";
  const text = row.content_text?.trim() || `[${row.modality}]`;
  const description = text.length > 180 ? text.slice(0, 177) + "..." : text;

  // Always prefer the dynamic OG image (renders the pull-quote) unless the
  // whisper itself has a media URL, in which case use that for visual whispers.
  const ogImage = row.content_media_url ?? `/api/og/whisper/${id}`;

  return {
    title: `${emoji} ${topic} · @${handle}${charter} · chatter`,
    description,
    openGraph: {
      title: `${emoji} ${topic} · @${handle}${charter}`,
      description,
      type: "article",
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${emoji} ${topic} · @${handle}${charter}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function WhisperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: raw } = await admin
    .from("whispers")
    .select(`
      id, author_id, topic_id, modality, content_text, content_transcript, content_media_url,
      content_duration_sec, scope, kind, is_whisper_tier, is_spoiler, is_breath,
      require_reply_approval, ttl, expires_at, deleted_at,
      echo_count, pass_count, corroboration_count, created_at,
      users:author_id ( handle, display_name, insider_tags, trust_score, is_charter ),
      topics:topic_id ( id, name, emoji, type )
    `)
    .eq("id", id)
    .maybeSingle();

  if (!raw || (raw as { deleted_at: string | null }).deleted_at) {
    notFound();
  }

  // Cast is OK — schema added columns are not on TS type yet
  const whisper = joinRowToWhisperRow(raw as unknown as WhisperJoinRow);

  // Load replies (child whispers via parent_id)
  const { data: replyRaw } = await admin
    .from("whispers")
    .select(`
      id, author_id, topic_id, modality, content_text, content_transcript, content_media_url,
      content_duration_sec, scope, kind, is_whisper_tier, hidden_by_author_at,
      echo_count, pass_count, corroboration_count, created_at,
      users:author_id ( handle, display_name, insider_tags, trust_score, is_charter ),
      topics:topic_id ( id, name, emoji, type )
    `)
    .eq("parent_id", id)
    .is("deleted_at", null)
    .is("hidden_by_author_at", null)
    .order("created_at", { ascending: true })
    .limit(40);

  const replies = ((replyRaw ?? []) as unknown as WhisperJoinRow[]).map(joinRowToWhisperRow);

  // Credential-weighted reply ranking — Pact-aligned alternative to "boost".
  // Charter members surface first, then insider-credentialled, then chronological.
  // No paid placement, no opaque amplification — just credential signal.
  replies.sort((a, b) => {
    const aCharter = a.author.is_charter ? 1 : 0;
    const bCharter = b.author.is_charter ? 1 : 0;
    if (aCharter !== bCharter) return bCharter - aCharter;
    const aInsider = (a.author.insider_tags?.length ?? 0) > 0 ? 1 : 0;
    const bInsider = (b.author.insider_tags?.length ?? 0) > 0 ? 1 : 0;
    if (aInsider !== bInsider) return bInsider - aInsider;
    return a.created_at.localeCompare(b.created_at);
  });

  // Load insider corrections (vouch-gated display — here: any insider, threshold refined later)
  const { data: correctionsRaw } = await admin
    .from("corrections")
    .select(`
      id, content, created_at,
      users:author_id ( handle, insider_tags )
    `)
    .eq("whisper_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  type Correction = {
    id: string;
    content: string;
    created_at: string;
    users: { handle: string; insider_tags: string[] | null };
  };
  const corrections = (correctionsRaw ?? []) as unknown as Correction[];

  // Auth state
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthed = Boolean(user);

  const allIds = [id, ...replies.map((r) => r.id)];
  const [echoedIds, savedIds] = await Promise.all([
    fetchEchoedIds(allIds),
    fetchSavedIds(allIds),
  ]);

  const isAuthor = user && user.id === whisper.author_id;

  // Can current user push back (submit correction)?
  let canCorrect = false;
  if (user && !isAuthor) {
    const { data: me } = await admin
      .from("users")
      .select("insider_tags")
      .eq("id", user.id)
      .maybeSingle();
    canCorrect = Boolean(
      (me as { insider_tags?: string[] | null } | null)?.insider_tags?.length,
    );
  }

  return (
    <main className="min-h-screen pb-28">
      <h1 className="sr-only">Whisper · Chatter</h1>
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/home" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>

      {/* Parent whisper — no ranking rule here, just content */}
      <WhisperCard
        whisper={whisper}
        initiallyEchoed={echoedIds.has(whisper.id)}
        initiallySaved={savedIds.has(whisper.id)}
        isAuthed={isAuthed}
      />

      {/* Corrections strip — if insiders pushed back */}
      {corrections.length > 0 && (
        <section className="mx-5 my-4 border border-gold/30 bg-gold/5 p-4">
          <p className="label-text text-red mb-3">
            {corrections.length} insider{corrections.length > 1 ? "s" : ""} pushed back
          </p>
          {corrections.map((c) => (
            <div key={c.id} className="py-2 border-t border-gold/20 first:border-t-0">
              <p className="body-text text-ink text-sm mb-1">{c.content}</p>
              <p className="mono-text text-[10px] text-muted">
                <span className="text-ink">@{c.users.handle}</span>
                {c.users.insider_tags && c.users.insider_tags.length > 0 && (
                  <>
                    {" · "}
                    <span className="italic text-gold">
                      {bestInsiderCredential(c.users.insider_tags)}
                    </span>
                  </>
                )}
                {" · "}
                {relativeTime(c.created_at)}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Reply thread */}
      <section className="pt-2 pb-4">
        {replies.length === 0 ? (
          <p className="px-5 py-8 text-center text-muted text-sm">
            No replies yet. Be the first — thoughtfully.
          </p>
        ) : (
          replies.map((r) => (
            <WhisperCard
              key={r.id}
              whisper={r}
              initiallyEchoed={echoedIds.has(r.id)}
              initiallySaved={savedIds.has(r.id)}
              isAuthed={isAuthed}
            />
          ))
        )}
      </section>

      {/* Reply composer — only for authed users */}
      {isAuthed && (
        <ReplyComposer
          parentId={id}
          topicId={whisper.topic_id}
          requiresApproval={
            (raw as unknown as { require_reply_approval: boolean }).require_reply_approval
          }
        />
      )}

      {!isAuthed && (
        <section className="px-5 py-6 border-t border-line text-center">
          <Link href="/auth/sign-in" className="btn-primary inline-flex">
            sign in to reply
          </Link>
        </section>
      )}

      {isAuthor && (
        <AuthorTools whisperId={whisper.id} />
      )}

      {isAuthed && !isAuthor && (
        <CorrectionButton whisperId={whisper.id} canCorrect={canCorrect} />
      )}

      <TabBar />
    </main>
  );
}

function AuthorTools({ whisperId }: { whisperId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { deleteOwnWhisper } = await import("@/lib/engagement-actions");
        const res = await deleteOwnWhisper(whisperId);
        if (res.ok) {
          redirect("/home");
        }
      }}
    >
      <div className="px-5 py-4 border-t border-line flex items-center justify-between">
        <span className="label-text text-muted">author tools</span>
        <button
          type="submit"
          className="text-warn text-xs hover:text-ink transition"
        >
          delete this whisper
        </button>
      </div>
    </form>
  );
}
