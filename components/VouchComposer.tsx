"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { vouchFor } from "@/lib/trust-actions";

export function VouchComposer({ topicId, topicName }: { topicId: string; topicName: string }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await vouchFor({ topicId, text });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setText("");
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 border border-gold text-gold mono-text uppercase tracking-wider text-[11px] px-3 py-1.5 hover:bg-gold/10 transition"
      >
        <Sparkles size={11} strokeWidth={1.5} />
        <span>vouch</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center justify-center" onClick={() => setOpen(false)}>
          <div
            className="w-full sm:max-w-md bg-canvas border border-line p-5 sm:m-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="display-italic text-xl text-ink mb-1">Vouch on {topicName}</h3>
              <p className="text-muted text-xs leading-relaxed">
                One sentence on why your perspective on this topic is worth weight. Visible to everyone. Not editable.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={280}
                rows={4}
                autoFocus
                placeholder="e.g. covered the Premier League for The Athletic 2018–24…"
                className="w-full border border-line bg-paper px-3 py-2 text-ink text-sm focus:outline-none focus:border-red"
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted mono-text text-[11px]">{text.length}/280</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-muted mono-text uppercase tracking-wider text-[11px] px-3 py-1.5 hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending || !text.trim()}
                    className="bg-gold text-canvas mono-text uppercase tracking-wider text-[11px] px-4 py-1.5 hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {pending && <Loader2 size={11} className="animate-spin" />}
                    <span>Vouch</span>
                  </button>
                </div>
              </div>
              {error && <p className="text-red text-xs">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
