"use client";

import { useState, useTransition } from "react";
import { unblockUser } from "@/lib/trust-actions";

interface BlockedUser {
  userId: string;
  handle: string;
  displayName: string;
}

export function BlockedUsersList({ initial }: { initial: BlockedUser[] }) {
  const [blocked, setBlocked] = useState(initial);
  const [pending, startTransition] = useTransition();

  function handleUnblock(userId: string) {
    if (!confirm("Unblock this account? Their whispers will appear again.")) return;
    startTransition(async () => {
      const result = await unblockUser(userId);
      if (result.ok) setBlocked((prev) => prev.filter((b) => b.userId !== userId));
    });
  }

  if (blocked.length === 0) {
    return <p className="text-muted text-xs italic">no blocked accounts</p>;
  }

  return (
    <ul className="space-y-2">
      {blocked.map((b) => (
        <li
          key={b.userId}
          className="flex items-center justify-between border border-line bg-paper px-4 py-3"
        >
          <div>
            <p className="text-ink mono-text text-sm">@{b.handle}</p>
            {b.displayName && <p className="text-muted text-xs mt-0.5">{b.displayName}</p>}
          </div>
          <button
            type="button"
            onClick={() => handleUnblock(b.userId)}
            disabled={pending}
            className="mono-text uppercase tracking-wider text-[11px] text-muted hover:text-red transition disabled:opacity-50"
          >
            Unblock
          </button>
        </li>
      ))}
    </ul>
  );
}
