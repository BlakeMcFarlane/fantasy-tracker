import "server-only";

import { REVALIDATE_SECONDS, espnCookieHeader, type EspnConfig } from "./config";

const BASE = "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl";

export class EspnRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "EspnRequestError";
  }
}

/**
 * Fetches one or more ESPN "views" in a single request. ESPN accepts repeated
 * `view` params, so the whole app can be powered by very few round trips.
 *
 * The npm package (`espn-fantasy-football-api`) covers teams, boxscores and
 * league info; this client fills the gaps it does not expose — the full season
 * schedule, member/owner names, standings streaks and detailed settings.
 */
export async function fetchLeagueViews<T = unknown>(
  config: EspnConfig,
  views: string[],
  extraParams: Record<string, string | number> = {},
): Promise<T> {
  const url = new URL(
    `${BASE}/seasons/${config.seasonId}/segments/0/leagues/${config.leagueId}`,
  );
  for (const view of views) url.searchParams.append("view", view);
  for (const [key, value] of Object.entries(extraParams)) {
    url.searchParams.set(key, String(value));
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    // ESPN rejects requests without a browser-ish agent.
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  };
  const cookie = espnCookieHeader(config);
  if (cookie) headers.Cookie = cookie;

  let response: Response;
  try {
    response = await fetch(url, {
      headers,
      next: { revalidate: REVALIDATE_SECONDS, tags: ["espn-league"] },
    });
  } catch (cause) {
    throw new EspnRequestError(
      `Could not reach ESPN: ${(cause as Error).message}`,
    );
  }

  if (response.status === 401) {
    throw new EspnRequestError(
      "ESPN rejected the request. For a private league, set ESPN_S2 and SWID.",
      401,
    );
  }
  if (response.status === 404) {
    throw new EspnRequestError(
      `League ${config.leagueId} was not found for season ${config.seasonId}.`,
      404,
    );
  }
  if (!response.ok) {
    throw new EspnRequestError(
      `ESPN returned ${response.status} ${response.statusText}.`,
      response.status,
    );
  }

  return (await response.json()) as T;
}
