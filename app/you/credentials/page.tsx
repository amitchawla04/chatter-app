import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { TabBar } from "@/components/TabBar";
import { CredentialClaimForm } from "@/components/CredentialClaimForm";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verified credentials · chatter",
  description: "Claim your insider expertise. Each claim is reviewed before the gold mark goes live.",
};

export default async function CredentialsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?redirect=/you/credentials");

  const admin = createAdminClient();
  const [{ data: meRow }, { data: claims }] = await Promise.all([
    admin.from("users").select("insider_tags").eq("id", user.id).maybeSingle(),
    admin
      .from("insider_claims")
      .select("id, tag, status, evidence_url, evidence_note, created_at, reviewed_at, reviewer_note")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const verified = ((meRow as { insider_tags: string[] | null } | null)?.insider_tags ?? []);
  const allClaims = (claims ?? []) as {
    id: string;
    tag: string;
    status: "pending" | "approved" | "rejected";
    evidence_url: string | null;
    evidence_note: string | null;
    created_at: string;
    reviewed_at: string | null;
    reviewer_note: string | null;
  }[];

  return (
    <main className="min-h-screen pb-32">
      <header className="px-5 pt-6 pb-3 flex items-center justify-between">
        <Link
          href="/you"
          className="text-muted hover:text-ink transition flex items-center gap-1 text-sm"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          <span>You</span>
        </Link>
      </header>

      <section className="px-5 mb-8 max-w-2xl">
        <h1 className="display-italic text-3xl text-ink mb-1">Credentials</h1>
        <p className="text-muted text-sm leading-relaxed">
          Insider tags surface your real expertise next to your handle and rank your replies in the
          credential-weighted sort. Each claim is reviewed before the gold mark goes live.
        </p>
      </section>

      {verified.length > 0 && (
        <section className="px-5 mb-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} strokeWidth={1.5} className="text-gold" />
            <h2 className="label-text text-muted">verified</h2>
          </div>
          <ul className="flex flex-wrap gap-2">
            {verified.map((t) => (
              <li
                key={t}
                className="inline-flex items-center gap-1 border border-gold text-gold mono-text italic text-xs px-2.5 py-1"
              >
                ✦ {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="px-5 mb-10 max-w-2xl">
        <h2 className="label-text text-muted mb-3">claim a credential</h2>
        <CredentialClaimForm />
      </section>

      <section className="px-5 max-w-2xl">
        <h2 className="label-text text-muted mb-3">submitted claims</h2>
        {allClaims.length === 0 ? (
          <p className="text-muted text-xs italic">no submissions yet</p>
        ) : (
          <ul className="space-y-3">
            {allClaims.map((c) => (
              <li key={c.id} className="border border-line bg-paper p-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="display-italic text-ink text-base">{c.tag}</p>
                  <span
                    className={`mono-text text-[10px] uppercase tracking-wider px-2 py-0.5 ${
                      c.status === "approved"
                        ? "text-gold border border-gold"
                        : c.status === "rejected"
                          ? "text-warn border border-warn"
                          : "text-muted border border-line"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                {c.evidence_note && <p className="text-muted text-xs mb-1">{c.evidence_note}</p>}
                {c.evidence_url && (
                  <a
                    href={c.evidence_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-muted text-xs underline hover:text-ink break-all"
                  >
                    {c.evidence_url}
                  </a>
                )}
                {c.reviewer_note && (
                  <p className="text-muted text-xs italic mt-2">reviewer: {c.reviewer_note}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <TabBar />
    </main>
  );
}
