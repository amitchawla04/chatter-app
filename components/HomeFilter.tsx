"use client";

/**
 * Home feed filter — "All chatter" vs "🤫 Whispers only".
 * Client component because router replaces query-params on click.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function HomeFilter({ current }: { current: "all" | "whispers" }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const setFilter = (f: "all" | "whispers") => {
    startTransition(() => {
      router.replace(f === "all" ? "/home" : "/home?filter=whispers");
    });
  };

  return (
    <div className="inline-flex items-center gap-1 p-1 border border-line rounded-pill">
      <button
        type="button"
        onClick={() => setFilter("all")}
        className={`px-4 py-1.5 text-sm rounded-pill transition-colors ${
          current === "all" ? "bg-red text-paper" : "text-ink/70"
        }`}
      >
        All chatter
      </button>
      <button
        type="button"
        onClick={() => setFilter("whispers")}
        className={`px-4 py-1.5 text-sm rounded-pill transition-colors ${
          current === "whispers" ? "bg-red text-paper" : "text-ink/70"
        }`}
      >
        🤫 Whispers
      </button>
    </div>
  );
}
