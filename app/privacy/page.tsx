/**
 * Privacy — plain-language summary + the 5 Pact promises on privacy.
 * Full legal version will be added before public launch.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";

export const metadata = {
  title: "Privacy — Chatter",
  description: "How Chatter treats your data. Plain language first. Legal version below.",
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

      <section className="flex-1 px-6 sm:px-10 py-12 sm:py-20">
        <div className="max-w-2xl mx-auto w-full">
          <p className="label-text text-red mb-6">Privacy · v0.2</p>
          <h1 className="display-text text-4xl sm:text-5xl text-ink mb-5">
            your data, your rules.
          </h1>
          <p className="body-text text-muted text-lg mb-12 max-w-xl">
            Chatter is pre-launch. This is the plain-language version — the full legal privacy policy ships before public launch. The commitments below are identical in both.
          </p>

          <h2 className="display-italic text-2xl text-red mb-4">what we collect</h2>
          <ul className="space-y-3 mb-10">
            <li className="border-l-2 border-gold/40 pl-5 body-text text-ink">
              <strong>Your email.</strong> To send you a magic sign-in link. Nothing else.
            </li>
            <li className="border-l-2 border-gold/40 pl-5 body-text text-ink">
              <strong>Your handle.</strong> Chosen by you, yours forever.
            </li>
            <li className="border-l-2 border-gold/40 pl-5 body-text text-ink">
              <strong>Your whispers.</strong> What you write, record, or share — scope-controlled by you.
            </li>
            <li className="border-l-2 border-gold/40 pl-5 body-text text-ink">
              <strong>Your tuned topics.</strong> What you care about, stored so your feed has signal.
            </li>
            <li className="border-l-2 border-gold/40 pl-5 body-text text-ink">
              <strong>Minimal technical data.</strong> IP on sign-in for abuse prevention. Nothing else cross-app.
            </li>
          </ul>

          <h2 className="display-italic text-2xl text-red mb-4">what we never do</h2>
          <ul className="space-y-3 mb-10">
            <li className="border-l-2 border-warn/40 pl-5 body-text text-ink">
              Sell your data. Ever. To anyone.
            </li>
            <li className="border-l-2 border-warn/40 pl-5 body-text text-ink">
              Track you outside Chatter. No pixels, no ad-tech, no cross-site.
            </li>
            <li className="border-l-2 border-warn/40 pl-5 body-text text-ink">
              Use your content to train external AI models.
            </li>
            <li className="border-l-2 border-warn/40 pl-5 body-text text-ink">
              Run ads. We don't take ad money. Our revenue model is consumer subscriptions, creator economy, and institutional signal — not attention.
            </li>
          </ul>

          <h2 className="display-italic text-2xl text-red mb-4">your rights</h2>
          <ul className="space-y-3 mb-10">
            <li className="border-l-2 border-line pl-5 body-text text-ink">
              Export all your data as JSON + media bundle. Anytime.
            </li>
            <li className="border-l-2 border-line pl-5 body-text text-ink">
              Delete your account. All whispers, echoes, passes, vouches removed.
            </li>
            <li className="border-l-2 border-line pl-5 body-text text-ink">
              Pause your account without deleting. Come back when you want.
            </li>
            <li className="border-l-2 border-line pl-5 body-text text-ink">
              Appeal any moderation action within 7 days. 72-hour admin response SLA.
            </li>
          </ul>

          <div className="mt-12 border-t border-line pt-8">
            <p className="body-text text-muted leading-relaxed mb-4">
              The Chatter Pact codifies these commitments in 14 specific promises.
            </p>
            <Link href="/pact" className="btn-primary inline-flex">
              read the pact →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
