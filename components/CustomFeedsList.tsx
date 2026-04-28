"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2, Eye } from "lucide-react";
import { saveCustomFeed, deleteCustomFeed } from "@/app/you/feeds/actions";

interface Feed {
  id: string;
  name: string;
  topic_ids: string[];
}
interface Topic {
  id: string;
  name: string;
  emoji: string | null;
}

export function CustomFeedsList({ feeds, availableTopics }: { feeds: Feed[]; availableTopics: Topic[] }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!name.trim() || pickedIds.length === 0) {
      setErr("name + at least 1 topic required");
      return;
    }
    startTransition(async () => {
      const r = await saveCustomFeed({ name: name.trim(), topicIds: pickedIds });
      if (!r.ok) {
        setErr(r.error ?? "couldn't save");
        return;
      }
      setName("");
      setPickedIds([]);
      setCreating(false);
    });
  };

  return (
    <div>
      {feeds.length === 0 && !creating && (
        <p className="body-text text-muted italic mb-6">no custom feeds yet.</p>
      )}

      {feeds.map((f) => (
        <article key={f.id} className="border border-line p-4 mb-3 bg-paper flex items-center justify-between">
          <div>
            <p className="display-italic text-lg text-ink">{f.name}</p>
            <p className="mono-text text-xs text-muted">{f.topic_ids.length} topics</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/home?feed=${f.id}`}
              className="text-muted hover:text-red"
              aria-label={`Open ${f.name} feed`}
            >
              <Eye size={18} strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  await deleteCustomFeed(f.id);
                })
              }
              className="text-muted hover:text-warn"
              aria-label="Delete feed"
            >
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </div>
        </article>
      ))}

      {creating ? (
        <form onSubmit={submit} className="border border-red p-4 bg-red-soft">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 60))}
            placeholder="feed name (e.g. football monday)"
            autoFocus
            className="w-full bg-transparent border-b border-line focus:border-red outline-none py-2 text-lg display-italic text-ink mb-4"
          />
          <p className="label-text text-muted mb-2">pick topics</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableTopics.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() =>
                  setPickedIds((p) =>
                    p.includes(t.id) ? p.filter((x) => x !== t.id) : [...p, t.id],
                  )
                }
                data-selected={pickedIds.includes(t.id)}
                className="topic-chip"
              >
                {t.emoji && <span>{t.emoji}</span>}
                <span>{t.name}</span>
              </button>
            ))}
          </div>
          {err && <p className="text-warn text-sm mb-2">{err}</p>}
          <div className="flex items-center gap-2">
            <button type="submit" disabled={pending} className="btn-primary text-sm px-4 py-2">
              {pending ? "saving…" : "create"}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-muted hover:text-ink text-sm"
            >
              cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn-secondary w-full justify-center"
        >
          <Plus size={16} strokeWidth={1.5} /> new feed
        </button>
      )}
    </div>
  );
}
