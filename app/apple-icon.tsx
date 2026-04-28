import { ImageResponse } from "next/og";

/**
 * Apple touch icon — 180×180 warm-white + wordmark + red period.
 * Shows up on iOS home screen after Add to Home.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          fontSize: 96,
          letterSpacing: "-0.03em",
        }}
      >
        c<span style={{ color: "#FF2D2D" }}>.</span>
      </div>
    ),
    size,
  );
}
