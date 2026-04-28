"use client";

/**
 * GlimpseLightbox — full-screen modal for a single glimpse.
 * Swipe / arrow-key / tap-edges to navigate. Escape to close.
 * No view-count emission (Pact 5).
 */

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { CharterBadge } from "./CharterBadge";
import { relativeTime } from "@/lib/whisper";
import type { GlimpseRow } from "@/lib/queries";

interface GlimpseLightboxProps {
  glimpses: GlimpseRow[];
  startIndex: number;
  onClose: () => void;
}

export function GlimpseLightbox({
  glimpses,
  startIndex,
  onClose,
}: GlimpseLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const current = glimpses[index];

  const next = useCallback(() => {
    setIndex((i) => Math.min(i + 1, glimpses.length - 1));
  }, [glimpses.length]);
  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, next, prev]);

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Glimpse lightbox"
      className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-5 py-4 text-paper">
        <div className="mono-text text-[10px] uppercase tracking-wider opacity-80">
          {index + 1} / {glimpses.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-paper/10 hover:bg-paper/20 flex items-center justify-center transition"
          aria-label="Close"
        >
          <X size={18} strokeWidth={1.6} />
        </button>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {index > 0 && (
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/10 hover:bg-paper/20 text-paper flex items-center justify-center transition"
            aria-label="Previous glimpse"
          >
            <ChevronLeft size={20} strokeWidth={1.6} />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.media_url}
          alt={`Glimpse from @${current.author_handle} in ${current.topic_name}`}
          className="max-w-full max-h-[70vh] object-contain"
        />
        {index < glimpses.length - 1 && (
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/10 hover:bg-paper/20 text-paper flex items-center justify-center transition"
            aria-label="Next glimpse"
          >
            <ChevronRight size={20} strokeWidth={1.6} />
          </button>
        )}
      </div>

      <div
        className="px-5 py-5 text-paper border-t border-paper/10 flex items-center justify-between gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mono-text text-xs flex-wrap">
          {current.topic_emoji && <span>{current.topic_emoji}</span>}
          <Link
            href={`/t/${current.topic_id}`}
            onClick={onClose}
            className="text-paper hover:text-red transition"
          >
            {current.topic_name}
          </Link>
          <span className="opacity-50">·</span>
          <span>@{current.author_handle}</span>
          {current.author_is_charter && <CharterBadge size="sm" />}
          <span className="opacity-50">·</span>
          <span className="opacity-70">{relativeTime(current.created_at)}</span>
        </div>
        <Link
          href={`/w/${current.id}`}
          onClick={onClose}
          className="label-text text-red text-[10px] hover:text-paper transition"
        >
          open whisper →
        </Link>
      </div>
    </div>
  );
}
