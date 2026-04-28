"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { redeemBetaCode } from "@/app/onboard/beta/actions";

export function BetaCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await redeemBetaCode(code.trim().toUpperCase());
      if (!res.ok) {
        setError(res.error ?? "invalid code");
        return;
      }
      router.push(res.next ?? "/auth/sign-in");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label htmlFor="code" className="label-text text-muted block mb-2">
          invite code
        </label>
        <input
          id="code"
          type="text"
          autoFocus
          autoCapitalize="characters"
          autoComplete="off"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 24))}
          placeholder="CHTR-XXXX-XXXX"
          className="w-full bg-transparent border border-line focus:border-red text-ink placeholder-muted-soft px-4 py-3 outline-none transition-colors mono-text text-lg tracking-widest"
        />
      </div>

      <button
        type="submit"
        disabled={pending || !code.trim()}
        className="btn-primary w-full justify-center"
      >
        {pending ? "redeeming…" : "redeem & sign in"}
        {!pending && <span>→</span>}
      </button>

      {error && <p className="text-warn text-sm">{error}</p>}
    </form>
  );
}
