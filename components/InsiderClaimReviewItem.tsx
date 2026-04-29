"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { reviewInsiderClaim } from "@/lib/trust-actions";

interface Claim {
  id: string;
  tag: string;
  status: "pending" | "approved" | "rejected";
  evidenceUrl: string | null;
  evidenceNote: string | null;
  createdAt: string;
  handle: string;
  displayName: string;
}

export function InsiderClaimReviewItem({ claim }: { claim: Claim }) {
  const [decided, setDecided] = useState<"approved" | "rejected" | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function handle(decision: "approved" | "rejected") {
    if (!confirm(`${decision === "approved" ? "Approve" : "Reject"} this claim?`)) return;
    startTransition(async () => {
      const result = await reviewInsiderClaim({ claimId: claim.id, decision, note });
      if (result.ok) setDecided(decision);
    });
  }

  if (decided) {
    return (
      <li className="border border-line bg-paper px-4 py-3 text-muted mono-text text-xs">
        @{claim.handle} · {claim.tag} → {decided}
      </li>
    );
  }

  return (
    <li className="border border-line bg-paper p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="display-italic text-ink text-base mb-0.5">{claim.tag}</p>
          <p className="text-muted text-xs mono-text">
            @{claim.handle} {claim.displayName ? `· ${claim.displayName}` : ""} · {claim.createdAt}
          </p>
        </div>
      </div>

      {claim.evidenceNote && <p className="text-ink text-sm leading-relaxed">{claim.evidenceNote}</p>}
      {claim.evidenceUrl && (
        <a
          href={claim.evidenceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="block text-muted text-xs underline hover:text-ink break-all"
        >
          {claim.evidenceUrl}
        </a>
      )}

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={140}
        placeholder="reviewer note (optional)"
        className="w-full border border-line bg-canvas px-3 py-1.5 text-ink text-xs mono-text focus:outline-none focus:border-red"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handle("approved")}
          disabled={pending}
          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-gold text-gold mono-text uppercase tracking-wider text-[11px] py-2 hover:bg-gold/10 transition disabled:opacity-50"
        >
          {pending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2} />}
          <span>Approve</span>
        </button>
        <button
          type="button"
          onClick={() => handle("rejected")}
          disabled={pending}
          className="flex-1 inline-flex items-center justify-center gap-1.5 border border-line text-muted mono-text uppercase tracking-wider text-[11px] py-2 hover:border-warn hover:text-warn transition disabled:opacity-50"
        >
          {pending ? <Loader2 size={12} className="animate-spin" /> : <X size={12} strokeWidth={2} />}
          <span>Reject</span>
        </button>
      </div>
    </li>
  );
}
