/**
 * Passes inbox — the whispers OTHER people have passed to you, and ones you sent.
 * Ordered most-recent first, unread bold, read dimmed.
 */
import { redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { PassListItem } from "@/components/PassListItem";
import { EmptyState } from "@/components/EmptyState";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { relativeTime } from "@/lib/whisper";
import { getT } from "@/lib/i18n-server";

export const revalidate = 15;

type PassJoin = {
  id: string;
  created_at: string;
  note: string | null;
  opened_at: string | null;
  thanked_at: string | null;
  from_user_id: string;
  whisper_id: string;
  from_user: { handle: string; display_name: string; insider_tags: string[] | null };
  whispers: {
    id: string;
    content_text: string | null;
    content_transcript: string | null;
    modality: string;
    topics: { id: string; name: string; emoji: string | null };
  };
};

export default async function PassesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();
  const { data: raw } = await admin
    .from("passes")
    .select(`
      id, created_at, note, opened_at, thanked_at, from_user_id, whisper_id,
      from_user:from_user_id ( handle, display_name, insider_tags ),
      whispers:whisper_id (
        id, content_text, content_transcript, modality,
        topics:topic_id ( id, name, emoji )
      )
    `)
    .eq("to_user_id", user.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(40);

  const passes = (raw ?? []) as unknown as PassJoin[];
  const { t } = await getT();

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <h1 className="display-italic text-xl text-ink">{t("passes.title")}</h1>
        <div className="w-4" />
      </header>

      {passes.length === 0 ? (
        <EmptyState
          heading={t("passes.empty.heading")}
          body={t("passes.empty.body")}
          cta={{ label: "see what's live", href: "/live" }}
        />
      ) : (
        <section>
          <p className="px-5 py-2 mono-text text-[10px] uppercase tracking-wider text-muted bg-paper border-b border-line">
            ← swipe to thank · swipe → to archive
          </p>
          {passes.map((p) => {
            const excerpt =
              p.whispers.content_text ??
              p.whispers.content_transcript ??
              "[no preview]";
            return (
              <PassListItem
                key={p.id}
                pass={{
                  id: p.id,
                  whisper_id: p.whisper_id,
                  from_handle: p.from_user.handle,
                  topic_name: p.whispers.topics.name,
                  topic_emoji: p.whispers.topics.emoji,
                  excerpt,
                  note: p.note,
                  unread: !p.opened_at,
                  thanked: Boolean(p.thanked_at),
                  when: relativeTime(p.created_at),
                }}
              />
            );
          })}
        </section>
      )}

      <TabBar />
    </main>
  );
}
