/**
 * /activity — in-app notifications. Echo, vouch, correction, charter actions.
 * No push (Phase later). All in-app.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { EmptyState } from "@/components/EmptyState";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { relativeTime } from "@/lib/whisper";
import { getT } from "@/lib/i18n-server";

export const revalidate = 15;

interface EchoEvent {
  whisper_id: string;
  user_id: string;
  created_at: string;
  whispers: { content_text: string | null; topics: { name: string; emoji: string | null } | null } | null;
  users: { handle: string } | null;
}

export default async function ActivityPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();

  // Echoes on YOUR whispers
  const { data: echoesRaw } = await admin
    .from("echoes")
    .select(`
      whisper_id, user_id, created_at,
      whispers!inner(content_text, author_id, topics:topic_id(name, emoji)),
      users:user_id(handle)
    `)
    .eq("whispers.author_id", user.id)
    .neq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(40);

  const echoes = (echoesRaw ?? []) as unknown as EchoEvent[];
  const { t } = await getT();

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <h1 className="display-italic text-xl text-ink">{t("activity.title")}</h1>
        <div className="w-4" />
      </header>

      {echoes.length === 0 ? (
        <EmptyState
          heading={t("activity.empty.heading")}
          body={t("activity.empty.body")}
          cta={{ label: "go whisper something", href: "/compose" }}
        />
      ) : (
        <section>
          {echoes.map((e, i) => (
            <Link
              key={`${e.whisper_id}-${e.user_id}-${i}`}
              href={`/w/${e.whisper_id}`}
              className="block px-5 py-4 border-b border-line hover:bg-paper transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-line flex items-center justify-center text-xs text-ink mt-1">
                  {(e.users?.handle ?? "·")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="body-text text-sm text-ink">
                    <span className="font-medium">@{e.users?.handle}</span>{" "}
                    <span className="text-muted">echoed your whisper on</span>{" "}
                    {e.whispers?.topics?.emoji && <span>{e.whispers.topics.emoji}</span>}{" "}
                    <span className="text-red">{e.whispers?.topics?.name ?? "—"}</span>
                  </p>
                  {e.whispers?.content_text && (
                    <p className="display-italic text-sm text-ink/70 mt-1 line-clamp-2">
                      &ldquo;{e.whispers.content_text}&rdquo;
                    </p>
                  )}
                  <p className="mono-text text-[10px] text-muted mt-1">
                    {relativeTime(e.created_at)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      <TabBar />
    </main>
  );
}
