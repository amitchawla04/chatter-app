/**
 * Privacy Policy — production v1.0.
 * Plain language first, complete enough to ship beta. Reviewed by counsel before mass-market launch.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";

export const metadata = {
  title: "Privacy Policy · Chatter",
  description: "How Chatter treats your data. Plain language first.",
};

export default function PrivacyPage() {
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
            <p className="label-text text-red mb-3">privacy policy · v1.0 · effective 2026-04-29</p>
            <h1 className="display-italic text-4xl sm:text-5xl text-ink mb-4">Your data, your rules.</h1>
            <p className="body-text text-muted text-base leading-relaxed">
              The five privacy promises in <Link href="/pact" className="text-red underline-offset-2 hover:underline">the Pact</Link> are contractual. This policy explains, in concrete operational detail, how those promises are kept.
            </p>
          </div>

          <Section title="1. The data we collect, and why">
            <p>We collect only what we need to operate the service you signed up for. Specifically:</p>
            <Subhead>Identity (required)</Subhead>
            <ul className="list-disc pl-6 space-y-1 text-ink">
              <li><strong>Email or phone number</strong> — to authenticate you (magic-link or SMS OTP). We never use these for marketing without explicit opt-in.</li>
              <li><strong>Handle</strong> — chosen by you. Visible to others.</li>
              <li><strong>Display name, bio, pronouns, location, avatar URL</strong> — optional, visible to others where you scope them.</li>
            </ul>
            <Subhead>Content you create</Subhead>
            <ul className="list-disc pl-6 space-y-1 text-ink">
              <li>Whispers (text, voice, image, video), threads, vouches, corrections, echoes, passes, saves.</li>
              <li>Topic tunes (which topics you follow), village memberships.</li>
              <li>Insider-credential claims, including any evidence URL or note you submit.</li>
            </ul>
            <Subhead>Operational signals (minimum necessary)</Subhead>
            <ul className="list-disc pl-6 space-y-1 text-ink">
              <li><strong>IP address at sign-in</strong> — kept 30 days for abuse prevention, then discarded.</li>
              <li><strong>User-agent at sign-in</strong> — same retention.</li>
              <li><strong>Push-subscription endpoint and keys</strong> — stored only if you opt in to web push.</li>
              <li><strong>Rate-limit events</strong> — stored 7 days, used to detect abuse and bot activity.</li>
              <li><strong>Error reports</strong> — anonymised stack traces sent to our error monitor (Sentry).</li>
            </ul>
            <Subhead>What we do NOT collect</Subhead>
            <ul className="list-disc pl-6 space-y-1 text-ink">
              <li>No tracking pixels.</li>
              <li>No third-party advertising identifiers.</li>
              <li>No fingerprint data beyond standard server logs.</li>
              <li>No location at the GPS level — only your self-stated location field.</li>
              <li>No address book, contacts, calendar, or device sensors.</li>
            </ul>
          </Section>

          <Section title="2. How we use the data">
            <p>Operationally, your data is used only to:</p>
            <ul className="list-disc pl-6 space-y-1 text-ink">
              <li>Show your whispers to the audiences you scoped them to (private, village, network, public).</li>
              <li>Surface relevant whispers in your feed based on your tuned topics, vouches, and village memberships.</li>
              <li>Send transactional notifications you enabled (e.g. invite-to-thread, correction-on-your-whisper).</li>
              <li>Detect and prevent abuse (hate, doxxing, threats, automation).</li>
              <li>Comply with legal obligations (court orders served on the operator).</li>
            </ul>
            <p><strong>What we never do:</strong> never sell your data, never use it to train external AI models, never share it with advertisers, never run ad-tech tracking. See Pact promises P1, P4, A1.</p>
          </Section>

          <Section title="3. Who can see what">
            <p>Visibility is controlled by the &ldquo;scope&rdquo; you set on each whisper:</p>
            <ul className="list-disc pl-6 space-y-1 text-ink">
              <li><strong>Private</strong> — only you.</li>
              <li><strong>Village</strong> — the specific thread or circle you posted to.</li>
              <li><strong>Network</strong> — people you have vouches or threads with.</li>
              <li><strong>Public</strong> — anyone on Chatter, and visible to the open web at <span className="mono-text">chatter.today/w/[id]</span> URLs.</li>
            </ul>
            <p>Profile fields (handle, display name, bio, pronouns, avatar) are visible to anyone signed in to Chatter. Your email and phone number are never shown to other users.</p>
          </Section>

          <Section title="4. AI use — opt-in only, never to train external models">
            <p>
              AI features that affect what you post or see (suggested replies, opt-in summarisation, opt-in translation, voice transcription) are off by default. You enable each one explicitly.
            </p>
            <p>
              We never use your whispers, voices, photos, or vouches to train external AI models. Where we use AI internally — for safety classification on hate / spam / threats, or for transcription you submitted — the processing happens on a per-input basis and the original is not added to any training corpus. AI cannot post, reply, echo, or vouch in your name.
            </p>
          </Section>

          <Section title="5. How long we keep data">
            <ul className="list-disc pl-6 space-y-1 text-ink">
              <li><strong>Account data and content:</strong> until you delete the content or your account.</li>
              <li><strong>Deleted content:</strong> removed immediately from the live database; purged from technical backups within 30 days.</li>
              <li><strong>IP / user-agent at sign-in:</strong> 30 days.</li>
              <li><strong>Rate-limit events:</strong> 7 days.</li>
              <li><strong>Error reports:</strong> 90 days, anonymised.</li>
              <li><strong>Pact-violation reports and moderation history:</strong> retained while account is active for accountability; purged 90 days after account deletion.</li>
            </ul>
          </Section>

          <Section title="6. Your rights">
            <p>Regardless of your jurisdiction, Chatter gives you:</p>
            <ul className="list-disc pl-6 space-y-1 text-ink">
              <li><strong>Export</strong> — full JSON of your account + content via <Link href="/api/export" className="text-red underline">/api/export</Link>. Always available, no review required.</li>
              <li><strong>Delete</strong> — remove your account and content at <Link href="/settings/account" className="text-red underline">settings → account</Link>. Effective immediately, with the 30-day backup-purge window.</li>
              <li><strong>Pause</strong> — soft-disable your account without deleting; reactivate any time.</li>
              <li><strong>Block, mute, hide</strong> — granular content controls at <Link href="/settings/privacy" className="text-red underline">settings → privacy</Link>.</li>
              <li><strong>Appeal any moderation action</strong> within 7 days; 72-hour SLA on admin response.</li>
              <li><strong>Where local law applies</strong> (GDPR, CCPA, India DPDP Act): right to access, rectify, restrict, port, and object to processing. Contact us via the address below.</li>
            </ul>
          </Section>

          <Section title="7. Where data is stored">
            <p>
              Primary database: Supabase Postgres in <span className="mono-text">us-east-1</span>. Storage (images, voice): Supabase Storage same region. Email delivery: Resend (US). Push notifications: VAPID keys held by us, delivery via browser push services. SMS verification: Twilio (US).
            </p>
            <p>
              By using Chatter, you consent to your data being processed in the United States. We use industry-standard transport encryption (TLS 1.3) and at-rest encryption on the database.
            </p>
          </Section>

          <Section title="8. Children and teen accounts">
            <p>
              Chatter is not for anyone under 13. Accounts identified as belonging to under-13 users are removed.
            </p>
            <p>
              Teen accounts (13–17) default to: village-or-narrower scope, no public-broadcast surfaces, parental-supervision email if you provided one. We don&apos;t collect more from teens than from adults — we restrict what teens can do, not what we know.
            </p>
          </Section>

          <Section title="9. Cookies and trackers">
            <p>
              We use a small number of strictly-necessary cookies for sign-in and locale preference. We do not set advertising or tracking cookies. We do not use third-party analytics that fingerprint users.
            </p>
          </Section>

          <Section title="10. Data breaches">
            <p>
              If we discover a breach affecting your data, we will notify you within 72 hours of confirmation by email and by in-app banner, including what data was exposed, what we are doing about it, and what you should do.
            </p>
          </Section>

          <Section title="11. Changes to this Policy">
            <p>
              We will notify you of any material changes by email and in-app banner at least 14 days before they take effect. The Pact promises override anything weaker that might appear here in a future revision.
            </p>
          </Section>

          <Section title="12. Contact us">
            <p>
              Privacy questions, data-subject requests, or breach reports: <a href="mailto:hello@chatter.today" className="text-red underline">hello@chatter.today</a> (subject line: PRIVACY). Pact-violation reports: the form on <Link href="/pact" className="text-red underline">/pact</Link>.
            </p>
          </Section>

          <p className="mono-text text-xs text-muted pt-8 border-t border-line">
            v1.0 · effective 2026-04-29 · supersedes pre-launch v0.2. Companion documents: <Link href="/pact" className="underline">the Pact (14 promises)</Link>, <Link href="/terms" className="underline">terms of service</Link>.
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

function Subhead({ children }: { children: React.ReactNode }) {
  return <p className="mono-text text-xs uppercase tracking-wider text-muted mt-4 mb-1">{children}</p>;
}
