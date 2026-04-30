"use client";

/**
 * SearchBar with autocomplete (IP11).
 *  - 250ms debounced live suggestions (topics + people via Supabase)
 *  - Recent searches persisted in localStorage (last 6, swipe-clear)
 *  - Keyboard nav: ↓/↑ through suggestions, Enter to commit
 *  - Closes on outside click or Escape
 *
 * A11y: combobox + listbox per WAI-ARIA 1.2 authoring practices.
 */

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Suggestion =
  | { kind: "recent"; label: string }
  | { kind: "topic"; id: string; label: string; emoji: string | null }
  | { kind: "user"; handle: string; label: string };

const RECENTS_KEY = "chatter:recent-searches";
const RECENTS_MAX = 6;

function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string").slice(0, RECENTS_MAX) : [];
  } catch {
    return [];
  }
}

function writeRecents(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, RECENTS_MAX)));
  } catch {
    // localStorage full or blocked — not fatal
  }
}

export function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [recents, setRecents] = useState<string[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string; emoji: string | null }[]>([]);
  const [users, setUsers] = useState<{ handle: string; display_name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const [, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRecents(readRecents());
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = q.trim();
    if (term.length < 2) {
      setTopics([]);
      setUsers([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const safe = term.replace(/[,()'"]/g, "").slice(0, 50);
      const [topicRes, userRes] = await Promise.all([
        supabase.from("topics").select("id, name, emoji").ilike("name", `%${safe}%`).limit(5),
        supabase
          .from("users")
          .select("handle, display_name")
          .or(`handle.ilike.%${safe}%,display_name.ilike.%${safe}%`)
          .limit(5),
      ]);
      setTopics(((topicRes.data ?? []) as { id: string; name: string; emoji: string | null }[]));
      setUsers(((userRes.data ?? []) as { handle: string; display_name: string }[]));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo<Suggestion[]>(() => {
    const term = q.trim();
    if (term.length < 2) {
      return recents.map((r) => ({ kind: "recent" as const, label: r }));
    }
    const out: Suggestion[] = [];
    topics.forEach((t) => out.push({ kind: "topic", id: t.id, label: t.name, emoji: t.emoji }));
    users.forEach((u) => out.push({ kind: "user", handle: u.handle, label: u.display_name }));
    return out;
  }, [q, topics, users, recents]);

  const commit = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recents.filter((r) => r !== trimmed)].slice(0, RECENTS_MAX);
    setRecents(next);
    writeRecents(next);
    setOpen(false);
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIdx >= 0 && suggestions[activeIdx]) {
      const s = suggestions[activeIdx];
      if (s.kind === "topic") {
        setOpen(false);
        startTransition(() => router.push(`/t/${s.id}`));
        return;
      }
      if (s.kind === "user") {
        setOpen(false);
        startTransition(() => router.push(`/u/${s.handle}`));
        return;
      }
      commit(s.label);
      return;
    }
    commit(q);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const removeRecent = (label: string) => {
    const next = recents.filter((r) => r !== label);
    setRecents(next);
    writeRecents(next);
  };

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={submit}
        role="search"
        className="flex items-center gap-2 border border-line focus-within:border-red bg-paper transition-colors"
      >
        <Search size={16} strokeWidth={1.5} className="text-muted ml-3" aria-hidden="true" />
        <div role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-controls="search-suggestions" aria-owns="search-suggestions" className="flex-1">
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActiveIdx(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKey}
            placeholder="topic · person · whisper"
            aria-label="Search topics, people, or whispers"
            aria-autocomplete="list"
            autoFocus
            className="w-full bg-transparent text-ink placeholder-muted-soft py-2.5 outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!q.trim()}
          className="px-4 text-red text-sm font-medium disabled:opacity-30 transition-opacity"
        >
          go
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 mt-1 z-40 bg-paper border border-line shadow-sm max-h-72 overflow-y-auto"
        >
          {q.trim().length < 2 && recents.length > 0 && (
            <li className="px-3 py-2 mono-text text-[10px] uppercase tracking-wider text-muted border-b border-line/60" aria-hidden="true">
              recent
            </li>
          )}
          {suggestions.map((s, i) => {
            const isActive = i === activeIdx;
            const baseCls = `flex items-center gap-2.5 px-3 py-2.5 transition-colors text-sm w-full text-left ${
              isActive ? "bg-red/10 text-red" : "text-ink hover:bg-canvas"
            }`;
            if (s.kind === "recent") {
              const id = `sugg-recent-${i}`;
              return (
                <li key={id} className="flex items-stretch border-b border-line/40 last:border-b-0">
                  <button
                    id={id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commit(s.label);
                    }}
                    className={`flex-1 ${baseCls}`}
                  >
                    <Clock size={14} strokeWidth={1.5} className="text-muted shrink-0" aria-hidden="true" />
                    <span className="truncate">{s.label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      removeRecent(s.label);
                    }}
                    className="px-3 py-2.5 text-muted hover:text-warn shrink-0"
                    aria-label={`Forget search "${s.label}"`}
                  >
                    <X size={12} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </li>
              );
            }
            if (s.kind === "topic") {
              const id = `sugg-t-${s.id}`;
              return (
                <li key={id}>
                  <button
                    id={id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setOpen(false);
                      router.push(`/t/${s.id}`);
                    }}
                    className={baseCls}
                  >
                    <span className="text-base shrink-0" aria-hidden="true">{s.emoji ?? "·"}</span>
                    <span className="truncate">{s.label}</span>
                    <span className="ml-auto mono-text text-[10px] text-muted shrink-0">topic</span>
                  </button>
                </li>
              );
            }
            const id = `sugg-u-${s.handle}`;
            return (
              <li key={id}>
                <button
                  id={id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    router.push(`/u/${s.handle}`);
                  }}
                  className={baseCls}
                >
                  <div className="w-5 h-5 rounded-full bg-line flex items-center justify-center text-[10px] shrink-0" aria-hidden="true">
                    {s.label[0]?.toUpperCase() ?? "·"}
                  </div>
                  <span className="truncate">@{s.handle}</span>
                  <span className="ml-auto mono-text text-[10px] text-muted shrink-0">person</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
