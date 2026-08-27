/** Fantasy points, always one decimal so columns line up. */
export function formatPoints(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

export function formatWholeNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Math.round(value).toLocaleString("en-US");
}

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "TBD";
  return `$${value.toLocaleString("en-US")}`;
}

export function formatRecord(wins: number, losses: number, ties: number): string {
  return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
}

export function winPercentage(wins: number, losses: number, ties: number): number {
  const games = wins + losses + ties;
  if (games === 0) return 0;
  return (wins + ties * 0.5) / games;
}

/** Percentages read better than ".833" for anyone who isn't a stats person. */
export function formatWinPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** "1st", "2nd", "3rd", "4th" … */
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

/** Signed margin, e.g. "+12.4" / "−12.4". */
export function formatMargin(value: number): string {
  const rounded = Math.abs(value).toFixed(1);
  if (value > 0) return `+${rounded}`;
  if (value < 0) return `−${rounded}`;
  return "0.0";
}

/**
 * Monogram for avatar fallbacks: "Chase Money" -> "CM",
 * "Play Action Pals" -> "PAP". Three-letter monograms keep 14 similarly-named
 * teams distinguishable at a glance.
 */
export function initialsFrom(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/**
 * Short chip label for a team. ESPN abbreviations are user-chosen and are not
 * guaranteed unique (this league has two "TTT"s), so anything ambiguous falls
 * back to the first word of the team name.
 */
export function shortTeamLabels(
  teams: { id: number; name: string; abbrev: string }[],
): Map<number, string> {
  const counts = new Map<string, number>();
  for (const team of teams) {
    const key = team.abbrev.toUpperCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const labels = new Map<number, string>();
  for (const team of teams) {
    const abbrev = team.abbrev.toUpperCase();
    const unique = (counts.get(abbrev) ?? 0) === 1;
    labels.set(
      team.id,
      unique && abbrev.length >= 2 ? abbrev : firstWord(team.name),
    );
  }
  return labels;
}

/** "Trevor's Talented Team" -> "TREVOR" */
function firstWord(name: string): string {
  const word = name.trim().split(/\s+/)[0] ?? name;
  return word.replace(/['\u2019]s$/i, "").slice(0, 7).toUpperCase();
}
