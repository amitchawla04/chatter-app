import { ImageResponse } from "next/og";

/**
 * PWA icon — 512×512 · The Bite.
 * High-DPI installs, share-card thumbnails, and the App Store marketing icon source.
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
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: 350,
            background: "#FF2D2D",
            top: 70,
            left: 60,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: 160,
            background: "#FAF9F6",
            top: 40,
            left: 310,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 64,
            height: 64,
            borderRadius: 64,
            background: "#0A0A0A",
            bottom: 70,
            right: 70,
          }}
        />
      </div>
    ),
    size,
  );
}
