"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  /** Optional topic ID to filter pulses to a single topic feed. Omit for the global home feed. */
  topicId?: string;
  /** Author IDs to ignore (the viewer's own whispers). */
  excludeAuthorIds?: string[];
}

/**
 * Subscribes to new public whispers via Supabase Realtime and shows a "(N) new whispers" pill.
 * Tap to refresh the page and prepend the new ones at top of the feed.
 */
export function LiveWhispersPulse({ topicId, excludeAuthorIds = [] }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const exclude = useRef(new Set(excludeAuthorIds));

  useEffect(() => {
    exclude.current = new Set(excludeAuthorIds);
  }, [excludeAuthorIds]);

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

  if (count === 0) return null;

  return (
    <button
      type="button"
      onClick={() => {
        setCount(0);
        router.refresh();
      }}
      className="sticky top-[64px] z-30 mx-auto block left-1/2 mb-3 -translate-x-1/2 inline-flex items-center gap-1.5 bg-red text-canvas mono-text uppercase tracking-wider text-[11px] px-3 py-1.5 hover:opacity-90 transition shadow-md"
      aria-label={`${count} new whispers, tap to load`}
    >
      <Radio size={11} strokeWidth={2} className="animate-pulse" />
      <span>
        {count === 1 ? "1 new whisper" : `${count} new whispers`} · tap to load
      </span>
    </button>
  );
}
