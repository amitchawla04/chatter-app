/**
 * /you/feeds — manage custom feeds (X15 from gate analysis).
 * User curates topic-bundles → renders as their personal feed at /home?feed=XXX.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { CustomFeedsList } from "@/components/CustomFeedsList";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function FeedsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();
  const { data: feeds } = await admin
    .from("custom_feeds")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: tunes } = await admin
    .from("tunes")
    .select("topic_id, topics:topic_id(id, name, emoji)")
    .eq("user_id", user.id);

  type TuneRow = { topic_id: string; topics: { id: string; name: string; emoji: string | null } };
  const tunedTopics = ((tunes ?? []) as unknown as TuneRow[])
    .map((t) => t.topics)
    .filter(Boolean);

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link
          href="/you"
          className="text-muted hover:text-ink transition flex items-center gap-1 text-sm"
          aria-label="Back to profile"
        >
          <ChevronLeft size={18} strokeWidth={1.5} /> you
        </Link>
        <ChatterMark size="sm" />
        <div className="w-12" />
      </header>

      <section className="px-5 sm:px-10 py-8 max-w-2xl mx-auto">
        <p className="label-text text-red mb-3">custom feeds</p>
        <h1 className="display-text text-3xl text-ink mb-2">your feeds.</h1>
        <p className="body-text text-muted mb-10">
          bundle topics into a feed. switch between them on home. ranking is transparent — same as the main feed, just scoped.
        </p>

        <CustomFeedsList feeds={feeds ?? []} availableTopics={tunedTopics} />
      </section>

      <TabBar />
    </main>
  );
}
