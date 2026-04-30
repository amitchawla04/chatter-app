"use client";

/**
 * PassSheet — bottom sheet to pass a whisper to one or more people.
 * Visual DNA Principle 6: pass-signature move. Distinct from broadcast.
 *
 * Multi-recipient: tap to toggle. Up to 5 recipients per pass (IP5).
 * Note travels with all recipients in the batch.
 */

import { useEffect, useRef, useState, useTransition } from "react";
import { X, Send, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { passWhisper } from "@/lib/engagement-actions";

interface Recipient {
  id: string;
  handle: string;
  display_name: string;
  insider_tags: string[] | null;
}

const MAX_RECIPIENTS = 5;

export function PassSheet({
  whisperId,
  whisperExcerpt,
  onClose,
}: {
  whisperId: string;
  whisperExcerpt: string;
  onClose: () => void;
}) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");
  const [sentCount, setSentCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("users")
        .select("id, handle, display_name, insider_tags")
        .neq("handle", "")
        .order("trust_score", { ascending: false })
        .limit(20);
      if (err) setError(err.message);
      setRecipients((data as Recipient[]) ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_RECIPIENTS) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const selectedList = recipients.filter((r) => selectedIds.has(r.id));

  const handleSend = () => {
    if (selectedIds.size === 0) return;
    setError(null);
    startTransition(async () => {
      const trimmedNote = note.trim() || undefined;
      let okCount = 0;
      let firstError: string | null = null;
      for (const r of selectedList) {
        const res = await passWhisper({
          whisperId,
          toUserId: r.id,
          note: trimmedNote,
        });
        if (res.ok) okCount++;
        else if (!firstError) firstError = res.error ?? "couldn't pass.";
      }
      if (okCount === 0) {
        setError(firstError ?? "couldn't pass. try again.");
        return;
      }
      setSentCount(okCount);
      setTimeout(onClose, 1400);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-sheet-title"
      className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-canvas border-t border-line sm:border sm:border-line shadow-2xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="pass-sheet-title" className="display-italic text-xl text-ink">pass this whisper</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {sentCount > 0 ? (
          <div className="py-12 text-center">
            <p className="display-italic text-2xl text-red mb-2">delivered.</p>
            <p className="mono-text text-xs text-muted">
              {sentCount === 1
                ? `${selectedList[0].handle ? "@" + selectedList[0].handle : "they"} will see it in their passes.`
                : `${sentCount} villagers will see it in their passes.`}
            </p>
          </div>
        ) : (
          <>
            <p className="body-text text-sm text-ink/70 mb-5 italic border-l-2 border-gold/40 pl-3 line-clamp-2">
              &ldquo;{whisperExcerpt}…&rdquo;
            </p>

            <div className="flex items-center justify-between mb-3">
              <p className="label-text text-muted">to · pick up to {MAX_RECIPIENTS}</p>
              {selectedIds.size > 0 && (
                <span className="mono-text text-[11px] text-red">
                  {selectedIds.size}/{MAX_RECIPIENTS} selected
                </span>
              )}
            </div>

            {loading ? (
              <p className="mono-text text-xs text-muted py-4">loading your village…</p>
            ) : (
              <div className="max-h-56 overflow-y-auto -mx-5 sm:-mx-6 px-5 sm:px-6 mb-5">
                {recipients.map((r) => {
                  const isSelected = selectedIds.has(r.id);
                  const disabled = !isSelected && selectedIds.size >= MAX_RECIPIENTS;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggle(r.id)}
                      disabled={disabled}
                      className={`w-full text-left flex items-center gap-3 py-2.5 border-b border-line/50 transition-colors ${
                        isSelected ? "bg-red/10" : "hover:bg-paper"
                      } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
                      aria-pressed={isSelected}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-colors ${
                          isSelected ? "bg-red text-paper" : "bg-line text-ink"
                        }`}
                      >
                        {isSelected ? <Check size={14} strokeWidth={2} /> : (r.display_name[0]?.toUpperCase() ?? "·")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-ink truncate">@{r.handle}</div>
                        {r.insider_tags && r.insider_tags.length > 0 && (
                          <div className="mono-text text-[10px] text-red italic truncate">
                            {r.insider_tags[0].replace(/_/g, " ")}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedIds.size > 0 && (
              <div className="mb-5">
                <label className="label-text text-muted block mb-2">
                  note (optional · same for all)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value.slice(0, 200))}
                  placeholder="say why you're passing this"
                  className="w-full bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm"
                />
              </div>
            )}

            {error && <p className="text-warn text-sm mb-3">{error}</p>}

            <button
              type="button"
              onClick={handleSend}
              disabled={selectedIds.size === 0}
              className="btn-primary w-full justify-center"
            >
              <Send size={16} strokeWidth={1.5} />
              {selectedIds.size === 0
                ? "pick a recipient"
                : selectedIds.size === 1
                ? `pass to @${selectedList[0]?.handle}`
                : `pass to ${selectedIds.size} villagers`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
