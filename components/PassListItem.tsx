"use client";

/**
 * PassListItem — swipeable inbox row (Surface 8.8).
 *  - Drag right past 80px → "thank sender" (gold flash, sender gets a tiny push)
 *  - Drag left past 80px → archive (slides off, removes from list)
 *  - Tap → opens whisper detail
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Heart, Archive } from "lucide-react";
import { archivePass, thankPassSender } from "@/lib/trust-actions";

interface PassRow {
  id: string;
  whisper_id: string;
  from_handle: string;
  topic_name: string;
  topic_emoji: string | null;
  excerpt: string;
  note: string | null;
  unread: boolean;
  thanked: boolean;
  when: string;
}

export function PassListItem({ pass }: { pass: PassRow }) {
  const [thanked, setThanked] = useState(pass.thanked);
  const [archived, setArchived] = useState(false);
  const [, startTransition] = useTransition();
  const x = useMotionValue(0);
  const thankOpacity = useTransform(x, [0, 60, 100], [0, 0.6, 1]);
  const archiveOpacity = useTransform(x, [0, -60, -100], [0, 0.6, 1]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 100 && !thanked) {
      setThanked(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(12);
      startTransition(async () => {
        await thankPassSender(pass.id);
      });
    } else if (info.offset.x < -100) {
      setArchived(true);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate([12, 60, 12]);
      startTransition(async () => {
        await archivePass(pass.id);
      });
    }
    x.set(0);
  };

  if (archived) {
    return (
      <div className="px-5 py-3 border-b border-line bg-paper text-center">
        <span className="mono-text text-[11px] text-muted">archived</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-b border-line">
      {/* Thank hint (left side) */}
      <motion.div
        style={{ opacity: thankOpacity }}
        className="absolute inset-y-0 left-0 w-full flex items-center px-5 bg-gold/15 pointer-events-none"
      >
        <span className="mono-text text-xs text-gold flex items-center gap-1.5 font-medium">
          <Heart size={14} strokeWidth={1.6} fill="currentColor" /> thank
        </span>
      </motion.div>
      {/* Archive hint (right side) */}
      <motion.div
        style={{ opacity: archiveOpacity }}
        className="absolute inset-y-0 right-0 w-full flex items-center justify-end px-5 bg-warn/10 pointer-events-none"
      >
        <span className="mono-text text-xs text-warn flex items-center gap-1.5 font-medium">
          archive <Archive size={14} strokeWidth={1.6} />
        </span>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={onDragEnd}
        style={{ x }}
        className="relative bg-canvas"
      >
        <Link
          href={`/w/${pass.whisper_id}`}
          className={`block px-5 py-4 transition-colors ${
            pass.unread ? "bg-gold/5 hover:bg-gold/10" : "hover:bg-paper"
          }`}
        >
          <div className="flex items-center gap-2 mb-1 text-xs text-muted">
            <span className="text-ink font-medium">@{pass.from_handle}</span>
            <span className="opacity-40">passed you a whisper on</span>
            {pass.topic_emoji && <span>{pass.topic_emoji}</span>}
            <span className="text-gold">{pass.topic_name}</span>
            <span className="opacity-40">·</span>
            <span className="mono-text">{pass.when}</span>
            {thanked && (
              <span className="ml-auto mono-text text-[10px] text-gold flex items-center gap-1">
                <Heart size={10} strokeWidth={1.6} fill="currentColor" /> thanked
              </span>
            )}
          </div>
          <p className="display-italic text-base text-ink leading-snug line-clamp-2">
            &ldquo;{pass.excerpt}&rdquo;
          </p>
          {pass.note && (
            <p className="mt-2 text-sm text-ink/70 italic border-l-2 border-gold/40 pl-3">
              {pass.note}
            </p>
          )}
        </Link>
      </motion.div>
    </div>
  );
}
