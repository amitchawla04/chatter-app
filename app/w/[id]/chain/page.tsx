/**
 * Pass-chain page — `/w/{id}/chain` — CN24.
 *
 * Visualizes the scope-controlled distribution path of a whisper:
 *   author → A passes → B passes → C echoes
 *
 * Pact-aligned: never surfaces engagement metrics as competitive scoreboards.
 * The chain is a felt-shape — who heard it from whom, who said "I agree" with
 * an echo, where it stopped. The novel artifact of a network we invented.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { PassChainTree } from "@/components/PassChainTree";
import { MascotIcon } from "@/components/MascotIcon";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `pass chain · whisper ${id.slice(0, 8)} · chatter`,
    description: "How this whisper travelled — who passed it, who echoed.",
    robots: { index: false, follow: false },
  };
}

interface ChainRow {
  pass_id: string;
  from_user_id: string;
  from_handle: string;
  from_is_charter: boolean | null;
  to_user_id: string;
  to_handle: string;
  to_is_charter: boolean | null;
  to_echoed: boolean;
  depth: number;
  created_at: string;
}

export default async function PassChainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: whisperRaw } = await admin
    .from("whispers")
    .select(
      "id, content_text, content_transcript, modality, author_id, users:author_id(id, handle, is_charter), topics:topic_id(id, name, emoji)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!whisperRaw) notFound();

  const whisper = whisperRaw as unknown as {
    id: string;
    content_text: string | null;
    content_transcript: string | null;
    modality: string;
    author_id: string;
    users: { id: string; handle: string; is_charter: boolean | null } | null;
    topics: { id: string; name: string; emoji: string | null } | null;
  };

  const [{ data: chainRaw }, { data: directEchoesRaw }, { data: authorEchoesRaw }] = await Promise.all([
    admin.rpc("get_pass_chain", { p_whisper_id: id, p_max_depth: 6 }),
    // Direct echoers — no pass involved (their user_id never appears as `to_user_id` in the chain
    // OR appears with `to_echoed=false`). Easier: query echoes, then exclude pass-recipients client-side.
    admin
      .from("echoes")
      .select("user_id, users:user_id(id, handle, is_charter)")
      .eq("whisper_id", id)
      .neq("user_id", whisper.author_id)
      .limit(50),
    admin
      .from("echoes")
      .select("user_id", { count: "exact", head: false })
      .eq("whisper_id", id)
      .neq("user_id", whisper.author_id),
  ]);

  const edges = (chainRaw ?? []) as ChainRow[];
  const passRecipientIds = new Set(edges.map((e) => e.to_user_id));

  type EchoJoin = {
    user_id: string;
    users: { id: string; handle: string; is_charter: boolean | null } | null;
  };
  const directEchoers = ((directEchoesRaw ?? []) as unknown as EchoJoin[])
    .filter((r) => r.users && !passRecipientIds.has(r.user_id))
    .map((r) => ({
      id: r.users!.id,
      handle: r.users!.handle,
      is_charter: r.users!.is_charter,
    }));

  const totalEchoes = (authorEchoesRaw ?? []).length;
  const directEchoCount = totalEchoes - edges.filter((e) => e.to_echoed).length;

  const excerpt =
    (whisper.content_text ?? whisper.content_transcript ?? `[${whisper.modality}]`).slice(0, 200);

  return (
    <main className="min-h-screen pb-28 bg-canvas">
      <h1 className="sr-only">Pass chain · Chatter</h1>
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href={`/w/${id}`} className="text-muted hover:text-ink transition">
          ←
        </Link>
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>

      {/* Whisper context */}
      <section className="px-5 py-5 border-b border-line">
        <div className="flex items-center gap-3 mb-2">
          <MascotIcon name="brand-pass-chain" size={56} alt="pass chain" />
          <p className="label-text text-red">pass chain</p>
        </div>
        <p className="display-italic text-lg text-ink leading-snug line-clamp-3 mb-3">
          &ldquo;{excerpt}&rdquo;
        </p>
        <div className="flex items-center gap-2 mono-text text-[11px] text-muted">
          {whisper.topics?.emoji && <span>{whisper.topics.emoji}</span>}
          {whisper.topics && (
            <Link href={`/t/${whisper.topics.id}`} className="text-gold hover:text-red transition">
              {whisper.topics.name}
            </Link>
          )}
          {whisper.users && (
            <>
              <span>·</span>
              <span>by</span>
              <Link href={`/u/${whisper.users.handle}`} className="text-ink">
                @{whisper.users.handle}
              </Link>
            </>
          )}
        </div>
      </section>

      <PassChainTree
        rootAuthor={{
          id: whisper.users?.id ?? whisper.author_id,
          handle: whisper.users?.handle ?? "—",
          is_charter: whisper.users?.is_charter ?? null,
          echoed_directly: false,
          direct_echo_count: Math.max(0, directEchoCount),
        }}
        edges={edges}
        directEchoers={directEchoers}
      />

      <section className="px-5 py-6 mono-text text-[10px] text-muted border-t border-line/50 leading-relaxed">
        <p className="mb-1">
          <span className="text-ink uppercase tracking-wider">how to read</span>
        </p>
        <p>
          • the gold node is the original author. each row down is one pass.
          a red disc next to a name means that person echoed.
          chains stop when nobody passed further. depth capped at 6.
        </p>
      </section>

      <TabBar />
    </main>
  );
}
