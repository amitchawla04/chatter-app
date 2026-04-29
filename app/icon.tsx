import { ImageResponse } from "next/og";

/**
 * Chatter favicon — 32×32 · The Bite (Cycle 1 lead concept).
 * Big red shape with a bite-notch on the upper-right + tiny black period below.
 * Apple-school provocation reduced to favicon scale.
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
          position: "relative",
        }}
      >
        {/* Big red disc */}
        <div
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderRadius: 22,
            background: "#FF2D2D",
            top: 4,
            left: 3,
          }}
        />
        {/* Bite (canvas-colored cutout) on the upper-right of the disc */}
        <div
          style={{
            position: "absolute",
            width: 10,
            height: 10,
            borderRadius: 10,
            background: "#FAF9F6",
            top: 2,
            left: 19,
          }}
        />
        {/* Tiny black period — punctuation residue */}
        <div
          style={{
            position: "absolute",
            width: 4,
            height: 4,
            borderRadius: 4,
            background: "#0A0A0A",
            bottom: 4,
            right: 4,
          }}
        />
      </div>
    ),
    size,
  );
}
