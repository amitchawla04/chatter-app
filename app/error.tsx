"use client";

/**
 * Global error boundary — renders when an uncaught error is thrown by any
 * server component or route segment under app/. Replaces the default
 * Next.js error page with the Chatter register.
 *
 * For the absolute-fallback case (root layout itself crashes),
 * see app/global-error.tsx.
 */

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to Vercel function logs / Sentry (when wired)
    console.error("[chatter:error]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <span
        className="block w-3 h-3 rounded-full bg-red mb-6"
        aria-hidden="true"
      />
      <h1 className="display-italic text-3xl sm:text-4xl text-ink mb-3 max-w-md">
        the line went quiet.
      </h1>
      <p className="body-text text-muted mb-8 max-w-sm">
        something on this page didn&rsquo;t answer. it&rsquo;s on us, not you.
        we&rsquo;ve been pinged. try again, or step back to the village.
      </p>
      {error.digest && (
        <p className="mono-text text-[10px] text-muted/70 mb-8">
          ref · {error.digest}
        </p>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-primary px-5 py-2.5"
        >
          try again
        </button>
        <Link href="/home" className="btn-secondary px-5 py-2.5">
          back to home
        </Link>
      </div>
    </main>
  );
}
