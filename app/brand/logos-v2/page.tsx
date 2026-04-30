/**
 * Brand · Cycle 2 · 12 mascot / streetwear / Y2K / current-app concepts.
 *
 * Cycle 1 (heritage / sigil / crest / cipher / witness) was rejected by founder
 * 2026-04-30: "none of those for me are iconic." Reset brief:
 *   "totally fresh and new · true entertainment · cheeky, naughty, informative ·
 *    as current as current can be · for 3B people tired of the same Insta/TikTok"
 *
 * Reference DNA (locked):
 *   Snapchat · Tinder · BeReal · MSCHF · TikTok · Y2K · streetwear.
 *   NOT Hermes / Patek / Apple-heritage.
 *
 * Each concept is a separable mark, favicon-scalable (1024 → 192 → 32 readable),
 * carries one specific idea, and breaks color out of the warm-canvas+red lane
 * where the concept demands it (hot pink / acid yellow / chromatic / chrome).
 */
import Link from "next/link";

export const metadata = {
  title: "Brand · Cycle 2 · mascot, streetwear, Y2K · Chatter",
  description: "Cycle 2 brand exploration. 12 marks in mascot / Y2K / streetwear / current-app territory.",
};

interface Concept {
  id: string;
  name: string;
  family: string;
  hook: string;
  story: string;
  dnaTag: "mascot" | "streetwear" | "y2k" | "current-app";
}

