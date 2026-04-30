/**
 * /moderation — moderator triage queue (TM1).
 * Filters: by target kind (all/whisper/user/topic), by status (open/escalated),
 * by reporter charter status. Each open report supports dismiss / label /
 * hide-whisper / pause-user / escalate-to-admin.
 *
 * Pact: every action audited. Mods can also see the global activity log at
 * /moderation/log (TM4).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScrollText } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { ModerationItem } from "@/components/ModerationItem";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0;

type Filter = "all" | "whisper" | "user" | "topic";
type StatusFilter = "open" | "escalated";

export default async function ModerationQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; status?: string; charter?: string }>;
}) {
  const sp = await searchParams;
  const kind: Filter = (sp.kind === "whisper" || sp.kind === "user" || sp.kind === "topic") ? sp.kind : "all";
  const status: StatusFilter = sp.status === "escalated" ? "escalated" : "open";
  const charterOnly = sp.charter === "1";

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("users")
    .select("id, is_moderator, handle")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || !(me as { is_moderator: boolean }).is_moderator) notFound();

  let q = admin
    .from("reports")
    .select(`
      id, target_kind, target_id, reason, context, created_at, status, escalated_at,
      reporter:reporter_id ( handle, is_charter )
    `)
    .order("created_at", { ascending: false })
    .limit(50);
  if (status === "escalated") {
    q = q.not("escalated_at", "is", null).eq("status", "open");
  } else {
    q = q.eq("status", "open");
  }
  if (kind !== "all") q = q.eq("target_kind", kind);
  const { data: openReports } = await q;

  type ReportRow = {
    id: string;
    target_kind: "whisper" | "user" | "topic";
    target_id: string;
    reason: string;
    context: string | null;
    created_at: string;
    status: string;
    escalated_at: string | null;
    reporter: { handle: string; is_charter: boolean | null } | null;
  };
  let reports = (openReports ?? []) as unknown as ReportRow[];
  if (charterOnly) reports = reports.filter((r) => r.reporter?.is_charter);

  const whisperIds = reports.filter((r) => r.target_kind === "whisper").map((r) => r.target_id);
  const userIds = reports.filter((r) => r.target_kind === "user").map((r) => r.target_id);

  const [{ data: whispers }, { data: users }] = await Promise.all([
    whisperIds.length > 0
      ? admin
          .from("whispers")
          .select("id, content_text, modality, scope, author_id, review_status, users:author_id(handle)")
          .in("id", whisperIds)
      : Promise.resolve({ data: [] }),
    userIds.length > 0
      ? admin.from("users").select("id, handle, display_name").in("id", userIds)
      : Promise.resolve({ data: [] }),
  ]);

  type Whisper = {
    id: string;
    content_text: string | null;
    modality: string;
    scope: string;
    review_status: "claim_under_review" | "under_review" | null;
    users: { handle: string } | null;
  };
  type UserPreview = { id: string; handle: string; display_name: string };

  const whisperMap = new Map<string, Whisper>(
    ((whispers ?? []) as unknown as Whisper[]).map((w) => [w.id, w]),
  );
  const userMap = new Map<string, UserPreview>(
    ((users ?? []) as unknown as UserPreview[]).map((u) => [u.id, u]),
  );

  const [
    { count: actionedTotal },
    { count: dismissedTotal },
    { count: escalatedTotal },
  ] = await Promise.all([
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "actioned"),
    admin.from("reports").select("id", { count: "exact", head: true }).eq("status", "dismissed"),
    admin
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .not("escalated_at", "is", null),
  ]);

  const params = (overrides: Partial<{ kind: Filter; status: StatusFilter; charter: boolean }>) => {
    const next = new URLSearchParams();
    const k = overrides.kind ?? kind;
    const s = overrides.status ?? status;
    const c = overrides.charter ?? charterOnly;
    if (k !== "all") next.set("kind", k);
    if (s !== "open") next.set("status", s);
    if (c) next.set("charter", "1");
    const qs = next.toString();
    return qs ? `/moderation?${qs}` : "/moderation";
  };

  const FilterChip = ({
    label,
    href,
    active,
  }: {
    label: string;
    href: string;
    active: boolean;
  }) => (
    <Link
      href={href}
      className={`mono-text text-[11px] uppercase tracking-wider px-2.5 py-1 transition border no-underline-link ${
        active ? "border-red bg-red text-canvas" : "border-line text-ink hover:border-ink"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/home" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <ChatterMark size="sm" />
        <Link
          href="/moderation/log"
          className="mono-text text-[10px] text-muted hover:text-ink transition flex items-center gap-1.5 no-underline-link"
        >
          <ScrollText size={12} strokeWidth={1.5} />
          activity log
        </Link>
      </header>

      <section className="px-5 pt-6 pb-4 border-b border-line">
        <h1 className="display-text text-3xl tracking-tighter text-ink mb-2">
          moderation queue
        </h1>
        <p className="body-text text-sm text-muted mb-4">
          @{(me as { handle: string }).handle} · open reports · every action audited
        </p>
        <div className="flex gap-4 mono-text text-[11px] mb-4">
          <span>
            <span className="text-red font-medium">{reports.length}</span>{" "}
            <span className="text-muted">in view</span>
          </span>
          <span>
            <span className="text-gold font-medium">{escalatedTotal ?? 0}</span>{" "}
            <span className="text-muted">escalated</span>
          </span>
          <span>
            <span className="text-ink">{actionedTotal ?? 0}</span>{" "}
            <span className="text-muted">actioned</span>
          </span>
          <span>
            <span className="text-ink">{dismissedTotal ?? 0}</span>{" "}
            <span className="text-muted">dismissed</span>
          </span>
        </div>

        {/* TM1: filters */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mono-text text-[10px] uppercase tracking-wider text-muted mr-1">kind ·</span>
            {(["all", "whisper", "user", "topic"] as const).map((k) => (
              <FilterChip key={k} label={k} href={params({ kind: k })} active={kind === k} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mono-text text-[10px] uppercase tracking-wider text-muted mr-1">view ·</span>
            <FilterChip label="open" href={params({ status: "open" })} active={status === "open"} />
            <FilterChip label="escalated only" href={params({ status: "escalated" })} active={status === "escalated"} />
            <FilterChip
              label={charterOnly ? "charter ✓" : "charter only"}
              href={params({ charter: !charterOnly })}
              active={charterOnly}
            />
          </div>
        </div>
      </section>

      <section>
        {reports.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-muted text-sm">queue is clean. no reports match these filters.</p>
          </div>
        ) : (
          <ul>
            {reports.map((r) => (
              <ModerationItem
                key={r.id}
                report={r}
                whisper={r.target_kind === "whisper" ? whisperMap.get(r.target_id) ?? null : null}
                userTarget={r.target_kind === "user" ? userMap.get(r.target_id) ?? null : null}
              />
            ))}
          </ul>
        )}
      </section>

      <TabBar />
    </main>
  );
}
