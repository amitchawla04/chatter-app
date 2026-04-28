/**
 * /moderation — open-reports triage queue. Moderator-only.
 * Pact: every action audited (resolved_at + resolver). Mods can dismiss, hide
 * the targeted whisper, or pause the targeted user.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { ModerationItem } from "@/components/ModerationItem";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0;

export default async function ModerationQueuePage() {
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

  const { data: openReports } = await admin
    .from("reports")
    .select(`
      id, target_kind, target_id, reason, context, created_at, status,
      reporter:reporter_id ( handle, is_charter )
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(50);

  type ReportRow = {
    id: string;
    target_kind: "whisper" | "user" | "topic";
    target_id: string;
    reason: string;
    context: string | null;
    created_at: string;
    status: string;
    reporter: { handle: string; is_charter: boolean | null } | null;
  };

  const reports = (openReports ?? []) as unknown as ReportRow[];

  // Hydrate whisper / user / topic preview for each report
  const whisperIds = reports
    .filter((r) => r.target_kind === "whisper")
    .map((r) => r.target_id);
  const userIds = reports.filter((r) => r.target_kind === "user").map((r) => r.target_id);

  const [{ data: whispers }, { data: users }] = await Promise.all([
    whisperIds.length > 0
      ? admin
          .from("whispers")
          .select("id, content_text, modality, scope, author_id, users:author_id(handle)")
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
    users: { handle: string } | null;
  };
  type UserPreview = { id: string; handle: string; display_name: string };

  const whisperMap = new Map<string, Whisper>(
    ((whispers ?? []) as unknown as Whisper[]).map((w) => [w.id, w]),
  );
  const userMap = new Map<string, UserPreview>(
    ((users ?? []) as unknown as UserPreview[]).map((u) => [u.id, u]),
  );

  const { count: actionedTotal } = await admin
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "actioned");
  const { count: dismissedTotal } = await admin
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "dismissed");

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/home" className="text-muted hover:text-ink transition">
          ←
        </Link>
        <ChatterMark size="sm" />
        <span className="mono-text text-[10px] text-muted">
          mod · @{(me as { handle: string }).handle}
        </span>
      </header>

      <section className="px-5 pt-6 pb-4 border-b border-line">
        <h1 className="display-text text-3xl tracking-tighter text-ink mb-2">
          moderation queue
        </h1>
        <p className="body-text text-sm text-muted mb-4">
          open reports · triaged in order received · every action audited.
        </p>
        <div className="flex gap-4 mono-text text-[11px]">
          <span>
            <span className="text-red font-medium">{reports.length}</span>{" "}
            <span className="text-muted">open</span>
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
      </section>

      <section>
        {reports.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-muted text-sm">no open reports. queue is clean.</p>
          </div>
        ) : (
          <ul>
            {reports.map((r) => (
              <ModerationItem
                key={r.id}
                report={r}
                whisper={
                  r.target_kind === "whisper" ? whisperMap.get(r.target_id) ?? null : null
                }
                userTarget={
                  r.target_kind === "user" ? userMap.get(r.target_id) ?? null : null
                }
              />
            ))}
          </ul>
        )}
      </section>

      <TabBar />
    </main>
  );
}
