/**
 * Per-topic accent tinting — Material You-inspired but emoji-derived.
 * Maps a topic emoji to a hue that subtly tints the topic page hero.
 *
 * The tint stays muted (5-8% opacity for backgrounds, never strong)
 * so the topic feels personalised without breaking the warm-white aesthetic.
 */

const HUE_MAP: Record<string, number> = {
  // Sports
  "⚽": 220, // football blue
  "🏆": 45,  // trophy gold
  "🔴": 0,   // red team (Arsenal etc)
  "🔵": 220, // blue team
  "🟣": 280, // purple team (Aston Villa)
  "🦅": 30,  // crystal palace
  "🐝": 50,  // brentford
  "⚡": 50,  // breakout players (lightning)
  // Country flags — use blue-ish neutral
  "🇦🇷": 200, "🇧🇷": 130, "🇫🇷": 220, "🇪🇸": 15, "🇩🇪": 50,
  "🇬🇧": 220, "🇺🇸": 220, "🇮🇳": 30, "🇲🇽": 130, "🇨🇦": 0,
  "🇦🇺": 220, "🇦🇹": 0, "🇧🇪": 50, "🇨🇲": 130, "🇨🇴": 50,
  "🇨🇷": 220, "🇭🇷": 0, "🇩🇿": 130,
  // Shows
  "🎬": 280, // film purple
  "🐻": 25,  // The Bear orange
  "🔪": 160, // Severance teal
  "🏝️": 180, // White Lotus tropical
  // Music
  "🩶": 320, // Taylor Swift soft pink
  "🎤": 280, // Kendrick mic purple
  "🌃": 230, // The Weeknd night blue
  "🖤": 0,   // Billie Eilish dark
  // Tech
  "🍎": 0,   // Apple red
  "🎭": 280, // Anthropic theatre purple
  "✳️": 130, // OpenAI green
  "💚": 130, // Nvidia green
  "🎨": 320, // Figma pink
  "🌀": 230, // Arc browser blue
  // Gaming
  "⚔️": 0,   // Elden Ring red
  "🎯": 220, // Valorant blue
  // Places
  "🗽": 130, // NYC liberty green
  "🎡": 220, // London ferris blue
  "🌳": 130, // Bengaluru green
  // Culture
  "🏃": 25,  // running orange
  "☕": 25,  // coffee brown-orange
  // Business
  "📈": 130, // Berkshire green
  "📰": 0,   // Lenny's red (newsletter)
};

/**
 * Returns CSS variables to apply a subtle topic tint to a hero element.
 * Background uses HSL so we control saturation + lightness for warmth.
 *
 * Default (no emoji match) returns Chatter red (#FF2D2D hue 0).
 */
export function topicTint(emoji: string | null | undefined): {
  bgStyle: React.CSSProperties;
  accentHex: string;
} {
  const hue = (emoji && HUE_MAP[emoji]) ?? 0;

  return {
    bgStyle: {
      backgroundColor: `hsl(${hue}, 60%, 96%)`,
      borderColor: `hsl(${hue}, 50%, 88%)`,
    },
    accentHex: `hsl(${hue}, 65%, 50%)`,
  };
}
