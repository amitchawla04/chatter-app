import { ImageResponse } from "next/og";

/**
 * Chatter PWA icon — 192×192 for Android home-screen installs and Web Share.
 * "any maskable" → padded so Android adaptive-icon mask doesn't clip the wordmark.
 */
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon192() {
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
          fontSize: 110,
          letterSpacing: "-0.04em",
          // 18% padding for Android adaptive-icon safe area
          padding: "16%",
          boxSizing: "border-box",
        }}
      >
        c<span style={{ color: "#FF2D2D" }}>.</span>
      </div>
    ),
    size,
  );
}
