"use client";

/**
 * Meta row on the whisper-detail surface (Surface 7.2-7.4).
 * Shows "N echoes from insiders · N passes · N saves" + opens the
 * EngagementListSheet for either echoes or passes.
 */

import { useState } from "react";
import { EngagementListSheet } from "./EngagementListSheet";

interface Props {
  whisperId: string;
  echoCount: number;
  passCount: number;
  insiderEchoCount: number;
}

export function WhisperEngagementMeta({
  whisperId,
  echoCount,
  passCount,
  insiderEchoCount,
}: Props) {
  const [open, setOpen] = useState<"echoes" | "passes" | null>(null);

  if (echoCount === 0 && passCount === 0) return null;

  return (
    <>
      <div className="px-5 pt-4 pb-2 border-b border-line/60 flex items-center gap-4 flex-wrap mono-text text-[11px] text-muted">
        {echoCount > 0 && (
          <button
            type="button"
            onClick={() => setOpen("echoes")}
            className="hover:text-red transition-colors flex items-center gap-1"
            aria-label="Show who echoed this whisper"
          >
            <span className="text-ink font-medium">{echoCount}</span>
            <span>{insiderEchoCount > 0 ? `echoes (${insiderEchoCount} insider)` : echoCount === 1 ? "echo" : "echoes"}</span>
            <span className="text-red ml-1">show →</span>
          </button>
        )}
        {passCount > 0 && (
          <button
            type="button"
            onClick={() => setOpen("passes")}
            className="hover:text-red transition-colors flex items-center gap-1"
            aria-label="Show who passed this whisper"
          >
            <span className="text-ink font-medium">{passCount}</span>
            <span>{passCount === 1 ? "pass" : "passes"}</span>
            <span className="text-red ml-1">show →</span>
          </button>
        )}
      </div>
      {open && (
        <EngagementListSheet
          whisperId={whisperId}
          mode={open}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
