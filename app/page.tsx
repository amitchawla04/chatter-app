"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChatterMark } from "@/components/ChatterMark";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="px-6 sm:px-10 pt-8 sm:pt-10 flex justify-between items-center">
        <ChatterMark size="sm" />
        <span className="label-text text-muted">Research preview</span>
      </header>

      <section className="flex-1 flex items-center px-6 sm:px-10 py-16">
        <div className="max-w-3xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="label-text text-gold mb-8"
          >
            Pre-launch · World Cup 2026
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="display-text text-5xl sm:text-7xl md:text-8xl text-cream mb-8"
          >
            What&rsquo;s the world
            <br />
            <span className="display-italic text-gold">chattering about?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="body-text text-lg sm:text-xl text-cream/80 max-w-2xl mb-12"
          >
            Tune into what real humans are actually saying about the things you care about. Short
            takes. Real people. Organized by topic. Not by who you follow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
          >
            <Link href="/onboarding" className="btn-primary">
              Begin
              <span>→</span>
            </Link>
            <span className="text-muted text-sm">1 min setup. No email required.</span>
          </motion.div>
        </div>
      </section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="px-6 sm:px-10 pb-8"
      >
        <div className="border-t border-line pt-6 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted">
          <span>© 2026 Chatter</span>
          <span className="display-italic text-cream/60">
            &ldquo;Wait, can I tell you something?&rdquo;
          </span>
        </div>
      </motion.footer>
    </main>
  );
}
