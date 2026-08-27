import type {
  LeagueBundle,
  LeagueMeta,
  Matchup,
  Position,
  RosterPlayer,
  Team,
  TeamRoster,
} from "@/types/league";
import { rankTeams } from "./transform";
import { headshotUrl } from "./nfl-teams";

/**
 * Deterministic demo league used when ESPN is not connected.
 *
 * This exists so the UI is fully explorable in development and so the app can
 * be demoed before the real league is populated. It is OFF in production unless
 * `USE_MOCK_DATA=true` is set explicitly, and when it is on the UI shows a
 * "Demo data" banner. Delete this file once ESPN is wired up for good — only
 * `service.ts` imports it.
 */

const REGULAR_SEASON_WEEKS = 14;
const TEAM_COUNT = 14;

interface Seedling {
  name: string;
  abbrev: string;
  owner: string;
}

const TEAM_SEEDS: Seedling[] = [
  { name: "Chase Money", abbrev: "CASH", owner: "Blake" },
  { name: "Team Trevor", abbrev: "TREV", owner: "Trevor" },
  { name: "Gridiron Goblins", abbrev: "GOBS", owner: "Marcus" },
  { name: "Couch Commanders", abbrev: "COUC", owner: "Devin" },
  { name: "Fourth & Long", abbrev: "4TH", owner: "Priya" },
  { name: "Hail Mary Hooligans", abbrev: "HAIL", owner: "Sam" },
  { name: "The Pocket Passers", abbrev: "PKT", owner: "Nia" },
  { name: "Red Zone Rejects", abbrev: "RZR", owner: "Jordan" },
  { name: "Turf Toe Titans", abbrev: "TURF", owner: "Alex" },
  { name: "Sunday Scaries", abbrev: "SCAR", owner: "Chris" },
  { name: "Blitz Brigade", abbrev: "BLTZ", owner: "Taylor" },
  { name: "Play Action Pals", abbrev: "PLAY", owner: "Morgan" },
  { name: "Two Minute Warning", abbrev: "2MIN", owner: "Riley" },
  { name: "Last Place Larry", abbrev: "LARR", owner: "Casey" },
];

const FIRST_NAMES = [
  "Jalen", "Darius", "Cooper", "Malik", "Brandon", "Trey", "Elijah", "Kenneth",
  "Marquise", "Tyrell", "Dominic", "Caleb", "Xavier", "Rashad", "Nolan",
  "Isaiah", "Grant", "Emmanuel", "Silas", "Devonte", "Micah", "Beau",
];

const LAST_NAMES = [
  "Hollins", "Barrett", "Whitfield", "Okafor", "Sandoval", "Reyes", "Kaminski",
  "Fontaine", "Ashworth", "Delgado", "Tanaka", "Boateng", "Vandermeer",
  "Castellano", "Ferreira", "Nakamura", "Ellison", "Pruitt", "Rasmussen",
  "Guerrero", "Lindqvist", "Achebe",
];

const NFL_TEAMS = [
  "KC", "BUF", "PHI", "SF", "DAL", "MIA", "DET", "BAL", "CIN", "GB", "LAR",
  "NYJ", "MIN", "SEA", "HOU", "JAX", "CHI", "PIT",
];

/** mulberry32 — small, fast, and repeatable so demo data never shifts. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, list: T[]): T {
  return list[Math.floor(random() * list.length)];
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/* ------------------------------------------------------------------ */
/* Schedule                                                            */
/* ------------------------------------------------------------------ */

/** Circle-method round robin: 14 teams play a unique opponent each week. */
function buildRoundRobin(teamIds: number[]): [number, number][][] {
  const rotation = [...teamIds];
  const fixed = rotation.shift()!;
  const rounds: [number, number][][] = [];

  for (let round = 0; round < teamIds.length - 1; round += 1) {
    const pairs: [number, number][] = [];
    pairs.push(round % 2 === 0 ? [fixed, rotation[0]] : [rotation[0], fixed]);
    for (let i = 1; i < rotation.length / 2 + 0.5; i += 1) {
      const home = rotation[i];
      const away = rotation[rotation.length - i];
      if (home === undefined || away === undefined || home === away) continue;
      pairs.push(i % 2 === 0 ? [home, away] : [away, home]);
    }
    rounds.push(pairs);
    rotation.unshift(rotation.pop()!);
  }
  return rounds;
}

