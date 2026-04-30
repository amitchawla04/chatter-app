/**
 * Saved — whispers the user has bookmarked.
 * Feature B1 from 03-FEATURE-INVENTORY.md.
 */
import { redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { WhisperCard } from "@/components/WhisperCard";
import { EmptyState } from "@/components/EmptyState";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  joinRowToWhisperRow,
  type WhisperJoinRow,
} from "@/lib/whisper";
import { getT } from "@/lib/i18n-server";

export const revalidate = 30;

export default async function SavedPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();
  const { data: savesRaw } = await admin
    .from("saves")
    .select(`
      whisper_id, created_at,
      whispers:whisper_id (
        id, author_id, topic_id, modality, content_text, content_transcript, content_media_url,
        content_duration_sec, scope, kind, is_whisper_tier,
        echo_count, pass_count, corroboration_count, review_status, created_at,
        users:author_id ( handle, display_name, insider_tags, trust_score, is_charter ),
        topics:topic_id ( id, name, emoji, type )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  type SaveRow = { whisper_id: string; whispers: WhisperJoinRow };
  const whispers = ((savesRaw ?? []) as unknown as SaveRow[])
    .map((r) => r.whispers)
    .filter(Boolean)
    .map(joinRowToWhisperRow);

  const { t } = await getT();
  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <h1 className="display-italic text-xl text-ink">{t("saved.title")}</h1>
        <div className="w-4" />
      </header>

      {whispers.length === 0 ? (
        <EmptyState
          heading={t("saved.empty.heading")}
          body={t("saved.empty.body")}
          cta={{ label: "find a whisper to save", href: "/explore" }}
        />
      ) : (
        <section>
          {whispers.map((w) => (
            <WhisperCard
              key={w.id}
              whisper={w}
              rankingRule="saved by you"
              initiallySaved={true}
              isAuthed={true}
            />
          ))}
        </section>
      )}

      <TabBar />
    </main>
  );
}
