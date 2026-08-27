import type {
  LeagueMeta,
  LeaguePhase,
  LeagueSettings,
  LineupSlotSummary,
  Matchup,
  MatchupStatus,
  Position,
  RosterPlayer,
  Team,
  TeamRoster,
} from "@/types/league";
import type {
  RawLeagueResponse,
  RawMember,
  RawRosterEntry,
  RawMatchupSide,
  RawScheduleItem,
  RawSettings,
  RawTeam,
} from "./raw-types";
import { headshotUrl, proTeamAbbrev } from "./nfl-teams";
import {
  BENCH_SLOTS,
  LINEUP_SLOT_LABELS,
  POSITION_BY_ID,
  slotSortIndex,
} from "@/lib/utils/positions";

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

const RECEPTION_STAT_ID = 53;

function receptionPoints(settings: RawSettings | undefined): number {
  const items = settings?.scoringSettings?.scoringItems ?? [];
  return items.find((item) => item.statId === RECEPTION_STAT_ID)?.points ?? 0;
}

function scoringFormat(points: number): string {
  if (points >= 1) return "Full PPR";
  if (points > 0) return `${points} PPR`;
  return "Standard";
}

const DRAFT_TYPE_LABELS: Record<string, string> = {
  SNAKE: "Snake draft",
  AUCTION: "Auction draft",
  OFFLINE: "Offline draft",
  LINEAR: "Linear draft",
};

const WAIVER_LABELS: Record<string, string> = {
  WAIVERS: "Waiver claims",
  WAIVERS_CONTINUOUS: "Rolling waiver claims",
  WAIVERS_TRADITIONAL: "Waiver claims",
  FREE_AGENCY: "First come, first served",
};