/* ------------------------------------------------------------------ */
/* Rosters                                                             */
/* ------------------------------------------------------------------ */

const STARTER_SLOTS: { slot: string; position: Position }[] = [
  { slot: "QB", position: "QB" },
  { slot: "RB", position: "RB" },
  { slot: "RB", position: "RB" },
  { slot: "WR", position: "WR" },
  { slot: "WR", position: "WR" },
  { slot: "TE", position: "TE" },
  { slot: "FLEX", position: "WR" },
  { slot: "DST", position: "DST" },
  { slot: "K", position: "K" },
];

const BENCH_POSITIONS: Position[] = ["RB", "WR", "QB", "WR", "TE", "RB"];

const INJURY_POOL = [null, null, null, null, null, "QUESTIONABLE", "OUT", null];

function makePlayer(
  random: () => number,
  idBase: number,
  index: number,
  position: Position,
  slot: string,
  isStarter: boolean,
  scored: boolean,
): RosterPlayer {
  const firstName = pick(random, FIRST_NAMES);
  const lastName = pick(random, LAST_NAMES);
  const proTeam = position === "DST" ? pick(random, NFL_TEAMS) : pick(random, NFL_TEAMS);
  const id = idBase * 100 + index;
  const projected = round1(4 + random() * (position === "QB" ? 18 : 14));
  const name = position === "DST" ? `${proTeam} Defense` : `${firstName} ${lastName}`;

  return {
    id,
    name,
    firstName: position === "DST" ? proTeam : firstName,
    lastName: position === "DST" ? "Defense" : lastName,
    position,
    proTeam,
    // Demo players are not real, so no headshot lookup would resolve.
    headshotUrl: position === "DST" ? headshotUrl(id, "DST", proTeam) : null,
    lineupSlot: slot,
    isStarter,
    points: scored ? round1(Math.max(0, projected + (random() - 0.45) * 12)) : null,
    projected,
    injuryStatus: isStarter ? pick(random, INJURY_POOL) : null,
  };
}

function buildRoster(teamId: number, week: number, scored: boolean): TeamRoster {
  const random = makeRandom(teamId * 7919 + 13);
  const starters = STARTER_SLOTS.map((entry, index) =>
    makePlayer(random, teamId, index, entry.position, entry.slot, true, scored),
  );
  const bench = BENCH_POSITIONS.map((position, index) =>
    makePlayer(random, teamId, index + 50, position, "BE", false, scored),
  );
  return { teamId, week, starters, bench };
}

/* ------------------------------------------------------------------ */
/* Bundle                                                              */
/* ------------------------------------------------------------------ */

export type MockPhase = "preseason" | "regular";

