/**
 * CharterBadge — visible signal of charter (founding) member status.
 * Inline credential per Visual DNA Principle 4.
 */
import { Sparkles } from "lucide-react";

export function CharterBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls =
    size === "md"
      ? "px-2.5 py-1 text-xs"
      : "px-2 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1 border border-gold text-gold mono-text italic ${cls}`}
      title="Charter member · among the first 500 contributors"
    >
      <Sparkles size={size === "md" ? 12 : 10} strokeWidth={1.5} />
      charter
    </span>
  );
}
