/**
 * MascotIcon — server-renderable image wrapper for the Cycle 2 icon family.
 * Pulls from /api/brand/icons/[id]. Default size 56px (loud-tier surface).
 *
 * Usage rules — keep this honest:
 *  · ONLY on loud-canvas surfaces (onboarding scope-picker, live-event kind
 *    chips, glimpse header, charter badge, empty states, pact hero, trust
 *    indicators). NEVER in the in-feed action rail or kebab menus — those
 *    use hairline lucide glyphs so whisper content stays readable.
 *  · Server component by default; safe to render anywhere.
 */

export type MascotName =
  // Verbs
  | "whisper"
  | "echo"
  | "pass"
  | "save"
  | "vouch"
  | "correct"
  | "breath"
  | "tune-in"
  | "glimpse"
  | "quote"
  // Scopes
  | "scope-private"
  | "scope-village"
  | "scope-network"
  | "scope-public"
  // Moments
  | "moment-match"
  | "moment-awards"
  | "moment-news"
  | "moment-premiere"
  | "moment-space"
  // Trust
  | "trust-charter"
  | "trust-insider"
  | "trust-moderator"
  | "trust-whisper-tier"
  // Brand vocabulary
  | "brand-pact"
  | "brand-pass-chain"
  | "brand-charter-cohort"
  | "brand-chatter";

interface Props {
  name: MascotName;
  size?: number;
  className?: string;
  alt?: string;
}

export function MascotIcon({ name, size = 56, className = "", alt = "" }: Props) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`/api/brand/icons/${name}`}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
