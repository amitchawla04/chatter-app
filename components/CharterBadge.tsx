/**
 * CharterBadge — visible signal of charter (founding) member status.
 * Inline credential per Visual DNA Principle 4. Two sizes:
 *   sm — inline byline / hairline-only
 *   md — profile / charter page hero — includes the trust-charter mascot
 *        from the Cycle 2 system as a brand-voice loud-tier signal.
 * Links to /charter for benefits.
 */
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { MascotIcon } from "./MascotIcon";

export function CharterBadge({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  if (size === "lg") {
    return (
      <Link
        href="/charter"
        className="inline-flex items-center gap-2 border border-gold bg-gold/5 hover:bg-gold/10 transition px-3 py-1.5 no-underline-link"
        title="Charter member · among the first 500 contributors"
      >
        <MascotIcon name="trust-charter" size={28} alt="charter" />
        <span className="mono-text italic text-gold text-sm">charter</span>
      </Link>
    );
  }
  const cls =
    size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]";
  return (
    <Link
      href="/charter"
      className={`inline-flex items-center gap-1 border border-gold text-gold mono-text italic hover:bg-gold/10 transition ${cls}`}
      title="Charter member · among the first 500 contributors"
    >
      <Sparkles size={size === "md" ? 12 : 10} strokeWidth={1.5} />
      charter
    </Link>
  );
}
