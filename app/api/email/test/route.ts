/**
 * Founder-only test send — verifies the Resend chain end-to-end.
 *   POST /api/email/test?s=<BYPASS_SECRET>
 * Body: { to: "you@email.com", kind?: "welcome"|"pass"|"thread"|"charter"|"correction" }
 *
 * Returns { ok, id } from Resend on success.
 */
import { NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendPassReceivedEmail,
  sendThreadInvitedEmail,
  sendCharterRedemptionEmail,
  sendCorrectionEmail,
} from "@/lib/email";

const BYPASS_SECRET = process.env.BYPASS_SECRET ?? "chatter-2026-04-28-temp";
const SITE = "https://chatter.today";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("s");
  if (secret !== BYPASS_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { to?: string; kind?: string };
  const to = body.to;
  const kind = body.kind ?? "welcome";
  if (!to) return NextResponse.json({ error: "to required" }, { status: 400 });

  let result;
  switch (kind) {
    case "welcome":
      result = await sendWelcomeEmail({
        to,
        displayName: "Test User",
        handle: "testhandle",
        isCharter: false,
      });
      break;
    case "charter":
      result = await sendCharterRedemptionEmail({ to, handle: "testhandle" });
      break;
    case "pass":
      result = await sendPassReceivedEmail({
        to,
        fromHandle: "ashburton89",
        whisperExcerpt:
          "Saw Arteta's pre-match notes at Colney this morning. Saliba is definitely out tomorrow regardless of what the club says publicly.",
        note: "thought you'd want to see this before the lineup posts",
        whisperUrl: `${SITE}/w/00000000-0000-0000-0000-000000000001`,
      });
      break;
    case "thread":
      result = await sendThreadInvitedEmail({
        to,
        fromHandle: "setpiecestan",
        threadName: "set-piece nerds",
        threadUrl: `${SITE}/v/test-thread-id`,
        topicName: "Arsenal",
      });
      break;
    case "correction":
      result = await sendCorrectionEmail({
        to,
        insiderHandle: "setpiecestan",
        insiderTag: "arsenal coach 2019-23",
        correctionText:
          "I worked the set-piece room 2019-23. Saliba is in the day-of squad list. He's playing.",
        whisperUrl: `${SITE}/w/00000000-0000-0000-0000-000000000001`,
      });
      break;
    default:
      return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  }

  return NextResponse.json(result);
}
