import { ImageResponse } from "next/og";

/**
 * Apple touch icon — 180×180 · The Bite.
 * Shows on iOS home screen after Add to Home.
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
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 124,
            height: 124,
            borderRadius: 124,
            background: "#FF2D2D",
            top: 22,
            left: 18,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 56,
            height: 56,
            borderRadius: 56,
            background: "#FAF9F6",
            top: 12,
            left: 108,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderRadius: 22,
            background: "#0A0A0A",
            bottom: 26,
            right: 26,
          }}
        />
      </div>
    ),
    size,
  );
}
