/**
 * The `espn-fantasy-football-api` package ships without types. This declares
 * only the surface the app uses (see `lib/espn/package-client.ts`).
 */
declare module "espn-fantasy-football-api/node" {
  export interface ClientOptions {
    leagueId: number;
  }

  export interface Cookies {
    espnS2: string;
    SWID: string;
  }

  export interface PackageTeam {
    id: number;
    abbreviation: string;
    name: string;
    ownerName: string | null;
    logoURL: string | null;
    wins: number;
    losses: number;
    ties: number;
    totalPointsScored: number;
    regularSeasonPointsFor: number;
    regularSeasonPointsAgainst: number;
    winningPercentage: number;
    playoffSeed: number;
    finalStandingsPosition: number;
    roster: unknown[];
  }

  export interface PackageLeague {
    name: string;
    size: number;
    isPublic: boolean;
    currentMatchupPeriodId: number;
    currentScoringPeriodId: number;
    draftSettings: Record<string, unknown>;
    rosterSettings: Record<string, unknown>;
    scheduleSettings: Record<string, unknown>;
    scoringSettings: Record<string, unknown>;
  }

  export interface PackageBoxscorePlayer {
    id: number;
    fullName: string;
    proTeamAbbreviation: string | null;
    defaultPosition: string;
    rosteredPosition: string;
    injuryStatus: string | null;
    totalPoints: number;
    projectedPointBreakdown: Record<string, number>;
  }

  export interface PackageBoxscore {
    homeScore: number;
    homeProjectedScore: number;
    homeTeamId: number;
    homeRoster: PackageBoxscorePlayer[];
    awayScore: number;
    awayProjectedScore: number;
    awayTeamId: number;
    awayRoster: PackageBoxscorePlayer[];
  }

  export interface PackageDraftPlayer {
    id: number;
    fullName: string;
    teamId: number;
    overallPickNumber: number;
    roundNumber: number;
    roundPickNumber: number;
  }

  export class Client {
    constructor(options: ClientOptions);
    setCookies(cookies: Cookies): void;
    getLeagueInfo(options: { seasonId: number }): Promise<PackageLeague>;
    getTeamsAtWeek(options: {
      seasonId: number;
      scoringPeriodId: number;
    }): Promise<PackageTeam[]>;
    getBoxscoreForWeek(options: {
      seasonId: number;
      matchupPeriodId: number;
      scoringPeriodId: number;
    }): Promise<PackageBoxscore[]>;
    getDraftInfo(options: {
      seasonId: number;
      scoringPeriodId?: number;
    }): Promise<PackageDraftPlayer[]>;
  }
}