const CONCEPTS: Concept[] = [
  {
    id: "01-wink",
    name: "The Wink",
    family: "mascot · the c is a face",
    dnaTag: "mascot",
    hook: "the lowercase c is a winking mascot · tongue poking out the corner",
    story:
      "Snapchat-ghost / Disney-mascot register applied to the wordmark itself. The chunky lowercase c silhouette is also a face — one open eye, one closed wink, a tiny tongue tip exiting the mouth. Reads as the letter AND a personality. Hot pink ground earns instant attention. This is the answer to 'where's the brand's face.'",
  },
  {
    id: "02-shh",
    name: "The Shh",
    family: "mascot · secret-keeper",
    dnaTag: "mascot",
    hook: "lavender face · finger-to-lips · acid yellow ground",
    story:
      "Direct expression of the product promise: we keep secrets, you can talk. A round mascot face, two big bean-shape eyes, a thick pink finger pressed across a tiny mouth. Plays in the same emotional register as the iOS shushing-emoji but is OUR character. The acid yellow ground escapes the heritage-canvas trap.",
  },
  {
    id: "03-tongue",
    name: "The Tongue",
    family: "streetwear · MSCHF",
    dnaTag: "streetwear",
    hook: "open mouth · teeth · long pink tongue draping down",
    story:
      "Cardi-B / Jeremy Scott / MSCHF energy. An open mouth showing teeth with a long pink tongue. Says cheeky, naughty, hungry — exactly the brief. Lives perfectly on a hoodie or a sticker pack. Acid green ground gives it the irreverent chartreuse edge that hot-pink tongues need to pop.",
  },
  {
    id: "04-sip",
    name: "The Sip",
    family: "mascot · spilling-the-tea",
    dnaTag: "mascot",
    hook: "hot pink teacup · steam wisps shape into speech bubbles",
    story:
      "The whole product is gossip / signal / 'spilling tea.' This mark is literally that. A pink teacup, three steam puffs rising — but the puffs are speech-bubble shapes. Reads as a teacup AND as conversation rising out of it. Cream ground keeps it warm and inviting (this is one of the few canvas-friendly marks — earns its place by inverting the meaning of the canvas).",
  },
  {
    id: "05-bubble",
    name: "The Bubble",
    family: "current-app · speech-bubble face",
    dnaTag: "current-app",
    hook: "the speech bubble IS the face · two eyes inside · smirk",
    story:
      "What every chat app draws as a separator, we draw as the brand. The speech bubble has eyes and a smirk inside it. Acid yellow on cyan — pure iMessage/Discord/Snap-current register, but with mascot personality nobody else has. Maximally readable at favicon scale.",
  },
  {
    id: "06-kiss",
    name: "The Kiss",
    family: "streetwear · kiss-and-tell",
    dnaTag: "streetwear",
    hook: "single hot-pink lipstick mark · with c. breath above",
    story:
      "Streetwear merch energy. The brand is literally a kiss. Pairs with the verb 'tell' — chatter is where you kiss-and-tell. One shape, one color, one hand-mark feeling. Reduces to a flat sticker, scales to a wall mural. Most printable mark in the set — works on lipstick packaging, t-shirts, keychains.",
  },
  {
    id: "07-smirk",
    name: "The Smirk",
    family: "current-app · maximum reduction",
    dnaTag: "current-app",
    hook: "one curved smirk line + one dot eye · the brand IS the expression",
    story:
      "The Steve Jobs reduction move applied to mascot DNA. Strip everything except the expression itself: one curl, one dot. Scales to 16×16 perfectly because it's already 16×16-shaped. Acid yellow ground means the mark IS the face — no border between mascot and brand color.",
  },
  {
    id: "08-blob",
    name: "The Blob",
    family: "y2k · liquid metal mascot",
    dnaTag: "y2k",
    hook: "chrome gummy blob · pixel eyes · iMac G3 / Bratz / lava lamp",
    story:
      "Pure Y2K. A chunky liquid-metal blob with two pixel eyes and a small smirk. Chrome gradient runs from chrome-cyan-pink-darkchrome — a full Y2K reflection map. Lives on a sticker pack, a mobile case, a TikTok PFP. Distinctly from 2026, not from 1926. Pairs with Gen-Z core aesthetics that Insta/TikTok skipped over.",
  },
  {
    id: "09-chromatic",
    name: "The Chromatic",
    family: "current-app · TikTok aberration",
    dnaTag: "current-app",
    hook: "lowercase c with cyan + magenta chromatic offset · pink period",
    story:
      "TikTok's signature visual language — chromatic aberration — applied to our letterform. Three offset c-shapes (cyan, magenta, white) read as one c with that 'broken signal / I'm what's now' energy. Pure motion-first mark: the cyan and magenta layers separate and re-converge as the brand reveals.",
  },
  {
    id: "10-dualframe",
    name: "Dual Frame",
    family: "current-app · BeReal homage",
    dnaTag: "current-app",
    hook: "two stacked frames · big = EVERYONE · tiny = whisper",
    story:
      "BeReal taught everyone that two stacked rectangles = a product idea. We use the same vocabulary to teach scope. The big frame says EVERYONE; the tiny corner frame says whisper. The product is the mark — scope is visible in the icon. Acid green ground makes it shout.",
  },
  {
    id: "11-echo",
    name: "The Echo",
    family: "streetwear · chromatic ripples",
    dnaTag: "streetwear",
    hook: "concentric ripples in TikTok chromatic gradient · acid center",
    story:
      "Pulse / signal / sound-wave — but rendered current. Three rings of varying opacity in magenta-pink-cyan gradient ripple out from a single acid-yellow center. Translates beautifully to motion (rings ripple outward on every notification). Beats Cycle 1's pulse by feeling 2026 instead of 2002.",
  },
  {
    id: "12-pop",
    name: "The Pop",
    family: "y2k · supermarket-sticker burst",
    dnaTag: "y2k",
    hook: "14-point acid burst · ink core · italic c. inside",
    story:
      "Y2K Pop-Tarts / SALE-sticker / cereal-box burst aesthetic. The 14 points = one for each Pact promise. Acid-yellow burst, ink center, italic c. wordmark inside. Loud, current, irreverent — exactly the founder brief. Lives on packaging, OOH, a launch teaser zine.",
  },
];

const FAMILY_CHIP: Record<Concept["dnaTag"], string> = {
  mascot: "bg-[#FF2D9A] text-white",
  streetwear: "bg-[#0A0A0A] text-[#F4FF00]",
  y2k: "bg-[#B5A3FF] text-[#0A0A0A]",
  "current-app": "bg-[#00F0FF] text-[#0A0A0A]",
};

