import "server-only";

import { cache } from "react";
import type { PackageTeam } from "espn-fantasy-football-api/node";

import type { LeagueBundle, LeagueMeta, Team } from "@/types/league";
import {
  REVALIDATE_SECONDS,
  readEspnConfig,
  useDemoData,
  type EspnConfig,
} from "./config";
import { fetchLeagueViews } from "./raw-client";
import type { RawLeagueResponse } from "./raw-types";
import {
  rankTeams,
  toLeagueMeta,
  toMatchups,
  toTeamRosters,
  toTeams,
} from "./transform";
import { getLeagueInfo } from "./package-client";
import { buildMockBundle, type MockPhase } from "./mock";
import { withTtl } from "./ttl-cache";

/**
 * The single entry point for league data.
 *
 * Everything the app renders comes from `getLeagueBundle()`. Components never
 * talk to ESPN directly. `cache()` dedupes the work within one render pass, and
 * the pages that call it set `revalidate`, so ESPN is hit at most once per
 * revalidation window rather than once per visitor.
 */

const LEAGUE_VIEWS = [
  "mSettings",
  "mTeam",
  "mRoster",
  "mMatchup",
  "mDraftDetail",
];

function emptyBundle(error: string | null): LeagueBundle {
  return {
    source: "none",
    fetchedAt: new Date().toISOString(),
    error,
    meta: null,
    teams: [],
    matchups: [],
    rosters: [],
  };
}

/**
 * Teams as modelled by the npm package. Preferred when available because it is
 * the maintained mapping of ESPN's shifting field names; the raw view is the
 * fallback and supplies streaks, which the package does not expose.
 */
function toTeamsFromPackage(packageTeams: PackageTeam[], rawTeams: Team[]): Team[] {
  const rawById = new Map(rawTeams.map((team) => [team.id, team]));
  const merged = packageTeams.map((team, index) => {
    const raw = rawById.get(team.id);
    return {
      id: team.id,
      name: team.name?.trim() || raw?.name || `Team ${team.id}`,
      abbrev: (team.abbreviation || raw?.abbrev || "").toUpperCase(),
      owner: team.ownerName?.trim() || raw?.owner || null,
      logoUrl: team.logoURL?.trim() || raw?.logoUrl || null,
      wins: team.wins ?? 0,
      losses: team.losses ?? 0,
      ties: team.ties ?? 0,
      pointsFor: team.regularSeasonPointsFor ?? raw?.pointsFor ?? 0,
      pointsAgainst: team.regularSeasonPointsAgainst ?? raw?.pointsAgainst ?? 0,
      rank: 0,
      playoffSeed: team.playoffSeed ?? raw?.playoffSeed ?? 0,
      streak: raw?.streak ?? null,
      colorSeed: index,
    } satisfies Team;
  });
  return rankTeams(merged);
}

function mergeMeta(
  rawMeta: LeagueMeta | null,
  packageLeague: Awaited<ReturnType<typeof getLeagueInfo>>,
  config: EspnConfig,
): LeagueMeta | null {
  if (!rawMeta && !packageLeague) return null;
  if (!rawMeta && packageLeague) {
    // Raw view failed but the package answered — show what we can.
    return {
      id: config.leagueId,
      seasonId: config.seasonId,
      name: packageLeague.name?.trim() || "Chase & Champions",
      size: packageLeague.size ?? 0,
      isPublic: packageLeague.isPublic ?? false,
      currentWeek: Math.max(1, packageLeague.currentMatchupPeriodId ?? 1),
      currentScoringPeriod: Math.max(1, packageLeague.currentScoringPeriodId ?? 1),
      phase: "preseason",
      hasDrafted: false,
      settings: {
        scoringFormat: "—",
        receptionPoints: 0,
        draftType: "—",
        draftDate: null,
        rosterSize: 0,
        starterCount: 0,
        benchCount: 0,
        playoffTeamCount: 0,
        playoffFormat: "—",
        regularSeasonWeeks: 0,
        tradeDeadline: null,
        waiverType: "—",
        waiverHours: null,
        lineup: [],
      },
    };
  }
  if (!rawMeta) return null;
  return {
    ...rawMeta,
    name: rawMeta.name || packageLeague?.name?.trim() || "Chase & Champions",
    size: rawMeta.size || packageLeague?.size || rawMeta.size,
    currentWeek:
      rawMeta.currentWeek || Math.max(1, packageLeague?.currentMatchupPeriodId ?? 1),
  };
}

