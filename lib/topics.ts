// Chatter seed topics — Soccer / World Cup 2026 wedge launch set
// All teams qualified for FIFA World Cup 2026 (48 teams) + top 20 Premier League clubs
// Plus breakout players as "person" topics

export interface Topic {
  id: string;
  name: string;
  slug: string;
  type: "team" | "league" | "player" | "event" | "competition";
  emoji?: string;
  country_code?: string;
  description?: string;
}

// ──────────────────────────────────────────────────────
// COMPETITIONS & EVENTS
// ──────────────────────────────────────────────────────
export const competitionTopics: Topic[] = [
  {
    id: "world-cup-2026",
    name: "FIFA World Cup 2026",
    slug: "world-cup-2026",
    type: "event",
    emoji: "🏆",
    description: "48 teams. USA, Canada, Mexico. June 11 – July 19, 2026.",
  },
  {
    id: "premier-league",
    name: "Premier League",
    slug: "premier-league",
    type: "competition",
    emoji: "⚽",
    country_code: "GB",
    description: "England's top division.",
  },
  {
    id: "ucl",
    name: "UEFA Champions League",
    slug: "ucl",
    type: "competition",
    emoji: "🏆",
    description: "Europe's biggest club competition.",
  },
  {
    id: "uel",
    name: "UEFA Europa League",
    slug: "uel",
    type: "competition",
    emoji: "🥈",
  },
  {
    id: "la-liga",
    name: "La Liga",
    slug: "la-liga",
    type: "competition",
    emoji: "⚽",
    country_code: "ES",
  },
  {
    id: "serie-a",
    name: "Serie A",
    slug: "serie-a",
    type: "competition",
    emoji: "⚽",
    country_code: "IT",
  },
  {
    id: "bundesliga",
    name: "Bundesliga",
    slug: "bundesliga",
    type: "competition",
    emoji: "⚽",
    country_code: "DE",
  },
  {
    id: "ligue-1",
    name: "Ligue 1",
    slug: "ligue-1",
    type: "competition",
    emoji: "⚽",
    country_code: "FR",
  },
  {
    id: "mls",
    name: "Major League Soccer",
    slug: "mls",
    type: "competition",
    emoji: "⚽",
    country_code: "US",
  },
  {
    id: "isl",
    name: "Indian Super League",
    slug: "isl",
    type: "competition",
    emoji: "⚽",
    country_code: "IN",
  },
];

