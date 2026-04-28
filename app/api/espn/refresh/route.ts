/**
 * ESPN scoreboard refresh — pulls live scores from ESPN's free public API
 * and updates `live_events` rows where team labels match.
 *
 * Trigger: hit this endpoint manually OR via cron (Vercel Cron Jobs).
 * Path: POST /api/espn/refresh?s=<BYPASS_SECRET>
 *   ?league=epl|ucl|nba|nfl  (omit = refresh all)
 */
import { NextResponse } from "next/server";
import { refreshScoreboard, refreshAllScoreboards } from "@/lib/espn";

const BYPASS_SECRET = process.env.BYPASS_SECRET ?? "chatter-2026-04-28-temp";
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("s") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  // Allow either BYPASS_SECRET (founder-manual) or CRON_SECRET (Vercel Cron)
  if (secret !== BYPASS_SECRET && secret !== CRON_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const league = url.searchParams.get("league");
  if (league) {
    const result = await refreshScoreboard(league as never);
    return NextResponse.json({ ok: true, league, ...result });
  }
  const all = await refreshAllScoreboards();
  return NextResponse.json({ ok: true, all });
}

export async function GET(req: Request) {
  return POST(req);
}