async function loadFromEspn(config: EspnConfig): Promise<LeagueBundle> {
  const [rawResult, packageLeagueResult] = await Promise.allSettled([
    fetchLeagueViews<RawLeagueResponse>(config, LEAGUE_VIEWS),
    // Axios-based, so Next's fetch cache does not apply — hence the TTL wrapper.
    withTtl(`league-info:${config.leagueId}:${config.seasonId}`, REVALIDATE_SECONDS, () =>
      getLeagueInfo(config),
    ),
  ]);

  const raw = rawResult.status === "fulfilled" ? rawResult.value : null;
  const packageLeague =
    packageLeagueResult.status === "fulfilled" ? packageLeagueResult.value : null;

  if (!raw && !packageLeague) {
    const reason =
      rawResult.status === "rejected"
        ? ((rawResult.reason as Error)?.message ?? "ESPN request failed.")
        : "ESPN request failed.";
    return emptyBundle(reason);
  }

  const rawTeams = raw ? toTeams(raw) : [];
  const rawMeta = raw ? toLeagueMeta(raw, config.leagueId) : null;
  const meta = mergeMeta(rawMeta, packageLeague, config);
  const scoringPeriod = meta?.currentScoringPeriod ?? 1;

  const teams = rawTeams.length > 0 ? rawTeams : [];
  const matchups = raw ? toMatchups(raw) : [];
  const rosters = raw && meta?.hasDrafted ? toTeamRosters(raw, scoringPeriod) : [];

  return {
    source: "espn",
    fetchedAt: new Date().toISOString(),
    error:
      rawResult.status === "rejected"
        ? "Some league details could not be loaded from ESPN."
        : null,
    meta,
    teams,
    matchups,
    rosters,
  };
}

/**
 * Loads teams through the npm package when the raw view came back empty.
 * Kept separate so the happy path stays a single request.
 */
export async function loadTeamsViaPackage(
  config: EspnConfig,
  scoringPeriodId: number,
  rawTeams: Team[],
): Promise<Team[]> {
  try {
    const { createEspnClient } = await import("./package-client");
    const packageTeams = await withTtl(
      `teams:${config.leagueId}:${config.seasonId}:${scoringPeriodId}`,
      REVALIDATE_SECONDS,
      () =>
        createEspnClient(config).getTeamsAtWeek({
          seasonId: config.seasonId,
          scoringPeriodId,
        }),
    );
    if (!packageTeams?.length) return rawTeams;
    return toTeamsFromPackage(packageTeams, rawTeams);
  } catch {
    return rawTeams;
  }
}

export const getLeagueBundle = cache(async (): Promise<LeagueBundle> => {
  if (useDemoData()) {
    const phase = (process.env.MOCK_PHASE as MockPhase) ?? "regular";
    return buildMockBundle(phase === "preseason" ? "preseason" : "regular");
  }

  const config = readEspnConfig();
  if (!config) {
    return emptyBundle(
      "ESPN is not connected yet. Add ESPN_LEAGUE_ID to your environment to pull in live league data.",
    );
  }

  try {
    const bundle = await loadFromEspn(config);
    if (bundle.teams.length === 0 && bundle.meta) {
      // Raw teams view came back empty — try the package before giving up.
      const teams = await loadTeamsViaPackage(
        config,
        bundle.meta.currentScoringPeriod,
        [],
      );
      return { ...bundle, teams };
    }
    return bundle;
  } catch (error) {
    return emptyBundle(
      error instanceof Error ? error.message : "Could not load league data.",
    );
  }
});

/* ---- Focused accessors used by pages ------------------------------ */

export async function getLeagueMeta() {
  return (await getLeagueBundle()).meta;
}

export async function getTeams() {
  return (await getLeagueBundle()).teams;
}

export async function getTeamById(id: number) {
  const bundle = await getLeagueBundle();
  return bundle.teams.find((team) => team.id === id) ?? null;
}

export async function getRosterForTeam(id: number) {
  const bundle = await getLeagueBundle();
  return bundle.rosters.find((roster) => roster.teamId === id) ?? null;
}

export async function getMatchupsForTeam(id: number) {
  const bundle = await getLeagueBundle();
  return bundle.matchups.filter(
    (matchup) => matchup.home.teamId === id || matchup.away?.teamId === id,
  );
}

export async function getMatchupsForWeek(week: number) {
  const bundle = await getLeagueBundle();
  return bundle.matchups.filter((matchup) => matchup.week === week);
}
