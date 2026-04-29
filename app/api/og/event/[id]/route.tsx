/**
 * Dynamic OG image for a live event — score for matches, title for premieres.
 */
import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
export const revalidate = 30;

const SIZE = { width: 1200, height: 630 };

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const admin = createAdminClient();
  const { data } = await admin
    .from("live_events")
    .select(
      "title, subtitle, status, kind, home_label, away_label, home_score, away_score, minute_label",
    )
    .eq("id", id)
    .maybeSingle();

  type Event = {
    title: string;
    subtitle: string | null;
    status: "scheduled" | "live" | "finished";
    kind: string;
    home_label: string | null;
    away_label: string | null;
    home_score: number | null;
    away_score: number | null;
    minute_label: string | null;
  };

  const e = (data as Event | null) ?? {
    title: "event",
    subtitle: null,
    status: "scheduled" as const,
    kind: "match",
    home_label: null,
    away_label: null,
    home_score: null,
    away_score: null,
    minute_label: null,
  };

  const isLive = e.status === "live";
  const isMatch = e.kind === "match";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FAF9F6",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "26px",
              fontStyle: "italic",
              color: "#0A0A0A",
              letterSpacing: "-0.02em",
            }}
          >
            chatter<span style={{ color: "#FF2D2D" }}>.</span>
          </div>
          {isLive && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 18px",
                border: "2px solid #FF2D2D",
                color: "#FF2D2D",
                fontFamily: "ui-monospace, monospace",
                fontSize: "20px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: "#FF2D2D",
                  display: "block",
                }}
              />
              live
            </div>
          )}
        </div>

        {e.subtitle && (
          <div
            style={{
              display: "flex",
              fontSize: "26px",
              color: "#767676",
              fontFamily: "ui-monospace, monospace",
              marginTop: "30px",
            }}
          >
            {e.subtitle}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          {isMatch && e.home_label && e.away_label ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "60px",
                  fontSize: "60px",
                  fontStyle: "italic",
                  color: "#0A0A0A",
                  letterSpacing: "-0.02em",
                }}
              >
                <span>{e.home_label}</span>
                <span style={{ color: "#FF2D2D", fontFamily: "ui-monospace, monospace", fontSize: "120px", fontStyle: "normal", fontWeight: 600 }}>
                  {e.home_score ?? "—"}
                </span>
                <span style={{ color: "#A8A4A0" }}>·</span>
                <span style={{ color: "#FF2D2D", fontFamily: "ui-monospace, monospace", fontSize: "120px", fontStyle: "normal", fontWeight: 600 }}>
                  {e.away_score ?? "—"}
                </span>
                <span>{e.away_label}</span>
              </div>
              {e.minute_label && (
                <div
                  style={{
                    display: "flex",
                    fontSize: "32px",
                    color: "#FF2D2D",
                    fontFamily: "ui-monospace, monospace",
                    marginTop: "30px",
                  }}
                >
                  {e.minute_label}
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                display: "flex",
                fontSize: "84px",
                fontStyle: "italic",
                color: "#0A0A0A",
                letterSpacing: "-0.02em",
                textAlign: "center",
                maxWidth: "1000px",
              }}
            >
              {e.title}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "16px",
            color: "#767676",
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>live whispers from people who actually know</span>
          <span style={{ color: "#FF2D2D" }}>chatter-ten-lemon.vercel.app</span>
        </div>
      </div>
    ),
    SIZE,
  );
}
