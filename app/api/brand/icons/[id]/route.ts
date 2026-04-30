/**
 * Brand · Cycle 2 · Product-vocabulary icon family.
 *
 * Each Chatter verb, scope, live-moment, and trust badge gets a mascot-style
 * mark in the same register as 01-Wink / 02-Shh / 03-Tongue / 05-Bubble.
 * Founder direction (2026-05-01): "extend the family, attach to all the
 * other terminology — whispers, echoes, etc."
 *
 * Visual rules across the system:
 *  · 1024×1024 viewBox, full-bleed ground color
 *  · eye dots ≈ 36px radius (or 22px for small marks); always TWO eyes
 *  · smirk = ~half-ellipse arc; consistent stroke weight 14-22px
 *  · ground colors rotate across the brand palette: hot-pink / acid-yellow /
 *    acid-green / lavender / TikTok-cyan / ink — never the warm canvas
 *    (canvas = the heritage register we're escaping)
 *  · everything reads at 16×16 favicon size
 *
 * Each entry is one separable mark, served as image/svg+xml.
 */

const INK = "#0A0A0A";
const CREAM = "#FFFEF7";
const HOT_PINK = "#FF2D9A";
const ACID_YELLOW = "#F4FF00";
const ACID_GREEN = "#B8FF1A";
const LAVENDER = "#B5A3FF";
const TIK_CYAN = "#00F0FF";
const TIK_MAGENTA = "#FF1AB4";
const GOLD = "#FFC93C";
const RED = "#FF2D2D";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const svg = ICONS[id];
  if (!svg) return new Response("not found", { status: 404 });
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=86400",
    },
  });
}

function svg(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img">${inner}</svg>`;
}

/* ─── Reusable face primitives ──────────────────────────────────────────── */
function eyes(cxL: number, cxR: number, cy: number, r: number, color = INK): string {
  return `<circle cx="${cxL}" cy="${cy}" r="${r}" fill="${color}" /><circle cx="${cxR}" cy="${cy}" r="${r}" fill="${color}" />`;
}
function smirk(cx: number, cy: number, w: number, color = INK, sw = 18): string {
  return `<path d="M ${cx - w / 2} ${cy} q ${w / 2} ${w / 2.4} ${w} 0" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" />`;
}
function wink(cx: number, cy: number, w: number, color = INK, sw = 18): string {
  return `<path d="M ${cx - w / 2} ${cy} q ${w / 2} -${w / 3} ${w} 0" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" />`;
}

