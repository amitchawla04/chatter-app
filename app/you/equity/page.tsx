/**
 * /you/equity — CCEP equity dashboard for charter contributors.
 * Per Decision Memo v1.1: 10% of company equity reserved at formation,
 * distributed over 10 years to top creators via contributor-share class.
 *
 * Displays: total grant · vesting schedule · current vested · cliff status.
 * Read-only. Real share counts in DB via ccep_grants.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 300; // 5 min

export default async function CCEPDashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();
  const { data: grants } = await admin
    .from("ccep_grants")
    .select("*")
    .eq("user_id", user.id)
    .order("granted_at", { ascending: false });

  const totalShares = (grants ?? []).reduce((s, g) => s + g.shares, 0);

  if (!grants || grants.length === 0) {
    return (
      <main className="min-h-screen pb-28">
        <Header />
        <section className="px-6 py-20 text-center">
          <p className="display-italic text-2xl text-ink mb-3">no equity grants yet.</p>
          <p className="body-text text-muted text-sm max-w-sm mx-auto">
            CCEP grants go to charter contributors. join the charter cohort →{" "}
            <Link href="/onboard/beta" className="text-red hover:underline">
              redeem an invite
            </Link>
            .
          </p>
        </section>
        <TabBar />
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-28">
      <Header />

      <section className="px-5 sm:px-10 py-8 max-w-2xl mx-auto">
        <p className="label-text text-red mb-3">your stake in chatter</p>
        <h1 className="display-text text-3xl text-ink mb-2">
          {totalShares.toLocaleString()}{" "}
          <span className="text-muted text-2xl">shares</span>
        </h1>
        <p className="body-text text-muted mb-10">
          contributor-share class · non-voting · participates in exit · 10% equity pool reserved at formation
        </p>

        {grants.map((g) => {
          const pct = vestedPercentage(g);
          const vested = Math.floor(g.shares * (pct / 100));
          const remaining = g.shares - vested;
          const cliffPassed = cliffPassedFor(g);
          return (
            <article
              key={g.id}
              className="border border-line p-5 mb-4 bg-paper"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="label-text text-muted">grant</p>
                  <p className="display-italic text-2xl text-ink">
                    {g.shares.toLocaleString()} shares
                  </p>
                </div>
                <p className="mono-text text-xs text-muted">
                  granted {new Date(g.granted_at).toLocaleDateString()}
                </p>
              </div>

              {/* Vesting bar */}
              <div className="mb-3">
                <div className="flex justify-between mono-text text-[11px] text-muted mb-1">
                  <span>vested {vested.toLocaleString()}</span>
                  <span>{pct.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-line">
                  <div
                    className="h-full bg-red transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mono-text text-muted">
                <div>
                  <p className="text-ink/80">vesting</p>
                  <p>{g.vesting_months}-month linear</p>
                </div>
                <div>
                  <p className="text-ink/80">cliff</p>
                  <p>{g.cliff_months} months {cliffPassed ? "✓ passed" : "· not yet"}</p>
                </div>
                <div>
                  <p className="text-ink/80">remaining</p>
                  <p>{remaining.toLocaleString()} shares</p>
                </div>
                {g.cohort && (
                  <div>
                    <p className="text-ink/80">cohort</p>
                    <p>{g.cohort}</p>
                  </div>
                )}
              </div>

              {g.notes && (
                <p className="body-text text-xs text-muted mt-3 italic border-l-2 border-line pl-3">
                  {g.notes}
                </p>
              )}
            </article>
          );
        })}

        <p className="mono-text text-[11px] text-muted mt-8 leading-relaxed">
          shares vest over {grants[0]?.vesting_months ?? 48} months with a {grants[0]?.cliff_months ?? 12}-month cliff. cliff passed = first vesting tranche unlocked. exit (acquisition / IPO) participates pro-rata. read the full CCEP terms in{" "}
          <Link href="/legal/ccep" className="text-red hover:underline">
            /legal/ccep
          </Link>
          .
        </p>
      </section>

      <TabBar />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
      <Link
        href="/you"
        className="text-muted hover:text-ink transition flex items-center gap-1 text-sm"
        aria-label="Back to profile"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
        you
      </Link>
      <ChatterMark size="sm" />
      <div className="w-12" />
    </header>
  );
}

function vestedPercentage(g: { granted_at: string; vesting_start: string; vesting_months: number; cliff_months: number }): number {
  const start = new Date(g.vesting_start).getTime();
  const now = Date.now();
  const monthsElapsed = (now - start) / (1000 * 60 * 60 * 24 * 30.44);
  if (monthsElapsed < g.cliff_months) return 0;
  const pct = Math.min(100, (monthsElapsed / g.vesting_months) * 100);
  return pct;
}

function cliffPassedFor(g: { vesting_start: string; cliff_months: number }): boolean {
  const start = new Date(g.vesting_start).getTime();
  const monthsElapsed = (Date.now() - start) / (1000 * 60 * 60 * 24 * 30.44);
  return monthsElapsed >= g.cliff_months;
}
