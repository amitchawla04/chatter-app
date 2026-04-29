/**
 * Founder-only Sentry verification endpoint.
 *   POST /api/sentry/test?s=<BYPASS_SECRET>
 * Throws an intentional error → Sentry should capture and surface it
 * in the project's Issues feed within ~10s.
 */
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

const BYPASS_SECRET = process.env.BYPASS_SECRET ?? "chatter-2026-04-28-temp";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("s");
  if (secret !== BYPASS_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const eventId = Sentry.captureMessage("chatter sentry test — manual founder verification", "info");
  // Also throw a real error to verify the catch chain
  try {
    throw new Error("chatter sentry test — intentional error from /api/sentry/test");
  } catch (err) {
    Sentry.captureException(err);
  }
  await Sentry.flush(3000);

  return NextResponse.json({
    ok: true,
    eventId,
    message: "check Sentry Issues feed",
    issuesUrl: "https://amits-org-cn.sentry.io/issues/",
  });
}