export function buildMockBundle(
  phase: MockPhase = "regular",
  seasonId = 2026,
): LeagueBundle {
  const isPreseason = phase === "preseason";
  const currentWeek = isPreseason ? 1 : 7;
  const completedWeeks = isPreseason ? 0 : currentWeek - 1;

  const teamIds = TEAM_SEEDS.map((_, index) => index + 1);
  const rounds = buildRoundRobin(teamIds);

  const stats = new Map<
    number,
    { wins: number; losses: number; ties: number; pf: number; pa: number; results: ("W" | "L")[] }
  >();
  for (const id of teamIds) {
    stats.set(id, { wins: 0, losses: 0, ties: 0, pf: 0, pa: 0, results: [] });
  }

  const matchups: Matchup[] = [];
  for (let week = 1; week <= REGULAR_SEASON_WEEKS; week += 1) {
    const pairs = rounds[(week - 1) % rounds.length];
    pairs.forEach((pair, index) => {
      const [homeId, awayId] = pair;
      const isComplete = week <= completedWeeks;
      const random = makeRandom(week * 1000 + homeId * 31 + awayId);
      const homeScore = isComplete ? round1(78 + random() * 62) : null;
      const awayScore = isComplete ? round1(78 + random() * 62) : null;

      if (isComplete && homeScore !== null && awayScore !== null) {
        const home = stats.get(homeId)!;
        const away = stats.get(awayId)!;
        home.pf += homeScore;
        home.pa += awayScore;
        away.pf += awayScore;
        away.pa += homeScore;
        if (homeScore > awayScore) {
          home.wins += 1;
          away.losses += 1;
          home.results.push("W");
          away.results.push("L");
        } else if (awayScore > homeScore) {
          away.wins += 1;
          home.losses += 1;
          away.results.push("W");
          home.results.push("L");
        } else {
          home.ties += 1;
          away.ties += 1;
        }
      }

      matchups.push({
        id: `${week}-${index}`,
        week,
        home: {
          teamId: homeId,
          score: homeScore,
          projected: isComplete ? null : round1(95 + random() * 35),
        },
        away: {
          teamId: awayId,
          score: awayScore,
          projected: isComplete ? null : round1(95 + random() * 35),
        },
        status: isComplete ? "final" : week === currentWeek ? "upcoming" : "upcoming",
        isPlayoff: false,
      });
    });
  }

  const teams: Team[] = TEAM_SEEDS.map((seed, index) => {
    const id = index + 1;
    const record = stats.get(id)!;
    const results = record.results;
    let streak: Team["streak"] = null;
    if (results.length > 0) {
      const last = results[results.length - 1];
      let length = 0;
      for (let i = results.length - 1; i >= 0 && results[i] === last; i -= 1) length += 1;
      streak = { type: last, length };
    }
    return {
      id,
      name: seed.name,
      abbrev: seed.abbrev,
      owner: seed.owner,
      logoUrl: null,
      wins: record.wins,
      losses: record.losses,
      ties: record.ties,
      pointsFor: round1(record.pf),
      pointsAgainst: round1(record.pa),
      rank: 0,
      playoffSeed: 0,
      streak,
      colorSeed: index,
    };
  });

  const meta: LeagueMeta = {
    id: "demo",
    seasonId,
    name: "Chase & Champions",
    size: TEAM_COUNT,
    isPublic: false,
    currentWeek,
    currentScoringPeriod: currentWeek,
    phase: isPreseason ? "preseason" : "regular",
    hasDrafted: !isPreseason,
    settings: {
      scoringFormat: "0.5 PPR",
      receptionPoints: 0.5,
      draftType: "Snake draft",
      draftDate: "2026-09-05T23:00:00.000Z",
      rosterSize: 15,
      starterCount: 9,
      benchCount: 6,
      playoffTeamCount: 6,
      playoffFormat: "Top 6 make the playoffs · one week per round",
      regularSeasonWeeks: REGULAR_SEASON_WEEKS,
      tradeDeadline: "2026-11-25T05:00:00.000Z",
      waiverType: "Rolling waiver claims",
      waiverHours: 24,
      lineup: [
        { slot: "QB", label: "QB", count: 1 },
        { slot: "RB", label: "RB", count: 2 },
        { slot: "WR", label: "WR", count: 2 },
        { slot: "TE", label: "TE", count: 1 },
        { slot: "FLEX", label: "FLEX", count: 1 },
        { slot: "DST", label: "DST", count: 1 },
        { slot: "K", label: "K", count: 1 },
        { slot: "BE", label: "BE", count: 6 },
      ],
    },
  };

  const rosters = isPreseason
    ? []
    : teamIds.map((id) => buildRoster(id, currentWeek, false));

  return {
    source: "demo",
    fetchedAt: new Date().toISOString(),
    error: null,
    meta,
    teams: rankTeams(teams),
    matchups,
    rosters,
  };
}
