import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { TabBar } from "@/components/TabBar";
import { InsiderClaimReviewItem } from "@/components/InsiderClaimReviewItem";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { relativeTime } from "@/lib/whisper";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Insider claims · founder · chatter",
};

export default async function InsiderClaimsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const admin = createAdminClient();
  const { data: meRow } = await admin
    .from("users")
    .select("is_moderator")
    .eq("id", user.id)
    .maybeSingle();
  if (!meRow || !(meRow as { is_moderator: boolean }).is_moderator) notFound();

  const { data: claims } = await admin
    .from("insider_claims")
    .select("id, tag, status, evidence_url, evidence_note, created_at, user_id, user:user_id ( handle, display_name )")
    .order("created_at", { ascending: false })
    .limit(100);

  type Row = {
    id: string;
    tag: string;
    status: "pending" | "approved" | "rejected";
    evidence_url: string | null;
    evidence_note: string | null;
    created_at: string;
    user_id: string;
    user: { handle: string; display_name: string } | null;
  };
  const all = ((claims ?? []) as unknown as Row[]).map((c) => ({
    id: c.id,
    tag: c.tag,
    status: c.status,
    evidenceUrl: c.evidence_url,
    evidenceNote: c.evidence_note,
    createdAt: relativeTime(c.created_at),
    handle: c.user?.handle ?? "—",
    displayName: c.user?.display_name ?? "",
  }));
  const pending = all.filter((c) => c.status === "pending");
  const decided = all.filter((c) => c.status !== "pending");

  return (
    <main className="min-h-screen pb-32">
      <header className="px-5 pt-6 pb-3 flex items-center justify-between">
        <Link
          href="/founder"
          className="text-muted hover:text-ink transition flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          <span>Founder</span>
        </Link>
      </header>

      <section className="px-5 mb-8 max-w-2xl">
        <h1 className="display-italic text-3xl text-ink mb-1">Insider claims</h1>
        <p className="text-muted text-sm">Review submitted credentials. Approving adds the tag to the user&apos;s profile.</p>
      </section>

      <section className="px-5 mb-10 max-w-2xl">
        <h2 className="label-text text-muted mb-3">pending · {pending.length}</h2>
        {pending.length === 0 ? (
          <p className="text-muted text-xs italic">no pending claims</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((c) => (
              <InsiderClaimReviewItem key={c.id} claim={c} />
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 && (
        <section className="px-5 max-w-2xl">
          <h2 className="label-text text-muted mb-3">history · {decided.length}</h2>
          <ul className="space-y-2">
            {decided.slice(0, 30).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between border border-line bg-paper px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-ink text-sm display-italic truncate">{c.tag}</p>
                  <p className="text-muted text-xs mono-text">@{c.handle} · {c.createdAt}</p>
                </div>
                <span
                  className={`mono-text text-[10px] uppercase tracking-wider px-2 py-0.5 ${
                    c.status === "approved" ? "text-gold border border-gold" : "text-warn border border-warn"
                  }`}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <TabBar />
    </main>
  );
}
