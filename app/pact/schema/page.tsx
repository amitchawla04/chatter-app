/**
 * Pact-as-Schema — the 14 Pact promises in machine- and reviewer-readable form.
 * Each promise is a row with: id, pillar, version, statement, what-violates-it, who-bears-the-burden,
 * audit-mechanism, escalation-path. Designed for press, investors, regulators, and AI auditors.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";

export const metadata = {
  title: "Pact as Schema · Chatter",
  description: "The 14 Pact promises in structured, machine-readable form. For press, investors, regulators, AI auditors.",
};

interface PromiseSchema {
  id: string;
  pillar: "Privacy" | "Vibe" | "AI" | "Performance";
  statement: string;
  violates: string;
  burden: "operator" | "platform-content" | "moderation";
  audit: string;
  escalation: string;
  added: string;
}

const SCHEMA: PromiseSchema[] = [
  {
    id: "P1",
    pillar: "Privacy",
    statement: "We never sell your data.",
    violates: "Any commercial transfer of user identifiers, content, behavioural signals, or derived profiles to a third party for compensation. Includes anonymised-but-rejoinable datasets.",
    burden: "operator",
    audit: "Quarterly third-party audit of data-egress logs. Charter members may request raw audit reports.",
    escalation: "Board-level escalation. Charter consultation required before any change. Pact-violation form on /pact triggers founder email.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "P2",
    pillar: "Privacy",
    statement: "Your whispers are yours. Export everything. Delete everything. Any time.",
    violates: "Any restriction on export, any failure to honour a delete request beyond the documented 30-day technical-backup window, any retention of derived data after deletion.",
    burden: "operator",
    audit: "End-to-end test of export + delete on every release. SLA: export within 24h, delete effective immediately.",
    escalation: "Failure to honour deletion = Pact violation, founder-direct response.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "P3",
    pillar: "Privacy",
    statement: "Scope is the default. You decide who sees it.",
    violates: "Any default that broadens scope without opt-in. Any silent re-scoping of past content. Any UI that obscures the current scope.",
    burden: "platform-content",
    audit: "Compose flow shows current scope above the fold. Past whispers retain their original scope through any UI redesign.",
    escalation: "Charter review of any compose-flow scope change.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "P4",
    pillar: "Privacy",
    statement: "We don't track you outside Chatter.",
    violates: "Any third-party analytics that fingerprints users. Any ad-tech or marketing pixel. Any cross-site identifier propagation.",
    burden: "operator",
    audit: "External CSP audit. No third-party scripts on chatter.today domains. Headers-only third-party calls.",
    escalation: "Board-level. New third-party integrations require Charter sign-off.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "P5",
    pillar: "Privacy",
    statement: "We verify humans — we don't surveil them.",
    violates: "Use of phone/email verification for any purpose other than abuse prevention and account recovery. Retention of verification artifacts beyond what's needed.",
    burden: "operator",
    audit: "Twilio Verify logs reviewed quarterly. Verification artifacts purged within 30 days.",
    escalation: "Founder-direct review.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "V1",
    pillar: "Vibe",
    statement: "Criticism welcome. Cruelty isn't.",
    violates: "Personal attacks unrelated to ideas, dogpiles designed to harm, content that targets a person's character rather than their argument.",
    burden: "moderation",
    audit: "Moderation queue at /moderation. Public moderation log (anonymised).",
    escalation: "Charter members may flag dogpiles directly to founder.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "V2",
    pillar: "Vibe",
    statement: "Attack ideas, not people.",
    violates: "Same as V1, refined: focus is on the target. Disagreement with someone's reasoning ≠ disagreement with their existence.",
    burden: "moderation",
    audit: "Same as V1.",
    escalation: "Same as V1.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "V3",
    pillar: "Vibe",
    statement: "Zero tolerance for hate against protected groups. Permanent ban.",
    violates: "Any content targeting people for hate based on race, religion, gender, sexuality, disability, or immigration status. No grey area, no warnings, no second chances.",
    burden: "moderation",
    audit: "Permanent-ban actions logged with original content + decision rationale, accessible to charter on request.",
    escalation: "Immediate action; appeal window does NOT apply to V3 violations.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "V4",
    pillar: "Vibe",
    statement: "No personal harassment.",
    violates: "Doxxing, threats, sexual harassment, sustained unwanted contact, content that endangers a real person's safety.",
    burden: "moderation",
    audit: "Reports → moderation queue → action within 72h. Doxxing/threats acted on immediately.",
    escalation: "Founder-direct for severe cases.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "V5",
    pillar: "Vibe",
    statement: "Passion over poison.",
    violates: "Engagement-bait, rage-bait, and outrage cycles whose primary value is generating reaction rather than informing.",
    burden: "platform-content",
    audit: "Heat-score algorithm reviewed for outrage-amplification bias.",
    escalation: "Charter review of feed-ranking changes.",
    added: "v1.0 · 2026-04-21",
  },
  {
    id: "A1",
    pillar: "AI",
    statement: "Your content is yours, not training data. We never use your whispers, photos, or voice notes to train external AI models.",
    violates: "Any inclusion of user-generated content in datasets used to train third-party or external AI models. Includes derivative datasets.",
    burden: "operator",
    audit: "Annual third-party data-flow audit specifically for AI training inclusion. Public attestation.",
    escalation: "Permanent commitment, non-modifiable carve-out in Terms §4.",
    added: "v1.1 · 2026-04-22",
  },
  {
    id: "A2",
    pillar: "AI",
    statement: "AI features that affect what you post or see are opt-in. AI safety systems that protect the community (hate, spam, threats) are always on.",
    violates: "Any AI feature that modifies feed ranking, suggested posts, or composed text without explicit per-user opt-in. Conversely, disabling safety AI is a V3-class violation.",
    burden: "platform-content",
    audit: "Settings → AI shows every AI feature, on/off state, what it does. New AI features require new opt-in.",
    escalation: "Charter consultation before any new AI feature ships.",
    added: "v1.1 · 2026-04-22",
  },
  {
    id: "A3",
    pillar: "AI",
    statement: "AI cannot post, reply, or comment for you.",
    violates: "Any auto-generation of content attributed to your account. Includes 'reply suggestions' that auto-send.",
    burden: "platform-content",
    audit: "Compose surfaces are explicit-submit only. No background-AI-write features.",
    escalation: "Permanent commitment.",
    added: "v1.1 · 2026-04-22",
  },
  {
    id: "PR1",
    pillar: "Performance",
    statement: "No public popularity scores. No public follower count. No like count on your whispers visible to others.",
    violates: "Any UI surface that exposes a user's follower count, like count, view count, or reach metric to anyone other than the user themselves.",
    burden: "platform-content",
    audit: "Visual audit on every UI release. Charter members may flag any popularity-score surface.",
    escalation: "Charter review. Vouches received ARE visible — credentials, not popularity.",
    added: "v1.1 · 2026-04-22",
  },
];

const pillarColor = {
  Privacy: "text-red border-red",
  Vibe: "text-blue border-blue",
  AI: "text-gold border-gold",
  Performance: "text-ink border-ink",
} as const;

export default function PactSchemaPage() {
  const grouped = SCHEMA.reduce<Record<string, PromiseSchema[]>>((acc, p) => {
    (acc[p.pillar] ??= []).push(p);
    return acc;
  }, {});

  const jsonLD = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: "Chatter Pact (Schema view)",
    description: "14 contractual commitments to users, in machine-readable form.",
    url: "https://chatter.today/pact/schema",
    dateModified: "2026-04-22",
    publisher: {
      "@type": "Organization",
      name: "Chatter",
      url: "https://chatter.today",
    },
    hasPart: SCHEMA.map((p) => ({
      "@type": "DigitalDocument",
      identifier: p.id,
      headline: p.statement,
      genre: p.pillar,
      dateCreated: p.added,
    })),
  };

  return (
    <main className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
      />
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <Link href="/pact" className="label-text text-muted hover:text-ink transition">
          ← back to the pact
        </Link>
      </header>

      <section className="flex-1 px-6 sm:px-10 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto w-full space-y-10">
          <div>
            <p className="label-text text-red mb-3">pact-as-schema · v1.1 · machine-readable form</p>
            <h1 className="display-italic text-4xl sm:text-5xl text-ink mb-4">14 promises, structured.</h1>
            <p className="body-text text-muted text-base leading-relaxed max-w-2xl">
              The narrative version lives at <Link href="/pact" className="text-red underline-offset-2 hover:underline">/pact</Link>. This is the same 14 promises in structured form for press, investors, regulators, and AI auditors. Each row defines what the promise is, what violates it, who bears the burden, how it&apos;s audited, and how a violation escalates.
            </p>
            <p className="body-text text-muted text-sm leading-relaxed max-w-2xl mt-3">
              JSON-LD <span className="mono-text">DigitalDocument</span> schema is embedded above for crawlers and policy auditors.
            </p>
          </div>

          {Object.entries(grouped).map(([pillar, promises]) => (
            <section key={pillar}>
              <h2 className={`mono-text text-xs uppercase tracking-[0.2em] mb-4 px-2 py-1 inline-block border ${pillarColor[pillar as keyof typeof pillarColor]}`}>
                {pillar} · {promises.length}
              </h2>
              <div className="space-y-4">
                {promises.map((p) => (
                  <article
                    key={p.id}
                    className="border border-line bg-paper p-5"
                  >
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="mono-text text-xs text-muted">{p.id}</span>
                      <h3 className="display-italic text-lg text-ink leading-snug">{p.statement}</h3>
                    </div>
                    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div>
                        <dt className="mono-text text-[10px] uppercase tracking-wider text-muted mb-1">violates</dt>
                        <dd className="text-ink leading-relaxed">{p.violates}</dd>
                      </div>
                      <div>
                        <dt className="mono-text text-[10px] uppercase tracking-wider text-muted mb-1">burden of compliance</dt>
                        <dd className="text-ink mono-text uppercase tracking-wider text-xs">{p.burden}</dd>
                      </div>
                      <div>
                        <dt className="mono-text text-[10px] uppercase tracking-wider text-muted mb-1">audit mechanism</dt>
                        <dd className="text-ink leading-relaxed">{p.audit}</dd>
                      </div>
                      <div>
                        <dt className="mono-text text-[10px] uppercase tracking-wider text-muted mb-1">escalation path</dt>
                        <dd className="text-ink leading-relaxed">{p.escalation}</dd>
                      </div>
                      <div className="sm:col-span-2 pt-2 border-t border-line">
                        <span className="mono-text text-[10px] uppercase tracking-wider text-muted">added · </span>
                        <span className="mono-text text-[11px] text-muted">{p.added}</span>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          ))}

          <div className="border-t border-line pt-8">
            <p className="body-text text-muted text-sm leading-relaxed mb-4">
              For policy reviewers: this schema is canonical. Any divergence between this page and the narrative <Link href="/pact" className="text-red underline">/pact</Link> page is a Pact-violation report-worthy event — please flag via the form.
            </p>
            <Link href="/pact" className="btn-primary inline-flex">
              ← narrative pact
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
