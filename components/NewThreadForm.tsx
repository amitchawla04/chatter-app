"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createThread } from "@/lib/thread-actions";

interface NewThreadFormProps {
  topics: { id: string; name: string; emoji: string | null }[];
}

export function NewThreadForm({ topics }: NewThreadFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [topicId, setTopicId] = useState<string>(topics[0]?.id ?? "");
  const [invites, setInvites] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const handles = invites
      .split(/[,\s]+/)
      .map((h) => h.trim())
      .filter(Boolean);
    if (handles.length > 11) {
      setError("max 11 invites — threads cap at 12 including you.");
      return;
    }
    startTransition(async () => {
      const res = await createThread({
        name: name.trim(),
        topicId,
        inviteHandles: handles,
      });
      if (!res.ok || !("threadId" in res)) {
        setError(res.error ?? "couldn't create thread.");
        return;
      }
      router.push(`/v/${res.threadId}`);
    });
  };

  return (
    <form onSubmit={submit} className="px-5 space-y-6">
      <label className="block">
        <span className="label-text text-muted block mb-2">topic</span>
        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="w-full bg-transparent border border-line focus:border-red text-ink px-3 py-2 outline-none transition-colors text-sm"
          required
        >
          {topics.length === 0 && <option value="">no topics available</option>}
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.emoji ? `${t.emoji} ` : ""}
              {t.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label-text text-muted block mb-2">thread name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 60))}
          placeholder="e.g. set-piece nerds"
          className="w-full bg-transparent border border-line focus:border-red text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm"
          required
        />
        <span className="mono-text text-[10px] text-muted">{name.length}/60</span>
      </label>

      <label className="block">
        <span className="label-text text-muted block mb-2">invite by handle (optional)</span>
        <textarea
          value={invites}
          onChange={(e) => setInvites(e.target.value)}
          placeholder="@ashburton89, @lamasia, @setpiecestan"
          rows={3}
          className="w-full bg-transparent border border-line focus:border-red text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm"
        />
        <span className="mono-text text-[10px] text-muted">
          comma- or space-separated · max 11 (you + 11 = 12)
        </span>
      </label>

      {error && <p className="text-warn text-xs">{error}</p>}

      <button
        type="submit"
        disabled={pending || !name.trim() || !topicId}
        className="btn-primary w-full disabled:opacity-30"
      >
        {pending ? "creating…" : "create thread"}
      </button>
    </form>
  );
}
