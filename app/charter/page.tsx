import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Award, Coins, MessageSquareQuote, ShieldCheck, Users } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Charter members · chatter",
  description: "The first 500 contributors who shape Chatter. Equity-bearing. Vote-bearing. Permanent.",
};

const benefits = [
  {
    icon: Award,
    title: "Permanent gold credential",
    body: "A subtle gold mark next to your handle, everywhere — on profile, in feeds, on replies. Earned, not bought, not boostable.",
  },
  {
    icon: MessageSquareQuote,
    title: "Replies sort to the top",
    body: "Pact-aligned alternative to algorithmic boost. On any whisper, charter replies surface above credentialed insiders, who surface above chronological. No purchasable visibility.",
  },
  {
    icon: Coins,
    title: "CCEP — Contributor Equity",
    body: "Every charter member receives equity vesting over 48 months with a 12-month cliff. Tracked at /you/equity. Real shares in the company you helped build.",
  },
  {
    icon: ShieldCheck,
    title: "Pact-violation review power",
    body: "When the Pact is at stake, charter members are consulted before product decisions are finalized. You don't just use Chatter — you safeguard it.",
  },
  {
    icon: Users,
    title: "Founder-direct channel",
    body: "Direct line to the founder. No support tickets. Bugs, ideas, complaints — they reach Amit's eyes within 24 hours.",
  },
  {
    icon: Sparkles,
    title: "First-look on every new feature",
    body: "Charter members test new surfaces a week before they ship to anyone else. Your taste shapes what makes the cut.",
  },
];

export default async function CharterPage() {
  const admin = createAdminClient();
  const { count: charterCount } = await admin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("is_charter", true);

  const remaining = Math.max(0, 500 - (charterCount ?? 0));

  return (
    <main className="min-h-screen pb-32">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link href="/" className="text-muted hover:text-ink transition" aria-label="home">
          ←
        </Link>
        <ChatterMark size="sm" />
        <div className="w-4" />
      </header>

      <section className="px-5 pt-12 pb-8 max-w-2xl mx-auto text-center">
        <Sparkles className="text-gold mx-auto mb-4" size={36} strokeWidth={1.25} />
        <h1 className="display-italic text-4xl sm:text-5xl text-ink leading-tight mb-3">
          The Charter.
        </h1>
        <p className="text-muted text-base leading-relaxed mb-2">
          The first 500 contributors who shape Chatter from the inside.
        </p>
        <p className="mono-text text-xs text-muted uppercase tracking-wider">
          {charterCount ?? 0} of 500 · {remaining} seats remain
        </p>
      </section>

      <section className="px-5 max-w-2xl mx-auto mb-12">
        <h2 className="label-text text-muted mb-5 text-center">what charter members get</h2>
        <ul className="space-y-6">
          {benefits.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4 border-b border-line pb-6 last:border-b-0">
              <div className="flex-shrink-0 w-10 h-10 border border-gold flex items-center justify-center">
                <Icon size={18} strokeWidth={1.5} className="text-gold" />
              </div>
              <div>
                <h3 className="display-italic text-lg text-ink mb-1">{title}</h3>
                <p className="text-muted text-sm leading-relaxed">{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 max-w-2xl mx-auto mb-12 text-center">
        <h2 className="display-italic text-2xl text-ink mb-3">How you become one</h2>
        <p className="text-muted text-sm leading-relaxed mb-6 max-w-md mx-auto">
          Charter membership is invitation-based. We&apos;re looking for genuine experts and connectors across our 16 verticals — people whose whispers will be worth reading. If you think you&apos;re one of them, write to{" "}
          <a href="mailto:hello@chatter.today" className="text-ink underline">
            hello@chatter.today
          </a>
          .
        </p>
        <p className="mono-text text-[11px] text-muted">
          no application form · no waitlist tricks · no buy-in
        </p>
      </section>

      <TabBar />
    </main>
  );
}
