/**
 * Passes inbox — the whispers OTHER people have passed to you, and ones you sent.
 * Ordered most-recent first, unread bold, read dimmed.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { Send } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { relativeTime } from "@/lib/whisper";

export const revalidate = 15;

type PassJoin = {
  id: string;
  created_at: string;
  note: string | null;
  opened_at: string | null;
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
      id, created_at, note, opened_at, from_user_id, whisper_id,
      from_user:from_user_id ( handle, display_name, insider_tags ),
      whispers:whisper_id (
        id, content_text, content_transcript, modality,
        topics:topic_id ( id, name, emoji )
      )
    `)
    .eq("to_user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  const passes = (raw ?? []) as unknown as PassJoin[];

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <h1 className="display-italic text-xl text-ink">passes</h1>
        <div className="w-4" />
      </header>

      {passes.length === 0 ? (
        <section className="flex-1 px-6 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full border border-line flex items-center justify-center mb-6">
            <Send size={22} strokeWidth={1.3} className="text-muted" />
          </div>
          <h2 className="display-text text-2xl text-ink mb-3 max-w-md">
            quiet here.
          </h2>
          <p className="body-text text-muted max-w-xs">
            when someone passes a whisper to you, it lands here — just for you.
          </p>
        </section>
      ) : (
        <section>
          {passes.map((p) => {
            const excerpt =
              p.whispers.content_text ??
              p.whispers.content_transcript ??
              "[no preview]";
            const unread = !p.opened_at;
            return (
              <Link
                key={p.id}
                href={`/w/${p.whisper_id}`}
                className={`block px-5 py-4 border-b border-line transition-colors ${
                  unread ? "bg-gold/5 hover:bg-gold/10" : "hover:bg-paper"
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-xs text-muted">
                  <span className="text-ink font-medium">
                    @{p.from_user.handle}
                  </span>
                  <span className="opacity-40">passed you a whisper on</span>
                  {p.whispers.topics.emoji && <span>{p.whispers.topics.emoji}</span>}
                  <span className="text-gold">{p.whispers.topics.name}</span>
                  <span className="opacity-40">·</span>
                  <span className="mono-text">{relativeTime(p.created_at)}</span>
                </div>
                <p className="display-italic text-base text-ink leading-snug line-clamp-2">
                  &ldquo;{excerpt}&rdquo;
                </p>
                {p.note && (
                  <p className="mt-2 text-sm text-ink/70 italic border-l-2 border-gold/40 pl-3">
                    {p.note}
                  </p>
                )}
              </Link>
            );
          })}
        </section>
      )}

      <TabBar />
    </main>
  );
}
