"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { submitInsiderClaim } from "@/lib/trust-actions";

export function CredentialClaimForm() {
  const [tag, setTag] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitInsiderClaim({ tag, evidenceUrl, evidenceNote });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setStatus("submitted");
      setTag("");
      setEvidenceUrl("");
      setEvidenceNote("");
      setTimeout(() => setStatus("idle"), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="tag" className="block text-xs mono-text text-muted uppercase tracking-wider mb-1.5">
          credential
        </label>
        <input
          id="tag"
          type="text"
          required
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          maxLength={60}
          placeholder="e.g. former Premier League referee"
          className="w-full border border-line bg-canvas px-3 py-2 text-ink text-sm focus:outline-none focus:border-red"
        />
      </div>

      <div>
        <label htmlFor="evidence-url" className="block text-xs mono-text text-muted uppercase tracking-wider mb-1.5">
          evidence link <span className="lowercase normal-case">(optional)</span>
        </label>
        <input
          id="evidence-url"
          type="url"
          value={evidenceUrl}
          onChange={(e) => setEvidenceUrl(e.target.value)}
          placeholder="LinkedIn, Wikipedia, official page…"
          className="w-full border border-line bg-canvas px-3 py-2 text-ink mono-text text-xs focus:outline-none focus:border-red"
        />
      </div>

      <div>
        <label htmlFor="evidence-note" className="block text-xs mono-text text-muted uppercase tracking-wider mb-1.5">
          context <span className="lowercase normal-case">(optional, 280 char max)</span>
        </label>
        <textarea
          id="evidence-note"
          value={evidenceNote}
          onChange={(e) => setEvidenceNote(e.target.value)}
          maxLength={280}
          rows={2}
          placeholder="Anything that helps the reviewer verify."
          className="w-full border border-line bg-canvas px-3 py-2 text-ink text-sm focus:outline-none focus:border-red"
        />
      </div>

      {error && <p className="text-red text-xs">{error}</p>}
      {status === "submitted" && (
        <p className="text-ink text-xs mono-text">
          ✓ Submitted. You&apos;ll see the gold mark once reviewed.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !tag.trim()}
        className="bg-ink text-canvas mono-text uppercase tracking-wider text-xs px-4 py-2 hover:opacity-90 transition disabled:opacity-50 inline-flex items-center gap-2"
      >
        {pending && <Loader2 size={12} className="animate-spin" />}
        <span>Submit for review</span>
      </button>
    </form>
  );
}
