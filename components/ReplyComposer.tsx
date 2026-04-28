"use client";

/**
 * ReplyComposer — sticky bottom composer on whisper detail page.
 * Supports the X3 reply agency via require_reply_approval on the parent.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { postReply } from "@/lib/reply-actions";

export function ReplyComposer({
  parentId,
  topicId,
  requiresApproval,
}: {
  parentId: string;
  topicId: string;
  requiresApproval: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "posted" | "pending-approval">("idle");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await postReply({ parentId, topicId, content: text.trim() });
      if (!res.ok) {
        setError(res.error ?? "couldn't send reply.");
        return;
      }
      setText("");
      setStatus(requiresApproval ? "pending-approval" : "posted");
      router.refresh();
      setTimeout(() => setStatus("idle"), 3000);
    });
  };

  return (
    <form
      onSubmit={submit}
      className="fixed bottom-20 inset-x-0 mx-auto max-w-lg bg-canvas/95 backdrop-blur border-t border-line px-5 py-3 z-30"
    >
      {status === "pending-approval" && (
        <p className="mono-text text-[11px] text-red mb-2">
          sent · author pre-approves replies. you&rsquo;ll be notified when it appears.
        </p>
      )}
      {status === "posted" && (
        <p className="mono-text text-[11px] text-red mb-2">reply posted.</p>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 280))}
          placeholder="reply…"
          className="flex-1 bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="w-10 h-10 bg-red text-paper flex items-center justify-center disabled:opacity-30"
          aria-label="Post reply"
        >
          <Send size={16} strokeWidth={1.8} />
        </button>
      </div>
      {error && <p className="text-warn text-xs mt-2">{error}</p>}
    </form>
  );
}
