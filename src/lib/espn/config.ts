/**
 * All ESPN configuration is read here, server-side only. Nothing in this file
 * may be imported from a Client Component — the cookies are private.
 */

export interface EspnConfig {
  leagueId: string;
  seasonId: number;
  espnS2: string | null;
  swid: string | null;
  isPrivate: boolean;
}

export const REVALIDATE_SECONDS = Number(
  process.env.LEAGUE_REVALIDATE_SECONDS ?? 300,
);

/** Opt-in demo data. Never on by default in production. */
export function useDemoData(): boolean {
  const flag = process.env.USE_MOCK_DATA;
  if (flag === "true") return true;
  if (flag === "false") return false;
  // In local development, fall back to demo data when ESPN is not wired up yet
  // so the UI is fully explorable.
  return process.env.NODE_ENV !== "production" && !process.env.ESPN_LEAGUE_ID;
}

export function readEspnConfig(): EspnConfig | null {
  const leagueId = process.env.ESPN_LEAGUE_ID?.trim();
  if (!leagueId) return null;

  const seasonId = Number(process.env.ESPN_SEASON_ID ?? 2026);
  const espnS2 = process.env.ESPN_S2?.trim() || null;
  const rawSwid = (process.env.SWID ?? process.env.ESPN_SWID)?.trim() || null;
  // ESPN expects the SWID wrapped in braces; accept it either way.
  const swid = rawSwid
    ? rawSwid.startsWith("{")
      ? rawSwid
      : `{${rawSwid}}`
    : null;

  return {
    leagueId,
    seasonId: Number.isFinite(seasonId) ? seasonId : 2026,
    espnS2,
    swid,
    isPrivate: Boolean(espnS2 && swid),
  };
}

export function espnCookieHeader(config: EspnConfig): string | null {
  if (!config.espnS2 || !config.swid) return null;
  return `espn_s2=${config.espnS2}; SWID=${config.swid}`;
}
