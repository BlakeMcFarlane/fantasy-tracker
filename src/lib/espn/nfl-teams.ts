/** ESPN pro team id → abbreviation. Id 0 means "free agent / no team". */
export const PRO_TEAM_ABBREV: Record<number, string> = {
  0: "FA",
  1: "ATL",
  2: "BUF",
  3: "CHI",
  4: "CIN",
  5: "CLE",
  6: "DAL",
  7: "DEN",
  8: "DET",
  9: "GB",
  10: "TEN",
  11: "IND",
  12: "KC",
  13: "LV",
  14: "LAR",
  15: "MIA",
  16: "MIN",
  17: "NE",
  18: "NO",
  19: "NYG",
  20: "NYJ",
  21: "PHI",
  22: "ARI",
  23: "PIT",
  24: "LAC",
  25: "SF",
  26: "SEA",
  27: "TB",
  28: "WSH",
  29: "CAR",
  30: "JAX",
  33: "BAL",
  34: "HOU",
};

export function proTeamAbbrev(id: number | undefined | null): string | null {
  if (id === undefined || id === null) return null;
  const abbrev = PRO_TEAM_ABBREV[id];
  if (!abbrev || abbrev === "FA") return null;
  return abbrev;
}

export function headshotUrl(playerId: number, position: string, proTeam: string | null): string | null {
  if (position === "DST") {
    return proTeam
      ? `https://a.espncdn.com/i/teamlogos/nfl/500/${proTeam.toLowerCase()}.png`
      : null;
  }
  return `https://a.espncdn.com/i/headshots/nfl/players/full/${playerId}.png`;
}
