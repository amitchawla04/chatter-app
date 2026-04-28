/**
 * Next.js instrumentation hook — runs once at server startup.
 * Lightweight observability without bringing in Sentry SDK weight.
 *
 * For production: drop in @sentry/nextjs and replace registerLogger() with
 * Sentry.init({ dsn: process.env.SENTRY_DSN }). The shape is the same.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    registerLogger();
  }
}

function registerLogger() {
  // Wrap unhandledRejection + uncaughtException with structured logs.
  // These show up in Vercel logs and can be queried.
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
  });

  console.log(
    JSON.stringify({
      level: "info",
      type: "boot",
      message: "chatter instrumentation registered",
      timestamp: new Date().toISOString(),
      env: process.env.VERCEL_ENV ?? "unknown",
    }),
  );
}

/**
 * Public helper for application code to log structured errors.
 * import { logError } from "@/instrumentation"; logError("compose_failed", err, { whisperId });
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
}
