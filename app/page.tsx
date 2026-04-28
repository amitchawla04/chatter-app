"use client";

/**
 * Landing — the cold open.
 *
 * Visual DNA principles driving this surface:
 *  - Principle 1 (quote-first, handle-second): proof whisper leads; wordmark second
 *  - Principle 4 (insider-sentence as typography): byline uses role-as-mono-italic, not badge
 *  - Principle 9 (wordmark-period breathing): `chatter.` period pulses ambient 1200ms
 *
 * Pact above the fold (4 promises): trust moat made visible per founder decision
 * 2026-04-22 + Theme 1 (social-fatigue universal) + Theme 5 (Bluesky/Threads aren't the answer).
 *
 * Craft Bet: B (Pull-Quote) + C (Identity-Merged) locked 2026-04-24 by Opus.
 */

import Link from "next/link";
import { motion } from "framer-motion";
import { ChatterMark } from "@/components/ChatterMark";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Minimal header — just a label anchor */}
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <span className="label-text text-muted">Research preview · 2026</span>
      </header>

      {/* HERO · proof whisper (Visual DNA Principle 1) */}
      <section className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-10 sm:py-16">
        <div className="max-w-xl mx-auto w-full">
          {/* Proof whisper — the hero artifact, not a slogan */}
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="proof-whisper mb-10"
          >
            <p className="proof-whisper-ranking-rule mb-4">
              because 3 in your village echoed this
            </p>
            <p className="proof-whisper-quote text-2xl sm:text-3xl mb-5">
              &ldquo;The new tool we shipped this week is the one I wish I had
              in 2018. Small team, three years quiet. Proof that scale
              follows craft, not vice versa.&rdquo;
            </p>
            <p className="proof-whisper-byline">
              <span className="text-ink">@maya</span>{" "}
              <span className="role">· figma design lead</span>{" "}
              <span>· 2h · creative</span>
            </p>
          </motion.article>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="label-text text-muted text-center mb-12"
          >
            this is what chatter looks like.
          </motion.p>

          {/* Wordmark — breathing period per Principle 9 */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="text-center mb-8"
          >
            <ChatterMark size="xl" pulse="breath" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
            className="body-text text-ink/80 text-center text-base sm:text-lg mb-10"
          >
            whispers from people who actually know.
          </motion.p>

          {/* 4 Pact pills above the fold — trust moat made visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            <span className="pact-pill">no ads ever</span>
            <span className="pact-pill">no public counts</span>
            <span className="pact-pill">your data stays yours</span>
            <span className="pact-pill">ai is opt-in</span>
          </motion.div>

          {/* Primary + secondary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.25 }}
            className="flex flex-col items-center gap-3"
          >
            <Link href="/onboarding" className="btn-primary w-full max-w-xs justify-center">
              claim your handle
              <span>→</span>
            </Link>
            <Link
              href="/onboarding"
              className="text-sm text-ink/60 hover:text-red transition-colors"
            >
              i already have one
            </Link>
          </motion.div>

          {/* Ticker — live count with synced breath */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="mt-10 text-center"
          >
            <span className="mono-text text-xs text-muted">
              <span className="live-dot mr-2" />
              <span className="text-ink">412</span> charter contributors · waitlist open
            </span>
          </motion.div>
        </div>
      </section>

      {/* Footer — Pact emphasized per founder decision 2026-04-22 */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="px-6 sm:px-10 pb-8"
      >
        <div className="border-t border-line pt-5 flex items-center justify-center gap-5 text-xs mono-text text-muted">
          <Link href="/pact" className="text-red hover:text-ink transition-colors">
            the pact
          </Link>
          <span className="opacity-40">·</span>
          <Link href="/privacy" className="hover:text-ink transition-colors">
            privacy
          </Link>
          <span className="opacity-40">·</span>
          <span>v0.2</span>
        </div>
      </motion.footer>
    </main>
  );
}
