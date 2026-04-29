/**
 * Brand · Cycle 1 · 10 symbol concepts.
 *
 * Reference DNA (founder-locked): Instagram (real-object abstracted + signature gradient),
 * Apple (silhouette + origin story), Ferrari (heraldic crest + brand color).
 * Trigger emotion: FOMO — gravitational pull, "I have to open this."
 *
 * Each concept is a SEPARABLE SYMBOL (lives without the wordmark), favicon-scalable,
 * and carries an idea, not a font tweak. Cycle 2 will refine the founder's pick.
 */
import Link from "next/link";
import { ChatterMark } from "@/components/ChatterMark";

export const metadata = {
  title: "Brand · Cycle 1 · 10 symbol concepts · Chatter",
  description: "Iconic-mark concepts for Chatter. Cycle 1 of multi-cycle branding.",
};

interface Concept {
  id: string;
  name: string;
  hook: string;
  story: string;
  family: string;
}

const CONCEPTS: Concept[] = [
  {
    id: "01-bloom",
    name: "The Bloom",
    family: "punctuation primitive",
    hook: "the period IS the brand · weighted, glowing, owned",
    story:
      "Apple-school move: take the smallest mark we already own (the breathing red period in the wordmark) and weaponise it as the symbol. Soft-glow halo around a single dense red period. The period stops being a footnote and becomes the entire brand. Works at 16×16 favicon, billboards, embroidery.",
  },
  {
    id: "02-sigil",
    name: "The Insider Sigil",
    family: "heraldic / secret-society",
    hook: "wax-seal · 14 dots ring (one per Pact promise) · earned",
    story:
      "Premium-club register (Patek / Hermes / Yale Skull-and-Bones). Two concentric rings, 14 ornamental dots, a recessed 'C' arc, red period at heart. Reads as something earned, not bought. Subtle FOMO: 'who's inside?'",
  },
  {
    id: "03-crest",
    name: "The Whisper Crest",
    family: "heraldic shield · Ferrari-school",
    hook: "ink shield · gold inner ring (charter) · red period at heart",
    story:
      "Ferrari's ranch-of-belonging applied to a whisper network. Shield silhouette grounds it in heritage; gold ring signals the charter cohort; red period is the soul. The mark a charter member wears with pride.",
  },
  {
    id: "04-twodot",
    name: "Two-Dot Reply",
    family: "punctuation primitive",
    hook: "you say · I respond · quietly",
    story:
      "Owns the punctuation territory we've already claimed. Black period speaks; red period answers; a hairline binds them. Reads as a punctuation mark AND an idea. Embarrassingly simple — that's its strength. Reduces perfectly to 16×16 (just two dots).",
  },
  {
    id: "05-bite",
    name: "The Bite",
    family: "Apple-provocation",
    hook: "a single bite taken out of the period · forbidden quiet",
    story:
      "Apple's bitten apple says 'we know'. Chatter's bitten period says 'we listen, but we don't bite back'. Negative-space tension. Single red shape, single removal. Memorable because incomplete.",
  },
  {
    id: "06-pulse",
    name: "The Pulse",
    family: "signal · life-sign",
    hook: "a tight ECG curve ending in a red period",
    story:
      "Signal primitive — heartbeat, ECG, frequency spike. Speaks 'alive' instantly. The line resolves into the red period. Translates to motion: the line draws on, the period blooms. Strong on dark too.",
  },
  {
    id: "07-aperture",
    name: "The Aperture",
    family: "scope · access",
    hook: "four blades · four scopes · the opening is your choice",
    story:
      "Camera-aperture-style four-blade symbol. Each blade is one scope (private / village / network / public). The center red dot is your whisper, scope-adjustable in motion. Concept-rich — it explains the product.",
  },
  {
    id: "08-cipher",
    name: "The Cipher",
    family: "fashion-house monogram",
    hook: "two interlocking C's · red period anchor",
    story:
      "Chanel's double-C / Hermes' H register. Two C's interlock — one for chatter, one for charter. Red period grounds. Highest register; works on a watch face, leather goods, magazine masthead.",
  },
  {
    id: "09-witness",
    name: "The Witness",
    family: "observation · listening",
    hook: "ink almond + red iris · 'someone is here, listening'",
    story:
      "Eye / Vogue-Eye magazine register. The mark says: a credible witness exists. The product story is 'whispers from people who actually know' — the eye sees, the ear listens, the period remembers. Slight unease (eyes ARE intense) — that drives FOMO.",
  },
  {
    id: "10-quiet-bloom",
    name: "Quiet Bloom",
    family: "premium-stamp · framed-bloom",
    hook: "the bloom (#01), but inside an ornate ink frame",
    story:
      "Cycle-1 dark horse. Combines #01's brand-color ownership with #02's premium-enclosure register. Ink ground, gold thin-frame and dotted-frame, red bloom. Feels like a vinyl record sleeve or a premium-spirits label. Different from the warm-canvas siblings — could be the dark-mode mark.",
  },
];

