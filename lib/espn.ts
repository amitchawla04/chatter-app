import "server-only";
/**
 * ESPN public scoreboard fetcher.
 * Pulls free, no-auth scores from ESPN's public site API. Maps results to
 * Chatter's `live_events` rows by team-label fuzzy match.
 *
 * Endpoint shapes vary slightly per sport. For now we support soccer (EPL/UCL),
 * NBA, and NFL. Add more by extending SCOREBOARDS.
 *
 * Founder call this via /api/espn/refresh or cron. NOT called on /live page
 * render — keeps Match Day decoupled from ESPN uptime.
 */
import { createAdminClient } from "@/lib/supabase/admin";

const SCOREBOARDS: Record<string, string> = {
  "epl": "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard",
  "ucl": "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard",
  "uel": "https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.europa/scoreboard",
  "la-liga": "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard",
  "serie-a": "https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard",
  "nba": "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
  "nfl": "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
};

interface ESPNEvent {
  id: string;
  name: string;
  shortName: string;
  status: { type: { state: string; completed: boolean; description: string } };
  competitions: Array<{
    competitors: Array<{
      homeAway: "home" | "away";
      team: { displayName: string; shortDisplayName: string; abbreviation: string };
      score: string;
    }>;
    status?: { displayClock?: string; period?: number };
  }>;
}

export async function refreshScoreboard(league: keyof typeof SCOREBOARDS): Promise<{
  events_seen: number;
  events_updated: number;
}> {
  const url = SCOREBOARDS[league];
  if (!url) return { events_seen: 0, events_updated: 0 };

  let body: { events?: ESPNEvent[] } | null = null;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { "User-Agent": "Chatter/1.0 (+https://chatter-ten-lemon.vercel.app)" },
    });
    if (!res.ok) return { events_seen: 0, events_updated: 0 };
    body = await res.json();
  } catch (err) {
    console.error("[espn] fetch failed", err);
    return { events_seen: 0, events_updated: 0 };
  }

  const events = body?.events ?? [];
  const admin = createAdminClient();

  let updated = 0;
  for (const e of events) {
    const comp = e.competitions?.[0];
    if (!comp) continue;

    const home = comp.competitors.find((c) => c.homeAway === "home");
    const away = comp.competitors.find((c) => c.homeAway === "away");
    if (!home || !away) continue;

    const homeLabel = home.team.shortDisplayName;
    const awayLabel = away.team.shortDisplayName;
    const homeScore = parseInt(home.score, 10);
    const awayScore = parseInt(away.score, 10);
    const minute = comp.status?.displayClock ?? null;

    const espnState = e.status.type.state.toLowerCase();
    const status =
      espnState === "in" || espnState === "live"
        ? "live"
        : e.status.type.completed
          ? "finished"
          : "scheduled";

    // Fuzzy-match against existing live_events rows by team labels (case-insensitive contains)
    const { data: matches } = await admin
      .from("live_events")
      .select("id, home_label, away_label")
      .ilike("home_label", `%${homeLabel.split(" ").pop()}%`)
      .ilike("away_label", `%${awayLabel.split(" ").pop()}%`);

    if (!matches || matches.length === 0) continue;

    const target = matches[0] as { id: string };
    await admin
      .from("live_events")
      .update({
        home_score: isNaN(homeScore) ? null : homeScore,
        away_score: isNaN(awayScore) ? null : awayScore,
        minute_label: minute,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", target.id);
    updated += 1;
  }

  return { events_seen: events.length, events_updated: updated };
}

export async function refreshAllScoreboards() {
  const results: Record<string, { events_seen: number; events_updated: number }> = {};
  for (const league of Object.keys(SCOREBOARDS)) {
    results[league] = await refreshScoreboard(league as keyof typeof SCOREBOARDS);
  }
  return results;
}
