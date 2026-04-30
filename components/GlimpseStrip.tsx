"use client";

/**
 * GlimpseStrip — horizontal strip of last-24h image whispers.
 *
 * Pact alignment:
 *  - No view counts surfaced to author (Pact 5: no popularity scores).
 *  - No streaks, no read receipts.
 *  - 24h window only — content vanishes from strip after.
 *  - Charter authors first; gold ring signals credential, not paid placement.
 */

import { useState } from "react";
import type { GlimpseRow } from "@/lib/queries";
import { GlimpseLightbox } from "./GlimpseLightbox";
import { MascotIcon } from "./MascotIcon";
import { useT } from "./I18nProvider";

interface GlimpseStripProps {
  glimpses: GlimpseRow[];
}

export function GlimpseStrip({ glimpses }: GlimpseStripProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const t = useT();

  if (glimpses.length < 2) return null; // hide if not enough signal

  return (
    <>
      <section
        aria-label="Glimpse — photos from the last 24 hours"
        className="border-b border-line bg-paper"
      >
        <div className="px-5 pt-4 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MascotIcon name="glimpse" size={26} alt="" />
            <h2 className="label-text text-ink">{t("home.glimpse_today")}</h2>
          </div>
          <span className="mono-text text-[10px] text-muted uppercase tracking-wider">
            {t("home.glimpse_window")}
          </span>
        </div>
        <ul tabIndex={0} aria-label="glimpse · last 24 hours of village photos" className="flex gap-3 overflow-x-auto px-5 py-3 no-scrollbar focus:outline-none focus-visible:ring-2 focus-visible:ring-red">
          {glimpses.map((g, i) => (
            <li key={g.id} className="flex-none">
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className="flex flex-col items-center gap-1.5 group"
                aria-label={`Glimpse from @${g.author_handle} in ${g.topic_name}`}
              >
                <span
                  className={`relative block w-16 h-16 rounded-full overflow-hidden ${
                    g.author_is_charter
                      ? "ring-2 ring-gold ring-offset-2 ring-offset-paper"
                      : "ring-1 ring-line"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.media_url}
                    alt={
                      g.caption
                        ? `${g.caption} — by @${g.author_handle}`
                        : `Glimpse from @${g.author_handle} in ${g.topic_name}`
                    }
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 group-active:scale-95"
                    loading={i < 3 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                  {g.topic_emoji && (
                    <span
                      className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-paper border border-line flex items-center justify-center text-[10px]"
                      aria-hidden="true"
                    >
                      {g.topic_emoji}
                    </span>
                  )}
                </span>
                <span className="mono-text text-[10px] text-muted max-w-[68px] truncate">
                  @{g.author_handle}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {activeIndex !== null && (
        <GlimpseLightbox
          glimpses={glimpses}
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