export default function LogosV2Page() {
  return (
    <main className="min-h-screen pb-32 bg-canvas">
      <h1 className="sr-only">Brand · Cycle 2 · 12 mascot / streetwear / Y2K concepts · Chatter</h1>

      <header className="px-6 sm:px-10 pt-6 sm:pt-8 flex justify-between items-center">
        <Link href="/" className="display-italic text-2xl text-ink tracking-tight">
          chatter<span className="text-red">.</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/brand/logos" className="label-text text-muted hover:text-ink transition no-underline-link">
            ← cycle 1
          </Link>
          <Link href="/" className="label-text text-muted hover:text-ink transition no-underline-link">
            home
          </Link>
        </div>
      </header>

      <section className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
        <p className="label-text text-red mb-3">brand · cycle 2 · 12 concepts</p>
        <h2 className="display-italic text-4xl sm:text-5xl text-ink mb-3 leading-tight">
          A mascot, a smirk, a kiss — and a face for chatter.
        </h2>
        <p className="body-text text-muted text-base leading-relaxed max-w-2xl mb-2">
          Cycle 1 read as <em>heritage</em> — Hermes, Patek, Apple-sigil. Wrong register. <span className="text-ink">Cycle 2 hunts mascot, streetwear, Y2K and current-app territory</span> instead. Reference DNA: Snapchat ghost · Tinder flame · BeReal dual-frame · MSCHF · TikTok chromatic · Y2K bubble.
        </p>
        <p className="body-text text-muted text-base leading-relaxed max-w-2xl mb-12">
          Brief from the founder: <em className="text-ink">&ldquo;totally fresh and new · true entertainment · cheeky, naughty, informative · as current as current can be · for 3 billion people tired of the same Instagram, TikTok swipe.&rdquo;</em>
        </p>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CONCEPTS.map((c) => (
            <li key={c.id} className="border border-line bg-paper">
              <a
                href={`/api/brand/cycle2/${c.id}`}
                target="_blank"
                rel="noreferrer noopener"
                className="block aspect-square overflow-hidden border-b border-line no-underline-link"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/brand/cycle2/${c.id}`}
                  alt={`${c.name} concept`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </a>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="mono-text text-[10px] uppercase tracking-wider text-muted">
                    {c.id} · {c.family}
                  </p>
                  <span className={`px-2 py-0.5 mono-text text-[9px] uppercase tracking-wider ${FAMILY_CHIP[c.dnaTag]}`}>
                    {c.dnaTag}
                  </span>
                </div>
                <h3 className="display-italic text-2xl text-ink mb-2 leading-tight">{c.name}</h3>
                <p className="text-ink text-sm italic mb-3 leading-snug">{c.hook}</p>
                <p className="text-muted text-xs leading-relaxed">{c.story}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-16 border-t border-line pt-10 max-w-2xl">
          <p className="mono-text text-xs uppercase tracking-wider text-muted mb-3">scale pressure-test</p>
          <p className="body-text text-ink text-sm leading-relaxed mb-6">
            Pick the survivors. Each will then be rendered at 32 / 192 / 1024 to verify favicon scale. Cycle 3 takes the winner into a full system: lockup with the wordmark, motion logo, dark-mode pair, OG card, App Store icon (1024×1024), launch teaser.
          </p>
          <div className="flex flex-wrap gap-2 mb-6">
            {CONCEPTS.map((c) => (
              <a
                key={c.id}
                href={`/api/brand/cycle2/${c.id}`}
                target="_blank"
                rel="noreferrer noopener"
                className="topic-chip no-underline-link"
              >
                {c.id}
              </a>
            ))}
          </div>

          <p className="mono-text text-xs uppercase tracking-wider text-muted mb-3">my recommendation</p>
          <p className="body-text text-ink text-sm leading-relaxed mb-3">
            <strong>Lead pick:</strong> <span className="text-red">01 The Wink</span> — gives the brand a face that IS the wordmark, mascot register without losing letterform anchor, scales to 16×16. <strong>Streetwear pick:</strong> <span className="text-red">06 The Kiss</span> — lives on merch the day after launch. <strong>Current-app pick:</strong> <span className="text-red">09 The Chromatic</span> — owns motion, pairs with TikTok-native users immediately. <strong>Wildcard:</strong> <span className="text-red">07 The Smirk</span> — most reduced, most quotable, most stickerable.
          </p>
          <p className="mono-text text-[11px] text-muted mt-6 leading-relaxed">
            color territory expanded · hot pink <span className="text-[#FF2D9A]">#FF2D9A</span> · acid yellow <span className="text-[#0A0A0A] bg-[#F4FF00] px-1">#F4FF00</span> · acid green <span className="text-[#0A0A0A] bg-[#B8FF1A] px-1">#B8FF1A</span> · lavender <span className="text-[#0A0A0A] bg-[#B5A3FF] px-1">#B5A3FF</span> · TikTok cyan <span className="text-[#0A0A0A] bg-[#00F0FF] px-1">#00F0FF</span> · TikTok magenta <span className="text-white bg-[#FF1AB4] px-1">#FF1AB4</span>
          </p>
        </div>
      </section>
    </main>
  );
}
