"use client";

/**
 * Push notification permission UI — quiet, lives in /settings/notifications.
 * Per Pact: never auto-prompt, never push engagement metrics, only:
 *  - new pass received
 *  - your topic just went LIVE
 *  - someone vouched for you
 */
import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";

export function EnableNotifications() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setSupported(ok);
    if (ok) setPermission(Notification.permission);
  }, []);

  const enable = async () => {
    if (!supported) return;
    setSubscribing(true);
    try {
      // Register the service worker
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Ask permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setSubscribing(false);
        return;
      }

      // Subscribe — for now, we record the subscription server-side but don't send pushes.
      // Wiring real Web Push requires a VAPID keypair (Phase μ.next).
      const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (vapidPublic) {
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          applicationServerKey: urlBase64ToUint8Array(vapidPublic) as any,
        });
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub),
        });
      }
    } catch (e) {
      console.error("push enable failed", e);
    } finally {
      setSubscribing(false);
    }
  };

  if (!supported) {
    return (
      <div className="border border-line p-4 flex items-start gap-3">
        <BellOff size={20} strokeWidth={1.5} className="text-muted mt-0.5" />
        <div>
          <p className="text-ink text-sm">notifications not supported on this device</p>
          <p className="mono-text text-xs text-muted mt-1">
            iOS Safari · add chatter to home screen first → notifications work in standalone mode
          </p>
        </div>
      </div>
    );
  }

  if (permission === "granted") {
    return (
      <div className="border border-red bg-red-soft p-4 flex items-start gap-3">
        <Bell size={20} strokeWidth={1.5} className="text-red mt-0.5" />
        <div>
          <p className="text-ink text-sm">notifications on</p>
          <p className="mono-text text-xs text-muted mt-1">
            we'll only ping you for: new passes · your topic going live · someone vouching for you. nothing else.
          </p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="border border-line p-4 flex items-start gap-3">
        <BellOff size={20} strokeWidth={1.5} className="text-muted mt-0.5" />
        <div>
          <p className="text-ink text-sm">notifications blocked</p>
          <p className="mono-text text-xs text-muted mt-1">
            you turned them off in browser settings. open site settings to re-enable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={enable}
      disabled={subscribing}
      className="w-full border border-line hover:border-red hover:bg-red-soft transition-colors p-4 flex items-start gap-3 text-left"
    >
      <Bell size={20} strokeWidth={1.5} className="text-ink mt-0.5" />
      <div className="flex-1">
        <p className="text-ink text-sm">{subscribing ? "asking…" : "turn on notifications"}</p>
        <p className="mono-text text-xs text-muted mt-1">
          opt-in. we ping for passes + lives + vouches only. never engagement metrics.
        </p>
      </div>
    </button>
  );
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
