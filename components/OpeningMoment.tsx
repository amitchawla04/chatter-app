"use client";

/**
 * OpeningMoment — first-visit-of-session curtain raise on /home.
 *
 * Plays once per session (sessionStorage gate), ~2.5s total. Announces the
 * Chatter register before the feed reveals: breathing red period, wordmark,
 * a proof-whisper from a charter member — three seconds that say "this is a
 * different medium" before you scroll.
 *
 * Why this exists: every social product opens with a feed. If Chatter does
 * the same, the user never learns what's different in the first 3 seconds —
 * and 3 seconds is the whole window. This curtain is the felt-difference.
 *
 * prefers-reduced-motion: the CSS at globals.css disables all animations.
 * The curtain still renders but with no transitions; we exit immediately.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "chatter:opening-moment-shown";

interface OpeningMomentProps {
  proofText?: string | null;
  proofAuthor?: string | null;
  proofTopic?: string | null;
  proofIsCharter?: boolean;
}

export function OpeningMoment({
  proofText,
  proofAuthor,
  proofTopic,
  proofIsCharter,
}: OpeningMomentProps) {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip on prefers-reduced-motion
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // Session gate — show only once per browser session
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;

    setShow(true);

    // Phased reveal (each phase fades in a layer of the curtain):
    //   0 → just-mounted
    //   1 → breathing period visible (200ms)
    //   2 → wordmark visible (1000ms)
    //   3 → proof-whisper visible (1700ms)
    //   exit → 2700ms
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 1000);
    const t3 = setTimeout(() => setPhase(3), 1700);
    const t4 = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShow(false);
    }, 2700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="opening-moment"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: "easeOut" } }}
          className="fixed inset-0 z-[200] bg-canvas flex flex-col items-center justify-center px-8 pointer-events-none"
          aria-hidden="true"
        >
          {/* Breathing red period — the brand signature */}
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: phase >= 1 ? [0.6, 1.2, 1] : 0,
              opacity: phase >= 1 ? 1 : 0,
            }}
            transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
            className="block w-4 h-4 rounded-full bg-red mb-3"
          />

          {/* Wordmark reveals around the period */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 6 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="display-italic text-4xl sm:text-5xl text-ink tracking-tight mb-12"
          >
            chatter
            <span className="text-red">.</span>
          </motion.div>

          {/* Proof-whisper from a charter member — "this is what's different" */}
          {proofText && (
            <motion.figure
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 12 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-md text-center border-l-2 border-red pl-6 py-2 text-left mx-auto"
            >
              <blockquote className="display-italic text-xl sm:text-2xl text-ink leading-snug tracking-tight">
                &ldquo;{proofText}&rdquo;
              </blockquote>
              <figcaption className="mono-text text-[11px] text-muted mt-3">
                {proofAuthor && <span className="text-ink">@{proofAuthor}</span>}
                {proofIsCharter && (
                  <span className="text-gold italic"> · charter</span>
                )}
                {proofTopic && (
                  <>
                    <span className="opacity-50"> · </span>
                    <span>{proofTopic}</span>
                  </>
                )}
              </figcaption>
            </motion.figure>
          )}

          {/* Tagline at bottom */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 0.6 : 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="absolute bottom-12 mono-text text-[10px] uppercase tracking-[0.3em] text-muted"
          >
            whispers from people who actually know
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
