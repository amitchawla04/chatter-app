"use client";

/**
 * Tune-in toggle for a topic page.
 * Calls toggleTune server action + optimistically updates.
 */
import { useState, useTransition } from "react";
import { Radio } from "lucide-react";
import { toggleTune } from "@/app/t/[id]/actions";

export function TuneInButton({
  topicId,
  initiallyTuned,
}: {
  topicId: string;
  initiallyTuned: boolean;
}) {
  const [tuned, setTuned] = useState(initiallyTuned);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !tuned;
    setTuned(next);
    startTransition(async () => {
      const res = await toggleTune(topicId, next);
      if (!res.ok) {
        setTuned(!next); // revert on error
      }
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`inline-flex items-center gap-2 px-5 py-2 border transition-colors ${
        tuned
          ? "bg-red text-paper border-gold"
          : "bg-transparent text-ink border-line hover:border-gold"
      }`}
    >
      <Radio size={16} strokeWidth={1.5} />
      <span className="text-sm">{tuned ? "tuned in" : "tune in"}</span>
    </button>
  );
}
