/**
 * Next.js instrumentation hook — runs once at server startup.
 * Wires Sentry for both Node.js and Edge runtimes, plus structured logs to
 * Vercel.
 */

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    registerLogger();
  } else if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Sentry's request-error hook — captures errors thrown in server components
// and route handlers
export const onRequestError = Sentry.captureRequestError;

function registerLogger() {
  // Wrap unhandledRejection + uncaughtException with structured logs.
  process.on("unhandledRejection", (reason: unknown) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    console.error(
      JSON.stringify({
        level: "error",
        type: "unhandled_rejection",
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      }),
    );
    Sentry.captureException(err);
  });

  process.on("uncaughtException", (err: Error) => {
    console.error(
      JSON.stringify({
        level: "fatal",
        type: "uncaught_exception",
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      }),
    );
    Sentry.captureException(err);
  });

  console.log(
    JSON.stringify({
      level: "info",
      type: "boot",
      message: "chatter instrumentation registered",
      sentry_enabled: Boolean(process.env.SENTRY_DSN),
      timestamp: new Date().toISOString(),
      env: process.env.VERCEL_ENV ?? "unknown",
    }),
  );
}

/**
 * Public helper for application code to log structured errors.
 */
export function logError(
  type: string,
  err: unknown,
  context: Record<string, unknown> = {},
) {
  const error = err instanceof Error ? err : new Error(String(err));
  console.error(
    JSON.stringify({
      level: "error",
      type,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    }),
  );
  Sentry.captureException(error, { tags: { type }, extra: context });
}
