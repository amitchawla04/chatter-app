/**
 * Terms of Service — production v1.0.
 * Plain-language first, complete enough to ship beta. Reviewed by counsel before mass-market launch.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";

export const metadata = {
  title: "Terms of Service · Chatter",
  description: "The terms governing your use of Chatter.",
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

      <section className="flex-1 px-6 sm:px-10 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto w-full space-y-8">
          <div>
            <p className="label-text text-red mb-3">terms of service · v1.0 · effective 2026-04-29</p>
            <h1 className="display-italic text-4xl sm:text-5xl text-ink mb-4">The deal.</h1>
            <p className="body-text text-muted text-base leading-relaxed">
              Plain language first. By creating an account or using Chatter, you agree to these terms and to <Link href="/pact" className="text-red underline-offset-2 hover:underline">the Pact</Link> — our 14 contractual promises to you.
            </p>
          </div>

          <Section title="1. Who we are">
            <p>
              Chatter is operated by Amit Chawla, a sole proprietor based in Bengaluru, India (the &ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;). Contact: <a href="mailto:hello@chatter.today" className="text-red underline">hello@chatter.today</a>. The service is provided on the domain <span className="mono-text">chatter.today</span> and any subdomains we operate.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 13 years old to use Chatter. If you are between 13 and 17, you may use Chatter only with the consent of a parent or guardian; we may apply additional protections to your account, including limited public scope and parental supervision email if provided.
            </p>
            <p>
              You must provide accurate sign-up information and keep your handle and credentials secure. Each person may operate one personal account; brand and creator accounts are operated under separate terms via the Account Type setting.
            </p>
          </Section>

          <Section title="3. The Pact is part of these Terms">
            <p>
              The 14 promises in <Link href="/pact" className="text-red underline-offset-2 hover:underline">the Pact</Link> are contractually binding on us. Where the Pact gives you a stronger right than these Terms (for example, on data sale or AI training), the Pact controls. We will not modify the Pact to weaken any existing promise; new versions are publicly logged and dated.
            </p>
          </Section>

          <Section title="4. Your content">
            <p>
              <strong>Ownership stays with you.</strong> Whispers, voices, photos, vouches, and any content you create on Chatter are yours. You retain all intellectual-property rights.
            </p>
            <p>
              <strong>What you grant us.</strong> You give Chatter a worldwide, royalty-free, non-exclusive licence to host, store, transmit, display, and adapt your content solely as needed to operate the service you signed up for — including showing it to the audiences you scope it to, generating thumbnails, transcribing voice you submit for transcription, and creating link previews. The licence ends when you delete the content or your account, except in technical backups (purged within 30 days).
            </p>
            <p>
              <strong>What you do NOT grant us.</strong> Per Pact promise A1, you do not grant us the right to train external AI models on your content, sell your content, or share it with advertisers. Ever. This is a permanent, non-modifiable carve-out.
            </p>
          </Section>

          <Section title="5. What we expect from you">
            <p>You agree not to use Chatter to:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-ink">
              <li>Post content that targets people for hate based on race, religion, gender, sexuality, disability, or immigration status — these violations are permanent-ban.</li>
              <li>Harass, dox, threaten, or impersonate any person.</li>
              <li>Post content you do not have rights to (copyrighted material, private personal data of others, classified information).</li>
              <li>Run automated activity (scraping, mass-posting, fake-account farming, vote-manipulation bots).</li>
              <li>Reverse-engineer, decompile, or interfere with the security of the service.</li>
              <li>Use Chatter for illegal commerce or to facilitate illegal activity in your jurisdiction.</li>
            </ul>
            <p>Violations may result in content removal, scope restriction, account pause, or permanent ban depending on severity. Hate-against-protected-groups violations are always permanent.</p>
          </Section>

          <Section title="6. Charter membership and CCEP">
            <p>
              Charter members are invited contributors who shape Chatter from the inside. Charter membership grants visible credentials, priority reply ranking on credential-weighted sorts, and equity participation through the Contributor Equity Plan (CCEP) — a 48-month vesting schedule with a 12-month cliff, governed by a separate CCEP grant agreement. Charter status is revocable for serious Pact or Terms violations.
            </p>
          </Section>

          <Section title="7. Ticketed Spaces (beta)">
            <p>
              In beta, &ldquo;Ticketed Spaces&rdquo; collect a phone-OTP-verified RSVP rather than a real payment. No money changes hands, no payout is owed. When real payment processing launches via a regulated payment partner, we will publish updated terms and require explicit re-acceptance for paid features. Until then, all access grants are free.
            </p>
          </Section>

          <Section title="8. Account changes and termination">
            <p>
              You can pause or delete your account any time at <Link href="/settings/account" className="text-red underline">settings → account</Link>. Deletion removes your data per the Pact (privacy promise 2), with the standard 30-day technical-backup window. We may suspend or terminate accounts that violate these Terms or the Pact, with notice and the chance to appeal except for hate, doxxing, threats, and account-takeover attempts where we may act immediately.
            </p>
          </Section>

          <Section title="9. Service availability">
            <p>
              Chatter is provided &ldquo;as is.&rdquo; We will work to keep the service available and secure but make no guarantee of uninterrupted operation, error-free behaviour, or fitness for a specific purpose during beta. We reserve the right to change features, pricing for paid features (with notice), and the underlying infrastructure.
            </p>
          </Section>

          <Section title="10. Limitation of liability">
            <p>
              To the maximum extent permitted by law, Chatter and its operator are not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service. Aggregate liability for any direct claim is capped at INR ₹10,000 (approximately USD $120) or the total fees you paid us in the prior 12 months, whichever is greater.
            </p>
          </Section>

          <Section title="11. Governing law and disputes">
            <p>
              These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka, except that you may bring small-claims actions in your local jurisdiction where local law requires.
            </p>
          </Section>

          <Section title="12. Changes to these Terms">
            <p>
              When we change these Terms in any material way, we will notify you in-app and by email at least 14 days before the change takes effect. Continued use after the effective date is acceptance. The Pact has its own stricter modification rules — those override anything weaker here.
            </p>
          </Section>

          <Section title="13. Contact">
            <p>
              Questions: <a href="mailto:hello@chatter.today" className="text-red underline">hello@chatter.today</a>. Pact-violation reports: the form on <Link href="/pact" className="text-red underline">/pact</Link>. Founder direct line for charter members: same email, subject line tagged &ldquo;CHARTER&rdquo;.
            </p>
          </Section>

          <p className="mono-text text-xs text-muted pt-8 border-t border-line">
            v1.0 · effective 2026-04-29 · supersedes pre-launch v0.2. Companion documents: <Link href="/pact" className="underline">the Pact (14 promises)</Link>, <Link href="/privacy" className="underline">privacy policy</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="display-italic text-2xl text-ink mb-3">{title}</h2>
      <div className="body-text text-ink/85 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}
