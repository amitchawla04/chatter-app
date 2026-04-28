"use client";

/**
 * CorrectionButton — insider-gated "push back" action on whisper detail.
 * Only renders when current user has insider_tags. Server action enforces.
 */
import { useState, useTransition } from "react";
import { ShieldAlert, X } from "lucide-react";
import { submitCorrection } from "@/lib/correction-actions";

export function CorrectionButton({
  whisperId,
  canCorrect,
}: {
  whisperId: string;
  canCorrect: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!canCorrect) {
    return (
      <div className="px-5 py-3 border-t border-line">
        <p className="mono-text text-[11px] text-muted">
          insider correction · available to users with verified topic credentials
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="px-5 py-3 border-t border-line">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-muted hover:text-red transition-colors text-sm"
        >
          <ShieldAlert size={16} strokeWidth={1.5} />
          push back on this whisper
        </button>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await submitCorrection({ whisperId, content: text.trim() });
      if (!res.ok) {
        setError(res.error ?? "couldn't submit.");
        return;
      }
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setText("");
        setSent(false);
      }, 1600);
    });
  };

  return (
    <section className="px-5 py-4 border-t border-line bg-gold/5">
      <div className="flex items-center justify-between mb-3">
        <p className="label-text text-gold">push back · insider correction</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-muted hover:text-ink"
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>

      {sent ? (
        <p className="display-italic text-lg text-red py-2">
          submitted. if 3+ insiders push back, it surfaces publicly.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 280))}
            placeholder="what's factually off about this whisper?"
            autoFocus
            rows={3}
            className="w-full bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors body-text text-sm resize-none"
          />
          <div className="flex items-center justify-between">
            <span className={`mono-text text-xs ${text.length > 260 ? "text-warn" : "text-muted"}`}>
              {text.length} / 280
            </span>
            <button
              type="submit"
              disabled={pending || !text.trim()}
              className="btn-primary px-4 py-1.5 text-sm"
            >
              {pending ? "sending…" : "submit"}
            </button>
          </div>
          {error && <p className="text-warn text-xs">{error}</p>}
        </form>
      )}
    </section>
  );
}
