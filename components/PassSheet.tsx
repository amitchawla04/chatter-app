"use client";

/**
 * PassSheet — bottom sheet to pass a whisper to one specific user.
 * Visual DNA Principle 6: pass-signature move. 1:1 distribution, distinct from broadcast.
 */

import { useEffect, useState, useTransition } from "react";
import { X, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { passWhisper } from "@/lib/engagement-actions";

interface Recipient {
  id: string;
  handle: string;
  display_name: string;
  insider_tags: string[] | null;
}

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
  const [selected, setSelected] = useState<Recipient | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      // For v1: load the 20 most-active users (trust_score proxy).
      // v2 will load from user's vouch graph / contact import.
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

  const handleSend = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await passWhisper({
        whisperId,
        toUserId: selected.id,
        note: note.trim() || undefined,
      });
      if (!res.ok) {
        setError(res.error ?? "couldn't pass. try again.");
        return;
      }
      setSent(true);
      setTimeout(onClose, 1400);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-canvas border-t border-line sm:border sm:border-line shadow-2xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="display-italic text-xl text-ink">pass this whisper</h2>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {sent ? (
          <div className="py-12 text-center">
            <p className="display-italic text-2xl text-red mb-2">delivered.</p>
            <p className="mono-text text-xs text-muted">
              @{selected?.handle} will see it in their passes.
            </p>
          </div>
        ) : (
          <>
            <p className="body-text text-sm text-ink/70 mb-5 italic border-l-2 border-gold/40 pl-3 line-clamp-2">
              &ldquo;{whisperExcerpt}…&rdquo;
            </p>

            <p className="label-text text-muted mb-3">to (one person)</p>

            {loading ? (
              <p className="mono-text text-xs text-muted py-4">loading your village…</p>
            ) : (
              <div className="max-h-56 overflow-y-auto -mx-5 sm:-mx-6 px-5 sm:px-6 mb-5">
                {recipients.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r)}
                    className={`w-full text-left flex items-center gap-3 py-2.5 border-b border-line/50 transition-colors ${
                      selected?.id === r.id ? "bg-gold/10" : "hover:bg-paper"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-line flex items-center justify-center text-xs text-ink">
                      {r.display_name[0]?.toUpperCase() ?? "·"}
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
                ))}
              </div>
            )}

            {selected && (
              <div className="mb-5">
                <label className="label-text text-muted block mb-2">
                  note (optional)
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
              disabled={!selected}
              className="btn-primary w-full justify-center"
            >
              <Send size={16} strokeWidth={1.5} />
              {selected ? `pass to @${selected.handle}` : "pick a recipient"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
