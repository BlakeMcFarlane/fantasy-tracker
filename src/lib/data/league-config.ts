/**
 * Static facts about the league that ESPN does not know about (money, house
 * rules, branding). Everything here is data — edit this file to change what
 * the app shows, not the components.
 */

export const LEAGUE_BRAND = {
  name: "Chase & Champions",
  wordmarkTop: "CHASE",
  wordmarkBottom: "& CHAMPIONS",
  season: 2026,
  tagline: "2026 Fantasy Football League",
  /** Used for the browser tab, share cards, and the League page header. */
  blurb:
    "Fourteen friends, one trophy, and a whole lot of talking. Everything you need for the season lives right here.",
} as const;

export const LEAGUE_MONEY = {
  teamCount: 14,
  buyIn: 20,
  winnerPrize: 260,
  currency: "USD",
  /** Set to a string once decided; `null` renders as "TBD". */
  forfeit: null as string | null,
  runnerUpPrize: null as number | null,
} as const;

export interface LeagueRule {
  id: string;
  label: string;
  value: string;
  detail?: string;
  emphasis?: boolean;
}

export const LEAGUE_RULES: LeagueRule[] = [
  {
    id: "teams",
    label: "League size",
    value: "14 teams",
    detail: "Everyone plays every week — no byes in the regular season.",
  },
  {
    id: "buy-in",
    label: "Buy-in",
    value: "$20 per team",
    detail: "Due before the draft on September 5.",
  },
  {
    id: "prize",
    label: "Winner takes",
    value: "$260",
    detail: "Champion of the 2026 season takes the whole pot.",
    emphasis: true,
  },
  {
    id: "forfeit",
    label: "Forfeit / punishment",
    value: "TBD",
    detail: "Still being decided. Suggestions welcome — and encouraged.",
  },
];

/**
 * Timezone used to interpret the league's calendar. Events are stored with an
 * explicit UTC offset so countdowns work no matter where someone opens the app.
 */
/**
 * Set once someone has actually won a season — the app then shows a
 * "Defending Champion" badge next to their team wherever it appears.
 * Match on owner name (case-insensitive) or exact team name.
 */
export const DEFENDING_CHAMPION: {
  owner: string | null;
  teamName: string | null;
  season: number | null;
} = {
  owner: null,
  teamName: null,
  season: null,
};

export function isDefendingChampion(
  teamName: string,
  owner: string | null,
): boolean {
  const { owner: championOwner, teamName: championTeam } = DEFENDING_CHAMPION;
  if (!championOwner && !championTeam) return false;
  if (championTeam && championTeam.toLowerCase() === teamName.toLowerCase()) {
    return true;
  }
  if (championOwner && owner && championOwner.toLowerCase() === owner.toLowerCase()) {
    return true;
  }
  return false;
}

export const LEAGUE_TIMEZONE = "America/New_York";

export const LEAGUE_LINKS = {
  espnLeagueUrl:
    process.env.NEXT_PUBLIC_ESPN_LEAGUE_URL ?? null,
} as const;
