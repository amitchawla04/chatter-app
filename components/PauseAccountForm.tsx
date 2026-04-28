"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePause } from "@/app/settings/account/actions";

export function PauseAccountForm({ paused }: { paused: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      await togglePause(!paused);
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={submit}
      disabled={pending}
      className={paused ? "btn-primary inline-flex" : "btn-secondary inline-flex"}
    >
      {pending ? "…" : paused ? "reactivate" : "pause"}
    </button>
  );
}
