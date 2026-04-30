/**
 * Brand · Cycle 2 · 12 mascot / streetwear / Y2K / current-app concepts.
 *
 * Cycle 1 register (heritage / Hermes / Patek / Apple sigil) was rejected by
 * founder 2026-04-30: "none of those for me are iconic." Reset brief:
 *   "totally fresh and new · true entertainment · cheeky, naughty, informative ·
 *    as current as current can be · for 3B people tired of the same Insta/TikTok"
 *
 * Reference DNA (locked):
 *   Snapchat ghost · Tinder flame · BeReal dual-frame · MSCHF · TikTok chromatic ·
 *   Y2K bubble · streetwear primary-color irreverence · mascot-first.
 *
 * Each concept:
 *   – mascot, streetwear, Y2K, or current-app-icon DNA (NOT heritage)
 *   – carries a specific idea, not just a font tweak
 *   – favicon-scalable (1024 → 192 → 32 readable)
 *   – pushes color territory away from warm-canvas-and-red into hot-pink /
 *     acid-yellow / chrome / chromatic where the concept demands it
 */

const INK = "#0A0A0A";
const CANVAS = "#FAF9F6";
const HOT_PINK = "#FF2D9A";
const ACID_YELLOW = "#F4FF00";
const ACID_GREEN = "#B8FF1A";
const LAVENDER = "#B5A3FF";
const TIK_CYAN = "#00F0FF";
const TIK_MAGENTA = "#FF1AB4";
const CREAM = "#FFFEF7";
const CHROME_HI = "#F5F5F8";
const CHROME_MID = "#A8A8B5";
const CHROME_LO = "#404048";

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
  /* ─── 01 · The Wink · mascot face that IS the c. ────────────────────────
     The wordmark's lowercase c re-imagined as a mascot face. One open eye
     (dot), one closed (smirk). Tongue-tip exits the mouth on the right.
     Reads as a face AND as the letter c. Snapchat-ghost mascot register. */
  "01-wink": svg(`
    <rect width="1024" height="1024" fill="${HOT_PINK}" />
    <!-- Big chunky 'c' silhouette in cream -->
    <path d="M 720 320
             a 280 280 0 1 0 0 384
             L 660 644
             a 220 220 0 1 1 0 -264 Z"
          fill="${CREAM}" />
    <!-- Open eye (top dot) -->
    <circle cx="500" cy="430" r="36" fill="${INK}" />
    <!-- Closed wink eye (curve) -->
    <path d="M 590 575 q 36 -34 72 0" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" />
    <!-- Tiny tongue poking out mouth-corner -->
    <circle cx="780" cy="612" r="38" fill="${ACID_YELLOW}" stroke="${INK}" stroke-width="10" />
  `),

  /* ─── 02 · The Shh · finger-to-lips secret-keeper mascot ────────────────
     A round lavender face, two black dot eyes, and a thick pink finger
     pressed to a tiny mouth. Says: "we keep secrets, you can talk." */
  "02-shh": svg(`
    <rect width="1024" height="1024" fill="${ACID_YELLOW}" />
    <!-- Round face -->
    <circle cx="512" cy="512" r="340" fill="${LAVENDER}" />
    <!-- Eyes -->
    <ellipse cx="400" cy="450" rx="32" ry="44" fill="${INK}" />
    <ellipse cx="600" cy="450" rx="32" ry="44" fill="${INK}" />
    <!-- Finger (vertical thick rounded bar) -->
    <rect x="486" y="540" width="52" height="220" rx="26" fill="${HOT_PINK}" stroke="${INK}" stroke-width="10" />
    <!-- Fingernail tip -->
    <ellipse cx="512" cy="560" rx="22" ry="14" fill="${CREAM}" />
    <!-- Tiny pursed mouth behind finger -->
    <ellipse cx="512" cy="640" rx="14" ry="10" fill="${INK}" />
  `),

  /* ─── 03 · The Tongue · sticking out, naughty + playful ─────────────────
     Open mouth showing teeth + a long pink tongue draping down.
     MSCHF / Cardi-B / streetwear-merch register. */
  "03-tongue": svg(`
    <rect width="1024" height="1024" fill="${ACID_GREEN}" />
    <!-- Outer lip silhouette -->
    <path d="M 220 480
             Q 360 280, 512 360
             Q 664 280, 804 480
             Q 720 720, 512 720
             Q 304 720, 220 480 Z"
          fill="${HOT_PINK}" stroke="${INK}" stroke-width="14" />
    <!-- Top teeth row -->
    <path d="M 280 470 L 744 470" stroke="${CREAM}" stroke-width="58" stroke-linecap="round" />
    <!-- Teeth gaps -->
    <line x1="360" y1="442" x2="360" y2="498" stroke="${INK}" stroke-width="6" />
    <line x1="440" y1="442" x2="440" y2="498" stroke="${INK}" stroke-width="6" />
    <line x1="520" y1="442" x2="520" y2="498" stroke="${INK}" stroke-width="6" />
    <line x1="600" y1="442" x2="600" y2="498" stroke="${INK}" stroke-width="6" />
    <line x1="680" y1="442" x2="680" y2="498" stroke="${INK}" stroke-width="6" />
    <!-- Long tongue draping -->
    <path d="M 412 540
             Q 412 760, 512 880
             Q 612 760, 612 540 Z"
          fill="${HOT_PINK}" stroke="${INK}" stroke-width="14" />
    <!-- Tongue centerline crease -->
    <path d="M 512 600 Q 512 760, 512 840" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.5" />
  `),

  /* ─── 04 · The Sip · spilling-the-tea cup ───────────────────────────────
     Teacup with steam wisps. "Spilling the tea" = gossip slang. Hot pink
     cup, black silhouette, steam = three small whisper-bubbles rising. */
  "04-sip": svg(`
    <rect width="1024" height="1024" fill="${CREAM}" />
    <!-- Cup body -->
    <path d="M 280 560
             L 296 800
             Q 304 856, 360 856
             L 644 856
             Q 700 856, 708 800
             L 724 560 Z"
          fill="${HOT_PINK}" stroke="${INK}" stroke-width="20" stroke-linejoin="round" />
    <!-- Cup rim (tea visible) -->
    <ellipse cx="502" cy="560" rx="222" ry="32" fill="${INK}" />
    <ellipse cx="502" cy="552" rx="208" ry="22" fill="${ACID_YELLOW}" />
    <!-- Cup handle -->
    <path d="M 724 620
             Q 836 620, 836 720
             Q 836 800, 712 800"
          fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" />
    <!-- Steam wisps as speech-bubbles -->
    <ellipse cx="380" cy="380" rx="44" ry="32" fill="${INK}" />
    <ellipse cx="500" cy="280" rx="56" ry="40" fill="${INK}" />
    <ellipse cx="640" cy="380" rx="44" ry="32" fill="${INK}" />
    <!-- Cup base shadow -->
    <ellipse cx="502" cy="868" rx="180" ry="14" fill="${INK}" opacity="0.15" />
  `),

  /* ─── 05 · The Bubble · speech-bubble that's a face ────────────────────
     A speech bubble shape with eyes inside it. The container is the face.
     Acid yellow ground, black bubble. Highly reducible to favicon. */
  "05-bubble": svg(`
    <rect width="1024" height="1024" fill="${TIK_CYAN}" />
    <!-- Speech bubble silhouette -->
    <path d="M 200 280
             Q 200 200, 280 200
             L 744 200
             Q 824 200, 824 280
             L 824 600
             Q 824 680, 744 680
             L 480 680
             L 360 800
             L 380 680
             L 280 680
             Q 200 680, 200 600 Z"
          fill="${INK}" />
    <!-- Two dot eyes -->
    <circle cx="400" cy="430" r="48" fill="${ACID_YELLOW}" />
    <circle cx="624" cy="430" r="48" fill="${ACID_YELLOW}" />
    <!-- Smirk -->
    <path d="M 400 540 q 112 60 224 0"
          fill="none" stroke="${ACID_YELLOW}" stroke-width="22" stroke-linecap="round" />
  `),

  /* ─── 06 · The Kiss · hot-pink lipstick mark ───────────────────────────
     Single shape. Streetwear merch energy. A literal kiss-mark with a tiny
     "c." breath above. Says "we kiss and tell." */
  "06-kiss": svg(`
    <rect width="1024" height="1024" fill="${CREAM}" />
    <!-- Upper lip -->
    <path d="M 280 480
             Q 360 380, 440 460
             Q 480 420, 512 460
             Q 544 420, 584 460
             Q 664 380, 744 480
             Q 700 540, 512 540
             Q 324 540, 280 480 Z"
          fill="${HOT_PINK}" stroke="${INK}" stroke-width="6" />
    <!-- Lower lip -->
    <path d="M 280 480
             Q 380 700, 512 720
             Q 644 700, 744 480
             Q 700 540, 512 540
             Q 324 540, 280 480 Z"
          fill="${HOT_PINK}" stroke="${INK}" stroke-width="6" />
    <!-- Highlight on lower lip -->
    <ellipse cx="512" cy="600" rx="60" ry="8" fill="${CREAM}" opacity="0.6" />
    <!-- Tiny "c." breath above -->
    <text x="512" y="320" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="120" font-weight="700" fill="${INK}">c<tspan fill="${HOT_PINK}">.</tspan></text>
  `),

  /* ─── 07 · The Smirk · single curve, maximum reduction ─────────────────
     Just one smirk line. The brand IS the expression. Fits 16x16 perfectly.
     Slightly asymmetric — left side flat, right side rises into a curl. */
  "07-smirk": svg(`
    <rect width="1024" height="1024" fill="${ACID_YELLOW}" />
    <!-- The smirk -->
    <path d="M 240 560
             Q 440 540, 600 560
             Q 760 580, 820 460"
          fill="none" stroke="${INK}" stroke-width="80" stroke-linecap="round" />
    <!-- Tiny dot eye above the curl -->
    <circle cx="560" cy="380" r="36" fill="${INK}" />
  `),

  /* ─── 08 · The Blob · Y2K liquid metal mascot ──────────────────────────
     Chrome gummy blob with eyes. Lava-lamp / iMac G3 / Bratz-aesthetic.
     Gradient chrome, two pixel eyes. Distinctly Y2K. */
  "08-blob": svg(`
    <defs>
      <linearGradient id="chrome2" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"  stop-color="${CHROME_HI}" />
        <stop offset="40%" stop-color="${TIK_CYAN}" />
        <stop offset="70%" stop-color="${HOT_PINK}" />
        <stop offset="100%" stop-color="${CHROME_LO}" />
      </linearGradient>
      <radialGradient id="hi2" cx="35%" cy="30%" r="35%">
        <stop offset="0%"  stop-color="${CREAM}" stop-opacity="0.95" />
        <stop offset="100%" stop-color="${CREAM}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="1024" height="1024" fill="${INK}" />
    <!-- Wobbly blob silhouette -->
    <path d="M 512 160
             C 720 160, 880 320, 864 520
             C 848 720, 700 856, 512 864
             C 320 872, 184 720, 168 520
             C 152 300, 304 160, 512 160 Z"
          fill="url(#chrome2)" />
    <!-- Specular highlight -->
    <ellipse cx="380" cy="320" rx="180" ry="100" fill="url(#hi2)" />
    <!-- Pixel eyes -->
    <rect x="380" y="500" width="48" height="48" fill="${INK}" />
    <rect x="596" y="500" width="48" height="48" fill="${INK}" />
    <!-- Eye highlights -->
    <rect x="392" y="508" width="14" height="14" fill="${CREAM}" />
    <rect x="608" y="508" width="14" height="14" fill="${CREAM}" />
    <!-- Tiny smirk -->
    <path d="M 460 660 q 52 24 104 0" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round" />
  `),

  /* ─── 09 · The Chromatic · TikTok aberration on the lowercase c ────────
     Three offset c-shapes in cyan/magenta/black. Reads as ONE c with
     chromatic aberration — the "I'm what's happening now" register. */
  "09-chromatic": svg(`
    <rect width="1024" height="1024" fill="${INK}" />
    <!-- Cyan c -->
    <path d="M 700 308
             a 220 220 0 1 0 0 408
             L 660 660
             a 160 160 0 1 1 0 -296 Z"
          transform="translate(-26 0)" fill="${TIK_CYAN}" />
    <!-- Magenta c -->
    <path d="M 700 308
             a 220 220 0 1 0 0 408
             L 660 660
             a 160 160 0 1 1 0 -296 Z"
          transform="translate(26 0)" fill="${TIK_MAGENTA}" mix-blend-mode="screen" />
    <!-- White c (foreground) -->
    <path d="M 700 308
             a 220 220 0 1 0 0 408
             L 660 660
             a 160 160 0 1 1 0 -296 Z"
          fill="${CREAM}" mix-blend-mode="screen" />
    <!-- The period — chromatic dot -->
    <circle cx="800" cy="700" r="46" fill="${HOT_PINK}" />
  `),

  /* ─── 10 · Dual Frame · BeReal homage ──────────────────────────────────
     Two stacked rounded rectangles — small one tucked into corner like a
     front-cam preview. One says broadcast, the other says whisper.
     Acid green ground, black frames. */
  "10-dualframe": svg(`
    <rect width="1024" height="1024" fill="${ACID_GREEN}" />
    <!-- Big back frame (broadcast) -->
    <rect x="160" y="200" width="704" height="624" rx="64" fill="${INK}" />
    <text x="512" y="540" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-weight="900" font-size="120" fill="${ACID_GREEN}" letter-spacing="-0.04em">EVERYONE</text>
    <!-- Small front frame (whisper) -->
    <rect x="180" y="220" width="288" height="232" rx="32" fill="${HOT_PINK}" stroke="${CREAM}" stroke-width="14" />
    <text x="324" y="356" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-style="italic" font-weight="700" font-size="56" fill="${CREAM}" letter-spacing="-0.02em">whisper.</text>
  `),

  /* ─── 11 · The Echo · concentric ripples in chromatic gradient ─────────
     Sound-wave / signal mark, but rendered in chromatic gradient. Beats
     Cycle 1 #06 (pulse) by feeling current instead of medical. */
  "11-echo": svg(`
    <defs>
      <linearGradient id="echoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"  stop-color="${TIK_MAGENTA}" />
        <stop offset="50%" stop-color="${HOT_PINK}" />
        <stop offset="100%" stop-color="${TIK_CYAN}" />
      </linearGradient>
    </defs>
    <rect width="1024" height="1024" fill="${INK}" />
    <!-- Outermost ring -->
    <circle cx="512" cy="512" r="380" fill="none" stroke="url(#echoGrad)" stroke-width="32" opacity="0.45" />
    <circle cx="512" cy="512" r="280" fill="none" stroke="url(#echoGrad)" stroke-width="40" opacity="0.65" />
    <circle cx="512" cy="512" r="180" fill="none" stroke="url(#echoGrad)" stroke-width="48" opacity="0.85" />
    <!-- Center dot -->
    <circle cx="512" cy="512" r="60" fill="${ACID_YELLOW}" />
  `),

  /* ─── 12 · The Pop · Y2K supermarket-sticker burst ─────────────────────
     A burst-shape (like a SALE sticker / Pop-Tarts wrapper) with c.
     centered. Tells you the brand is loud and current. Streetwear-merch
     register. Acid yellow burst on hot pink. */
  "12-pop": svg(`
    <rect width="1024" height="1024" fill="${HOT_PINK}" />
    <!-- 14-point starburst -->
    ${burst(14, 512, 512, 380, 280)}
    <!-- Inner circle ground -->
    <circle cx="512" cy="512" r="240" fill="${INK}" />
    <!-- 'c.' wordmark inside -->
    <text x="512" y="568" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="280" fill="${ACID_YELLOW}" letter-spacing="-0.04em">c<tspan fill="${HOT_PINK}">.</tspan></text>
  `),
};

function svg(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img">${inner}</svg>`;
}

function burst(points: number, cx: number, cy: number, outer: number, inner: number): string {
  const verts: string[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * step - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    verts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `<polygon points="${verts.join(" ")}" fill="${ACID_YELLOW}" />`;
}
