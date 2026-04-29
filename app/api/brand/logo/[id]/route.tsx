import { ImageResponse } from "next/og";

export const runtime = "edge";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

const SIZE = 1024;
const INK = "#0A0A0A";
const CANVAS = "#FAF9F6";
const RED = "#FF2D2D";
const GOLD = "#C8A24E";

export async function GET(_req: Request, { params }: RouteCtx) {
  const { id } = await params;

  switch (id) {
    case "01-wordmark-classic":
      return wordmarkClassic();
    case "02-wordmark-inverted":
      return wordmarkInverted();
    case "03-stamp":
      return stamp();
    case "04-whisper-mark":
      return whisperMark();
    case "05-combo":
      return combo();
    default:
      return new Response("not found", { status: 404 });
  }
}

function wordmarkClassic() {
  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          background: CANVAS,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            color: INK,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 280,
            letterSpacing: "-0.04em",
          }}
        >
          chatter<span style={{ color: RED }}>.</span>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}

function wordmarkInverted() {
  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          background: INK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            color: CANVAS,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 280,
            letterSpacing: "-0.04em",
          }}
        >
          chatter<span style={{ color: RED }}>.</span>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}

function stamp() {
  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          background: CANVAS,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 720,
            height: 720,
            borderRadius: 720,
            border: `12px solid ${GOLD}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Georgia, serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              color: INK,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 460,
              letterSpacing: "-0.05em",
            }}
          >
            c<span style={{ color: RED }}>.</span>
          </div>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}

function whisperMark() {
  // Speech curve: an open arc with the red period as the "mouth" at the end of the arc.
  // SVG-style rendered via flex + clip-path proxy (Satori has limited SVG, so we draw with shapes).
  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          background: CANVAS,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* curve approximated as a thick ring with a wedge cut — using two stacked rings */}
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 620,
            borderRadius: 620,
            border: `40px solid ${INK}`,
            borderRightColor: "transparent",
            borderBottomColor: "transparent",
            transform: "rotate(45deg)",
          }}
        />
        {/* red period — the mouth */}
        <div
          style={{
            position: "absolute",
            width: 96,
            height: 96,
            borderRadius: 96,
            background: RED,
            top: 540,
            left: 720,
          }}
        />
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}

function combo() {
  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          background: CANVAS,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          gap: 60,
        }}
      >
        {/* stamp */}
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 360,
            border: `8px solid ${GOLD}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Georgia, serif",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              color: INK,
              fontStyle: "italic",
              fontWeight: 600,
              fontSize: 230,
              letterSpacing: "-0.05em",
            }}
          >
            c<span style={{ color: RED }}>.</span>
          </div>
        </div>
        {/* wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            color: INK,
            fontStyle: "italic",
            fontWeight: 600,
            fontSize: 230,
            letterSpacing: "-0.04em",
            fontFamily: "Georgia, serif",
          }}
        >
          chatter<span style={{ color: RED }}>.</span>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE },
  );
}