// ──────────────────────────────────────────────────────
// WORLD CUP 2026 NATIONAL TEAMS (48)
// ──────────────────────────────────────────────────────
export const worldCupTeams: Topic[] = [
  // Hosts
  { id: "nt-usa", name: "USA", slug: "nt-usa", type: "team", emoji: "🇺🇸", country_code: "US" },
  { id: "nt-canada", name: "Canada", slug: "nt-canada", type: "team", emoji: "🇨🇦", country_code: "CA" },
  { id: "nt-mexico", name: "Mexico", slug: "nt-mexico", type: "team", emoji: "🇲🇽", country_code: "MX" },
  // UEFA (Europe) — top seeds
  { id: "nt-england", name: "England", slug: "nt-england", type: "team", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", country_code: "GB" },
  { id: "nt-france", name: "France", slug: "nt-france", type: "team", emoji: "🇫🇷", country_code: "FR" },
  { id: "nt-spain", name: "Spain", slug: "nt-spain", type: "team", emoji: "🇪🇸", country_code: "ES" },
  { id: "nt-germany", name: "Germany", slug: "nt-germany", type: "team", emoji: "🇩🇪", country_code: "DE" },
  { id: "nt-portugal", name: "Portugal", slug: "nt-portugal", type: "team", emoji: "🇵🇹", country_code: "PT" },
  { id: "nt-netherlands", name: "Netherlands", slug: "nt-netherlands", type: "team", emoji: "🇳🇱", country_code: "NL" },
  { id: "nt-italy", name: "Italy", slug: "nt-italy", type: "team", emoji: "🇮🇹", country_code: "IT" },
  { id: "nt-belgium", name: "Belgium", slug: "nt-belgium", type: "team", emoji: "🇧🇪", country_code: "BE" },
  { id: "nt-croatia", name: "Croatia", slug: "nt-croatia", type: "team", emoji: "🇭🇷", country_code: "HR" },
  { id: "nt-switzerland", name: "Switzerland", slug: "nt-switzerland", type: "team", emoji: "🇨🇭", country_code: "CH" },
  { id: "nt-denmark", name: "Denmark", slug: "nt-denmark", type: "team", emoji: "🇩🇰", country_code: "DK" },
  { id: "nt-austria", name: "Austria", slug: "nt-austria", type: "team", emoji: "🇦🇹", country_code: "AT" },
  { id: "nt-turkey", name: "Turkey", slug: "nt-turkey", type: "team", emoji: "🇹🇷", country_code: "TR" },
  // CONMEBOL (South America)
  { id: "nt-argentina", name: "Argentina", slug: "nt-argentina", type: "team", emoji: "🇦🇷", country_code: "AR" },
  { id: "nt-brazil", name: "Brazil", slug: "nt-brazil", type: "team", emoji: "🇧🇷", country_code: "BR" },
  { id: "nt-uruguay", name: "Uruguay", slug: "nt-uruguay", type: "team", emoji: "🇺🇾", country_code: "UY" },
  { id: "nt-colombia", name: "Colombia", slug: "nt-colombia", type: "team", emoji: "🇨🇴", country_code: "CO" },
  { id: "nt-ecuador", name: "Ecuador", slug: "nt-ecuador", type: "team", emoji: "🇪🇨", country_code: "EC" },
  { id: "nt-paraguay", name: "Paraguay", slug: "nt-paraguay", type: "team", emoji: "🇵🇾", country_code: "PY" },
  // CAF (Africa)
  { id: "nt-morocco", name: "Morocco", slug: "nt-morocco", type: "team", emoji: "🇲🇦", country_code: "MA" },
  { id: "nt-senegal", name: "Senegal", slug: "nt-senegal", type: "team", emoji: "🇸🇳", country_code: "SN" },
  { id: "nt-nigeria", name: "Nigeria", slug: "nt-nigeria", type: "team", emoji: "🇳🇬", country_code: "NG" },
  { id: "nt-egypt", name: "Egypt", slug: "nt-egypt", type: "team", emoji: "🇪🇬", country_code: "EG" },
  { id: "nt-algeria", name: "Algeria", slug: "nt-algeria", type: "team", emoji: "🇩🇿", country_code: "DZ" },
  { id: "nt-ghana", name: "Ghana", slug: "nt-ghana", type: "team", emoji: "🇬🇭", country_code: "GH" },
  { id: "nt-ivory-coast", name: "Ivory Coast", slug: "nt-ivory-coast", type: "team", emoji: "🇨🇮", country_code: "CI" },
  { id: "nt-tunisia", name: "Tunisia", slug: "nt-tunisia", type: "team", emoji: "🇹🇳", country_code: "TN" },
  { id: "nt-cameroon", name: "Cameroon", slug: "nt-cameroon", type: "team", emoji: "🇨🇲", country_code: "CM" },
  // AFC (Asia)
  { id: "nt-japan", name: "Japan", slug: "nt-japan", type: "team", emoji: "🇯🇵", country_code: "JP" },
  { id: "nt-south-korea", name: "South Korea", slug: "nt-south-korea", type: "team", emoji: "🇰🇷", country_code: "KR" },
  { id: "nt-iran", name: "Iran", slug: "nt-iran", type: "team", emoji: "🇮🇷", country_code: "IR" },
  { id: "nt-australia", name: "Australia", slug: "nt-australia", type: "team", emoji: "🇦🇺", country_code: "AU" },
  { id: "nt-saudi-arabia", name: "Saudi Arabia", slug: "nt-saudi-arabia", type: "team", emoji: "🇸🇦", country_code: "SA" },
  { id: "nt-qatar", name: "Qatar", slug: "nt-qatar", type: "team", emoji: "🇶🇦", country_code: "QA" },
  { id: "nt-uae", name: "UAE", slug: "nt-uae", type: "team", emoji: "🇦🇪", country_code: "AE" },
  { id: "nt-uzbekistan", name: "Uzbekistan", slug: "nt-uzbekistan", type: "team", emoji: "🇺🇿", country_code: "UZ" },
  { id: "nt-jordan", name: "Jordan", slug: "nt-jordan", type: "team", emoji: "🇯🇴", country_code: "JO" },
  // CONCACAF (N. America / Caribbean / Central)
  { id: "nt-costa-rica", name: "Costa Rica", slug: "nt-costa-rica", type: "team", emoji: "🇨🇷", country_code: "CR" },
  { id: "nt-panama", name: "Panama", slug: "nt-panama", type: "team", emoji: "🇵🇦", country_code: "PA" },
  { id: "nt-jamaica", name: "Jamaica", slug: "nt-jamaica", type: "team", emoji: "🇯🇲", country_code: "JM" },
  { id: "nt-honduras", name: "Honduras", slug: "nt-honduras", type: "team", emoji: "🇭🇳", country_code: "HN" },
  // OFC
  { id: "nt-new-zealand", name: "New Zealand", slug: "nt-new-zealand", type: "team", emoji: "🇳🇿", country_code: "NZ" },
  // Intercontinental play-off winners — placeholder
  { id: "nt-playoff-1", name: "Playoff Winner 1", slug: "nt-playoff-1", type: "team", emoji: "⚽" },
  { id: "nt-playoff-2", name: "Playoff Winner 2", slug: "nt-playoff-2", type: "team", emoji: "⚽" },
  { id: "nt-playoff-3", name: "Playoff Winner 3", slug: "nt-playoff-3", type: "team", emoji: "⚽" },
];

// ──────────────────────────────────────────────────────
// PREMIER LEAGUE CLUBS (20)
// ──────────────────────────────────────────────────────
export const premierLeagueClubs: Topic[] = [
  { id: "epl-arsenal", name: "Arsenal", slug: "arsenal", type: "team", emoji: "🔴", country_code: "GB" },
  { id: "epl-aston-villa", name: "Aston Villa", slug: "aston-villa", type: "team", emoji: "🟣", country_code: "GB" },
  { id: "epl-bournemouth", name: "Bournemouth", slug: "bournemouth", type: "team", emoji: "🔴", country_code: "GB" },
  { id: "epl-brentford", name: "Brentford", slug: "brentford", type: "team", emoji: "🐝", country_code: "GB" },
  { id: "epl-brighton", name: "Brighton", slug: "brighton", type: "team", emoji: "🔵", country_code: "GB" },
  { id: "epl-chelsea", name: "Chelsea", slug: "chelsea", type: "team", emoji: "🔵", country_code: "GB" },
  { id: "epl-crystal-palace", name: "Crystal Palace", slug: "crystal-palace", type: "team", emoji: "🦅", country_code: "GB" },
  { id: "epl-everton", name: "Everton", slug: "everton", type: "team", emoji: "🔵", country_code: "GB" },
  { id: "epl-fulham", name: "Fulham", slug: "fulham", type: "team", emoji: "⚫", country_code: "GB" },
  { id: "epl-leeds", name: "Leeds United", slug: "leeds", type: "team", emoji: "⚪", country_code: "GB" },
  { id: "epl-leicester", name: "Leicester City", slug: "leicester", type: "team", emoji: "🦊", country_code: "GB" },
  { id: "epl-liverpool", name: "Liverpool", slug: "liverpool", type: "team", emoji: "🔴", country_code: "GB" },
  { id: "epl-man-city", name: "Manchester City", slug: "man-city", type: "team", emoji: "🩵", country_code: "GB" },
  { id: "epl-man-united", name: "Manchester United", slug: "man-united", type: "team", emoji: "🔴", country_code: "GB" },
  { id: "epl-newcastle", name: "Newcastle United", slug: "newcastle", type: "team", emoji: "⚫", country_code: "GB" },
  { id: "epl-nottingham-forest", name: "Nottingham Forest", slug: "nottingham-forest", type: "team", emoji: "🌳", country_code: "GB" },
  { id: "epl-tottenham", name: "Tottenham Hotspur", slug: "tottenham", type: "team", emoji: "🐓", country_code: "GB" },
  { id: "epl-west-ham", name: "West Ham United", slug: "west-ham", type: "team", emoji: "🔴", country_code: "GB" },
  { id: "epl-wolves", name: "Wolverhampton Wanderers", slug: "wolves", type: "team", emoji: "🐺", country_code: "GB" },
  { id: "epl-southampton", name: "Southampton", slug: "southampton", type: "team", emoji: "⚪", country_code: "GB" },
];

// ──────────────────────────────────────────────────────
// BREAKOUT PLAYERS (Person topics)
// ──────────────────────────────────────────────────────
export const breakoutPlayers: Topic[] = [
  { id: "p-lamine-yamal", name: "Lamine Yamal", slug: "lamine-yamal", type: "player", emoji: "⚡" },
  { id: "p-jude-bellingham", name: "Jude Bellingham", slug: "jude-bellingham", type: "player", emoji: "⚡" },
  { id: "p-erling-haaland", name: "Erling Haaland", slug: "erling-haaland", type: "player", emoji: "⚡" },
  { id: "p-kylian-mbappe", name: "Kylian Mbappé", slug: "kylian-mbappe", type: "player", emoji: "⚡" },
  { id: "p-vinicius-jr", name: "Vinicius Jr", slug: "vinicius-jr", type: "player", emoji: "⚡" },
  { id: "p-bukayo-saka", name: "Bukayo Saka", slug: "bukayo-saka", type: "player", emoji: "⚡" },
  { id: "p-rodri", name: "Rodri", slug: "rodri", type: "player", emoji: "⚡" },
  { id: "p-pedri", name: "Pedri", slug: "pedri", type: "player", emoji: "⚡" },
  { id: "p-jamal-musiala", name: "Jamal Musiala", slug: "jamal-musiala", type: "player", emoji: "⚡" },
  { id: "p-florian-wirtz", name: "Florian Wirtz", slug: "florian-wirtz", type: "player", emoji: "⚡" },
];

export const allSeedTopics: Topic[] = [
  ...competitionTopics,
  ...worldCupTeams,
  ...premierLeagueClubs,
  ...breakoutPlayers,
];

export const totalSeedTopics = allSeedTopics.length;
