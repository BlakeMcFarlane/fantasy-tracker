import type {
  LeagueBundle,
  LeagueHighlights,
  Matchup,
  Team,
  TeamSeasonStats,
} from "@/types/league";
import { formatPoints, winPercentage } from "@/lib/utils/format";

/** Matchups that have actually been played. */
export function completedMatchups(bundle: LeagueBundle): Matchup[] {
  return bundle.matchups.filter(
    (matchup) =>
      matchup.status === "final" &&
      matchup.away !== null &&
      matchup.home.score !== null &&
      matchup.away.score !== null,
  );
}

export function hasPlayedGames(bundle: LeagueBundle): boolean {
  return completedMatchups(bundle).length > 0;
}

/**
 * League-wide talking points. Returns `null` for anything that would be
 * meaningless before games are played, so the Home page can hide it rather
 * than showing a row of zeroes.
 */
export function leagueHighlights(bundle: LeagueBundle): LeagueHighlights {
  const empty: LeagueHighlights = {
    topScorer: null,
    lowScorer: null,
    leader: null,
    biggestWin: null,
    closestGame: null,
  };

  const played = completedMatchups(bundle);
  if (played.length === 0 || bundle.teams.length === 0) return empty;

  const byId = new Map(bundle.teams.map((team) => [team.id, team]));
  const scoring = [...bundle.teams].sort((a, b) => b.pointsFor - a.pointsFor);
  const top = scoring[0];
  const low = scoring[scoring.length - 1];
  const leader = bundle.teams.find((team) => team.rank === 1) ?? null;

  let biggestWin: LeagueHighlights["biggestWin"] = null;
  let biggestMargin = -1;
  let closestGame: LeagueHighlights["closestGame"] = null;

  for (const matchup of played) {
    const home = matchup.home;
    const away = matchup.away!;
    const margin = Math.abs((home.score ?? 0) - (away.score ?? 0));
    if (margin === 0) continue;
    const winner = (home.score ?? 0) > (away.score ?? 0) ? home : away;
    const loser = winner === home ? away : home;

    if (margin > biggestMargin && byId.has(winner.teamId)) {
      biggestMargin = margin;
      biggestWin = {
        teamId: winner.teamId,
        opponentId: loser.teamId,
        label: "Biggest blowout",
        value: `${formatPoints(winner.score)} — ${formatPoints(loser.score)}`,
        detail: `Week ${matchup.week} · won by ${formatPoints(margin)}`,
      };
    }

    if (!closestGame || margin < closestGame.margin) {
      closestGame = {
        week: matchup.week,
        margin: Math.round(margin * 10) / 10,
        winnerId: winner.teamId,
        loserId: loser.teamId,
      };
    }
  }

  return {
    topScorer: top
      ? {
          teamId: top.id,
          label: "Most points scored",
          value: formatPoints(top.pointsFor),
          detail: top.name,
        }
      : null,
    lowScorer:
      low && low.id !== top?.id
        ? {
            teamId: low.id,
            label: "Fewest points scored",
            value: formatPoints(low.pointsFor),
            detail: low.name,
          }
        : null,
    leader: leader
      ? {
          teamId: leader.id,
          label: "League leader",
          value: `${leader.wins}-${leader.losses}${leader.ties ? `-${leader.ties}` : ""}`,
          detail: leader.name,
        }
      : null,
    biggestWin,
    closestGame,
  };
}

/** Every completed score for one team, oldest first. */
export function weeklyScores(
  bundle: LeagueBundle,
  teamId: number,
): { week: number; points: number; opponentId: number; won: boolean }[] {
  return completedMatchups(bundle)
    .filter(
      (matchup) => matchup.home.teamId === teamId || matchup.away?.teamId === teamId,
    )
    .map((matchup) => {
      const isHome = matchup.home.teamId === teamId;
      const self = isHome ? matchup.home : matchup.away!;
      const other = isHome ? matchup.away! : matchup.home;
      return {
        week: matchup.week,
        points: self.score ?? 0,
        opponentId: other.teamId,
        won: (self.score ?? 0) > (other.score ?? 0),
      };
    })
    .sort((a, b) => a.week - b.week);
}

export function teamSeasonStats(bundle: LeagueBundle, team: Team): TeamSeasonStats {
  const scores = weeklyScores(bundle, team.id);
  const gamesPlayed = scores.length;

  if (gamesPlayed === 0) {
    return {
      gamesPlayed: 0,
      averagePoints: null,
      highWeek: null,
      lowWeek: null,
      totalPoints: team.pointsFor,
      winPct: winPercentage(team.wins, team.losses, team.ties),
    };
  }

  const sorted = [...scores].sort((a, b) => b.points - a.points);
  const sum = scores.reduce((acc, entry) => acc + entry.points, 0);

  return {
    gamesPlayed,
    averagePoints: Math.round((sum / gamesPlayed) * 10) / 10,
    highWeek: { week: sorted[0].week, points: sorted[0].points },
    lowWeek: {
      week: sorted[sorted.length - 1].week,
      points: sorted[sorted.length - 1].points,
    },
    totalPoints: Math.round((team.pointsFor || sum) * 10) / 10,
    winPct: winPercentage(team.wins, team.losses, team.ties),
  };
}

/** Human sentence describing where the season stands. */
export function phaseHeadline(bundle: LeagueBundle): string {
  const meta = bundle.meta;
  if (!meta) return "Season not started";
  switch (meta.phase) {
    case "preseason":
      return "Preseason";
    case "drafting":
      return "Draft in progress";
    case "regular":
      return `Week ${meta.currentWeek}`;
    case "playoffs":
      return "Playoffs";
    case "complete":
      return "Season complete";
    default:
      return "Preseason";
  }
}
