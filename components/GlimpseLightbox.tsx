"use client";

/**
 * GlimpseLightbox — full-screen modal for a single glimpse.
 *
 * Polish (vs IG Stories at its own game):
 *  - Auto-advance every 5s with top progress bars (IG-style segmentation)
 *  - Tap-and-hold pauses (release resumes)
 *  - Tap left third → previous, right two-thirds → next (IG convention)
 *  - Arrow keys + Escape still work for desktop
 *  - On final glimpse, last 5s closes the lightbox
 *  - prefers-reduced-motion: progress bars + auto-advance disabled
 *
 * Pact: still no view-count emission. No "X seen by Y" indicators.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { CharterBadge } from "./CharterBadge";
import { relativeTime } from "@/lib/whisper";
import type { GlimpseRow } from "@/lib/queries";

interface GlimpseLightboxProps {
  glimpses: GlimpseRow[];
  startIndex: number;
  onClose: () => void;
}

const ADVANCE_MS = 5000;

export function GlimpseLightbox({
  glimpses,
  startIndex,
  onClose,
}: GlimpseLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0); // 0..1 of current glimpse elapsed
  const [paused, setPaused] = useState(false);
  const startRef = useRef<number>(Date.now());
  const elapsedAtPauseRef = useRef<number>(0);
  const reducedMotionRef = useRef<boolean>(false);
  const current = glimpses[index];

  const next = useCallback(() => {
    setIndex((i) => {
      if (i + 1 >= glimpses.length) {
        // Last glimpse → close
        onClose();
        return i;
      }
      return i + 1;
    });
  }, [glimpses.length, onClose]);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Reset progress when index changes
  useEffect(() => {
    startRef.current = Date.now();
    elapsedAtPauseRef.current = 0;
    setProgress(0);
  }, [index]);

  // Detect prefers-reduced-motion once
  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Progress + auto-advance loop
  useEffect(() => {
    if (reducedMotionRef.current) return; // no auto-advance for reduced-motion users
    if (paused) return;

    let raf: number;
    const tick = () => {
      const elapsed = elapsedAtPauseRef.current + (Date.now() - startRef.current);
      const ratio = Math.min(elapsed / ADVANCE_MS, 1);
      setProgress(ratio);
      if (ratio >= 1) {
        next();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index, paused, next]);

  // Keyboard nav
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

  // Tap-and-hold to pause + swipe-down to dismiss
  const swipeStartY = useRef<number | null>(null);
  const swipeDistY = useRef<number>(0);
  const onPointerDown = (e?: React.PointerEvent) => {
    elapsedAtPauseRef.current += Date.now() - startRef.current;
    setPaused(true);
    swipeStartY.current = e?.clientY ?? null;
    swipeDistY.current = 0;
  };
  const onPointerUp = () => {
    // Swipe-down dismiss: if dragged down >100px, close
    if (swipeDistY.current > 100) {
      onClose();
      return;
    }
    if (!paused) return;
    startRef.current = Date.now();
    setPaused(false);
    swipeStartY.current = null;
    swipeDistY.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (swipeStartY.current === null) return;
    swipeDistY.current = e.clientY - swipeStartY.current;
  };

  // Tap-edge navigation (left third = prev, right two-thirds = next)
  const onTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) prev();
    else next();
  };

  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Glimpse lightbox"
      className="fixed inset-0 z-[100] bg-ink/95 backdrop-blur-sm flex flex-col"
      onClick={onClose}
    >
      {/* Top segmented progress bars — IG-stories-style, one segment per glimpse */}
      <div
        className="flex items-center gap-1 px-4 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        {glimpses.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[2px] bg-paper/20 overflow-hidden rounded-full"
          >
            <div
              className="h-full bg-paper origin-left transition-transform"
              style={{
                transform: `scaleX(${
                  i < index ? 1 : i === index ? progress : 0
                })`,
                transitionDuration: paused ? "0ms" : "60ms",
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-5 py-3 text-paper">
        <div className="mono-text text-[10px] uppercase tracking-wider opacity-80">
          {index + 1} / {glimpses.length}
          {paused && <span className="ml-2 text-gold">paused</span>}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-paper/10 hover:bg-paper/20 flex items-center justify-center transition"
          aria-label="Close"
        >
          <X size={18} strokeWidth={1.6} />
        </button>
      </div>

      <div
        className="flex-1 flex flex-col items-center justify-center px-5 relative select-none"
        onClick={(e) => {
          e.stopPropagation();
          onTap(e);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.media_url}
          alt={
            current.caption
              ? `${current.caption} — by @${current.author_handle}`
              : `Glimpse from @${current.author_handle} in ${current.topic_name}`
          }
          className="max-w-full max-h-[60vh] object-contain pointer-events-none"
          draggable={false}
        />
        {current.caption && (
          <p
            className="mt-4 max-w-md text-center display-italic text-paper text-lg leading-snug px-4"
            onClick={(e) => e.stopPropagation()}
          >
            &ldquo;{current.caption}&rdquo;
          </p>
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