export default function LogosPage() {
  return (
    <main className="min-h-screen pb-32 bg-canvas">
      <h1 className="sr-only">Brand · Cycle 1 · 10 symbol concepts · Chatter</h1>
      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/">
          <ChatterMark size="sm" pulse="breath" />
        </Link>
        <Link href="/" className="label-text text-muted hover:text-ink transition">
          ← back
        </Link>
      </header>

      <section className="px-6 sm:px-10 py-10 max-w-5xl mx-auto">
        <p className="label-text text-red mb-3">brand · cycle 1 · 10 symbol concepts</p>
        <h2 className="display-italic text-4xl sm:text-5xl text-ink mb-3 leading-tight">
          Symbols that earn the verb of Chatter.
        </h2>
        <p className="body-text text-muted text-base leading-relaxed max-w-2xl mb-2">
          Reference DNA: <span className="text-ink">Instagram</span> (real-object abstracted + signature gradient), <span className="text-ink">Apple</span> (silhouette + story), <span className="text-ink">Ferrari</span> (heraldic crest + brand color).
        </p>
        <p className="body-text text-muted text-base leading-relaxed max-w-2xl mb-12">
          Trigger emotion: <span className="text-red italic">FOMO</span> — the mark has gravitational pull, the user opens the app the second they see it. Each concept below is a separable symbol (lives without the wordmark), favicon-scalable, and carries an idea — not a font tweak.
        </p>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONCEPTS.map((c) => (
            <li key={c.id} className="border border-line bg-paper">
              <a
                href={`/api/brand/symbol/${c.id}`}
                target="_blank"
                rel="noreferrer noopener"
                className="block aspect-square overflow-hidden bg-canvas border-b border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/brand/symbol/${c.id}`}
                  alt={`${c.name} concept`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </a>
              <div className="p-5">
                <p className="mono-text text-[10px] uppercase tracking-wider text-muted mb-1">
                  {c.id} · {c.family}
                </p>
                <h3 className="display-italic text-2xl text-ink mb-2 leading-tight">{c.name}</h3>
                <p className="text-ink text-sm italic mb-3 leading-snug">{c.hook}</p>
                <p className="text-muted text-xs leading-relaxed">{c.story}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-16 border-t border-line pt-10 max-w-2xl">
          <p className="mono-text text-xs uppercase tracking-wider text-muted mb-3">cycle process</p>
          <p className="body-text text-ink text-sm leading-relaxed mb-3">
            Cycle 1 surfaces 10 concepts. You react — kill the obvious losers, flag the 2-3 that pull at you. Cycle 2 takes the survivors and explores 5 variations each (weight, geometry, color treatment, motion). Cycle 3 takes the winner into a full system: lockup with the wordmark, app icon, OG card, motion logo, dark-mode pair, brand-color study.
          </p>
          <p className="body-text text-ink text-sm leading-relaxed mb-3">
            <strong>My pick from this 10</strong> if forced to choose now: <span className="text-red">04 Two-Dot Reply</span> for honest reduction (it scales to 16×16 perfectly and means something specific), with <span className="text-red">02 Insider Sigil</span> as the premium-side dark horse. <span className="text-red">10 Quiet Bloom</span> is the wildcard — could be the dark-mode signature mark.
          </p>
          <p className="mono-text text-[11px] text-muted mt-6 leading-relaxed">
            constraints kept across all 10: warm canvas <span className="mono-text">#FAF9F6</span> · near-black ink <span className="mono-text">#0A0A0A</span> · red period <span className="text-red mono-text">#FF2D2D</span> · gold accent <span className="mono-text">#C8A24E</span> · zero decorative flourishes that don&apos;t carry meaning.
          </p>
        </div>
      </section>
    </main>
  );
}
