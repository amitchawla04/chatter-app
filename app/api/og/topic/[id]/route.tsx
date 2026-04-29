/**
 * Dynamic OG image for a topic — emoji, name, tuned-in count.
 */
import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
export const revalidate = 600;

const SIZE = { width: 1200, height: 630 };

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const admin = createAdminClient();
  const [{ data: topic }, { count: whisperCount }] = await Promise.all([
    admin
      .from("topics")
      .select("name, emoji, type, description, tuned_in_count")
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("whispers")
      .select("id", { count: "exact", head: true })
      .eq("topic_id", id)
      .eq("is_hidden", false)
      .is("deleted_at", null),
  ]);

  type Topic = {
    name: string;
    emoji: string | null;
    type: string;
    description: string | null;
    tuned_in_count: number | null;
  };

  const t = (topic as Topic | null) ?? {
    name: "topic",
    emoji: "·",
    type: "other",
    description: null,
    tuned_in_count: 0,
  };

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
            fontSize: "26px",
            fontStyle: "italic",
            color: "#0A0A0A",
            letterSpacing: "-0.02em",
          }}
        >
          chatter<span style={{ color: "#FF2D2D" }}>.</span>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div style={{ fontSize: "180px", lineHeight: 1, display: "flex" }}>
            {t.emoji ?? "·"}
          </div>
          <div
            style={{
              fontSize: "100px",
              fontStyle: "italic",
              fontWeight: 500,
              color: "#0A0A0A",
              marginTop: "30px",
              letterSpacing: "-0.025em",
              display: "flex",
            }}
          >
            {t.name}
          </div>
          {t.description && (
            <div
              style={{
                fontSize: "28px",
                color: "#767676",
                marginTop: "18px",
                maxWidth: "950px",
                display: "flex",
              }}
            >
              {t.description.length > 100
                ? t.description.slice(0, 97) + "..."
                : t.description}
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
          <span>
            {t.tuned_in_count ?? 0} tuned in · {whisperCount ?? 0} whispers
          </span>
          <span style={{ color: "#FF2D2D" }}>chatter.today</span>
        </div>
      </div>
    ),
    SIZE,
  );
}
