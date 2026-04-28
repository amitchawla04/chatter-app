/**
 * Terms of Service — plain-language v0.2 pre-launch.
 * Full legal version finalized before public launch.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";

export const metadata = {
  title: "Terms — Chatter",
};

export default function TermsPage() {
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
        <div className="max-w-2xl mx-auto w-full prose-ish space-y-6">
          <p className="label-text text-red">terms of service · v0.2 pre-launch</p>
          <h1 className="display-text text-4xl sm:text-5xl text-ink">the deal.</h1>

          <p className="body-text text-muted">
            these are the plain-language terms for using chatter during pre-launch. the full legal terms ship before public launch and won&rsquo;t change anything below — they&rsquo;ll just be longer.
          </p>

          <Section title="who can use chatter">
            <p>you must be 13 or older. under-13 accounts are blocked at sign-up. if you are 13–17, your account defaults to teen-account guardrails — you can&rsquo;t turn those off until 18.</p>
          </Section>

          <Section title="your content">
            <p>you own everything you post on chatter. you grant us a non-exclusive license to display it inside chatter for as long as you keep it posted. when you delete it, our license ends. we don&rsquo;t sell your content. we don&rsquo;t use it to train external AI. (Pact promises 1 + 11.)</p>
          </Section>

          <Section title="our content + moderation">
            <p>we reserve the right to remove content that violates the <Link href="/community" className="text-red underline">community guidelines</Link>. you can <Link href="/pact" className="text-red underline">appeal any action</Link> within 7 days. our SLA is 72 hours. zero tolerance for hate against protected groups means permanent ban with no appeal.</p>
          </Section>

          <Section title="what we won't do">
            <p>we will never sell your data. we will never run ads. we will never train external AI on your content. we will never expose public popularity scores between users. these are the chatter pact — the contract underneath this contract.</p>
          </Section>

          <Section title="what you won't do">
            <p>no spam, no impersonation, no scraping, no abuse of rate limits, no using chatter to harm others. we may rate-limit, suspend, or terminate accounts that do these things.</p>
          </Section>

          <Section title="liability">
            <p>chatter is provided &ldquo;as is&rdquo; during pre-launch. we are not liable for content posted by other users. we use industry-standard security but cannot guarantee absolute security of any internet service.</p>
          </Section>

          <Section title="changes">
            <p>we&rsquo;ll version every change to these terms. we&rsquo;ll notify you in-app at least 14 days before any material change takes effect. if you don&rsquo;t agree, you can export your data and delete your account at any time.</p>
          </Section>

          <div className="pt-6 border-t border-line">
            <p className="mono-text text-xs text-muted">
              v0.2 · 2026 · governing law: TBD prior to public launch.
            </p>
            <Link href="/pact" className="btn-primary inline-flex mt-6">
              read the pact →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="display-italic text-2xl text-ink mb-3">{title}</h2>
      <div className="body-text text-ink/85 leading-relaxed">{children}</div>
    </div>
  );
}
