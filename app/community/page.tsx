/**
 * Community Guidelines — derived from the Vibe Pact (Pact 6-10) + 17-MODERATION-POLICY.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";

export const metadata = {
  title: "Community Guidelines — Chatter",
  description: "How we keep chatter the social network without the hate.",
};

const dos = [
  "Whisper truthfully — say what you actually know, with context.",
  "Disagree with the idea, not the person.",
  "Share what makes you better, not what makes them worse.",
  "Use scope deliberately — village, network, or public, on purpose.",
  "Report cruelty when you see it — the moderation team has a 72h SLA.",
];

const donts = [
  "No hate against protected groups (race · religion · gender · sexuality · disability · immigration). Permanent ban, no appeal.",
  "No personal harassment, doxxing, or intimidation.",
  "No misinformation that could cause real-world harm (medical, electoral, safety).",
  "No spam, engagement bait, or coordinated inauthentic behavior.",
  "No impersonation. We verify humans, not personas.",
];

export default function CommunityPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <Link href="/" className="label-text text-muted hover:text-ink transition">
          ← back
        </Link>
      </header>

      <section className="flex-1 px-6 sm:px-10 py-12 sm:py-20">
        <div className="max-w-2xl mx-auto w-full">
          <p className="label-text text-red mb-6">community guidelines · v0.2</p>
          <h1 className="display-text text-4xl sm:text-5xl text-ink mb-5">
            the social network without the hate.
          </h1>
          <p className="body-text text-muted text-lg mb-12 max-w-xl">
            this is mission G4 in plain language — what we expect, what we won&rsquo;t allow, and how we enforce it. it&rsquo;s shorter than most platforms&rsquo; rules because the pact already does most of the work.
          </p>

          <h2 className="display-italic text-2xl text-red mb-4">do this</h2>
          <ul className="space-y-3 mb-10">
            {dos.map((d, i) => (
              <li
                key={i}
                className="border-l-2 border-red pl-5 body-text text-ink leading-relaxed"
              >
                {d}
              </li>
            ))}
          </ul>

          <h2 className="display-italic text-2xl text-warn mb-4">never this</h2>
          <ul className="space-y-3 mb-10">
            {donts.map((d, i) => (
              <li
                key={i}
                className="border-l-2 border-warn pl-5 body-text text-ink leading-relaxed"
              >
                {d}
              </li>
            ))}
          </ul>

          <div className="border-t border-line pt-8">
            <h2 className="display-italic text-xl text-ink mb-3">how we enforce</h2>
            <p className="body-text text-muted leading-relaxed mb-3">
              <strong>tier 1</strong> — pre-publish moderation scan flags hate, threats, spam.
            </p>
            <p className="body-text text-muted leading-relaxed mb-3">
              <strong>tier 2</strong> — community reports reviewed within 72 hours. appeal window 7 days. admin response SLA 72 hours.
            </p>
            <p className="body-text text-muted leading-relaxed mb-6">
              <strong>tier 3</strong> — topic moderators (verified insiders) handle topic-scoped issues. transparent moderator list per topic.
            </p>
            <Link href="/pact" className="btn-primary inline-flex">
              read the full pact →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
