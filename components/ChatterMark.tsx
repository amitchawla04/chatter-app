"use client";

/**
 * ChatterMark — Chatter's brand signature.
 *
 * The period breathes (Visual DNA Principle 9). Three pulse modes:
 *  - "rest"    → static gold period, default in-app nav
 *  - "breath"  → ambient 1200ms slow pulse, landing + moments of welcome
 *  - "ember"   → 3-pulse sequence then hold bright, used on first-whisper ceremony
 *
 * Accessibility: pulse is disabled when user prefers-reduced-motion (CSS-level).
 */
interface ChatterMarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  pulse?: "rest" | "breath" | "ember";
  className?: string;
}

export function ChatterMark({
  size = "md",
  pulse = "rest",
  className = "",
}: ChatterMarkProps) {
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl sm:text-7xl",
  }[size];

  const periodClass = {
    rest: "text-gold",
    breath: "text-red chatter-period-breath",
    ember: "text-red chatter-period-ember",
  }[pulse];

  return (
    <span
      className={`display-italic ${sizeClass} text-ink tracking-tight ${className}`}
    >
      chatter<span className={`${periodClass} inline-block`}>.</span>
    </span>
  );
}
