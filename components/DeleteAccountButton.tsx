"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requestAccountDeletion } from "@/app/settings/account/actions";

export function DeleteAccountButton() {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "done">("idle");
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (confirmText.toLowerCase() !== "delete") {
      setError("type \"delete\" to confirm");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await requestAccountDeletion();
      if (!res.ok) {
        setError(res.error ?? "couldn't process");
        return;
      }
      setStep("done");
      setTimeout(() => router.push("/"), 2000);
    });
  };

  if (step === "done") {
    return (
      <p className="display-italic text-lg text-warn py-2">
        deletion requested. you have 30 days to undo.
      </p>
    );
  }

  if (step === "idle") {
    return (
      <button
        type="button"
        onClick={() => setStep("confirm")}
        className="inline-flex items-center gap-2 px-5 py-2.5 border border-warn text-warn hover:bg-warn hover:text-paper transition-colors text-sm"
      >
        <Trash2 size={16} strokeWidth={1.5} />
        delete my account
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="body-text text-sm text-ink">
        type <span className="mono-text text-warn font-medium">delete</span> to confirm
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        autoFocus
        className="w-full bg-transparent border border-warn focus:border-warn text-ink px-3 py-2 outline-none transition-colors mono-text"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setStep("idle");
            setConfirmText("");
            setError(null);
          }}
          className="btn-secondary flex-1 justify-center"
        >
          cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex flex-1 items-center justify-center gap-2 px-5 py-2.5 border border-warn bg-warn text-paper hover:bg-warn/90 transition-colors text-sm"
        >
          {pending ? "processing…" : "delete forever"}
        </button>
      </div>
      {error && <p className="text-warn text-xs">{error}</p>}
    </div>
  );
}
