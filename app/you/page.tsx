/**
 * /you — your profile.
 * Three states:
 *  1. Not signed in → CTA to sign-in
 *  2. Signed in, reciprocity gate not crossed → prompt to write first whisper
 *  3. Signed in, gate crossed → real profile with stats + own whispers
 */
import Link from "next/link";
import { Lock } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { WhisperCard } from "@/components/WhisperCard";
import { SignOutButton } from "@/components/SignOutButton";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  joinRowToWhisperRow,
  type WhisperJoinRow,
  type WhisperRow,
} from "@/lib/whisper";
import { getT } from "@/lib/i18n-server";
import type { Translator } from "@/lib/i18n";

export const revalidate = 30;

export default async function YouPage() {
  const supabase = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const { t } = await getT();

  if (!authUser) {
    return <NotSignedIn t={t} />;
  }

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (!me) {
    return <NotSignedIn t={t} />;
  }

  // Gate state
  if (!me.reciprocity_gate_crossed) {
    return <GateNotCrossed t={t} displayName={me.display_name} handle={me.handle} />;
  }

  // Own whispers
  const { data: raw } = await admin
    .from("whispers")
    .select(`
      id, author_id, topic_id, modality, content_text, content_transcript, content_media_url,
      content_duration_sec, scope, kind, is_whisper_tier,
      echo_count, pass_count, corroboration_count, created_at,
      users:author_id ( handle, display_name, insider_tags, trust_score, is_charter ),
      topics:topic_id ( id, name, emoji, type )
    `)
    .eq("author_id", me.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const whispers: WhisperRow[] = ((raw ?? []) as unknown as WhisperJoinRow[]).map(
    joinRowToWhisperRow,
  );

  // Tuned topics count
  const { count: tunedCount } = await admin
    .from("tunes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", me.id);

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <SignOutButton />
      </header>

      {/* Identity hero — Principle 4 (insider-sentence as typography) */}
      <section className="px-5 pt-8 pb-6 border-b border-line">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-line flex items-center justify-center text-lg text-ink font-medium">
            {me.display_name?.[0]?.toUpperCase() ?? "·"}
          </div>
          <div>
            <h1 className="display-text text-2xl text-ink">
              {me.display_name}
            </h1>
            <p className="mono-text text-xs text-muted">@{me.handle}</p>
          </div>
        </div>

        {me.insider_tags && me.insider_tags.length > 0 && (
          <p className="body-text text-sm text-ink mb-4">
            <span className="italic text-gold">
              {(me.insider_tags as string[])
                .map((t) => t.replace(/_/g, " "))
                .join(" · ")}
            </span>
          </p>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-line/50">
          <Stat label={t("you.stats.whispers")} value={whispers.length} />
          <Stat label={t("you.stats.tuned")} value={tunedCount ?? 0} />
          <Stat label={t("you.stats.trust")} value={me.trust_score ?? 0} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link
            href="/v"
            className="block border border-line px-3 py-2.5 text-center hover:border-red transition"
          >
            <div className="label-text text-[10px] text-muted">{t("you.tile.village")}</div>
            <div className="mono-text text-sm text-ink">{t("you.tile.threads")}</div>
          </Link>
          <Link
            href="/you/feeds"
            className="block border border-line px-3 py-2.5 text-center hover:border-red transition"
          >
            <div className="label-text text-[10px] text-muted">{t("you.tile.custom")}</div>
            <div className="mono-text text-sm text-ink">{t("you.tile.feeds")}</div>
          </Link>
          <Link
            href="/you/equity"
            className="block border border-line px-3 py-2.5 text-center hover:border-red transition"
          >
            <div className="label-text text-[10px] text-muted">{t("you.tile.ccep")}</div>
            <div className="mono-text text-sm text-ink">{t("you.tile.equity")}</div>
          </Link>
          <Link
            href="/you/vouches/network"
            className="block border border-line px-3 py-2.5 text-center hover:border-red transition"
          >
            <div className="label-text text-[10px] text-muted">{t("you.tile.vouch")}</div>
            <div className="mono-text text-sm text-ink">{t("you.tile.network")}</div>
          </Link>
        </div>
      </section>

      {/* Own whispers */}
      <section className="pb-8">
        {whispers.length === 0 ? (
          <p className="py-16 text-center text-muted text-sm">
            {t("you.your_whispers_empty")}
          </p>
        ) : (
          whispers.map((w) => (
            <WhisperCard
              key={w.id}
              whisper={w}
              rankingRule={t("you.ranking.your_whisper")}
              isAuthed={true}
            />
          ))
        )}
      </section>

      <TabBar />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className="mono-text text-xl text-ink">{value}</div>
      <div className="label-text text-[10px] text-muted mt-1">{label}</div>
    </div>
  );
}

function NotSignedIn({ t }: { t: Translator }) {
  return (
    <main className="min-h-screen pb-28 flex flex-col">
      <header className="px-5 py-4 flex items-center justify-between border-b border-line">
        <ChatterMark size="sm" />
      </header>
      <section className="flex-1 px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full border border-line flex items-center justify-center mb-8">
          <Lock size={22} strokeWidth={1.3} className="text-muted" />
        </div>
        <h1 className="display-text text-3xl text-ink mb-4 max-w-md">
          {t("you.notsignedin.heading")}
        </h1>
        <p className="body-text text-muted mb-10 max-w-sm">
          {t("you.notsignedin.body")}
        </p>
        <Link href="/auth/sign-in" className="btn-primary">
          {t("auth.sign_in")} <span>→</span>
        </Link>
      </section>
      <TabBar />
    </main>
  );
}

function GateNotCrossed({
  t,
  displayName,
  handle,
}: {
  t: Translator;
  displayName: string;
  handle: string;
}) {
  return (
    <main className="min-h-screen pb-28 flex flex-col">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <SignOutButton />
      </header>
      <section className="flex-1 px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full border border-line flex items-center justify-center mb-8">
          <Lock size={22} strokeWidth={1.3} className="text-muted" />
        </div>
        <p className="mono-text text-xs text-muted mb-3">
          @{handle}
        </p>
        <h1 className="display-text text-3xl sm:text-4xl text-ink mb-4 max-w-md">
          {t("you.gate.heading1")}
          <br />
          <span className="display-italic text-gold">
            {t("you.gate.heading2")}
          </span>
        </h1>
        <p className="body-text text-muted mb-10 max-w-sm">
          {t("you.gate.welcome")} {displayName}.
        </p>
        <Link href="/compose" className="btn-primary">
          {t("you.gate.cta")} <span>→</span>
        </Link>
      </section>
      <TabBar />
    </main>
  );
}
