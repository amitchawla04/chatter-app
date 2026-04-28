"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { postToThread } from "@/lib/thread-actions";

export function ThreadComposer({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await postToThread({ threadId, content: text.trim() });
      if (!res.ok) {
        setError(res.error ?? "couldn't send.");
        return;
      }
      setText("");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={submit}
      className="fixed bottom-20 inset-x-0 mx-auto max-w-lg bg-canvas/95 backdrop-blur border-t border-line px-5 py-3 z-30"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 280))}
          placeholder="message the village…"
          className="flex-1 bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="w-10 h-10 bg-red text-paper flex items-center justify-center disabled:opacity-30"
          aria-label="Send message"
        >
          <Send size={16} strokeWidth={1.8} />
        </button>
      </div>
      {error && <p className="text-warn text-xs mt-2">{error}</p>}
      <p className="mono-text text-[10px] text-muted mt-2 text-center">
        private to thread · max 12 villagers · no public counts surfaced
      </p>
    </form>
  );
}
