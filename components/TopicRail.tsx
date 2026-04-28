"use client";

/**
 * TopicRail — horizontal scroll of tuned-into topics with ring states.
 * Visual DNA Principle 7 (topic-ring state):
 *   red-pulse = LIVE in this topic right now
 *   red border = unread insider whisper
 *   blue border = unread village whisper
 *   gold = vouch activity
 *   line = dormant (seen)
 */

import Link from "next/link";

export interface TopicRailItem {
  id: string;
  name: string;
  emoji: string | null;
  state: "live" | "unread-insider" | "unread-village" | "vouched" | "dormant";
}

export function TopicRail({ topics }: { topics: TopicRailItem[] }) {
  if (topics.length === 0) return null;
  return (
    <div className="px-3 pt-3 pb-4 border-b border-line/60">
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-3 px-3">
        {topics.map((t) => (
          <Link
            key={t.id}
            href={`/t/${t.id}`}
            className="flex flex-col items-center gap-1 min-w-[60px] flex-shrink-0"
          >
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xl bg-paper relative ${
                t.state === "live"
                  ? "ring-2 ring-red animate-pulse"
                  : t.state === "unread-insider"
                    ? "ring-2 ring-red"
                    : t.state === "unread-village"
                      ? "ring-2 ring-blue"
                      : t.state === "vouched"
                        ? "ring-2 ring-gold"
                        : "ring-1 ring-line"
              }`}
            >
              <span>{t.emoji ?? "·"}</span>
              {t.state === "live" && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red border-2 border-canvas" />
              )}
            </div>
            <span className="text-[10px] mono-text text-ink/70 truncate max-w-[60px]">
              {t.name.toLowerCase().slice(0, 8)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
