"use client";

/**
 * PassChainTree — CN24, novel "who passed → who passed → who echoed" graph.
 *
 * Pact-aligned: shows scope-controlled distribution as a felt artifact, not
 * a popularity score. Each node is a person; each edge is a single pass; an
 * echo terminates a branch with a small red disc — the brand period as a
 * "stop, this resonated" mark.
 *
 * Visual: vertical, indented tree. Author at root in gold (charter) or ink.
 * Children fan out. Edges are 1-px hairlines that bend right at the corner.
 * No D3 — pure SVG/CSS. Responsive to depth (truncates beyond 4 visible levels).
 */

import { useState } from "react";
import Link from "next/link";
import { CharterBadge } from "./CharterBadge";

interface ChainEdge {
  pass_id: string;
  from_user_id: string;
  from_handle: string;
  from_is_charter: boolean | null;
  to_user_id: string;
  to_handle: string;
  to_is_charter: boolean | null;
  to_echoed: boolean;
  depth: number;
  created_at: string;
}

interface RootAuthor {
  id: string;
  handle: string;
  is_charter: boolean | null;
  echoed_directly: boolean; // direct echoers (no pass) — surfaced as terminal
  direct_echo_count: number;
}

interface Props {
  rootAuthor: RootAuthor;
  edges: ChainEdge[];
  /** People who echoed directly without a pass → terminal flowers off the root. */
  directEchoers: { id: string; handle: string; is_charter: boolean | null }[];
}

interface TreeNode {
  user_id: string;
  handle: string;
  is_charter: boolean | null;
  echoed: boolean;
  passed_at: string | null;
  children: TreeNode[];
}

function buildTree(rootAuthor: RootAuthor, edges: ChainEdge[]): TreeNode {
  const root: TreeNode = {
    user_id: rootAuthor.id,
    handle: rootAuthor.handle,
    is_charter: rootAuthor.is_charter,
    echoed: false, // author trivially "agrees" — don't double-count
    passed_at: null,
    children: [],
  };
  const byUser: Map<string, TreeNode> = new Map();
  byUser.set(root.user_id, root);

  // Sort by depth so parents are inserted before children
  const sorted = [...edges].sort((a, b) => a.depth - b.depth || a.created_at.localeCompare(b.created_at));
  for (const e of sorted) {
    const parent = byUser.get(e.from_user_id) ?? root;
    let node = byUser.get(e.to_user_id);
    if (!node) {
      node = {
        user_id: e.to_user_id,
        handle: e.to_handle,
        is_charter: e.to_is_charter,
        echoed: e.to_echoed,
        passed_at: e.created_at,
        children: [],
      };
      byUser.set(e.to_user_id, node);
      parent.children.push(node);
    } else {
      // already inserted via a different parent — keep first attachment
      node.echoed = node.echoed || e.to_echoed;
    }
  }
  return root;
}

function relTime(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

export function PassChainTree({ rootAuthor, edges, directEchoers }: Props) {
  const [expanded, setExpanded] = useState(true);
  const tree = buildTree(rootAuthor, edges);

  const totalPasses = edges.length;
  const totalEchoes = rootAuthor.direct_echo_count + edges.filter((e) => e.to_echoed).length;
  const reach = new Set<string>([rootAuthor.id]);
  edges.forEach((e) => {
    reach.add(e.from_user_id);
    reach.add(e.to_user_id);
  });
  directEchoers.forEach((u) => reach.add(u.id));

  if (totalPasses === 0 && directEchoers.length === 0) {
    return (
      <section className="px-5 py-6 border-t border-line text-center bg-paper">
        <p className="display-italic text-base text-muted italic">
          No passes yet. This whisper hasn&apos;t travelled.
        </p>
      </section>
    );
  }

  return (
    <section className="border-t border-line bg-paper">
      <div className="px-5 py-4 border-b border-line/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="label-text text-red mb-1">pass chain</p>
            <p className="mono-text text-[11px] text-muted">
              <span className="text-ink font-medium">{reach.size - 1}</span> people · {" "}
              <span className="text-ink font-medium">{totalPasses}</span> pass{totalPasses === 1 ? "" : "es"} · {" "}
              <span className="text-ink font-medium">{totalEchoes}</span> echo{totalEchoes === 1 ? "" : "es"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mono-text text-[10px] uppercase tracking-wider text-muted hover:text-ink"
          >
            {expanded ? "collapse" : "expand"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 py-5 max-h-[60vh] overflow-y-auto">
          <NodeRow node={tree} isRoot />
          {tree.children.map((c) => (
            <Branch key={c.user_id} node={c} depth={1} />
          ))}

          {directEchoers.length > 0 && (
            <div className="mt-5 pt-4 border-t border-line/40">
              <p className="mono-text text-[10px] uppercase tracking-wider text-muted mb-2">
                + direct echoes (no pass) · {directEchoers.length}
              </p>
              <div className="flex flex-wrap gap-2">
                {directEchoers.map((u) => (
                  <Link
                    key={u.id}
                    href={`/u/${u.handle}`}
                    className="inline-flex items-center gap-1.5 mono-text text-[11px] text-ink border border-line bg-canvas px-2 py-1 hover:border-red transition no-underline-link"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-red"
                      aria-hidden="true"
                    />
                    @{u.handle}
                    {u.is_charter && <CharterBadge size="sm" />}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Branch({ node, depth }: { node: TreeNode; depth: number }) {
  const indent = Math.min(depth, 4) * 24;
  return (
    <div className="relative" style={{ paddingLeft: `${indent}px` }}>
      <span
        className="absolute left-0 top-3 h-px w-4 bg-line"
        style={{ left: `${indent - 16}px` }}
        aria-hidden="true"
      />
      <span
        className="absolute top-0 bottom-0 w-px bg-line/60"
        style={{ left: `${indent - 16}px` }}
        aria-hidden="true"
      />
      <NodeRow node={node} />
      {node.children.map((c) => (
        <Branch key={c.user_id} node={c} depth={depth + 1} />
      ))}
    </div>
  );
}

function NodeRow({ node, isRoot = false }: { node: TreeNode; isRoot?: boolean }) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
          node.is_charter
            ? "bg-gold text-canvas"
            : node.echoed
              ? "bg-red text-canvas"
              : "bg-line text-ink"
        }`}
        aria-hidden="true"
      >
        {node.handle[0]?.toUpperCase() ?? "·"}
      </div>
      <Link
        href={`/u/${node.handle}`}
        className="text-sm text-ink hover:text-red transition-colors no-underline-link"
      >
        @{node.handle}
      </Link>
      {node.is_charter && <CharterBadge size="sm" />}
      {isRoot ? (
        <span className="mono-text text-[9px] uppercase tracking-wider text-gold ml-1">
          author
        </span>
      ) : (
        <span className="mono-text text-[10px] text-muted ml-1">
          {relTime(node.passed_at)}
        </span>
      )}
      {node.echoed && (
        <span
          className="ml-auto inline-flex items-center gap-1 mono-text text-[9px] uppercase tracking-wider text-red"
          title="echoed this whisper"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red" aria-hidden="true" />
          echo
        </span>
      )}
    </div>
  );
}
