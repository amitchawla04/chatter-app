"use client";

import { useState, useTransition } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { reportPactViolation } from "@/lib/pact-actions";

const PROMISES = [
  "Privacy · we never sell your data",
  "Privacy · your whispers are yours (export/delete)",
  "Privacy · scope is the default",
  "Privacy · no tracking outside Chatter",
  "Privacy · we verify, we don't surveil",
  "Vibe · criticism welcome, cruelty isn't",
  "Vibe · attack ideas not people",
  "Vibe · zero tolerance for hate",
  "Vibe · no personal harassment",
  "Vibe · passion over poison",
  "AI · your content is not training data",
  "AI · features that affect what you post or see are opt-in",
  "AI · cannot post or reply for you",
  "Performance · no public popularity scores",
];

export function PactViolationForm() {
  const [open, setOpen] = useState(false);
  const [promise, setPromise] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await reportPactViolation({ promise, description, contactEmail });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <div className="border border-line bg-paper p-6 max-w-xl mx-auto">
      <div className="flex items-start gap-3 mb-3">
        <ShieldAlert size={20} strokeWidth={1.5} className="text-red flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="display-italic text-xl text-ink mb-1">Did we break a promise?</h3>
          <p className="text-muted text-sm leading-relaxed">
            The Pact is contractual. If you think we broke any of the 14 promises, tell us. Reports go straight to Amit&apos;s inbox and into the moderation queue.
          </p>
        </div>
      </div>

      {!open && !done && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-2 inline-flex items-center gap-2 mono-text uppercase tracking-wider text-xs text-red hover:text-ink transition"
        >
          → Report a Pact violation
        </button>
      )}

      {done && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="display-italic text-lg text-ink mb-1">Thank you. We see it.</p>
          <p className="text-muted text-xs leading-relaxed">
            The report is in the moderation queue and Amit has been emailed. Pact violations are reviewed within 24 hours; remediation is publicly logged in the changelog.
          </p>
        </div>
      )}

      {open && !done && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="promise" className="block text-xs mono-text text-muted uppercase tracking-wider mb-1.5">
              which promise
            </label>
            <select
              id="promise"
              required
              value={promise}
              onChange={(e) => setPromise(e.target.value)}
              className="w-full border border-line bg-canvas px-3 py-2 text-ink text-sm focus:outline-none focus:border-red"
            >
              <option value="">choose a promise…</option>
              {PROMISES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-xs mono-text text-muted uppercase tracking-wider mb-1.5">
              what happened (specifics, links, screenshots)
            </label>
            <textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="Be concrete. The more specific, the faster we can act."
              className="w-full border border-line bg-canvas px-3 py-2 text-ink text-sm focus:outline-none focus:border-red"
            />
            <p className="text-muted text-[11px] mono-text mt-1">{description.length}/2000</p>
          </div>

          <div>
            <label htmlFor="contact" className="block text-xs mono-text text-muted uppercase tracking-wider mb-1.5">
              your email <span className="lowercase normal-case">(only if you want a reply — not required)</span>
            </label>
            <input
              id="contact"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full border border-line bg-canvas px-3 py-2 text-ink mono-text text-xs focus:outline-none focus:border-red"
            />
          </div>

          {error && <p className="text-red text-xs">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-muted mono-text uppercase tracking-wider text-[11px] px-3 py-2 hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !promise || description.length < 20}
              className="flex-1 bg-red text-canvas mono-text uppercase tracking-wider text-xs px-4 py-2 hover:opacity-90 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {pending && <Loader2 size={12} className="animate-spin" />}
              <span>Submit report</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
