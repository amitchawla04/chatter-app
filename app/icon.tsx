import { ImageResponse } from "next/og";

/**
 * Chatter favicon — warm-white background, ink wordmark initial, red period.
 * Light-mode entertainment register per 2026-04-25 reset.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FAF9F6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#0A0A0A",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontWeight: 600,
          fontSize: 22,
          letterSpacing: "-0.02em",
        }}
      >
        c<span style={{ color: "#FF2D2D" }}>.</span>
      </div>
    ),
    size,
  );
}
