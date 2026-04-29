import { ImageResponse } from "next/og";

/**
 * PWA icon — 192×192 · The Bite.
 * Maskable: 16% safe-area padding so Android adaptive-icon mask doesn't clip.
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
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 130,
            height: 130,
            borderRadius: 130,
            background: "#FF2D2D",
            top: 28,
            left: 22,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 60,
            height: 60,
            borderRadius: 60,
            background: "#FAF9F6",
            top: 16,
            left: 116,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 24,
            height: 24,
            borderRadius: 24,
            background: "#0A0A0A",
            bottom: 28,
            right: 28,
          }}
        />
      </div>
    ),
    size,
  );
}
