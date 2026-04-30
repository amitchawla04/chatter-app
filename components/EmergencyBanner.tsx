/**
 * EmergencyBanner — global banner / maintenance mode (IP17).
 *
 * Reads `EMERGENCY_BANNER_TEXT` and `EMERGENCY_BANNER_LEVEL` from env at request time.
 * Levels:
 *   - "info"    → blue-ink banner (planned maintenance, feature update)
 *   - "warn"    → red banner (incident, service degradation)
 * Empty/unset → renders nothing (no DOM).
 *
 * Intended to be flipped via `vercel env add EMERGENCY_BANNER_TEXT prod` in seconds.
 * Rendered by the root layout above the page so every route inherits.
 */

export function EmergencyBanner() {
  const text = process.env.EMERGENCY_BANNER_TEXT?.trim();
  if (!text) return null;
  const level = (process.env.EMERGENCY_BANNER_LEVEL ?? "info").trim().toLowerCase();
  const isWarn = level === "warn" || level === "warning" || level === "incident";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full px-4 py-2 text-center mono-text text-[11px] uppercase tracking-wider ${
        isWarn ? "bg-red text-paper" : "bg-ink text-paper"
      }`}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-paper align-middle mr-2 animate-pulse" />
      {text}
    </div>
  );
}
