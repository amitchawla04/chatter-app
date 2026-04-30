/**
 * /moderation/log — moderator activity log (TM4).
 * Pact 11: every moderation decision is auditable, surfaceable to the affected
 * user via appeal flow. The log is moderator-readable; raw rows live in
 * mod_actions with RLS gated to is_moderator=true.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollText, ShieldAlert, EyeOff, ChevronUp, X, Pause } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { relativeTime } from "@/lib/whisper";

export const revalidate = 0;

interface ActionRow {
  id: string;
  mod_id: string;
  action: string;
  target_kind: string;
  target_id: string;
  report_id: string | null;
  note: string | null;
  created_at: string;
  mod: { handle: string; is_charter: boolean | null } | null;
}

const ICON_FOR: Record<string, typeof ScrollText> = {
  dismiss: X,
  hide_whisper: EyeOff,
  pause_user: Pause,
  escalate: ChevronUp,
  label_under_review: ShieldAlert,
  label_claim_under_review: ShieldAlert,
  clear_review_label: ScrollText,
};

const TONE_FOR: Record<string, string> = {
  dismiss: "text-muted",
  hide_whisper: "text-warn",
  pause_user: "text-red",
  escalate: "text-gold",
  label_under_review: "text-gold",
  label_claim_under_review: "text-gold",
  clear_review_label: "text-muted",
};

const VERB_FOR: Record<string, string> = {
  dismiss: "dismissed",
  hide_whisper: "hid whisper",
  pause_user: "paused user",
  escalate: "escalated to admin",
  label_under_review: "labelled UNDER REVIEW",
  label_claim_under_review: "labelled CLAIM UNDER REVIEW",
  clear_review_label: "cleared review label",
};

export default async function ModLogPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("users")
    .select("is_moderator, handle")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || !(me as { is_moderator: boolean }).is_moderator) notFound();

  const { data: rawActions } = await admin
    .from("mod_actions")
    .select(
      "id, mod_id, action, target_kind, target_id, report_id, note, created_at, mod:mod_id(handle, is_charter)",
    )
    .order("created_at", { ascending: false })
    .limit(80);

  const rows = (rawActions ?? []) as unknown as ActionRow[];

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/moderation" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <ChatterMark size="sm" />
        <span className="mono-text text-[10px] text-muted">activity log</span>
      </header>

      <section className="px-5 pt-6 pb-4 border-b border-line">
        <h1 className="display-text text-3xl tracking-tighter text-ink mb-2">
          activity log
        </h1>
        <p className="body-text text-sm text-muted mb-4">
          last {rows.length} moderator action{rows.length === 1 ? "" : "s"} · most recent first ·
          every action is audited and visible to the affected user via appeal.
        </p>
      </section>

      {rows.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <p className="text-muted text-sm">no actions logged yet.</p>
        </div>
      ) : (
        <ul>
          {rows.map((a) => {
            const Icon = ICON_FOR[a.action] ?? ScrollText;
            const tone = TONE_FOR[a.action] ?? "text-muted";
            const verb = VERB_FOR[a.action] ?? a.action.replace(/_/g, " ");
            const targetHref =
              a.target_kind === "whisper"
                ? `/w/${a.target_id}`
                : a.target_kind === "user"
                  ? `/u/${a.target_id}`
                  : null;
            return (
              <li key={a.id} className="border-b border-line px-5 py-3">
                <div className="flex items-start gap-3">
                  <Icon size={14} strokeWidth={1.5} className={`mt-0.5 ${tone} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink leading-snug">
                      <span className="font-medium">@{a.mod?.handle ?? "—"}</span>
                      <span className="text-muted"> {verb} on </span>
                      <span className="mono-text text-[10px] uppercase tracking-wider text-muted">
                        {a.target_kind}
                      </span>
                      {targetHref ? (
                        <>
                          {" "}
                          <Link
                            href={targetHref}
                            className="mono-text text-[11px] text-blue hover:text-red transition no-underline-link"
                          >
                            {a.target_id.slice(0, 8)}…
                          </Link>
                        </>
                      ) : (
                        <span className="mono-text text-[11px] text-muted">
                          {" "}
                          {a.target_id.slice(0, 12)}
                        </span>
                      )}
                    </p>
                    {a.note && (
                      <p className="body-text text-xs text-muted mt-1 italic">
                        note: {a.note}
                      </p>
                    )}
                    <p className="mono-text text-[10px] text-muted mt-1">
                      {relativeTime(a.created_at)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <TabBar />
    </main>
  );
}
