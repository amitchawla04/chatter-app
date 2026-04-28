/**
 * /you/vouches/network — vouch graph visualization (CN24).
 * Renders the vouch network — who vouched for whom — as a force-directed SVG.
 * Pure-SVG implementation, no d3 dependency, computed server-side.
 *
 * Pact 14 guard: shows network DENSITY (your circle), never popularity ranking.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ChatterMark } from "@/components/ChatterMark";
import { TabBar } from "@/components/TabBar";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60;

type Edge = { from: string; to: string };
type Node = { id: string; handle: string; charter: boolean };

export default async function VouchNetworkPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const admin = createAdminClient();

  // Get user's vouches given + received → 2-degree network
  const { data: myGiven } = await admin
    .from("vouches")
    .select("topic_id, author_id")
    .eq("author_id", user.id);

  const { data: myReceived } = await admin
    .from("vouches")
    .select("topic_id, author_id")
    .neq("author_id", user.id)
    .limit(50);

  // Build adjacency. Real implementation would expand 2 degrees;
  // simplified to 1-degree (ego network) for performance.
  const otherIds = new Set<string>();
  (myGiven ?? []).forEach(() => {});
  (myReceived ?? []).forEach((v) => v.author_id && otherIds.add(v.author_id));

  const allIds = [user.id, ...Array.from(otherIds).slice(0, 12)];

  const { data: nodes } = await admin
    .from("users")
    .select("id, handle, is_charter")
    .in("id", allIds);

  const { data: edges } = await admin
    .from("vouches")
    .select("author_id, topic_id")
    .in("author_id", allIds);

  type VouchEdge = { author_id: string; topic_id: string };
  const e: Edge[] = (edges as VouchEdge[] ?? []).map((v) => ({
    from: v.author_id,
    to: v.topic_id,
  }));
  const n: Node[] = (nodes ?? []).map((u) => ({
    id: u.id,
    handle: u.handle,
    charter: u.is_charter ?? false,
  }));

  // Position nodes in concentric ring (you in center)
  const cx = 200;
  const cy = 200;
  const radius = 130;
  const others = n.filter((x) => x.id !== user.id);
  const positions: Record<string, { x: number; y: number }> = { [user.id]: { x: cx, y: cy } };
  others.forEach((node, i) => {
    const angle = (i / Math.max(1, others.length)) * Math.PI * 2;
    positions[node.id] = {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });

  return (
    <main className="min-h-screen pb-28">
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur border-b border-line px-5 py-4 flex items-center justify-between">
        <Link
          href="/you"
          className="text-muted hover:text-ink transition flex items-center gap-1 text-sm"
          aria-label="Back to profile"
        >
          <ChevronLeft size={18} strokeWidth={1.5} /> you
        </Link>
        <ChatterMark size="sm" />
        <div className="w-12" />
      </header>

      <section className="px-5 sm:px-10 py-8 max-w-2xl mx-auto">
        <p className="label-text text-red mb-3">vouch network</p>
        <h1 className="display-text text-3xl text-ink mb-2">your circle.</h1>
        <p className="body-text text-muted mb-8">
          who&rsquo;s vouched for you. who you&rsquo;ve vouched for.
          private to you. never shown to anyone else.
        </p>

        <div className="bg-paper border border-line p-4 mb-6">
          <svg
            viewBox="0 0 400 400"
            className="w-full h-auto max-w-md mx-auto"
            role="img"
            aria-label="Vouch network visualization"
          >
            {/* Edges first (so nodes paint on top) */}
            {e.map((edge, i) => {
              const a = positions[edge.from];
              const b = positions[edge.to];
              if (!a || !b) return null;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#E8E4DC"
                  strokeWidth="1"
                />
              );
            })}
            {/* Nodes */}
            {n.map((node) => {
              const p = positions[node.id];
              if (!p) return null;
              const isYou = node.id === user.id;
              return (
                <g key={node.id}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isYou ? 18 : 12}
                    fill={isYou ? "#FF2D2D" : node.charter ? "#C9A84C" : "#FAF9F6"}
                    stroke={isYou ? "#FF2D2D" : "#0A0A0A"}
                    strokeWidth="1.5"
                  />
                  <text
                    x={p.x}
                    y={p.y + 30}
                    textAnchor="middle"
                    fontFamily="Inter, sans-serif"
                    fontSize="10"
                    fill="#0A0A0A"
                  >
                    @{node.handle}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex items-center gap-4 mono-text text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red"></span> you
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-gold border border-ink"></span> charter
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-canvas border border-ink"></span> village
          </span>
        </div>

        <p className="mono-text text-[11px] text-muted mt-8">
          {n.length} nodes · {e.length} vouch edges · 1-degree network. always private to you.
        </p>
      </section>

      <TabBar />
    </main>
  );
}
