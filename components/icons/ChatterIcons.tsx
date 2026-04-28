/**
 * Custom Chatter glyphs — replace generic Lucide icons where the gesture is signature.
 * These are SVG-only, no external deps. ~30 lines each.
 *
 * Why: Twitter's heart, IG's plane, TikTok's arrows are visually-owned by their brands.
 * Chatter's reactions need their own visual signature so users learn the grammar:
 *  - Echo = ripple (sound waves outward) — silent corroboration
 *  - Pass = folded note (paper plane variant) — to one person, intimate
 *  - Save = pocket (curved bracket) — keep for later
 *
 * All icons inherit currentColor + accept className for sizing.
 */

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
  filled?: boolean;
}

export function EchoGlyph({ size = 16, strokeWidth = 1.6, className = "", filled = false }: IconProps) {
  // Three concentric arcs radiating from a tiny center dot — "ripple"
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {filled ? (
        <>
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          <path d="M7 12a5 5 0 0 1 5-5" />
          <path d="M17 12a5 5 0 0 0 -5 -5" />
          <path d="M4 12a8 8 0 0 1 8-8" />
          <path d="M20 12a8 8 0 0 0 -8 -8" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <path d="M7 12a5 5 0 0 1 5-5" />
          <path d="M17 12a5 5 0 0 0 -5 -5" />
          <path d="M4 12a8 8 0 0 1 8-8" opacity="0.55" />
          <path d="M20 12a8 8 0 0 0 -8 -8" opacity="0.55" />
        </>
      )}
    </svg>
  );
}

export function PassGlyph({ size = 16, strokeWidth = 1.6, className = "" }: IconProps) {
  // Folded-note origami silhouette — distinct from a paper plane. The fold line
  // says "this is a note, sealed for one person", not "broadcast".
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6.5 L12 12.5 L21 6.5" />
      <path d="M3 6.5 L3 19 L21 19 L21 6.5 L12 3 Z" />
      <path d="M3 19 L12 12.5 L21 19" opacity="0.5" />
    </svg>
  );
}

export function SaveGlyph({ size = 16, strokeWidth = 1.6, className = "", filled = false }: IconProps) {
  // Pocket / bookmark curve — keeps the conventional bookmark for findability
  // but with chatter-specific proportions (taller-than-wide ratio, soft notch)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 3 L18 3 L18 21 L12 16.5 L6 21 Z" />
    </svg>
  );
}

export function PeriodGlyph({ size = 12, className = "" }: IconProps) {
  // The period — Chatter's mark. Used as standalone signature in places.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      className={className}
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="5" fill="currentColor" />
    </svg>
  );
}

export function WhisperBracket({ size = 16, strokeWidth = 1.6, className = "" }: IconProps) {
  // Pull-quote bracket — used to mark insider whispers + featured pull-quotes
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 5 L5 5 L5 19 L9 19" />
      <path d="M15 5 L19 5 L19 19 L15 19" />
    </svg>
  );
}