function buildLineup(settings: RawSettings | undefined): LineupSlotSummary[] {
  const counts = settings?.rosterSettings?.lineupSlotCounts ?? {};
  return Object.entries(counts)
    .map(([slotId, count]) => ({
      slot: LINEUP_SLOT_LABELS[Number(slotId)] ?? `Slot ${slotId}`,
      label: LINEUP_SLOT_LABELS[Number(slotId)] ?? `Slot ${slotId}`,
      count: Number(count) || 0,
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => slotSortIndex(a.slot) - slotSortIndex(b.slot));
}

function isoOrNull(ms: number | undefined): string | null {
  if (!ms || !Number.isFinite(ms)) return null;
  return new Date(ms).toISOString();
}

export function toLeagueSettings(raw: RawLeagueResponse): LeagueSettings {
  const settings = raw.settings;
  const lineup = buildLineup(settings);
  const starterCount = lineup
    .filter((entry) => entry.slot !== "BE" && entry.slot !== "IR")
    .reduce((sum, entry) => sum + entry.count, 0);
  const benchCount = lineup
    .filter((entry) => entry.slot === "BE")
    .reduce((sum, entry) => sum + entry.count, 0);
  const playoffTeamCount = settings?.scheduleSettings?.playoffTeamCount ?? 0;
  const roundLength = settings?.scheduleSettings?.playoffMatchupPeriodLength ?? 1;
  const draftType = settings?.draftSettings?.type ?? "";

  const perReception = receptionPoints(settings);

  return {
    scoringFormat: scoringFormat(perReception),
    receptionPoints: perReception,
    draftType: DRAFT_TYPE_LABELS[draftType] ?? (draftType ? draftType : "Not set"),
    draftDate: isoOrNull(settings?.draftSettings?.date),
    rosterSize: starterCount + benchCount,
    starterCount,
    benchCount,
    playoffTeamCount,
    playoffFormat: playoffTeamCount
      ? `Top ${playoffTeamCount} make the playoffs · ${roundLength === 1 ? "one week" : `${roundLength} weeks`} per round`
      : "Not set",
    regularSeasonWeeks: settings?.scheduleSettings?.matchupPeriodCount ?? 0,
    tradeDeadline: isoOrNull(settings?.tradeSettings?.deadlineDate),
    waiverType:
      WAIVER_LABELS[settings?.acquisitionSettings?.acquisitionType ?? ""] ??
      "Waiver claims",
    waiverHours: settings?.acquisitionSettings?.waiverHours ?? null,
    lineup,
  };
}

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

export function toLeaguePhase(raw: RawLeagueResponse): LeaguePhase {
  const drafted = raw.draftDetail?.drafted ?? false;
  const inProgress = raw.draftDetail?.inProgress ?? false;
  if (inProgress) return "drafting";
  if (!drafted) return "preseason";

  const currentWeek = raw.status?.currentMatchupPeriod ?? 1;
  const regularSeasonWeeks = raw.settings?.scheduleSettings?.matchupPeriodCount ?? 14;
  const latest = raw.status?.latestScoringPeriod ?? 0;
  const final = raw.status?.finalScoringPeriod ?? 0;

  if (final > 0 && latest > final) return "complete";
  if (currentWeek > regularSeasonWeeks) {
    return currentWeek > regularSeasonWeeks + 4 ? "complete" : "playoffs";
  }
  return "regular";
}

export function toLeagueMeta(raw: RawLeagueResponse, leagueId: string): LeagueMeta {
  const settings = toLeagueSettings(raw);
  return {
    id: leagueId,
    seasonId: raw.seasonId ?? 0,
    name: raw.settings?.name?.trim() || "Chase & Champions",
    size: raw.settings?.size ?? raw.teams?.length ?? 0,
    isPublic: raw.settings?.isPublic ?? false,
    currentWeek: Math.max(1, raw.status?.currentMatchupPeriod ?? 1),
    currentScoringPeriod: Math.max(
      1,
      raw.status?.latestScoringPeriod ?? raw.scoringPeriodId ?? 1,
    ),
    phase: toLeaguePhase(raw),
    hasDrafted: raw.draftDetail?.drafted ?? false,
    settings,
  };
}

/* ------------------------------------------------------------------ */
/* Teams                                                               */
/* ------------------------------------------------------------------ */

function ownerName(team: RawTeam, membersById: Map<string, RawMember>): string | null {
  const ownerId = team.owners?.[0];
  if (!ownerId) return null;
  const member = membersById.get(ownerId) ?? membersById.get(ownerId.toUpperCase());
  if (!member) return null;
  const full = [member.firstName, member.lastName].filter(Boolean).join(" ").trim();
  return full || member.displayName?.trim() || null;
}

function teamName(team: RawTeam): string {
  const merged = team.name?.trim();
  if (merged) return merged;
  const composed = [team.location, team.nickname].filter(Boolean).join(" ").trim();
  return composed || `Team ${team.id ?? "?"}`;
}

export function toTeams(raw: RawLeagueResponse): Team[] {
  const membersById = new Map<string, RawMember>();
  for (const member of raw.members ?? []) {
    if (member.id) membersById.set(member.id, member);
  }

  const teams: Team[] = (raw.teams ?? []).map((team, index) => {
    const overall = team.record?.overall ?? {};
    const streakLength = overall.streakLength ?? 0;
    const streakType = (overall.streakType ?? "").toUpperCase();
    return {
      id: team.id ?? index,
      name: teamName(team),
      abbrev: (team.abbrev ?? teamName(team).slice(0, 4)).toUpperCase(),
      owner: ownerName(team, membersById),
      logoUrl: team.logo?.trim() || null,
      wins: overall.wins ?? 0,
      losses: overall.losses ?? 0,
      ties: overall.ties ?? 0,
      pointsFor: overall.pointsFor ?? team.points ?? 0,
      pointsAgainst: overall.pointsAgainst ?? team.pointsAgainst ?? 0,
      rank: 0,
      playoffSeed: team.playoffSeed ?? 0,
      streak:
        streakLength > 0 && (streakType === "WIN" || streakType === "LOSS")
          ? { type: streakType === "WIN" ? "W" : "L", length: streakLength }
          : null,
      colorSeed: index,
    };
  });

  return rankTeams(teams);
}

/**
 * Ranks on record, then points scored. Before any games are played there is no
 * real order, so teams are listed alphabetically — ESPN's preseason
 * `playoffSeed` is essentially arbitrary and showing it as a rank would imply
 * a standing that does not exist yet. The UI hides medals in that state too.
 */
export function rankTeams(teams: Team[]): Team[] {
  const played = teams.some((team) => team.wins + team.losses + team.ties > 0);
  const sorted = [...teams].sort((a, b) => {
    if (!played) return a.name.localeCompare(b.name);
    const aPct = winPct(a);
    const bPct = winPct(b);
    if (bPct !== aPct) return bPct - aPct;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });
  return sorted.map((team, index) => ({ ...team, rank: index + 1 }));
}

function winPct(team: Team): number {
  const games = team.wins + team.losses + team.ties;
  if (games === 0) return 0;
  return (team.wins + team.ties * 0.5) / games;
}

/* ------------------------------------------------------------------ */
/* Rosters                                                             */
/* ------------------------------------------------------------------ */

function playerPoints(
  entry: RawRosterEntry,
  scoringPeriodId: number,
  sourceId: 0 | 1,
): number | null {
  const stats = entry.playerPoolEntry?.player?.stats ?? [];
  const match = stats.find(
    (stat) =>
      stat.scoringPeriodId === scoringPeriodId &&
      stat.statSourceId === sourceId &&
      stat.statSplitTypeId === 1,
  );
  if (match?.appliedTotal === undefined) return null;
  return Math.round(match.appliedTotal * 100) / 100;
}

export function toRosterPlayer(
  entry: RawRosterEntry,
  scoringPeriodId: number,
): RosterPlayer | null {
  const player = entry.playerPoolEntry?.player;
  if (!player) return null;

  const slotId = entry.lineupSlotId ?? 20;
  const position: Position =
    POSITION_BY_ID[player.defaultPositionId ?? -1] ?? "UNKNOWN";
  const proTeam = proTeamAbbrev(player.proTeamId);
  const playerId = player.id ?? entry.playerId ?? 0;
  const injuryStatus = player.injuryStatus ?? null;

  return {
    id: playerId,
    name: player.fullName?.trim() || `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim(),
    firstName: player.firstName ?? "",
    lastName: player.lastName ?? "",
    position,
    proTeam,
    headshotUrl: playerId ? headshotUrl(playerId, position, proTeam) : null,
    lineupSlot: LINEUP_SLOT_LABELS[slotId] ?? "BE",
    isStarter: !BENCH_SLOTS.has(slotId),
    points: playerPoints(entry, scoringPeriodId, 0),
    projected: playerPoints(entry, scoringPeriodId, 1),
    injuryStatus: injuryStatus && injuryStatus !== "ACTIVE" ? injuryStatus : null,
  };
}

export function toTeamRosters(
  raw: RawLeagueResponse,
  scoringPeriodId: number,
): TeamRoster[] {
  return (raw.teams ?? [])
    .map((team) => {
      const entries = team.roster?.entries ?? [];
      const players = entries
        .map((entry) => toRosterPlayer(entry, scoringPeriodId))
        .filter((player): player is RosterPlayer => player !== null);

      const starters = players
        .filter((player) => player.isStarter)
        .sort(
          (a, b) =>
            slotSortIndex(a.lineupSlot) - slotSortIndex(b.lineupSlot) ||
            a.name.localeCompare(b.name),
        );
      const bench = players
        .filter((player) => !player.isStarter)
        .sort(
          (a, b) =>
            slotSortIndex(a.position) - slotSortIndex(b.position) ||
            a.name.localeCompare(b.name),
        );

      return {
        teamId: team.id ?? 0,
        week: scoringPeriodId,
        starters,
        bench,
      };
    })
    .filter((roster) => roster.starters.length > 0 || roster.bench.length > 0);
}

/* ------------------------------------------------------------------ */
/* Schedule                                                            */
/* ------------------------------------------------------------------ */

function matchupStatus(
  item: RawScheduleItem,
  currentWeek: number,
): MatchupStatus {
  const week = item.matchupPeriodId ?? 0;
  const winner = (item.winner ?? "UNDECIDED").toUpperCase();
  if (winner !== "UNDECIDED") return "final";
  if (week < currentWeek) return "final";
  if (week === currentWeek) {
    const played =
      (item.home?.totalPoints ?? 0) > 0 || (item.away?.totalPoints ?? 0) > 0;
    return played ? "live" : "upcoming";
  }
  return "upcoming";
}

function toSide(side: RawMatchupSide | undefined, status: MatchupStatus) {
  if (!side || side.teamId === undefined) return null;
  const score = side.totalPoints ?? side.totalPointsLive ?? null;
  return {
    teamId: side.teamId,
    score: status === "upcoming" ? null : (score ?? null),
    projected: side.totalProjectedPointsLive ?? null,
  };
}

export function toMatchups(raw: RawLeagueResponse): Matchup[] {
  const currentWeek = raw.status?.currentMatchupPeriod ?? 1;
  const regularSeasonWeeks = raw.settings?.scheduleSettings?.matchupPeriodCount ?? 14;

  return (raw.schedule ?? [])
    .map((item, index) => {
      const week = item.matchupPeriodId ?? 0;
      const status = matchupStatus(item, currentWeek);
      const home = toSide(item.home, status);
      if (!home) return null;
      const away = toSide(item.away, status);
      const tier = (item.playoffTierType ?? "NONE").toUpperCase();

      return {
        id: `${week}-${item.id ?? index}`,
        week,
        home,
        away,
        status,
        isPlayoff: tier !== "NONE" || week > regularSeasonWeeks,
      } satisfies Matchup;
    })
    .filter((matchup): matchup is Matchup => matchup !== null)
    .sort((a, b) => a.week - b.week);
}
