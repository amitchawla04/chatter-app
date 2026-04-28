"use client";

/**
 * Watch-Together presence indicator for /live/[id].
 * Heartbeat every 25s while the page is visible · sends DELETE on unmount.
 *
 * Pact alignment:
 *  - No engagement counts surfaced beyond a count of who's here NOW (not all-time).
 *  - No notifications or pings — purely passive presence.
 */

import { useEffect, useState } from "react";
import { useT } from "./I18nProvider";

type Viewer = {
  user_id: string;
  handle: string;
  is_charter: boolean;
  is_self: boolean;
};

interface WatchTogetherProps {
  eventId: string;
  isAuthed: boolean;
}

export function WatchTogether({ eventId, isAuthed }: WatchTogetherProps) {
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [count, setCount] = useState(0);
  const t = useT();

  useEffect(() => {
    if (!isAuthed) return;

    let stopped = false;

    const beat = async () => {
      try {
        const res = await fetch(`/api/live-events/${eventId}/heartbeat`, {
          method: "POST",
        });
        if (!res.ok) return;
        const json = (await res.json()) as { viewers: Viewer[]; count: number };
        if (!stopped) {
          setViewers(json.viewers);
          setCount(json.count);
        }
      } catch {
        // network blip — next tick will retry
      }
    };

    beat();
    const interval = setInterval(beat, 25_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Exit beacon — fires on tab close / navigation, more reliable than fetch DELETE on unmount
    const onUnload = () => {
      navigator.sendBeacon?.(`/api/live-events/${eventId}/heartbeat?op=leave`);
    };
    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      stopped = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
      onUnload();
      fetch(`/api/live-events/${eventId}/heartbeat`, { method: "DELETE" }).catch(
        () => {},
      );
    };
  }, [eventId, isAuthed]);

  if (!isAuthed) return null;
  if (count === 0) return null;

  const others = viewers.filter((v) => !v.is_self);

  return (
    <div className="px-5 py-3 border-b border-line bg-paper flex items-center gap-3">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red opacity-60" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red" />
      </span>
      <p className="mono-text text-[11px] text-ink">
        {t("live.watching_together")} · <span className="text-red">{count}</span>{" "}
        {count === 1 ? t("common.viewer_singular") : t("common.viewer_plural")}
        {others.length > 0 && (
          <>
            {" · "}
            <span className="text-muted">
              {others
                .slice(0, 4)
                .map((v) => `@${v.handle}${v.is_charter ? " ✦" : ""}`)
                .join(", ")}
              {others.length > 4 && ` +${others.length - 4} more`}
            </span>
          </>
        )}
      </p>
    </div>
  );
}
