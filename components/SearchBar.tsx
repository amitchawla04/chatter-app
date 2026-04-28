"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    });
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 border border-line focus-within:border-red bg-paper transition-colors"
    >
      <Search size={16} strokeWidth={1.5} className="text-muted ml-3" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="topic · person · whisper"
        autoFocus
        className="flex-1 bg-transparent text-ink placeholder-muted-soft py-2.5 outline-none text-sm"
      />
      <button
        type="submit"
        disabled={!q.trim()}
        className="px-4 text-red text-sm font-medium disabled:opacity-30 transition-opacity"
      >
        go
      </button>
    </form>
  );
}
