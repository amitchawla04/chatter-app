"use client";

/**
 * LinkPreview — Open Graph preview card for the first URL in whisper body (IP2).
 *
 * Lightweight: parses og:title / og:description / og:image via a server route
 * (`/api/og-preview?u=`). Caches at the edge for 24h. If parse fails, just
 * renders the bare URL as a hairline link.
 */

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

interface OGData {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  host: string;
}

export function LinkPreview({ url }: { url: string }) {
  const [og, setOg] = useState<OGData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/og-preview?u=${encodeURIComponent(url)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: OGData) => {
        if (!cancelled) setOg(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (failed || !og || (!og.title && !og.description && !og.image)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer noopener"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center gap-1 mono-text text-[11px] text-blue underline hover:text-red transition-colors"
      >
        <ExternalLink size={11} strokeWidth={1.6} />
        {og?.host ?? new URL(url).host}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(e) => e.stopPropagation()}
      className="block border border-line bg-canvas mt-3 mb-3 hover:border-red/40 transition-colors group"
    >
      {og.image && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={og.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-40 object-cover border-b border-line"
        />
      )}
      <div className="p-3">
        <p className="mono-text text-[10px] uppercase tracking-wider text-muted truncate">
          {og.siteName ?? og.host}
        </p>
        {og.title && (
          <p className="text-ink text-sm font-medium leading-snug line-clamp-2 mt-0.5 group-hover:text-red transition-colors">
            {og.title}
          </p>
        )}
        {og.description && (
          <p className="text-muted text-xs leading-snug line-clamp-2 mt-1">
            {og.description}
          </p>
        )}
      </div>
    </a>
  );
}

/** Extract the first http(s) URL from a string, or null. */
export function firstUrl(text: string | null | undefined): string | null {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s)\]]+/i);
  return match ? match[0] : null;
}
