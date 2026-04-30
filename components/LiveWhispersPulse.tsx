"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  /** Optional topic ID to filter pulses to a single topic feed. Omit for the global home feed. */
  topicId?: string;
  /** Author IDs to ignore (the viewer's own whispers). */
  excludeAuthorIds?: string[];
}

const LAST_SEEN_KEY_BASE = "chatter:last-feed-seen";

/**
 * Subscribes to new public whispers via Supabase Realtime AND, on first paint,
 * shows a "N new since you left" counter based on a localStorage last-seen
 * timestamp. Tap the pill to refresh + reset the marker. Pact-clean: no
 * popularity / engagement counts surfaced — just freshness (Surface 4.x +
 * Pressure-test addition IP10).
 */
export function LiveWhispersPulse({ topicId, excludeAuthorIds = [] }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(0); // delta since this page render
  const [sinceLast, setSinceLast] = useState(0); // landed since last visit
  const exclude = useRef(new Set(excludeAuthorIds));
  const lastSeenKey = topicId
    ? `${LAST_SEEN_KEY_BASE}:topic:${topicId}`
    : `${LAST_SEEN_KEY_BASE}:home`;

  useEffect(() => {
    exclude.current = new Set(excludeAuthorIds);
  }, [excludeAuthorIds]);

  // First-paint: count whispers since last visit (cross-session memory).
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const lastIso = window.localStorage.getItem(lastSeenKey);
    if (!lastIso || !/^\d{4}-/.test(lastIso)) {
      window.localStorage.setItem(lastSeenKey, new Date().toISOString());
      return;
    }
    if (Date.now() - new Date(lastIso).getTime() < 60_000) return; // tab switch noise

    const supabase = createBrowserClient(url, key);
    let q = supabase
      .from("whispers")
      .select("id", { count: "exact", head: true })
      .eq("is_hidden", false)
      .gt("created_at", lastIso);
    q = topicId ? q.eq("topic_id", topicId) : q.eq("scope", "public");
    q.then(({ count: c }) => {
      if (typeof c === "number" && c > 0) setSinceLast(Math.min(c, 99));
    });
  }, [topicId, lastSeenKey]);

  // Realtime subscription (in-session deltas)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const supabase = createBrowserClient(url, key);
    const channel = supabase
      .channel(topicId ? `whispers:topic:${topicId}` : "whispers:public")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whispers",
          filter: topicId ? `topic_id=eq.${topicId}` : "scope=eq.public",
        },
        (payload) => {
          const row = payload.new as { author_id?: string; scope?: string; is_hidden?: boolean | null };
          if (row?.is_hidden) return;
          if (row?.author_id && exclude.current.has(row.author_id)) return;
          if (!topicId && row?.scope !== "public") return;
          setCount((c) => c + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [topicId]);

  const total = count + sinceLast;

  const tap = () => {
    setCount(0);
    setSinceLast(0);
    window.localStorage.setItem(lastSeenKey, new Date().toISOString());
    router.refresh();
  };

  const label = total === 1 ? "1 new whisper" : `${total} new whispers`;
  // Tone shifts based on which signal: "since you left" reads as a welcome-back;
  // "tap to load" reads as live activity.
  const verb = sinceLast > 0 && count === 0 ? "since you left" : "tap to load";

  return (
    <div className="sticky top-[64px] z-30 mx-auto pointer-events-none flex justify-center">
      <AnimatePresence>
        {total > 0 && (
          <motion.button
            key="pulse-pill"
            type="button"
            onClick={tap}
            initial={{ y: -10, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
            whileTap={{ scale: 0.95 }}
            className="pointer-events-auto mt-3 inline-flex items-center gap-1.5 bg-red text-canvas mono-text uppercase tracking-wider text-[11px] px-3 py-1.5 hover:bg-ink transition-colors shadow-md"
            aria-label={`${total} new whispers, ${verb}`}
          >
            <Radio size={11} strokeWidth={2} className="animate-pulse" />
            <span>
              {label} · {verb}
            </span>
            <span aria-hidden="true" className="ml-0.5 text-canvas/80">↑</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
