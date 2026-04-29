import { ImageResponse } from "next/og";

/**
 * Default Open Graph + Twitter card image — 1200×630.
 * Used when a page doesn't override metadata.openGraph.images.
 * Visual register: warm canvas, italic display, breathing red period, pact pills.
 */
export const alt = "Chatter — whispers from people who actually know";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF9F6",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            color: "#0A0A0A",
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 64,
            letterSpacing: "-0.03em",
          }}
        >
          chatter
          <span style={{ color: "#FF2D2D" }}>.</span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Hero quote */}
        <div
          style={{
            color: "#0A0A0A",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 76,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>whispers from people</span>
          <span>who actually know.</span>
        </div>

        {/* Spacer */}
        <div style={{ height: 40 }} />

        {/* Pact pills */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            "no ads ever",
            "no public counts",
            "your data stays yours",
            "ai is opt-in",
          ].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #0A0A0A",
                color: "#0A0A0A",
                fontStyle: "italic",
                fontSize: 22,
                padding: "8px 18px",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL strip */}
        <div
          style={{
            marginTop: 36,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#FF2D2D",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 22,
            letterSpacing: "0.02em",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: "#FF2D2D",
            }}
          />
          chatter.today
        </div>
      </div>
    ),
    size,
  );
}
