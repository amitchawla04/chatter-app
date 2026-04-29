/**
 * The Chatter Pact — 14 public commitments.
 * Canonical text from MASTER-PROCESS-AND-STATUS.md §3 (v1.3 locked 2026-04-22).
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";
import { PactViolationForm } from "@/components/PactViolationForm";

export const metadata = {
  title: "The Chatter Pact — 14 commitments",
  description:
    "The 14 public commitments we make to you. Breaking any is a board-level escalation.",
};

const pillars = [
  {
    title: "Privacy",
    intro: "five promises about your data",
    items: [
      "We never sell your data.",
      "Your whispers are yours. Export everything. Delete everything. Any time.",
      "Scope is the default. You decide who sees it.",
      "We don't track you outside Chatter.",
      "We verify humans — we don't surveil them.",
    ],
  },
  {
    title: "Vibe",
    intro: "five promises about the room",
    items: [
      "Criticism welcome. Cruelty isn't.",
      "Attack ideas, not people.",
      "Zero tolerance for hate against protected groups. Permanent ban.",
      "No personal harassment.",
      "Passion over poison.",
    ],
  },
  {
    title: "AI",
    intro: "three promises about machines",
    items: [
      "Your content is yours, not training data. We never use your whispers, photos, or voice notes to train external AI models. We use AI only to deliver services you enabled — never to teach AI anywhere else.",
      "AI features that affect what you post or see are opt-in. AI safety systems that protect the community (hate, spam, threats) are always on — and we tell you exactly what they do.",
      "AI cannot post, reply, or comment for you. AI assists with transcription, captions, and translation only when you ask. It does not act in your name on its own.",
    ],
  },
  {
    title: "Performance",
    intro: "one promise about pressure",
    items: [
      "No public popularity scores. No public follower count. No like count on your whispers visible to others. Vouches you receive ARE visible — those are credentials, not popularity. We don't put scores between you and the people you talk to.",
    ],
  },
];

export default function PactPage() {
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
          <p className="label-text text-red mb-6">The Chatter Pact · v1.3</p>
          <h1 className="display-text text-4xl sm:text-5xl text-ink mb-5">
            14 commitments we make to you.
          </h1>
          <p className="body-text text-muted text-lg mb-12 max-w-xl">
            Breaking any of these is a board-level escalation. They are not marketing. They are how chatter is built.
          </p>

          <div className="space-y-14">
            {pillars.map((pillar, i) => (
              <div key={pillar.title}>
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="mono-text text-xs text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="display-italic text-2xl sm:text-3xl text-gold">
                    {pillar.title}
                  </h2>
                  <span className="mono-text text-xs text-muted ml-auto">{pillar.intro}</span>
                </div>
                <ul className="space-y-5">
                  {pillar.items.map((item, j) => (
                    <li
                      key={j}
                      className="border-l-2 border-gold/40 pl-5 body-text text-ink leading-relaxed"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-line pt-12">
            <PactViolationForm />
          </div>

          <div className="mt-12 border-t border-line pt-8 space-y-6">
            <p className="mono-text text-xs text-muted max-w-xl leading-relaxed">
              Version 1.3 · locked 2026-04-22 · grounded in 660 verified user-voice
              data points across X, Reddit, App Store, and Gen Z mining. Future
              versions are versioned, documented, and publicly logged.
            </p>
            <p className="mono-text text-xs text-muted max-w-xl leading-relaxed">
              Press, investors, regulators, AI auditors:{" "}
              <Link href="/pact/schema" className="text-red underline">read the same 14 promises in structured / machine-readable form →</Link>
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="btn-primary inline-flex"
              >
                ← back to chatter
              </Link>
              <Link
                href="/pact/schema"
                className="inline-flex items-center gap-2 border border-ink mono-text uppercase tracking-wider text-xs px-4 py-2 hover:bg-ink hover:text-canvas transition"
              >
                pact as schema →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
