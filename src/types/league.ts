/**
 * Domain types for the app. These are deliberately independent of ESPN's
 * response shapes — everything ESPN returns is normalised into these in
 * `lib/espn/transform.ts`, so swapping or extending the data source later
 * only touches the service layer.
 */

export type LeaguePhase =
  | "preseason" // league exists, draft has not happened
  | "drafting" // draft day
  | "regular" // regular season in progress
  | "playoffs"
  | "complete";

export type DataSource = "espn" | "demo" | "none";

export interface LeagueSettings {
  scoringFormat: string;
  /** Points awarded per catch. Drives the plain-English scoring explanation. */
  receptionPoints: number;
  draftType: string;
  draftDate: string | null;
  rosterSize: number;
  starterCount: number;
  benchCount: number;
  playoffTeamCount: number;
  playoffFormat: string;
  regularSeasonWeeks: number;
  tradeDeadline: string | null;
  waiverType: string;
  /** Hours a dropped player sits before anyone can claim them. */
  waiverHours: number | null;
  lineup: LineupSlotSummary[];
}

export interface LineupSlotSummary {
  slot: string;
  label: string;
  count: number;
}

export interface LeagueMeta {
  id: string;
  seasonId: number;
  name: string;
  size: number;
  isPublic: boolean;
  currentWeek: number;
  currentScoringPeriod: number;
  phase: LeaguePhase;
  hasDrafted: boolean;
  settings: LeagueSettings;
}

export interface Streak {
  type: "W" | "L";
  length: number;
}

export interface Team {
  id: number;
  name: string;
  abbrev: string;
  owner: string | null;
  logoUrl: string | null;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  rank: number;
  playoffSeed: number;
  streak: Streak | null;
  /** Stable index used to pick a fallback avatar gradient. */
  colorSeed: number;
}

export type Position = "QB" | "RB" | "WR" | "TE" | "K" | "DST" | "FLEX" | "BE" | "IR" | "UNKNOWN";

export interface RosterPlayer {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  position: Position;
  proTeam: string | null;
  headshotUrl: string | null;
  lineupSlot: string;
  isStarter: boolean;
  points: number | null;
  projected: number | null;
  injuryStatus: string | null;
}

export interface TeamRoster {
  teamId: number;
  week: number;
  starters: RosterPlayer[];
  bench: RosterPlayer[];
}

export type MatchupStatus = "upcoming" | "live" | "final";

export interface MatchupSide {
  teamId: number;
  score: number | null;
  projected: number | null;
}

export interface Matchup {
  id: string;
  week: number;
  home: MatchupSide;
  away: MatchupSide | null; // null === bye week
  status: MatchupStatus;
  isPlayoff: boolean;
}

/** Everything the UI needs, resolved once per request and cached. */
export interface LeagueBundle {
  source: DataSource;
  fetchedAt: string;
  error: string | null;
  meta: LeagueMeta | null;
  teams: Team[];
  matchups: Matchup[];
  rosters: TeamRoster[];
}

/* ---- Derived view models ------------------------------------------ */

export interface TeamHighlight {
  teamId: number;
  label: string;
  value: string;
  detail?: string;
}

export interface LeagueHighlights {
  topScorer: TeamHighlight | null;
  lowScorer: TeamHighlight | null;
  leader: TeamHighlight | null;
  biggestWin: (TeamHighlight & { opponentId: number }) | null;
  closestGame: {
    week: number;
    margin: number;
    winnerId: number;
    loserId: number;
  } | null;
}

export interface TeamSeasonStats {
  gamesPlayed: number;
  averagePoints: number | null;
  highWeek: { week: number; points: number } | null;
  lowWeek: { week: number; points: number } | null;
  totalPoints: number;
  winPct: number;
}
