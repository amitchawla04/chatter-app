"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyAge } from "@/app/onboarding/age/actions";

type Band = "under_13" | "13_17" | "18_plus";

export function AgeGateForm() {
  const router = useRouter();
  const [band, setBand] = useState<Band | null>(null);
  const [parentEmail, setParentEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!band) return;
    setError(null);
    startTransition(async () => {
      const res = await verifyAge({ band, parentEmail: parentEmail.trim() || undefined });
      if (!res.ok) {
        setError(res.error ?? "couldn't save.");
        return;
      }
      if (res.blocked) {
        router.push("/auth/sign-out");
        return;
      }
      router.push("/onboarding");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        {(
          [
            { v: "under_13" as const, label: "under 13" },
            { v: "13_17" as const, label: "13–17" },
            { v: "18_plus" as const, label: "18 or older" },
          ]
        ).map(({ v, label }) => (
          <button
            key={v}
            type="button"
            onClick={() => setBand(v)}
            data-selected={band === v}
            className={`w-full py-4 px-5 border text-left transition-colors ${
              band === v
                ? "border-gold bg-gold/5 text-ink"
                : "border-line text-ink/80 hover:border-line"
            }`}
          >
            <div className="display-italic text-xl">{label}</div>
          </button>
        ))}
      </div>

      {band === "13_17" && (
        <div className="pt-4 border-t border-line">
          <label htmlFor="pe" className="label-text text-muted block mb-2">
            parent / guardian email <span className="normal-case tracking-normal text-muted/60">(optional)</span>
          </label>
          <input
            id="pe"
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            placeholder="parent@email.com"
            className="w-full bg-transparent border border-line focus:border-gold text-ink placeholder-muted-soft px-4 py-3 outline-none transition-colors"
          />
          <p className="mono-text text-[11px] text-muted mt-2">
            we&rsquo;ll only email your parent if we need to reach them about safety.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={!band || pending}
        className="btn-primary w-full justify-center"
      >
        {pending ? "saving…" : "continue"}
        {!pending && <span>→</span>}
      </button>

      {error && <p className="text-warn text-sm">{error}</p>}
    </form>
  );
}
