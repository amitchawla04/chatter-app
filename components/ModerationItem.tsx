"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { resolveReport } from "@/lib/moderation-actions";
import { relativeTime } from "@/lib/whisper";

interface Props {
  report: {
    id: string;
    target_kind: "whisper" | "user" | "topic";
    target_id: string;
    reason: string;
    context: string | null;
    created_at: string;
    reporter: { handle: string; is_charter: boolean | null } | null;
  };
  whisper: {
    id: string;
    content_text: string | null;
    modality: string;
    scope: string;
    users: { handle: string } | null;
  } | null;
  userTarget: { id: string; handle: string; display_name: string } | null;
}

export function ModerationItem({ report, whisper, userTarget }: Props) {
  const [pending, startTransition] = useTransition();
  const [resolved, setResolved] = useState<string | null>(null);

  const act = (action: "dismiss" | "hide_whisper" | "pause_user") => {
    startTransition(async () => {
      const res = await resolveReport({ reportId: report.id, action });
      if (res.ok) setResolved(action);
    });
  };

  if (resolved) {
    return (
      <li className="border-b border-line px-5 py-4 bg-paper opacity-60">
        <p className="mono-text text-xs text-muted">
          report resolved · {resolved.replace(/_/g, " ")}
        </p>
      </li>
    );
  }

  return (
    <li className="border-b border-line px-5 py-4">
      <div className="flex items-start gap-3 mb-3">
        <span
          className={`mono-text text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
            report.target_kind === "whisper"
              ? "border-red text-red"
              : report.target_kind === "user"
                ? "border-warn text-warn"
                : "border-line text-muted"
          }`}
        >
          {report.target_kind}
        </span>
        <span className="text-ink text-sm flex-1">{report.reason}</span>
        <span className="mono-text text-[10px] text-muted shrink-0">
          {relativeTime(report.created_at)}
        </span>
      </div>

      {report.context && (
        <p className="body-text text-xs text-muted mb-3 italic">
          context: {report.context}
        </p>
      )}

      {report.reporter && (
        <p className="mono-text text-[10px] text-muted mb-3">
          reported by{" "}
          <span className="text-ink">@{report.reporter.handle}</span>
          {report.reporter.is_charter && (
            <span className="text-gold italic"> · charter</span>
          )}
        </p>
      )}

      {whisper && (
        <Link
          href={`/w/${whisper.id}`}
          target="_blank"
          rel="noreferrer"
          className="block border-l-2 border-line bg-paper px-3 py-2 mb-3 hover:border-ink transition"
        >
          <p className="display-italic text-sm text-ink line-clamp-2">
            &ldquo;{whisper.content_text ?? "[media whisper]"}&rdquo;
          </p>
          <p className="mono-text text-[10px] text-muted mt-1">
            @{whisper.users?.handle} · {whisper.modality} · {whisper.scope}
          </p>
        </Link>
      )}

      {userTarget && (
        <div className="border-l-2 border-line bg-paper px-3 py-2 mb-3">
          <p className="text-sm text-ink">@{userTarget.handle}</p>
          <p className="mono-text text-[10px] text-muted">{userTarget.display_name}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => act("dismiss")}
          disabled={pending}
          className="text-xs px-3 py-1.5 border border-line text-ink hover:border-ink transition disabled:opacity-30"
        >
          dismiss
        </button>
        {report.target_kind === "whisper" && (
          <button
            type="button"
            onClick={() => act("hide_whisper")}
            disabled={pending}
            className="text-xs px-3 py-1.5 border border-warn text-warn hover:bg-warn hover:text-paper transition disabled:opacity-30"
          >
            hide whisper
          </button>
        )}
        {report.target_kind === "user" && (
          <button
            type="button"
            onClick={() => act("pause_user")}
            disabled={pending}
            className="text-xs px-3 py-1.5 border border-red text-red hover:bg-red hover:text-paper transition disabled:opacity-30"
          >
            pause user
          </button>
        )}
      </div>
    </li>
  );
}
