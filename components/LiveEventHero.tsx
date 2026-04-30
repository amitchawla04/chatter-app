"use client";

/**
 * LiveEventHero — polymorphic header for /live/[id] (Surface 11 + LE1-4).
 *
 * Each kind opens with its own visual register:
 *  - LE1 match     · score + minute · clinical (existing, kept inline on the page)
 *  - LE2 awards    · gold-leaf chrome · ceremony scale · "now presenting" badge
 *  - LE3 news      · red urgency ticker · sources counter · live-status pulse
 *  - LE4 premiere  · cinema curtain reveal · episode cue · spoiler shield prompt
 *
 * Pact-aligned: the moment IS the kind. Don't blur registers. A press conference
 * should never feel like a finale; a finale should never feel like a soccer goal.
 */

import { useEffect, useState } from "react";
import { Trophy, Newspaper, Tv, AlertTriangle, EyeOff } from "lucide-react";

interface CommonProps {
  title: string;
  subtitle: string | null;
  status: "scheduled" | "live" | "finished";
  startsAt: string;
}

type AwardsProps = CommonProps & {
  kind: "awards";
  currentSegmentLabel: string | null;
  segmentsTotal: number | null;
  segmentsRevealed: number | null;
};

type NewsProps = CommonProps & {
  kind: "news";
  urgencyLevel: number | null;
  sourcesCited: number;
  minuteLabel: string | null;
};

type PremiereProps = CommonProps & {
  kind: "premiere";
  episodeLabel: string | null;
  spoilerShieldDefault: boolean;
};

export type LiveEventHeroProps = AwardsProps | NewsProps | PremiereProps;

export function LiveEventHero(props: LiveEventHeroProps) {
  if (props.kind === "awards") return <AwardsHero {...props} />;
  if (props.kind === "news") return <BreakingNewsHero {...props} />;
  return <PremiereHero {...props} />;
}

/* ───────────────────────────── LE2 · AWARDS ─────────────────────────────
   Red carpet chrome, gold-leaf rule lines, ceremony-scale title, "now
   presenting" pill animates a slow ember when live. Segment progress shown
   as a thin ladder of dots — one dot per category, filled = revealed. */
function AwardsHero({
  title,
  subtitle,
  status,
  currentSegmentLabel,
  segmentsTotal,
  segmentsRevealed,
}: AwardsProps) {
  const total = segmentsTotal ?? 0;
  const done = segmentsRevealed ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <section
      className="relative px-5 py-10 border-b border-line text-center overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #1a0e0e 0%, #2a1414 50%, #1a0e0e 100%)",
      }}
    >
      {/* gold-leaf rule lines */}
      <span aria-hidden="true" className="absolute top-3 left-1/2 -translate-x-1/2 h-px w-24 bg-[#C8A24E]" />
      <span aria-hidden="true" className="absolute bottom-3 left-1/2 -translate-x-1/2 h-px w-24 bg-[#C8A24E]" />

      <div className="flex items-center justify-center gap-2 mb-4 text-xs mono-text uppercase tracking-[0.24em] text-[#C8A24E]">
        <Trophy size={14} strokeWidth={1.5} />
        <span>{status === "live" ? "the ceremony · live" : status === "finished" ? "the ceremony · concluded" : "the ceremony · pre-show"}</span>
      </div>

      <h2 className="display-italic text-3xl sm:text-5xl text-canvas mb-3 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="display-italic text-base text-[#C8A24E]/90 italic mb-5 max-w-md mx-auto">
          {subtitle}
        </p>
      )}

      {currentSegmentLabel && status === "live" && (
        <div className="inline-flex items-center gap-2 mt-2 mb-6 bg-[#C8A24E] text-[#1a0e0e] mono-text uppercase tracking-wider text-[10px] px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" aria-hidden="true" />
          now presenting · {currentSegmentLabel}
        </div>
      )}

      {total > 0 && (
        <div className="max-w-xs mx-auto">
          <div className="flex items-center gap-1 justify-center mb-2" aria-hidden="true">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`block h-1 flex-1 max-w-[8px] ${
                  i < done ? "bg-[#C8A24E]" : "bg-canvas/15"
                }`}
              />
            ))}
          </div>
          <p className="mono-text text-[10px] text-[#C8A24E]/70 uppercase tracking-wider">
            {done} of {total} revealed · {pct}%
          </p>
        </div>
      )}
    </section>
  );
}

/* ───────────────────────────── LE3 · BREAKING NEWS ───────────────────────
   Red ticker top + bottom; urgency badge bumps tone from "developing" to
   "confirmed" to "active threat-level" via the urgency_level int. Source
   counter tells the user how many citations are in the timeline below. */
