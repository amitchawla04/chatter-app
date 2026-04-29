/**
 * Sentry client init — runs in the browser.
 * Captures unhandled errors, console errors, network failures.
 * Replays disabled by default (privacy) — Pact 2: your data stays yours.
 */
import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
    // Tracing — sample 10% of transactions to keep cost low
    tracesSampleRate: 0.1,
    // No session replays — Pact 2 (your data stays yours).
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    // Filter low-signal errors
    beforeSend(event, hint) {
      const err = hint.originalException;
      if (err instanceof Error) {
        const msg = err.message ?? "";
        // Browser-extension noise
        if (msg.includes("ResizeObserver loop")) return null;
        if (msg.includes("Non-Error promise rejection captured")) return null;
        if (msg.includes("Network request failed")) return null;
      }
      return event;
    },
  });
}
