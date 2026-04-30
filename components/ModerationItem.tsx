"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ShieldAlert, Eye, EyeOff, ChevronUp, FileText } from "lucide-react";
import {
  resolveReport,
  setWhisperReviewStatus,
  escalateReport,
} from "@/lib/moderation-actions";
import { relativeTime } from "@/lib/whisper";

interface Props {
  report: {
    id: string;
    target_kind: "whisper" | "user" | "topic";
    target_id: string;
    reason: string;
    context: string | null;
    created_at: string;
    escalated_at: string | null;
    reporter: { handle: string; is_charter: boolean | null } | null;
  };
  whisper: {
    id: string;
    content_text: string | null;
    modality: string;
    scope: string;
    review_status: "claim_under_review" | "under_review" | null;
    users: { handle: string } | null;
  } | null;
  userTarget: { id: string; handle: string; display_name: string } | null;
}

export function ModerationItem({ report, whisper, userTarget }: Props) {
  const [pending, startTransition] = useTransition();
  const [resolved, setResolved] = useState<string | null>(null);
  const [escalated, setEscalated] = useState<boolean>(Boolean(report.escalated_at));
  const [reviewStatus, setReviewStatus] = useState(whisper?.review_status ?? null);
  const [showLabelMenu, setShowLabelMenu] = useState(false);
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const [escalationNote, setEscalationNote] = useState("");

  const act = (action: "dismiss" | "hide_whisper" | "pause_user") => {
    startTransition(async () => {
      const res = await resolveReport({ reportId: report.id, action });
      if (res.ok) setResolved(action);
    });
  };

  const applyLabel = (status: "claim_under_review" | "under_review" | null) => {
    if (!whisper) return;
    setShowLabelMenu(false);
    startTransition(async () => {
      const res = await setWhisperReviewStatus({
        whisperId: whisper.id,
        status,
        reportId: report.id,
      });
      if (res.ok) setReviewStatus(status);
    });
  };

  const escalate = () => {
    startTransition(async () => {
      const res = await escalateReport({
        reportId: report.id,
        note: escalationNote.trim() || undefined,
      });
      if (res.ok) {
        setEscalated(true);
        setShowEscalateForm(false);
        setEscalationNote("");
      }
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
        {escalated && (
          <span className="mono-text text-[10px] uppercase tracking-wider text-gold border border-gold px-1.5 py-0.5 inline-flex items-center gap-1">
            <ChevronUp size={10} strokeWidth={2} />
            escalated
          </span>
        )}
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
        <div className="mb-3">
          <Link
            href={`/w/${whisper.id}`}
            target="_blank"
            rel="noreferrer"
            className="block border-l-2 border-line bg-paper px-3 py-2 hover:border-ink transition"
          >
            <p className="display-italic text-sm text-ink line-clamp-2">
              &ldquo;{whisper.content_text ?? "[media whisper]"}&rdquo;
            </p>
            <p className="mono-text text-[10px] text-muted mt-1">
              @{whisper.users?.handle} · {whisper.modality} · {whisper.scope}
              {reviewStatus && (
                <span className="ml-2 text-red uppercase tracking-wider">
                  · [{reviewStatus.replace(/_/g, " ")}]
                </span>
              )}
            </p>
          </Link>
        </div>
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
          <>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLabelMenu((v) => !v)}
                disabled={pending}
                className="text-xs px-3 py-1.5 border border-gold text-gold hover:bg-gold hover:text-canvas transition disabled:opacity-30 flex items-center gap-1"
              >
                {reviewStatus ? <EyeOff size={11} strokeWidth={1.6} /> : <Eye size={11} strokeWidth={1.6} />}
                {reviewStatus ? "change label" : "label"}
              </button>
              {showLabelMenu && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="close menu"
                    onClick={() => setShowLabelMenu(false)}
                  />
                  <div className="absolute z-20 left-0 top-full mt-1 min-w-[200px] bg-canvas border border-line shadow-sm py-1">
                    {([
                      { id: "under_review", label: "[UNDER REVIEW]", help: "general investigation" },
                      { id: "claim_under_review", label: "[CLAIM UNDER REVIEW]", help: "specific factual claim" },
                      { id: null, label: "clear label", help: "remove badge" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => applyLabel(opt.id)}
                        className="w-full text-left px-3 py-2 hover:bg-paper text-ink mono-text text-[11px]"
                      >
                        <div>{opt.label}</div>
                        <div className="text-muted text-[10px]">{opt.help}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => act("hide_whisper")}
              disabled={pending}
              className="text-xs px-3 py-1.5 border border-warn text-warn hover:bg-warn hover:text-paper transition disabled:opacity-30"
            >
              hide whisper
            </button>
          </>
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
        {!escalated && (
          <button
            type="button"
            onClick={() => setShowEscalateForm((v) => !v)}
            disabled={pending}
            className="text-xs px-3 py-1.5 border border-gold text-gold hover:bg-gold hover:text-canvas transition disabled:opacity-30 flex items-center gap-1"
          >
            <ShieldAlert size={11} strokeWidth={1.6} />
            escalate
          </button>
        )}
      </div>

      {showEscalateForm && !escalated && (
        <div className="mt-3 pt-3 border-t border-line/60">
          <label className="label-text text-muted block mb-2">escalation note (optional)</label>
          <textarea
            value={escalationNote}
            onChange={(e) => setEscalationNote(e.target.value.slice(0, 280))}
            placeholder="why is this admin-only?"
            rows={2}
            className="w-full bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-3 py-2 outline-none transition-colors text-sm"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={escalate}
              disabled={pending}
              className="text-xs px-3 py-1.5 bg-gold text-canvas mono-text uppercase tracking-wider hover:opacity-90 transition disabled:opacity-30"
            >
              <FileText size={11} strokeWidth={2} className="inline -mt-0.5 mr-1" />
              send to admin
            </button>
            <button
              type="button"
              onClick={() => setShowEscalateForm(false)}
              className="text-xs px-3 py-1.5 border border-line text-muted"
            >
              cancel
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
