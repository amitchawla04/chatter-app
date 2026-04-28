"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimHandle } from "@/app/onboarding/actions";

interface Props {
  initialHandle: string;
  initialDisplayName: string;
}

export function HandleClaimForm({ initialHandle, initialDisplayName }: Props) {
  const router = useRouter();
  const [handle, setHandle] = useState(initialHandle);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("handle", handle);
      fd.set("displayName", displayName);
      const res = await claimHandle(fd);
      if (!res.ok) {
        setError(res.error ?? "something went wrong");
        return;
      }
      router.push("/home");
    });
  };

  const valid = /^[a-z0-9_]{3,20}$/.test(handle);

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="label-text text-muted block mb-2" htmlFor="handle">
          your handle
        </label>
        <div className="flex items-center border border-line focus-within:border-gold transition-colors">
          <span className="pl-4 pr-0 py-3 text-muted text-lg">@</span>
          <input
            id="handle"
            type="text"
            value={handle}
            onChange={(e) =>
              setHandle(
                e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20),
              )
            }
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            className="flex-1 bg-transparent text-ink py-3 pr-4 outline-none text-lg font-medium"
            placeholder="your_handle"
          />
        </div>
        <p className="mono-text text-xs text-muted mt-2">
          3–20 characters · letters, numbers, underscore
        </p>
      </div>

      <div>
        <label className="label-text text-muted block mb-2" htmlFor="displayName">
          display name{" "}
          <span className="text-muted/60 normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value.slice(0, 60))}
          className="w-full bg-transparent border border-line focus:border-gold text-ink px-4 py-3 outline-none transition-colors"
          placeholder="e.g. Amit Chawla"
        />
      </div>

      <button
        type="submit"
        disabled={!valid || pending}
        className="btn-primary w-full justify-center"
      >
        {pending ? "claiming…" : `claim @${handle || "handle"}`}
        {!pending && <span>→</span>}
      </button>

      {error && <p className="text-warn text-sm">{error}</p>}
    </form>
  );
}
