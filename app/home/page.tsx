"use client";

import { useState } from "react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { WhisperCard, type WhisperCardData } from "@/components/WhisperCard";
import { PenLine } from "lucide-react";

// Seed whispers for the MVP feed — placeholder content matching brief Section 2.3
const seedWhispers: WhisperCardData[] = [
  {
    id: "w1",
    topicName: "Arsenal FC",
    topicEmoji: "🔴",
    author: { handle: "AshburtonGrove89", initial: "A", insiderTag: "Insider" },
    timestamp: "12m",
    content:
      "Just saw Arteta's pre-match notes. Saliba is DEFINITELY out tomorrow despite what the club is saying publicly. Brace for Kiwior + Gabriel.",
    modality: "text",
    echoCount: 847,
    passCount: 23,
    isWhisperTier: true,
  },
  {
    id: "w2",
    topicName: "World Cup 2026",
    topicEmoji: "🏆",
    author: { handle: "CopaFever", initial: "C" },
    timestamp: "34m",
    content:
      "England's squad selection is going to be a disaster waiting to happen. Mark my words — Southgate's replacement hasn't learned a thing.",
    modality: "voice",
    echoCount: 412,
    passCount: 18,
  },
  {
    id: "w3",
    topicName: "Lamine Yamal",
    topicEmoji: "⚡",
    author: { handle: "LaMasiaWatch", initial: "L", insiderTag: "Insider" },
    timestamp: "1h",
    content:
      "First look at the new boots he&rsquo;ll wear in El Clasico. Spotted them this morning at training.",
    modality: "image",
    echoCount: 1240,
    passCount: 89,
    isWhisperTier: true,
  },
  {
    id: "w4",
    topicName: "Premier League",
    topicEmoji: "⚽",
    author: { handle: "TouchlineBan", initial: "T" },
    timestamp: "2h",
    content:
      "Arteta's sideline behavior is going to get him banned for 3 games. Screenshot this.",
    modality: "text",
    echoCount: 89,
    passCount: 4,
  },
];

type FeedFilter = "all" | "whispers";

export default function HomePage() {
  const [filter, setFilter] = useState<FeedFilter>("all");

  const visible = filter === "whispers" ? seedWhispers.filter((w) => w.isWhisperTier) : seedWhispers;

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <ChatterMark size="sm" />
        <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-xs text-cream/80 font-medium">
          A
        </div>
      </header>

      {/* Filter toggle */}
      <div className="px-5 pt-5 pb-3">
        <div className="inline-flex items-center gap-1 p-1 border border-line rounded-pill">
          <button
            type="button"
            onClick={() => setFilter("all")}
            data-active={filter === "all"}
            className={`px-4 py-1.5 text-sm rounded-pill transition-colors ${
              filter === "all" ? "bg-gold text-ink" : "text-cream/70"
            }`}
          >
            All chatter
          </button>
          <button
            type="button"
            onClick={() => setFilter("whispers")}
            data-active={filter === "whispers"}
            className={`px-4 py-1.5 text-sm rounded-pill transition-colors ${
              filter === "whispers" ? "bg-gold text-ink" : "text-cream/70"
            }`}
          >
            🤫 Whispers
          </button>
        </div>
      </div>

      {/* Feed */}
      <section className="px-5 space-y-3">
        {visible.map((w) => (
          <WhisperCard key={w.id} whisper={w} />
        ))}
        {visible.length === 0 && (
          <p className="py-16 text-center text-muted text-sm">
            No whispers yet in this view.
          </p>
        )}
      </section>

      {/* Floating compose button */}
      <a
        href="/compose"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-gold text-ink flex items-center justify-center shadow-lg hover:bg-cream transition-colors z-40"
        aria-label="Compose a whisper"
      >
        <PenLine size={22} strokeWidth={1.8} />
      </a>

      <TabBar />
    </main>
  );
}
