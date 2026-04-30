"use client";

/**
 * TopicMuteSheet — duration picker for muting a topic (IP6).
 * Options: 1 hour · 24 hours · 7 days · forever.
 */

import { useEffect, useState, useTransition } from "react";
import { X, VolumeX } from "lucide-react";
import { muteTopic } from "@/lib/trust-actions";

type Duration = "1h" | "24h" | "7d" | "forever";

const DURATIONS: { id: Duration; label: string; sub: string }[] = [
  { id: "1h", label: "1 hour", sub: "small breather" },
  { id: "24h", label: "24 hours", sub: "rest of the day" },
  { id: "7d", label: "7 days", sub: "a week off" },
  { id: "forever", label: "forever", sub: "until you unmute" },
];

export function TopicMuteSheet({
  topicId,
  topicName,
  onClose,
  onMuted,
}: {
  topicId: string;
  topicName: string;
  onClose: () => void;
  onMuted?: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<Duration | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const submit = (d: Duration) => {
    setPicked(d);
    setError(null);
    startTransition(async () => {
      const res = await muteTopic({ topicId, duration: d });
      if (!res.ok) {
        setError(res.error ?? "couldn't mute");
        setPicked(null);
        return;
      }
      onMuted?.();
      setTimeout(onClose, 700);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="topic-mute-title"
      className="fixed inset-0 z-50 bg-canvas/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-canvas border-t border-line sm:border sm:border-line shadow-2xl p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <VolumeX size={18} strokeWidth={1.5} className="text-muted" />
            <h2 id="topic-mute-title" className="display-italic text-xl text-ink">
              mute {topicName}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink" aria-label="Close">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>
        <ul className="space-y-2">
          {DURATIONS.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => submit(d.id)}
                disabled={pending}
                className={`w-full text-left px-4 py-3 border transition-colors ${
                  picked === d.id
                    ? "border-red bg-red/10 text-red"
                    : "border-line hover:border-ink"
                } ${pending && picked !== d.id ? "opacity-30" : ""}`}
              >
                <div className="text-ink text-sm font-medium">{d.label}</div>
                <div className="mono-text text-[10px] text-muted">{d.sub}</div>
              </button>
            </li>
          ))}
        </ul>
        {error && <p className="text-warn text-xs mt-3">{error}</p>}
      </div>
    </div>
  );
}