const ICONS: Record<string, string> = {
  /* ═════════════════════════ VERBS (10) ═════════════════════════ */

  /* whisper · finger-to-lips face — the Shh, action-glyph variant */
  whisper: svg(`
    <rect width="1024" height="1024" fill="${HOT_PINK}" />
    <circle cx="512" cy="512" r="340" fill="${LAVENDER}" />
    ${eyes(400, 624, 460, 36)}
    <rect x="486" y="540" width="52" height="220" rx="26" fill="${CREAM}" stroke="${INK}" stroke-width="10" />
    <ellipse cx="512" cy="640" rx="14" ry="10" fill="${INK}" />
  `),

  /* echo · ripples in chromatic gradient with center dot — sound reverberating */
  echo: svg(`
    <defs>
      <linearGradient id="echoGrad" x1="0" y1="0" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${TIK_MAGENTA}" />
        <stop offset="50%" stop-color="${HOT_PINK}" />
        <stop offset="100%" stop-color="${TIK_CYAN}" />
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="${INK}" />
    <circle cx="512" cy="512" r="380" fill="none" stroke="url(#echoGrad)" stroke-width="32" opacity="0.45" />
    <circle cx="512" cy="512" r="280" fill="none" stroke="url(#echoGrad)" stroke-width="40" opacity="0.7" />
    <circle cx="512" cy="512" r="180" fill="none" stroke="url(#echoGrad)" stroke-width="48" opacity="0.95" />
    <circle cx="512" cy="512" r="60" fill="${ACID_YELLOW}" />
  `),

  /* pass · paper plane with mascot face — sending privately */
  pass: svg(`
    <rect width="1024" height="1024" fill="${ACID_YELLOW}" />
    <path d="M 160 312 L 880 196 L 596 836 L 472 596 L 160 312 Z" fill="${HOT_PINK}" stroke="${INK}" stroke-width="20" stroke-linejoin="round" />
    <path d="M 472 596 L 880 196" stroke="${INK}" stroke-width="14" stroke-linecap="round" />
    ${eyes(400, 540, 460, 30)}
    ${smirk(470, 530, 80, INK, 14)}
  `),

  /* save · folded-corner card with eyes — keeping for later */
  save: svg(`
    <rect width="1024" height="1024" fill="${LAVENDER}" />
    <path d="M 240 200 L 740 200 L 800 260 L 800 824 L 240 824 Z" fill="${CREAM}" stroke="${INK}" stroke-width="20" stroke-linejoin="round" />
    <path d="M 740 200 L 740 260 L 800 260" fill="none" stroke="${INK}" stroke-width="20" stroke-linejoin="round" />
    ${eyes(420, 620, 480, 40)}
    ${smirk(412, 600, 200, INK, 18)}
    <circle cx="520" cy="760" r="34" fill="${HOT_PINK}" />
  `),

  /* vouch · two interlocking rosette-faces nodding agreement */
  vouch: svg(`
    <rect width="1024" height="1024" fill="${ACID_GREEN}" />
    <circle cx="376" cy="512" r="240" fill="${HOT_PINK}" stroke="${INK}" stroke-width="20" />
    <circle cx="640" cy="512" r="240" fill="${TIK_CYAN}" stroke="${INK}" stroke-width="20" />
    ${eyes(316, 416, 480, 26)}
    ${eyes(596, 696, 480, 26)}
    ${smirk(316, 560, 100, INK, 14)}
    ${smirk(596, 560, 100, INK, 14)}
  `),

  /* correct · pointing-pen with insider-credential dot — gentle pushback */
  correct: svg(`
    <rect width="1024" height="1024" fill="${CREAM}" />
    <path d="M 220 824 L 660 384 L 760 484 L 320 924" fill="${HOT_PINK}" stroke="${INK}" stroke-width="20" stroke-linejoin="round" transform="translate(0 -100)" />
    <path d="M 660 384 L 760 484" stroke="${INK}" stroke-width="20" transform="translate(0 -100)" />
    <path d="M 720 244 L 820 344" stroke="${INK}" stroke-width="40" stroke-linecap="round" />
    <circle cx="240" cy="240" r="80" fill="${RED}" />
    <text x="240" y="276" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="80" fill="${CREAM}">!</text>
  `),

  /* breath · small wisp/cloud face — village-only soft signal */
  breath: svg(`
    <rect width="1024" height="1024" fill="${LAVENDER}" />
    <path d="M 200 600
             Q 160 520, 240 480
             Q 240 360, 360 360
             Q 420 280, 540 320
             Q 660 280, 720 360
             Q 840 360, 840 480
             Q 900 540, 840 600
             Q 880 660, 800 700
             Q 720 760, 600 720
             Q 460 760, 360 720
             Q 220 720, 200 600 Z"
          fill="${CREAM}" stroke="${INK}" stroke-width="20" />
    ${eyes(420, 600, 540, 34)}
    ${smirk(412, 620, 200, INK, 16)}
  `),

  /* tune-in · antenna mascot, signal rays */
  "tune-in": svg(`
    <rect width="1024" height="1024" fill="${HOT_PINK}" />
    <circle cx="512" cy="612" r="240" fill="${INK}" />
    ${eyes(432, 592, 580, 30, ACID_YELLOW)}
    ${smirk(432, 660, 160, ACID_YELLOW, 16)}
    <line x1="512" y1="370" x2="512" y2="200" stroke="${ACID_YELLOW}" stroke-width="22" stroke-linecap="round" />
    <circle cx="512" cy="170" r="42" fill="${ACID_YELLOW}" />
    <path d="M 380 280 Q 320 220, 250 220" fill="none" stroke="${ACID_YELLOW}" stroke-width="18" stroke-linecap="round" />
    <path d="M 644 280 Q 704 220, 774 220" fill="none" stroke="${ACID_YELLOW}" stroke-width="18" stroke-linecap="round" />
    <path d="M 360 360 Q 240 300, 140 320" fill="none" stroke="${ACID_YELLOW}" stroke-width="14" stroke-linecap="round" opacity="0.55" />
    <path d="M 664 360 Q 784 300, 884 320" fill="none" stroke="${ACID_YELLOW}" stroke-width="14" stroke-linecap="round" opacity="0.55" />
  `),

  /* glimpse · eye through parted curtain — 24h photo share */
  glimpse: svg(`
    <rect width="1024" height="1024" fill="${ACID_YELLOW}" />
    <path d="M 160 200 L 160 824 L 380 824 Q 380 612, 480 512 Q 380 412, 380 200 Z" fill="${HOT_PINK}" stroke="${INK}" stroke-width="20" />
    <path d="M 864 200 L 864 824 L 644 824 Q 644 612, 544 512 Q 644 412, 644 200 Z" fill="${HOT_PINK}" stroke="${INK}" stroke-width="20" />
    <ellipse cx="512" cy="512" rx="180" ry="120" fill="${CREAM}" stroke="${INK}" stroke-width="20" />
    <circle cx="512" cy="512" r="80" fill="${INK}" />
    <circle cx="490" cy="490" r="22" fill="${CREAM}" />
  `),

  /* quote · nested speech bubble face — republish with your take */
  quote: svg(`
    <rect width="1024" height="1024" fill="${TIK_CYAN}" />
    <path d="M 140 240 Q 140 160, 220 160 L 804 160 Q 884 160, 884 240 L 884 540 Q 884 620, 804 620 L 760 620 L 760 700 L 680 620 L 220 620 Q 140 620, 140 540 Z" fill="${INK}" />
    <path d="M 280 320 Q 280 280, 320 280 L 644 280 Q 684 280, 684 320 L 684 460 Q 684 500, 644 500 L 480 500 L 440 540 L 440 500 L 320 500 Q 280 500, 280 460 Z" fill="${ACID_YELLOW}" />
    ${eyes(384, 580, 400, 22)}
    ${smirk(380, 444, 100, INK, 12)}
  `),

  /* ═════════════════════════ SCOPES (4) ═════════════════════════ */

  /* private · sealed envelope with wink — 1:1 view-once */
  "scope-private": svg(`
    <rect width="1024" height="1024" fill="${INK}" />
    <rect x="160" y="280" width="704" height="464" rx="20" fill="${CREAM}" stroke="${ACID_YELLOW}" stroke-width="16" />
    <path d="M 160 280 L 512 580 L 864 280" fill="none" stroke="${ACID_YELLOW}" stroke-width="16" stroke-linejoin="round" />
    <circle cx="512" cy="600" r="60" fill="${RED}" stroke="${INK}" stroke-width="12" />
    <text x="512" y="630" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="80" fill="${CREAM}">1</text>
  `),

  /* village · 3-mascot triangle cluster — circle scope */
  "scope-village": svg(`
    <rect width="1024" height="1024" fill="${CREAM}" />
    <circle cx="512" cy="320" r="180" fill="${HOT_PINK}" stroke="${INK}" stroke-width="20" />
    <circle cx="312" cy="640" r="180" fill="${ACID_YELLOW}" stroke="${INK}" stroke-width="20" />
    <circle cx="712" cy="640" r="180" fill="${TIK_CYAN}" stroke="${INK}" stroke-width="20" />
    ${eyes(472, 552, 300, 18)} ${smirk(470, 348, 80, INK, 12)}
    ${eyes(272, 352, 620, 18)} ${smirk(270, 668, 80, INK, 12)}
    ${eyes(672, 752, 620, 18)} ${smirk(670, 668, 80, INK, 12)}
  `),

  /* network · chain link with mascot face — vouched insiders only */
  "scope-network": svg(`
    <rect width="1024" height="1024" fill="${ACID_YELLOW}" />
    <rect x="180" y="380" width="380" height="264" rx="132" fill="none" stroke="${INK}" stroke-width="40" />
    <rect x="464" y="380" width="380" height="264" rx="132" fill="none" stroke="${INK}" stroke-width="40" />
    <rect x="464" y="380" width="100" height="264" fill="${ACID_YELLOW}" />
    <circle cx="370" cy="512" r="80" fill="${HOT_PINK}" />
    <circle cx="654" cy="512" r="80" fill="${TIK_CYAN}" />
    ${eyes(346, 392, 504, 14)}
    ${eyes(630, 676, 504, 14)}
  `),

  /* public · globe with open mouth — to the open */
  "scope-public": svg(`
    <rect width="1024" height="1024" fill="${TIK_CYAN}" />
    <circle cx="512" cy="512" r="340" fill="${ACID_GREEN}" stroke="${INK}" stroke-width="20" />
    <ellipse cx="512" cy="512" rx="340" ry="120" fill="none" stroke="${INK}" stroke-width="14" />
    <line x1="172" y1="512" x2="852" y2="512" stroke="${INK}" stroke-width="14" />
    <line x1="512" y1="172" x2="512" y2="852" stroke="${INK}" stroke-width="14" />
    ${eyes(420, 604, 440, 30)}
    <ellipse cx="512" cy="600" rx="80" ry="44" fill="${INK}" />
    <ellipse cx="512" cy="606" rx="40" ry="22" fill="${HOT_PINK}" />
  `),

  /* ═════════════════════════ MOMENTS (5) ═════════════════════════ */

  /* match · soccer ball with wink — sports live */
  "moment-match": svg(`
    <rect width="1024" height="1024" fill="${ACID_GREEN}" />
    <circle cx="512" cy="512" r="340" fill="${CREAM}" stroke="${INK}" stroke-width="22" />
    <polygon points="512,300 612,372 574,492 450,492 412,372" fill="${INK}" />
    <line x1="512" y1="300" x2="512" y2="180" stroke="${INK}" stroke-width="22" />
    <line x1="612" y1="372" x2="720" y2="320" stroke="${INK}" stroke-width="22" />
    <line x1="412" y1="372" x2="304" y2="320" stroke="${INK}" stroke-width="22" />
    <line x1="450" y1="492" x2="380" y2="600" stroke="${INK}" stroke-width="22" />
    <line x1="574" y1="492" x2="644" y2="600" stroke="${INK}" stroke-width="22" />
    ${eyes(412, 612, 700, 22)}
    ${smirk(412, 760, 200, INK, 16)}
  `),

  /* awards · trophy with bow + center red dot */
  "moment-awards": svg(`
    <rect width="1024" height="1024" fill="${INK}" />
    <path d="M 332 244 L 692 244 L 668 528 Q 644 660, 512 660 Q 380 660, 356 528 Z" fill="${GOLD}" stroke="${CREAM}" stroke-width="14" />
    <path d="M 332 280 Q 200 280, 200 380 Q 200 480, 332 460" fill="none" stroke="${GOLD}" stroke-width="22" />
    <path d="M 692 280 Q 824 280, 824 380 Q 824 480, 692 460" fill="none" stroke="${GOLD}" stroke-width="22" />
    <rect x="432" y="660" width="160" height="60" fill="${GOLD}" />
    <rect x="372" y="720" width="280" height="40" fill="${GOLD}" />
    <rect x="320" y="760" width="384" height="60" fill="${GOLD}" />
    ${eyes(440, 584, 400, 22, INK)}
    ${smirk(440, 480, 144, INK, 14)}
    <circle cx="512" cy="244" r="36" fill="${RED}" />
  `),

  /* news · siren/megaphone with wide eyes */
  "moment-news": svg(`
    <rect width="1024" height="1024" fill="${RED}" />
    <path d="M 200 384 L 200 640 L 360 640 L 700 800 L 700 224 L 360 384 Z" fill="${CREAM}" stroke="${INK}" stroke-width="22" stroke-linejoin="round" />
    <path d="M 760 360 Q 880 384, 880 512 Q 880 640, 760 664" fill="none" stroke="${CREAM}" stroke-width="20" stroke-linecap="round" />
    <path d="M 760 280 Q 940 320, 940 512 Q 940 704, 760 744" fill="none" stroke="${CREAM}" stroke-width="14" stroke-linecap="round" opacity="0.65" />
    ${eyes(380, 560, 480, 28)}
    <ellipse cx="470" cy="572" rx="14" ry="20" fill="${INK}" opacity="0" />
  `),

  /* premiere · clapboard with eyes */
  "moment-premiere": svg(`
    <rect width="1024" height="1024" fill="${INK}" />
    <rect x="160" y="380" width="704" height="424" fill="${HOT_PINK}" stroke="${CREAM}" stroke-width="14" />
    <path d="M 140 280 L 220 380 L 360 280 L 440 380 L 580 280 L 660 380 L 800 280 L 880 380 L 140 380 Z" fill="${CREAM}" stroke="${INK}" stroke-width="14" />
    ${eyes(400, 624, 560, 38, CREAM)}
    ${smirk(400, 700, 224, CREAM, 18)}
    <text x="200" y="824" font-family="Inter, sans-serif" font-weight="900" font-size="40" fill="${CREAM}" letter-spacing="-0.04em">CHATTER · 1</text>
  `),

  /* space · microphone with face — audio space */
  "moment-space": svg(`
    <rect width="1024" height="1024" fill="${LAVENDER}" />
    <rect x="364" y="200" width="296" height="448" rx="148" fill="${INK}" />
    ${eyes(444, 580, 380, 28, ACID_YELLOW)}
    ${smirk(444, 480, 136, ACID_YELLOW, 14)}
    <line x1="512" y1="660" x2="512" y2="800" stroke="${INK}" stroke-width="32" stroke-linecap="round" />
    <line x1="412" y1="800" x2="612" y2="800" stroke="${INK}" stroke-width="32" stroke-linecap="round" />
    <path d="M 240 460 Q 200 540, 240 620" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round" />
    <path d="M 784 460 Q 824 540, 784 620" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round" />
  `),

  /* ═════════════════════════ TRUST + IDENTITY (4) ═════════════════════════ */

  /* charter · gold star mascot with red period — founding cohort */
  "trust-charter": svg(`
    <rect width="1024" height="1024" fill="${INK}" />
    <polygon points="512,144 612,420 904,420 668,580 760,856 512,696 264,856 356,580 120,420 412,420" fill="${GOLD}" stroke="${CREAM}" stroke-width="14" />
    ${eyes(440, 584, 480, 26, INK)}
    ${smirk(440, 528, 144, INK, 14)}
    <circle cx="512" cy="640" r="22" fill="${RED}" />
  `),

  /* insider · eye-witness with credential ring — verified expertise */
  "trust-insider": svg(`
    <rect width="1024" height="1024" fill="${CREAM}" />
    <circle cx="512" cy="512" r="360" fill="none" stroke="${INK}" stroke-width="14" stroke-dasharray="4 14" />
    <path d="M 160 512 Q 512 240, 864 512 Q 512 784, 160 512 Z" fill="${INK}" />
    <circle cx="512" cy="512" r="120" fill="${CREAM}" />
    <circle cx="512" cy="512" r="56" fill="${HOT_PINK}" />
    <circle cx="492" cy="492" r="14" fill="${CREAM}" />
  `),

  /* moderator · shield with neutral face — fair-minded mod */
  "trust-moderator": svg(`
    <rect width="1024" height="1024" fill="${CREAM}" />
    <path d="M 512 144 L 824 244 L 824 540 Q 824 720, 512 880 Q 200 720, 200 540 L 200 244 Z" fill="${INK}" />
    <path d="M 512 200 L 768 280 L 768 540 Q 768 680, 512 816 Q 256 680, 256 540 L 256 280 Z" fill="none" stroke="${ACID_YELLOW}" stroke-width="8" />
    ${eyes(420, 604, 460, 30, ACID_YELLOW)}
    <line x1="380" y1="640" x2="644" y2="640" stroke="${ACID_YELLOW}" stroke-width="14" stroke-linecap="round" />
  `),

  /* whisper-tier · premium variant of whisper, gold-leaf accent */
  "trust-whisper-tier": svg(`
    <rect width="1024" height="1024" fill="${INK}" />
    <circle cx="512" cy="512" r="340" fill="${LAVENDER}" stroke="${GOLD}" stroke-width="22" />
    ${eyes(400, 624, 460, 36)}
    <rect x="486" y="540" width="52" height="220" rx="26" fill="${GOLD}" stroke="${INK}" stroke-width="10" />
    <ellipse cx="512" cy="640" rx="14" ry="10" fill="${INK}" />
    <circle cx="816" cy="208" r="44" fill="${GOLD}" />
    <text x="816" y="224" text-anchor="middle" font-family="Inter, sans-serif" font-weight="900" font-size="44" fill="${INK}">★</text>
  `),

  /* ═════════════════════════ BRAND VOCABULARY (4) ═════════════════════════ */

  /* pact · 14-point burst (one per Pact promise) — the brand contract */
  "brand-pact": svg(`
    <rect width="1024" height="1024" fill="${HOT_PINK}" />
    ${(() => {
      const pts: string[] = [];
      const n = 14;
      const cx = 512;
      const cy = 512;
      const outer = 380;
      const inner = 280;
      for (let i = 0; i < n * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / n - Math.PI / 2;
        pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
      }
      return `<polygon points="${pts.join(" ")}" fill="${ACID_YELLOW}" />`;
    })()}
    <circle cx="512" cy="512" r="220" fill="${INK}" />
    <text x="512" y="568" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="240" fill="${ACID_YELLOW}" letter-spacing="-0.04em">14</text>
  `),

  /* pass-chain · 4 mascot-dots connected by a path — distribution lineage */
  "brand-pass-chain": svg(`
    <rect width="1024" height="1024" fill="${ACID_GREEN}" />
    <path d="M 200 280 Q 360 360, 440 480 Q 520 600, 680 560 Q 820 540, 824 760"
          fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round" stroke-dasharray="2 26" />
    <circle cx="200" cy="280" r="68" fill="${GOLD}" stroke="${INK}" stroke-width="14" />
    ${eyes(178, 222, 268, 12)}
    <circle cx="440" cy="480" r="60" fill="${HOT_PINK}" stroke="${INK}" stroke-width="14" />
    ${eyes(420, 460, 472, 12)}
    <circle cx="680" cy="560" r="60" fill="${TIK_CYAN}" stroke="${INK}" stroke-width="14" />
    ${eyes(660, 700, 552, 12)}
    <circle cx="824" cy="760" r="68" fill="${RED}" stroke="${INK}" stroke-width="14" />
    <circle cx="824" cy="760" r="22" fill="${CREAM}" />
  `),

  /* charter-cohort · 14 mascot heads in formation — the founding 500 */
  "brand-charter-cohort": svg(`
    <rect width="1024" height="1024" fill="${GOLD}" />
    ${(() => {
      const out: string[] = [];
      const cols = [3, 4, 5, 4, 2];
      let y = 220;
      const colorRotate = [HOT_PINK, TIK_CYAN, LAVENDER, ACID_GREEN, ACID_YELLOW];
      let i = 0;
      for (const c of cols) {
        const xStep = 800 / (c + 1);
        for (let k = 1; k <= c; k++) {
          const x = 112 + xStep * k;
          const color = colorRotate[i % colorRotate.length];
          out.push(`<circle cx="${x}" cy="${y}" r="60" fill="${color}" stroke="${INK}" stroke-width="10" />`);
          out.push(`<circle cx="${x - 18}" cy="${y - 8}" r="8" fill="${INK}" />`);
          out.push(`<circle cx="${x + 18}" cy="${y - 8}" r="8" fill="${INK}" />`);
          out.push(`<path d="M ${x - 22} ${y + 18} q 22 18 44 0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round" />`);
          i++;
        }
        y += 132;
      }
      return out.join("\n");
    })()}
  `),

  /* chatter · the wordmark itself, mascot-flavored — face hidden in the c */
  "brand-chatter": svg(`
    <rect width="1024" height="1024" fill="${HOT_PINK}" />
    <path d="M 720 320
             a 280 280 0 1 0 0 384
             L 660 644
             a 220 220 0 1 1 0 -264 Z"
          fill="${CREAM}" />
    <circle cx="500" cy="430" r="36" fill="${INK}" />
    <path d="M 590 575 q 36 -34 72 0" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" />
    <text x="780" y="744" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="200" fill="${CREAM}">.</text>
  `),
};
