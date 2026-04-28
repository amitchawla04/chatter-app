"use client";

import { useState, useTransition } from "react";
import { Flag, X } from "lucide-react";
import { submitReport } from "@/lib/report-actions";

const REASONS = [
  { v: "harassment", label: "personal harassment" },
  { v: "hate", label: "hate against protected group" },
  { v: "misinformation", label: "false / misleading claim" },
  { v: "spam", label: "spam / engagement bait" },
  { v: "impersonation", label: "impersonating someone" },
  { v: "other", label: "something else" },
];

export function ReportButton({
  targetKind,
  targetId,
}: {
  targetKind: "whisper" | "user" | "topic";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [context, setContext] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!reason) {
      setError("pick a reason");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await submitReport({
        targetKind,
        targetId,
        reason,
        context: context.trim() || undefined,
      });
      if (!res.ok) {
        setError(res.error ?? "couldn't send report");
        return;
      }
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setReason("");
        setContext("");
      }, 2000);
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 mono-text text-[10px] text-muted hover:text-warn transition-colors"
      >
        <Flag size={12} strokeWidth={1.5} />
        report
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full sm:max-w-md bg-canvas border-t border-line sm:border sm:border-line shadow-2xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="display-italic text-xl text-ink">report this</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted hover:text-ink"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {sent ? (
          <p className="display-italic text-lg text-ink py-4">
            received. our moderation team will review within 72 hours.
          </p>
        ) : (
          <>
            <p className="label-text text-muted mb-3">why?</p>
            <div className="space-y-2 mb-5">
              {REASONS.map((r) => (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setReason(r.v)}
                  className={`w-full text-left px-3 py-2.5 border text-sm transition-colors ${
                    reason === r.v
                      ? "border-warn bg-warn/5 text-ink"
                      : "border-line text-ink/80 hover:border-cream/40"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <label className="label-text text-muted block mb-2">add context (optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="anything else our moderators should know"
              className="w-full bg-transparent border border-line focus:border-warn text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm resize-none mb-4"
            />

            {error && <p className="text-warn text-sm mb-3">{error}</p>}

            <button
              type="button"
              onClick={submit}
              disabled={pending || !reason}
              className="btn-primary w-full justify-center"
            >
              {pending ? "sending…" : "send report"}
            </button>

            <p className="mono-text text-[11px] text-muted mt-3 text-center">
              72-hour SLA · appeal window 7 days
            </p>
          </>
        )}
      </div>
    </div>
  );
}
