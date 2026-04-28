"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus, Archive, Check } from "lucide-react";
import { createInviteCode, archiveInviteCode } from "@/lib/invite-actions";
import { relativeTime } from "@/lib/whisper";

type Code = {
  code: string;
  cohort: string | null;
  max_uses: number;
  used_count: number;
  archived: boolean;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
};

export function InviteCodeManager({ codes }: { codes: Code[] }) {
  const router = useRouter();
  const [cohort, setCohort] = useState("charter");
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = () => {
    setError(null);
    startTransition(async () => {
      const res = await createInviteCode({
        cohort: cohort.trim() || "charter",
        notes: notes.trim() || undefined,
        maxUses: 1,
      });
      if (!res.ok) {
        setError(res.error ?? "failed");
        return;
      }
      setNotes("");
      router.refresh();
    });
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const archive = (code: string) => {
    startTransition(async () => {
      await archiveInviteCode(code);
      router.refresh();
    });
  };

  const active = codes.filter((c) => !c.archived);
  const archived = codes.filter((c) => c.archived);

  return (
    <>
      <section className="px-5 py-5 border-b border-line">
        <h2 className="label-text text-muted mb-3">generate new</h2>
        <div className="space-y-3">
          <div>
            <label className="block mono-text text-[10px] text-muted mb-1">cohort</label>
            <input
              type="text"
              value={cohort}
              onChange={(e) => setCohort(e.target.value.slice(0, 30))}
              placeholder="charter / press / demo / partner"
              className="w-full bg-transparent border border-line focus:border-red text-ink px-3 py-2 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block mono-text text-[10px] text-muted mb-1">notes (private)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 80))}
              placeholder="e.g. for @balaji · met at Milken"
              className="w-full bg-transparent border border-line focus:border-red text-ink px-3 py-2 outline-none text-sm"
            />
          </div>
          {error && <p className="text-warn text-xs">{error}</p>}
          <button
            type="button"
            onClick={generate}
            disabled={pending}
            className="btn-primary w-full"
          >
            <Plus size={16} strokeWidth={1.8} />
            {pending ? "generating…" : "generate code"}
          </button>
        </div>
      </section>

      <section className="px-5 py-5 border-b border-line">
        <h2 className="label-text text-muted mb-3">
          active · {active.length}
        </h2>
        {active.length === 0 ? (
          <p className="text-muted text-sm">no active codes — generate one above.</p>
        ) : (
          <ul className="space-y-2">
            {active.map((c) => (
              <li
                key={c.code}
                className="flex items-center gap-3 border border-line px-3 py-2.5 hover:border-ink transition"
              >
                <button
                  type="button"
                  onClick={() => copy(c.code)}
                  className="font-mono text-sm text-ink hover:text-red transition flex items-center gap-2"
                  title="Click to copy"
                >
                  {c.code}
                  {copied === c.code ? (
                    <Check size={14} strokeWidth={1.8} className="text-red" />
                  ) : (
                    <Copy size={12} strokeWidth={1.5} className="text-muted" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="mono-text text-[10px] text-muted">
                    {c.cohort && <span className="text-ink">{c.cohort}</span>}
                    {c.cohort && " · "}
                    {c.used_count} / {c.max_uses} used
                    {" · "}
                    {relativeTime(c.created_at)}
                  </div>
                  {c.notes && (
                    <div className="mono-text text-[10px] text-muted/70 italic truncate">
                      {c.notes}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => archive(c.code)}
                  className="text-muted hover:text-warn transition"
                  aria-label="Archive"
                >
                  <Archive size={14} strokeWidth={1.5} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {archived.length > 0 && (
        <section className="px-5 py-5">
          <h2 className="label-text text-muted mb-3">
            archived · {archived.length}
          </h2>
          <ul className="space-y-1 mono-text text-[11px] text-muted/60">
            {archived.slice(0, 20).map((c) => (
              <li key={c.code} className="line-through">
                {c.code} · {c.cohort} · {c.used_count}/{c.max_uses} used
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
