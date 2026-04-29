import { ImageResponse } from "next/og";

/**
 * Chatter PWA icon — 512×512 for high-DPI installs, share-card thumbnails,
 * and the App Store marketing icon source. "any maskable" with 18% padding.
 */
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon512() {
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
          fontSize: 290,
          letterSpacing: "-0.04em",
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
