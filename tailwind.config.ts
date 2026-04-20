import type { Config } from "tailwindcss";

// Chatter brand tokens — locked from Design Brief v1
// These match what Claude Design generates from the Section 1 prompt
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // primary palette
        ink: "#0a0a0a",
        cream: "#f5f1e8",
        gold: "#c9a84c",
        muted: "#6b6b6b",
        line: "#2a2724",
        whisper: "#1a1a1a",
        // state colors (used sparingly)
        success: "#7fb069",
        warn: "#d98841",
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
