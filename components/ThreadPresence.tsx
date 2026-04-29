"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

interface Props {
  threadId: string;
  currentUserHandle: string;
  currentUserId: string;
}

interface PresenceMeta {
  user_id: string;
  handle: string;
  online_at: string;
}

/**
 * Realtime presence on a village thread — shows who is viewing right now.
 * Supabase Realtime presence channel keyed by thread.
 */
export function ThreadPresence({ threadId, currentUserHandle, currentUserId }: Props) {
  const [active, setActive] = useState<PresenceMeta[]>([]);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const supabase = createBrowserClient(url, key);
    const channel = supabase.channel(`thread-presence:${threadId}`, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceMeta>();
        const users: PresenceMeta[] = [];
        for (const key of Object.keys(state)) {
          const metas = state[key];
          if (metas && metas.length > 0) users.push(metas[0]);
        }
        setActive(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUserId,
            handle: currentUserHandle,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, currentUserHandle, currentUserId]);

  if (active.length === 0) return null;

  const others = active.filter((u) => u.user_id !== currentUserId);
  if (others.length === 0) {
    return (
      <div className="px-5 py-2 border-b border-line bg-paper flex items-center gap-2 text-xs mono-text text-muted">
        <Users size={12} strokeWidth={1.5} />
        <span>just you · room is quiet</span>
      </div>
    );
  }

  return (
    <div className="px-5 py-2 border-b border-line bg-paper flex items-center gap-2 text-xs mono-text">
      <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" aria-hidden="true" />
      <Users size={12} strokeWidth={1.5} className="text-muted" />
      <span className="text-ink">
        in the room ·{" "}
        {others
          .slice(0, 4)
          .map((u) => `@${u.handle}`)
          .join(" · ")}
        {others.length > 4 && ` · +${others.length - 4}`}
      </span>
    </div>
  );
}
