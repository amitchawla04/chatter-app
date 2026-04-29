import { ImageResponse } from "next/og";

/**
 * Default Open Graph + Twitter card image — 1200×630.
 * The Bite mark + hero quote + Pact pills + URL strip.
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
          padding: "60px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Left: The Bite mark + wordmark stacked */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 280,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 220,
              height: 220,
              display: "flex",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 168,
                height: 168,
                borderRadius: 168,
                background: "#FF2D2D",
                top: 26,
                left: 8,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                borderRadius: 80,
                background: "#FAF9F6",
                top: 10,
                left: 134,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 32,
                height: 32,
                borderRadius: 32,
                background: "#0A0A0A",
                bottom: 10,
                right: 10,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              color: "#0A0A0A",
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 56,
              letterSpacing: "-0.03em",
            }}
          >
            chatter<span style={{ color: "#FF2D2D" }}>.</span>
          </div>
        </div>

        {/* Right: hero quote + pact pills + URL */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 60,
            borderLeft: "1px solid #E8E4DC",
            marginLeft: 40,
          }}
        >
          <div
            style={{
              color: "#0A0A0A",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 64,
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>whispers from people</span>
            <span>who actually know.</span>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
            {["no ads ever", "no public counts", "your data stays yours", "ai is opt-in"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #0A0A0A",
                  color: "#0A0A0A",
                  fontStyle: "italic",
                  fontSize: 18,
                  padding: "6px 14px",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#FF2D2D",
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 20,
              letterSpacing: "0.02em",
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 4, background: "#FF2D2D" }} />
            chatter.today
          </div>
        </div>
      </div>
    ),
    size,
  );
}
