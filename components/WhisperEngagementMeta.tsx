"use client";

/**
 * Meta row on the whisper-detail surface (Surface 7.2-7.4 + CN24 chain link).
 * Shows "N echoes from insiders · N passes · N saves" + opens the
 * EngagementListSheet for either echoes or passes. If the whisper has been
 * passed, also offers a tertiary link to the full pass-chain visualization.
 */

import { useState } from "react";
import Link from "next/link";
import { GitBranch } from "lucide-react";
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
        {passCount > 0 && (
          <Link
            href={`/w/${whisperId}/chain`}
            className="hover:text-red transition-colors flex items-center gap-1.5 ml-auto no-underline-link"
            aria-label="Open the pass-chain visualization for this whisper"
          >
            <GitBranch size={11} strokeWidth={1.6} />
            <span>see chain →</span>
          </Link>
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
