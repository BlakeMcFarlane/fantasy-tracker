import "server-only";

import { Client } from "espn-fantasy-football-api/node";
import type { PackageBoxscore, PackageLeague } from "espn-fantasy-football-api/node";
import type { EspnConfig } from "./config";

/**
 * Thin wrapper around the official `espn-fantasy-football-api` package.
 *
 * The package gives us nicely-modelled league info and boxscores (per-week
 * scores plus each side's roster with projections). It does not expose the
 * full-season schedule, member names or detailed settings — those come from
 * `raw-client.ts`. Both live behind `service.ts`, so components never see either.
 */
export function createEspnClient(config: EspnConfig): Client {
  const client = new Client({ leagueId: Number(config.leagueId) });
  if (config.espnS2 && config.swid) {
    client.setCookies({ espnS2: config.espnS2, SWID: config.swid });
  }
  return client;
}

export async function getLeagueInfo(
  config: EspnConfig,
): Promise<PackageLeague | null> {
  try {
    return await createEspnClient(config).getLeagueInfo({
      seasonId: config.seasonId,
    });
  } catch {
    return null;
  }
}

/**
 * Per-week boxscores. Used to build a team's week-by-week scoring history,
 * which the season schedule alone does not carry once games are final.
 */
export async function getBoxscoresForWeek(
  config: EspnConfig,
  matchupPeriodId: number,
  scoringPeriodId: number = matchupPeriodId,
): Promise<PackageBoxscore[]> {
  try {
    return await createEspnClient(config).getBoxscoreForWeek({
      seasonId: config.seasonId,
      matchupPeriodId,
      scoringPeriodId,
    });
  } catch {
    return [];
  }
}

/** Empty array also means "not drafted yet", which is the common preseason case. */
export async function getDraftPicks(config: EspnConfig) {
  try {
    return await createEspnClient(config).getDraftInfo({
      seasonId: config.seasonId,
    });
  } catch {
    return [];
  }
}
