"use client";

import { useEffect, useState } from "react";
import { X, Share, Plus } from "lucide-react";

const DISMISSED_KEY = "chatter:ios-install-dismissed-at";
const COOLDOWN_DAYS = 14;

/**
 * Shows a single-line nudge on iOS Safari when the user is NOT in standalone PWA mode.
 * Dismissable; stays dismissed for COOLDOWN_DAYS so we don't nag.
 * Renders nothing on Android, desktop, or when already installed.
 */
export function IOSInstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    if (!isIOS) return;

    // Already installed → window is in standalone display mode
    const isStandalone =
      "standalone" in window.navigator
        ? Boolean((window.navigator as { standalone?: boolean }).standalone)
        : window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    // Cooldown
    try {
      const dismissedAt = window.localStorage.getItem(DISMISSED_KEY);
      if (dismissedAt) {
        const ageMs = Date.now() - Number(dismissedAt);
        if (ageMs < COOLDOWN_DAYS * 24 * 60 * 60 * 1000) return;
      }
    } catch {
      // localStorage may be blocked; show anyway
    }

    setShow(true);
  }, []);

  if (!show) return null;

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setShow(false);
  }

  return (
    <div
      role="status"
      className="sticky top-0 z-50 bg-ink text-canvas border-b border-gold px-4 py-2 flex items-center gap-2 text-xs mono-text"
    >
      <span className="flex-1 leading-snug">
        For the full Chatter feel on iPhone: tap{" "}
        <Share size={12} strokeWidth={2} className="inline -mt-0.5 mx-0.5" />
        then{" "}
        <Plus size={12} strokeWidth={2} className="inline -mt-0.5 mx-0.5" />
        Add to Home Screen.
      </span>
      <button
        type="button"
        onClick={dismiss}
        className="text-canvas/60 hover:text-canvas transition flex-shrink-0"
        aria-label="dismiss install hint"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}
