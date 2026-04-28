/**
 * /v/new — create a new village thread.
 * Topic is required (threads are topic-scoped per Pact).
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { NewThreadForm } from "@/components/NewThreadForm";
import { fetchCurrentUserRow } from "@/lib/queries";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0;

export default async function NewThreadPage() {
  const me = await fetchCurrentUserRow();
  if (!me) redirect("/auth/sign-in?next=/v/new");

  // Show topics the user has tuned into; fall back to top heat-score topics
  const admin = createAdminClient();
  const { data: tunes } = await admin
    .from("tunes")
    .select("topics:topic_id ( id, name, emoji )")
    .eq("user_id", me.id);
  type TuneRow = { topics: { id: string; name: string; emoji: string | null } | null };
  let topics = ((tunes ?? []) as unknown as TuneRow[])
    .map((t) => t.topics)
    .filter((t): t is { id: string; name: string; emoji: string | null } => Boolean(t));

  if (topics.length === 0) {
    const { data: top } = await admin
      .from("topics")
      .select("id, name, emoji")
      .order("heat_score", { ascending: false })
      .limit(20);
    topics = (top ?? []) as { id: string; name: string; emoji: string | null }[];
  }

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/v" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>

      <section className="px-5 pt-6 pb-2">
        <h1 className="display-text text-3xl tracking-tighter text-ink mb-2">
          new thread
        </h1>
        <p className="body-text text-sm text-muted mb-6">
          pick a topic, name the thread, invite up to 11 villagers by handle.
        </p>
      </section>

      <NewThreadForm topics={topics} />

      <TabBar />
    </main>
  );
}
