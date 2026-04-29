"use client";

/**
 * MomentWhisper — Match Day reaction CTA on /live/[id].
 *
 * When the score changes from the user's last-seen state, a 30s "REACT NOW"
 * mode auto-opens with the score as context. Else, a quieter floating CTA
 * is available to whisper any time.
 *
 * Pact: pre-fills scope=public (broadcasting your reaction), topic=event topic.
 * Per-user last-seen-score lives in localStorage.
 */

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Zap, X } from "lucide-react";
import { postWhisper } from "@/app/compose/actions";

interface Props {
  eventId: string;
  eventTopicId: string;
  eventTitle: string;
  isAuthed: boolean;
  homeLabel: string | null;
  awayLabel: string | null;
  homeScore: number | null;
  awayScore: number | null;
  minuteLabel: string | null;
  status: "scheduled" | "live" | "finished";
}

export function MomentWhisper({
  eventId,
  eventTopicId,
  eventTitle,
  isAuthed,
  homeLabel,
  awayLabel,
  homeScore,
  awayScore,
  minuteLabel,
  status,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Detect score change via localStorage
  useEffect(() => {
    if (!isAuthed || status !== "live") return;
    if (homeScore === null || awayScore === null) return;

    const key = `chatter:moment-score:${eventId}`;
    const previous = localStorage.getItem(key);
    const now = `${homeScore}-${awayScore}`;
    if (previous && previous !== now && !autoTriggered) {
      setAutoTriggered(true);
      setOpen(true);
      // Start 30s countdown
      setSecondsLeft(30);
      intervalRef.current = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s === null || s <= 1) {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    localStorage.setItem(key, now);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [eventId, homeScore, awayScore, status, isAuthed, autoTriggered]);

  if (!isAuthed) return null;

  const close = () => {
    setOpen(false);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSecondsLeft(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPending(true);
    setError(null);
    const fd = new FormData();
    fd.set("content", text.trim());
    fd.set("topicId", eventTopicId);
    fd.set("scope", "public");
    fd.set("modality", "text");
    const res = await postWhisper(fd);
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? "couldn't post.");
      return;
    }
    setText("");
    close();
    router.refresh();
  };

  return (
    <>
      {/* Floating CTA — pulses harder when auto-triggered */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`fixed bottom-24 right-5 inline-flex items-center gap-2 px-4 py-3 bg-red text-paper shadow-lg z-30 transition ${
            status === "live" ? "animate-pulse" : ""
          }`}
          aria-label="React now"
        >
          <Zap size={16} strokeWidth={1.8} />
          <span className="mono-text text-xs uppercase tracking-wider">
            {status === "live" ? "react now" : "whisper"}
          </span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="moment-whisper-title"
          className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-end sm:items-center justify-center px-4"
          onClick={close}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-paper border-t-4 border-red p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  {status === "live" && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-60" />
                  )}
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red" />
                </span>
                <span
                  id="moment-whisper-title"
                  className="mono-text text-[10px] uppercase tracking-wider text-red"
                  aria-live="polite"
                >
                  {autoTriggered && secondsLeft !== null && secondsLeft > 0
                    ? `score changed · ${secondsLeft}s to react`
                    : status === "live"
                      ? "react now"
                      : "moment whisper"}
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-muted hover:text-ink transition"
                aria-label="Close"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            {/* Score context */}
            {homeLabel && awayLabel && (homeScore !== null || awayScore !== null) && (
              <p className="mono-text text-sm text-ink text-center py-2 border-y border-line">
                {homeLabel}{" "}
                <span className="text-red font-semibold">{homeScore ?? "—"}</span>
                {" — "}
                <span className="text-red font-semibold">{awayScore ?? "—"}</span>{" "}
                {awayLabel}
                {minuteLabel && (
                  <span className="text-muted ml-2">· {minuteLabel}</span>
                )}
              </p>
            )}

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 280))}
              placeholder={
                autoTriggered
                  ? "what just happened? speak fast…"
                  : `your reaction to ${eventTitle}…`
              }
              className="w-full bg-transparent border border-line focus:border-red text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors display-italic text-lg min-h-[100px] resize-none"
              autoFocus
            />

            <div className="flex items-center justify-between">
              <span className="mono-text text-[10px] text-muted">
                public · {text.length} / 280
              </span>
              <button
                type="submit"
                disabled={pending || !text.trim()}
                className="btn-primary px-5 py-2 text-sm disabled:opacity-30"
              >
                {pending ? "posting…" : "release"}
              </button>
            </div>

            {error && <p className="text-warn text-xs">{error}</p>}
          </form>
        </div>
      )}
    </>
  );
}
