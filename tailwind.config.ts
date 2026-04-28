import type { Config } from "tailwindcss";

// Chatter brand tokens · v2 LIGHT ENTERTAINMENT REGISTER (locked 2026-04-25)
// Pivoted from dark "warm editorial" to light entertainment per founder
// direction + research: every entertainment-social app (IG/TikTok/Threads/
// BeReal/Pinterest/Partiful/Letterboxd/Substack) defaults to white/warm-white.
// Dark-mode defaults are for *consumption* apps (Netflix/Spotify), not posting.

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface palette — warm white, not cold
        canvas: "#FAF9F6",     // warm-white bg (Letterboxd/Substack register)
        paper: "#FFFFFF",      // pure-white for cards + sheets to lift off canvas
        ink: "#0A0A0A",        // near-black for text
        "ink-soft": "#1F1F1F", // secondary text strong
        muted: "#767676",      // tertiary text — readable on warm-white
        "muted-soft": "#A8A4A0", // quaternary / hints
        line: "#E8E4DC",       // warm hairline
        "line-soft": "#F0EDE6",// lighter hairline / dividers
        tint: "#F5F2EA",       // card-tint on canvas (feed bg variation)

        // Accent palette
        red: "#FF2D2D",        // PRIMARY — period, CTAs, LIVE states
        "red-soft": "#FFE8E8", // red bg tint
        blue: "#2D5BFF",       // scope / village / trust
        "blue-soft": "#E8EEFF",
        gold: "#C9A84C",       // CREDENTIAL only — insider tags, vouches
        "gold-soft": "#FAF3E0",
        green: "#3E8F3E",      // success
        warn: "#C35D2E",       // warn / error
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.02em",
        tighter: "-0.01em",
        label: "0.18em",
      },
      borderRadius: {
        none: "0",
        pill: "9999px",
      },
      animation: {
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fadeIn 0.8s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
