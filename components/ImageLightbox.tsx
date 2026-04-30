"use client";

/**
 * ImageLightbox — fullscreen image viewer with pinch-zoom + drag-to-dismiss (IP3).
 * - Tap image in WhisperCard → opens lightbox
 * - Pinch / wheel to zoom (1× → 4×)
 * - Drag down to dismiss when at 1×
 * - Escape closes
 */

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export function ImageLightbox({ url, onClose }: { url: string; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const pinchStart = useRef<{ d: number; s: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.max(1, Math.min(4, s - e.deltaY * 0.005)));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchStart.current = { d, s: scale };
    } else if (e.touches.length === 1 && scale === 1) {
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStart.current) {
      const [a, b] = [e.touches[0], e.touches[1]];
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const next = pinchStart.current.s * (d / pinchStart.current.d);
      setScale(Math.max(1, Math.min(4, next)));
    } else if (e.touches.length === 1 && dragStart.current && scale === 1) {
      const dy = e.touches[0].clientY - dragStart.current.y;
      const dx = e.touches[0].clientX - dragStart.current.x;
      setOffset({ x: dx, y: dy });
    }
  };
  const onTouchEnd = () => {
    if (dragStart.current && Math.abs(offset.y) > 120) onClose();
    dragStart.current = null;
    pinchStart.current = null;
    setOffset({ x: 0, y: 0 });
  };

  const overlayOpacity = Math.max(0.4, 1 - Math.abs(offset.y) / 400);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      className="fixed inset-0 z-[100] flex items-center justify-center select-none"
      style={{ background: `rgba(10,10,10,${overlayOpacity})` }}
      onClick={onClose}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-canvas/20 backdrop-blur-sm text-paper flex items-center justify-center hover:bg-canvas/30 transition"
        aria-label="Close"
      >
        <X size={20} strokeWidth={1.5} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setScale((s) => (s > 1 ? 1 : 2));
        }}
        className="max-w-[96vw] max-h-[92vh] object-contain transition-transform"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          touchAction: "none",
        }}
        draggable={false}
      />
      {scale > 1 && (
        <span className="absolute bottom-6 left-1/2 -translate-x-1/2 mono-text text-[10px] text-paper/70 bg-canvas/20 backdrop-blur-sm px-3 py-1 rounded-full">
          {scale.toFixed(1)}× · double-tap to reset
        </span>
      )}
    </div>
  );
}
