/**
 * Brand symbol API — pixel-perfect SVG marks for Cycle 1.
 * Each concept is a separable symbol (works without the wordmark), favicon-scalable,
 * carries an idea (not a font tweak), and is engineered to trigger the FOMO emotion
 * the founder anchored on (Instagram / Apple / Ferrari reference DNA).
 *
 * Returns image/svg+xml — render via <img src="/api/brand/symbol/{id}" />.
 */

const INK = "#0A0A0A";
const CANVAS = "#FAF9F6";
const RED = "#FF2D2D";
const RED_DEEP = "#D11A1A";
const GOLD = "#C8A24E";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const svg = SYMBOLS[id];
  if (!svg) return new Response("not found", { status: 404 });
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=86400",
    },
  });
}

const SYMBOLS: Record<string, string> = {
  /* ─── 01 · The Bloom · the period IS the brand, weighted + glowing ─────────
     Apple-school move: take the smallest mark we own and weaponise it. */
  "01-bloom": svg(`
    <defs>
      <radialGradient id="bloom" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${RED}" stop-opacity="0.35" />
        <stop offset="60%" stop-color="${RED}" stop-opacity="0.12" />
        <stop offset="100%" stop-color="${RED}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" fill="${CANVAS}" />
    <circle cx="512" cy="512" r="430" fill="url(#bloom)" />
    <circle cx="512" cy="512" r="180" fill="${RED}" />
  `),

  /* ─── 02 · The Insider Sigil · wax-seal heraldic mark ────────────────────
     Premium-club energy. Hermes / Patek register. Not for everyone — that's the point. */
  "02-sigil": svg(`
    <rect width="1024" height="1024" fill="${CANVAS}" />
    <circle cx="512" cy="512" r="380" fill="none" stroke="${INK}" stroke-width="6" />
    <circle cx="512" cy="512" r="350" fill="none" stroke="${INK}" stroke-width="2" />
    <!-- inner ornamental ring of 14 dots (one per Pact promise) -->
    ${ring(14, 512, 512, 305, 6, INK)}
    <!-- center red period weighted -->
    <circle cx="512" cy="540" r="76" fill="${RED}" />
    <!-- "C" curve -->
    <path d="M 512 360 a 110 110 0 0 0 -110 110 a 110 110 0 0 0 110 110" fill="none" stroke="${INK}" stroke-width="34" stroke-linecap="round" />
  `),

  /* ─── 03 · The Whisper Crest · Ferrari-school heraldic shield ───────────
     Original story: charter members shape the brand from the inside.
     Gold ring = charter credential, ink shield, red period at the heart. */
  "03-crest": svg(`
    <rect width="1024" height="1024" fill="${CANVAS}" />
    <!-- shield silhouette -->
    <path d="M 512 200
             L 760 280
             L 760 540
             Q 760 720, 512 824
             Q 264 720, 264 540
             L 264 280 Z"
          fill="${INK}" />
    <!-- gold inner ring -->
    <path d="M 512 246
             L 720 312
             L 720 540
             Q 720 690, 512 776
             Q 304 690, 304 540
             L 304 312 Z"
          fill="none" stroke="${GOLD}" stroke-width="6" />
    <!-- red period at heart -->
    <circle cx="512" cy="520" r="64" fill="${RED}" />
    <!-- subtle 'c.' detail above the period -->
    <path d="M 472 420 a 50 50 0 0 0 -50 50 a 50 50 0 0 0 50 50" fill="none" stroke="${CANVAS}" stroke-width="14" stroke-linecap="round" />
  `),

  /* ─── 04 · The Two-Dot Reply · punctuation as identity ────────────────
     Owns the period territory. Two dots in conversation. Black says, red answers. */
  "04-twodot": svg(`
    <rect width="1024" height="1024" fill="${CANVAS}" />
    <line x1="280" y1="600" x2="744" y2="600" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
    <circle cx="280" cy="600" r="92" fill="${INK}" />
    <circle cx="744" cy="600" r="92" fill="${RED}" />
  `),

  /* ─── 05 · The Bite · Apple-school provocation ────────────────────────
     Take the period and take a single bite out of it. Forbidden quiet.
     Tells you the rules ARE getting broken — but on the user's side. */
  "05-bite": svg(`
    <rect width="1024" height="1024" fill="${CANVAS}" />
    <defs>
      <mask id="bite-mask">
        <rect width="1024" height="1024" fill="white" />
        <!-- bite cutout: a circle that bites into the upper-right of the main period -->
        <circle cx="660" cy="380" r="120" fill="black" />
      </mask>
    </defs>
    <circle cx="512" cy="512" r="280" fill="${RED}" mask="url(#bite-mask)" />
    <!-- a single period below, like a punctuation tail -->
    <circle cx="780" cy="780" r="44" fill="${INK}" />
  `),

  /* ─── 06 · The Pulse · single curve, signal-strong ────────────────────
     Spotify / Bose territory. Heart-of-it-all primitive. Tight curve weight. */
  "06-pulse": svg(`
    <rect width="1024" height="1024" fill="${CANVAS}" />
    <path d="M 220 512
             L 380 512
             L 440 380
             L 520 740
             L 600 380
             L 660 512
             L 804 512"
          fill="none" stroke="${INK}" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="804" cy="512" r="44" fill="${RED}" />
  `),

  /* ─── 07 · The Aperture · scope made into the mark ─────────────────────
     4-blade camera aperture — Chatter's four scopes (private/village/network/public)
     literally drawn. Each blade is a scope. The opening is your choice. */
  "07-aperture": svg(`
    <rect width="1024" height="1024" fill="${CANVAS}" />
    <g transform="translate(512 512)">
      ${aperture()}
    </g>
    <circle cx="512" cy="512" r="44" fill="${RED}" />
  `),

  /* ─── 08 · The Cipher · Hermes / Chanel monogram register ──────────────
     Two interlocking C's (charter, chatter). Fashion-house heritage. Very high register. */
  "08-cipher": svg(`
    <rect width="1024" height="1024" fill="${CANVAS}" />
    <!-- Left C -->
    <path d="M 590 360 a 180 180 0 0 0 -180 152 a 180 180 0 0 0 180 152"
          fill="none" stroke="${INK}" stroke-width="48" stroke-linecap="round" />
    <!-- Right C reversed, interlocking -->
    <path d="M 434 360 a 180 180 0 0 1 180 152 a 180 180 0 0 1 -180 152"
          fill="none" stroke="${INK}" stroke-width="48" stroke-linecap="round" />
    <!-- Red period anchoring -->
    <circle cx="512" cy="800" r="38" fill="${RED}" />
  `),

  /* ─── 09 · The Witness · single eye-aperture, observation primitive ────
     Vogue Eye / Eye-Magazine register. Slightly off-balance, ink + red iris.
     "Someone is here, listening." */
  "09-witness": svg(`
    <rect width="1024" height="1024" fill="${CANVAS}" />
    <!-- almond outer -->
    <path d="M 200 512 Q 512 240 824 512 Q 512 784 200 512 Z"
          fill="${INK}" />
    <!-- inner aperture -->
    <circle cx="512" cy="512" r="120" fill="${CANVAS}" />
    <!-- red iris -->
    <circle cx="512" cy="512" r="56" fill="${RED}" />
  `),

  /* ─── 10 · The Quiet Bloom · Cycle-1 dark-horse ────────────────────────
     The bloom (#01) but contained inside a small geometric container — like a stamp.
     Combines bloom's brand-color territory with sigil's premium-feeling enclosure. */
  "10-quiet-bloom": svg(`
    <defs>
      <radialGradient id="qb" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${RED}" stop-opacity="1" />
        <stop offset="55%" stop-color="${RED_DEEP}" stop-opacity="0.85" />
        <stop offset="100%" stop-color="${INK}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" fill="${INK}" />
    <!-- ornate notched-square frame -->
    <rect x="172" y="172" width="680" height="680" fill="none" stroke="${GOLD}" stroke-width="3" />
    <rect x="200" y="200" width="624" height="624" fill="none" stroke="${GOLD}" stroke-width="1" stroke-dasharray="2 6" />
    <!-- bloom inside -->
    <circle cx="512" cy="512" r="320" fill="url(#qb)" />
    <circle cx="512" cy="512" r="100" fill="${RED}" />
  `),
};

function svg(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img">${inner}</svg>`;
}

function ring(count: number, cx: number, cy: number, r: number, dotR: number, color: string): string {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    out.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${dotR}" fill="${color}" />`);
  }
  return out.join("\n");
}

function aperture(): string {
  // four-blade aperture: each blade is a triangle-with-arc
  const blades: string[] = [];
  for (let i = 0; i < 4; i++) {
    const rotation = i * 90;
    blades.push(`
      <path d="M 0 -340 L 240 -100 L 0 0 L -240 -100 Z"
            fill="${INK}" transform="rotate(${rotation}) translate(0 -50)" />
    `);
  }
  return blades.join("\n");
}
