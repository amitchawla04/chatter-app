/**
 * Dynamic OG image for a whisper — renders the pull-quote on warm canvas
 * with handle, charter mark, and topic context.
 *
 * Used as og:image when /w/[id] is shared on iMessage/Slack/X.
 */
import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
export const revalidate = 60;

const SIZE = { width: 1200, height: 630 };

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const admin = createAdminClient();
  const { data } = await admin
    .from("whispers")
    .select(
      "content_text, modality, users:author_id(handle, is_charter, insider_tags), topics:topic_id(name, emoji)",
    )
    .eq("id", id)
    .maybeSingle();

  type Row = {
    content_text: string | null;
    modality: string;
    users: { handle: string; is_charter: boolean | null; insider_tags: string[] | null } | null;
    topics: { name: string; emoji: string | null } | null;
  };

  const row = data as unknown as Row | null;
  const handle = row?.users?.handle ?? "someone";
  const isCharter = Boolean(row?.users?.is_charter);
  const insiderTag = row?.users?.insider_tags?.[0]?.replace(/_/g, " ") ?? null;
  const topicName = row?.topics?.name ?? "chatter";
  const topicEmoji = row?.topics?.emoji ?? "🤫";
  const text =
    row?.content_text?.trim() ||
    (row?.modality === "voice"
      ? "[a voice whisper]"
      : row?.modality === "image"
        ? "[an image whisper]"
        : "[a whisper]");

  // Truncate quote to ~180 chars max for layout
  const quote = text.length > 180 ? text.slice(0, 177) + "..." : text;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FAF9F6",
          padding: "70px 80px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Top mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "30px",
            fontStyle: "italic",
            color: "#0A0A0A",
            letterSpacing: "-0.02em",
          }}
        >
          chatter<span style={{ color: "#FF2D2D", marginLeft: "1px" }}>.</span>
        </div>

        {/* Topic + handle context */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "40px",
            fontSize: "22px",
            color: "#767676",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          <span style={{ fontSize: "26px" }}>{topicEmoji}</span>
          <span style={{ color: "#0A0A0A" }}>{topicName}</span>
          <span>·</span>
          <span style={{ color: "#0A0A0A" }}>@{handle}</span>
          {isCharter && (
            <span
              style={{
                marginLeft: "4px",
                padding: "4px 12px",
                border: "1px solid #C9A84C",
                color: "#C9A84C",
                fontSize: "16px",
                fontStyle: "italic",
                fontFamily: "ui-monospace, monospace",
                display: "flex",
                alignItems: "center",
              }}
            >
              ✦ charter
            </span>
          )}
          {insiderTag && (
            <>
              <span>·</span>
              <span style={{ color: "#C9A84C", fontStyle: "italic" }}>{insiderTag}</span>
            </>
          )}
        </div>

        {/* The quote — Cormorant-style italic on warm canvas */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            paddingLeft: "30px",
            borderLeft: "3px solid #FF2D2D",
            marginTop: "44px",
          }}
        >
          <div
            style={{
              fontStyle: "italic",
              fontSize: quote.length > 120 ? "52px" : "64px",
              color: "#0A0A0A",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              fontFamily: "Georgia, serif",
            }}
          >
            “{quote}”
          </div>
        </div>

        {/* Footer tagline */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "48px",
            fontSize: "16px",
            color: "#767676",
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <span>whispers from people who actually know</span>
          <span style={{ color: "#FF2D2D" }}>chatter.today</span>
        </div>
      </div>
    ),
    SIZE,
  );
}