function BreakingNewsHero({
  title,
  subtitle,
  status,
  urgencyLevel,
  sourcesCited,
  minuteLabel,
}: NewsProps) {
  const u = urgencyLevel ?? 1;
  const tone =
    u >= 3 ? { bg: "#7A0B0B", label: "BREAKING · CONFIRMED" } :
    u === 2 ? { bg: "#B11A1A", label: "BREAKING · DEVELOPING" } :
    { bg: "#FF2D2D", label: "BREAKING · MONITORING" };

  return (
    <section className="relative border-b border-line bg-canvas">
      <div
        role="status"
        aria-live="polite"
        className="text-canvas mono-text uppercase tracking-[0.18em] text-[10px] font-medium px-5 py-1.5 text-center"
        style={{ background: tone.bg }}
      >
        <span className="inline-flex items-center gap-2">
          <AlertTriangle size={11} strokeWidth={2} />
          {tone.label}
          {minuteLabel && <span className="opacity-80">· {minuteLabel}</span>}
        </span>
      </div>

      <div className="px-5 py-7 text-center">
        <div className="flex items-center justify-center gap-2 mb-3 text-xs mono-text text-muted">
          <Newspaper size={14} strokeWidth={1.5} />
          <span>
            {status === "live" ? "live coverage" : status === "finished" ? "story closed" : "coverage starting soon"}
          </span>
        </div>
        <h2 className="display-text text-3xl sm:text-4xl text-ink mb-3 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="body-text text-base text-ink/80 max-w-xl mx-auto leading-snug">
            {subtitle}
          </p>
        )}
        {sourcesCited > 0 && (
          <p className="mt-5 mono-text text-[10px] uppercase tracking-wider text-muted">
            {sourcesCited} source{sourcesCited === 1 ? "" : "s"} cited in the timeline below
          </p>
        )}
      </div>

      <div
        aria-hidden="true"
        className="text-canvas mono-text uppercase tracking-[0.32em] text-[9px] px-5 py-1 text-center"
        style={{ background: tone.bg }}
      >
        · &nbsp; chatter live · whispers from people who actually know · {tone.label} · &nbsp;
      </div>
    </section>
  );
}

/* ───────────────────────────── LE4 · PREMIERE NIGHT ──────────────────────
   Cinema curtain reveal: a deep red drape parts on first paint to expose
   the title. Spoiler shield prompt sits centered. Episode cue lives in
   small-caps mono ("S2 E4 · The Reveal"). */
function PremiereHero({
  title,
  subtitle,
  status,
  episodeLabel,
  spoilerShieldDefault,
}: PremiereProps) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 320);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative border-b border-line overflow-hidden"
      style={{ background: "#0A0A0A" }}
    >
      {/* curtain - left + right halves, slide outward on reveal */}
      <span
        aria-hidden="true"
        className={`absolute top-0 bottom-0 left-0 w-1/2 z-10 transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          revealed ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, #4a0d0d 0%, #2a0808 70%, #4a0d0d 100%)",
          boxShadow: "inset -6px 0 12px rgba(0,0,0,0.6)",
        }}
      />
      <span
        aria-hidden="true"
        className={`absolute top-0 bottom-0 right-0 w-1/2 z-10 transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          revealed ? "translate-x-full" : "translate-x-0"
        }`}
        style={{
          background:
            "linear-gradient(270deg, #4a0d0d 0%, #2a0808 70%, #4a0d0d 100%)",
          boxShadow: "inset 6px 0 12px rgba(0,0,0,0.6)",
        }}
      />
      {/* spotlight */}
      <span
        aria-hidden="true"
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,200,120,0.10) 0%, rgba(0,0,0,0) 60%)",
        }}
      />

      <div className="relative z-20 px-5 py-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-xs mono-text uppercase tracking-[0.24em] text-[#C8A24E]">
          <Tv size={14} strokeWidth={1.5} />
          <span>
            {status === "live" ? "premiere · live" : status === "finished" ? "premiere · ended" : "premiere · curtain rising"}
          </span>
        </div>

        {episodeLabel && (
          <p className="mono-text text-[10px] uppercase tracking-[0.32em] text-canvas/70 mb-3">
            {episodeLabel}
          </p>
        )}

        <h2 className="display-italic text-3xl sm:text-5xl text-canvas mb-3 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="display-italic text-base text-canvas/80 italic max-w-md mx-auto">
            {subtitle}
          </p>
        )}

        {spoilerShieldDefault && (
          <div className="mt-7 inline-flex items-center gap-2 bg-canvas/10 border border-canvas/30 text-canvas mono-text uppercase tracking-wider text-[10px] px-3 py-1.5">
            <EyeOff size={11} strokeWidth={1.6} />
            <span>spoiler shield · whispers blurred until you tap</span>
          </div>
        )}
      </div>
    </section>
  );
}
