"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { addHiddenWord, removeHiddenWord } from "@/lib/trust-actions";

export function HiddenWordsManager({ initial }: { initial: string[] }) {
  const [words, setWords] = useState(initial);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const word = draft.trim().toLowerCase();
    if (!word) return;
    if (words.includes(word)) {
      setError("Already hidden");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await addHiddenWord(word);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setWords((prev) => [word, ...prev]);
      setDraft("");
    });
  }

  function handleRemove(word: string) {
    startTransition(async () => {
      const result = await removeHiddenWord(word);
      if (result.ok) setWords((prev) => prev.filter((w) => w !== word));
    });
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={60}
          placeholder="add a word or phrase…"
          className="flex-1 border border-line bg-canvas px-3 py-2 text-ink mono-text text-sm focus:outline-none focus:border-red"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className="bg-ink text-canvas mono-text uppercase tracking-wider text-xs px-4 py-2 hover:opacity-90 transition disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {error && <p className="text-red text-xs mb-3">{error}</p>}
      {words.length === 0 ? (
        <p className="text-muted text-xs italic">no hidden words yet</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {words.map((word) => (
            <li
              key={word}
              className="inline-flex items-center gap-2 border border-line bg-paper px-3 py-1.5 mono-text text-xs text-ink"
            >
              <span>{word}</span>
              <button
                type="button"
                onClick={() => handleRemove(word)}
                disabled={pending}
                className="text-muted hover:text-red transition"
                aria-label={`remove ${word}`}
              >
                <X size={12} strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
