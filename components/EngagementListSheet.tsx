"use client";

/**
 * EngagementListSheet — bottom sheet listing who echoed or passed a whisper.
 *
 * Pact-compliant: only renders rows the requester has permission to see
 * (echoes are visible to the whisper author + people in the same village).
 * RLS handles enforcement; client just displays whatever comes back.
 *
 * Triggered from the whisper-detail meta row "show who echoed →" / "show who passed →".
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { CharterBadge } from "./CharterBadge";
import { createClient } from "@/lib/supabase/client";

type Mode = "echoes" | "passes";

interface Person {
  id: string;
  handle: string;
  display_name: string;
  insider_tags: string[] | null;
  is_charter: boolean | null;
  at: string;
}

export function EngagementListSheet({
  whisperId,
  mode,
  onClose,
}: {
  whisperId: string;
  mode: Mode;
  onClose: () => void;
}) {
  const [rows, setRows] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const supabase = createClient();
      if (mode === "echoes") {
        const { data } = await supabase
          .from("echoes")
          .select(
            "created_at, users:user_id ( id, handle, display_name, insider_tags, is_charter )",
          )
          .eq("whisper_id", whisperId)
          .order("created_at", { ascending: false })
          .limit(50);
        if (cancelled) return;
        const list: Person[] = ((data ?? []) as unknown as {
          created_at: string;
          users: {
            id: string;
            handle: string;
            display_name: string;
            insider_tags: string[] | null;
            is_charter: boolean | null;
          };
        }[])
          .filter((row) => row.users)
          .map((row) => ({
            id: row.users.id,
            handle: row.users.handle,
            display_name: row.users.display_name,
            insider_tags: row.users.insider_tags,
            is_charter: row.users.is_charter,
            at: row.created_at,
          }));
        setRows(list);
      } else {
        const { data } = await supabase
          .from("passes")
          .select(
            "created_at, from_user:from_user_id ( id, handle, display_name, insider_tags, is_charter )",
          )
          .eq("whisper_id", whisperId)
          .order("created_at", { ascending: false })
          .limit(50);
        if (cancelled) return;
        const list: Person[] = ((data ?? []) as unknown as {
          created_at: string;
          from_user: {
            id: string;
            handle: string;
            display_name: string;
            insider_tags: string[] | null;
            is_charter: boolean | null;
          };
        }[])
          .filter((row) => row.from_user)
          .map((row) => ({
            id: row.from_user.id,
            handle: row.from_user.handle,
            display_name: row.from_user.display_name,
            insider_tags: row.from_user.insider_tags,
            is_charter: row.from_user.is_charter,
            at: row.created_at,
          }));
        setRows(list);
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [whisperId, mode]);

  const title = mode === "echoes" ? "echoed by" : "passed by";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="engagement-sheet-title"
      className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-canvas border-t border-line sm:border sm:border-line shadow-2xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="engagement-sheet-title" className="display-italic text-xl text-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {loading ? (
          <p className="mono-text text-xs text-muted py-6 text-center">loading…</p>
        ) : rows.length === 0 ? (
          <p className="mono-text text-xs text-muted py-8 text-center">
            {mode === "echoes" ? "no echoes yet." : "no passes yet."}
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
            {rows.map((r, i) => (
              <li key={`${r.id}-${i}`}>
                <Link
                  href={`/u/${r.handle}`}
                  onClick={onClose}
                  className="flex items-center gap-3 py-3 border-b border-line/50 hover:bg-paper transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-line flex items-center justify-center text-sm text-ink shrink-0">
                    {r.display_name?.[0]?.toUpperCase() ?? "·"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-ink truncate">@{r.handle}</span>
                      {r.is_charter && <CharterBadge size="sm" />}
                    </div>
                    {r.insider_tags && r.insider_tags.length > 0 && (
                      <div className="mono-text text-[10px] text-gold italic truncate">
                        {r.insider_tags[0].replace(/_/g, " ")}
                      </div>
                    )}
                  </div>
                  <span className="mono-text text-[10px] text-muted shrink-0">
                    {relTime(r.at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}
