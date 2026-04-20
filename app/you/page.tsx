"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";

export default function YouPage() {
  // STATE A — Reciprocity Gate not yet crossed (per design brief 2.7)
  return (
    <main className="min-h-screen pb-24 flex flex-col">
      <header className="px-5 py-4 flex items-center justify-between border-b border-line">
        <ChatterMark size="sm" />
      </header>

      <section className="flex-1 px-6 py-16 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-16 h-16 rounded-full border border-line flex items-center justify-center mb-8"
        >
          <Lock size={22} strokeWidth={1.3} className="text-muted" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="display-text text-3xl sm:text-4xl text-cream mb-4 max-w-md"
        >
          To hear what your village says about you,
          <br />
          <span className="display-italic text-gold">first say something about someone else.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="body-text text-muted mb-10 max-w-sm"
        >
          3 people in your orbit have whispered about you this week.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/compose" className="btn-primary">
            Write your first whisper
            <span>→</span>
          </Link>
        </motion.div>
      </section>

      <TabBar />
    </main>
  );
}
