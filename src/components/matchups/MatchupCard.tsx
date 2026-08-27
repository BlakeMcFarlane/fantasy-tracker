import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { cn } from "@/lib/utils/cn";
import { formatPoints } from "@/lib/utils/format";
import type { Matchup, Team } from "@/types/league";

interface MatchupCardProps {
  matchup: Matchup;
  teamsById: Map<number, Team>;
  /** Show the card from this team's point of view — they always appear first. */
  perspectiveTeamId?: number;
}

interface Line {
  team: Team | undefined;
  score: number | null;
  projected: number | null;
  isPerspective: boolean;
}

export function MatchupCard({
  matchup,
  teamsById,
  perspectiveTeamId,
}: MatchupCardProps) {
  const homeIsPerspective = matchup.home.teamId === perspectiveTeamId;
  const sides = matchup.away
    ? homeIsPerspective
      ? [matchup.home, matchup.away]
      : [matchup.away, matchup.home]
    : [matchup.home];

  const lines: Line[] = sides.map((side) => ({
    team: teamsById.get(side.teamId),
    score: side.score,
    projected: side.projected,
    isPerspective: side.teamId === perspectiveTeamId,
  }));

  const isFinal = matchup.status === "final" && lines.length === 2;
  const [first, second] = lines;
  const firstWon =
    isFinal && (first.score ?? 0) > (second?.score ?? 0);
  const secondWon =
    isFinal && (second?.score ?? 0) > (first.score ?? 0);
  const tied = isFinal && (first.score ?? 0) === (second?.score ?? 0);

  const outcome = !perspectiveTeamId
    ? null
    : tied
      ? { label: "Tie", tone: "neutral" as const }
      : firstWon && first.isPerspective
        ? { label: "Win", tone: "win" as const }
        : secondWon && second?.isPerspective
          ? { label: "Win", tone: "win" as const }
          : isFinal
            ? { label: "Loss", tone: "loss" as const }
            : null;

  return (
    <Card
      as="article"
      className={cn(
        "overflow-hidden",
        outcome?.tone === "win" && "ring-turf-500/20",
      )}
    >
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <span className="font-display text-sm font-bold uppercase tracking-[0.12em] text-mist-400">
          {matchup.isPlayoff ? "Playoffs · " : ""}Week {matchup.week}
        </span>

        {outcome ? (
          <Badge tone={outcome.tone} className="animate-pop">
            {outcome.label}
          </Badge>
        ) : matchup.status === "live" ? (
          <Badge tone="live" pulse>
            Live
          </Badge>
        ) : matchup.status === "final" ? (
          <Badge tone="muted">Final</Badge>
        ) : (
          <Badge tone="muted">Scheduled</Badge>
        )}
      </div>

      {matchup.away === null ? (
        <div className="px-4 py-5 text-center">
          <p className="font-display text-lg font-bold uppercase tracking-wide text-mist-400">
            Bye week
          </p>
          <p className="mt-1 text-xs text-mist-500">No game this week.</p>
        </div>
      ) : (
        <ul className="divide-y divide-hairline">
          {lines.map((line, index) => {
            const won = index === 0 ? firstWon : secondWon;
            const lost = isFinal && !won && !tied;
            return (
              <li
                key={line.team?.id ?? index}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3",
                  won && "bg-turf-500/[0.06]",
                )}
              >
                {won && (
                  <span
                    className="absolute inset-y-0 left-0 w-0.5 bg-turf-500"
                    aria-hidden
                  />
                )}
                <TeamAvatar
                  name={line.team?.name ?? "Team"}
                  logoUrl={line.team?.logoUrl}
                  seed={line.team?.colorSeed ?? index}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "truncate font-semibold leading-tight",
                      lost ? "text-mist-400" : "text-chalk",
                    )}
                  >
                    {line.team?.name ?? "To be decided"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {matchup.status === "upcoming" ? (
                    // Before kickoff ESPN often has no projection yet. An empty
                    // column reads better than a row of dashes — the
                    // "Scheduled" badge already says the game hasn't happened.
                    line.projected !== null && (
                      <p className="text-xs text-mist-500">
                        <span className="block text-[0.5625rem] font-semibold uppercase tracking-[0.1em]">
                          Projected
                        </span>
                        <span className="font-display text-base font-bold tnum text-mist-300">
                          {formatPoints(line.projected)}
                        </span>
                      </p>
                    )
                  ) : (
                    <p
                      className={cn(
                        "font-display text-2xl font-bold leading-none tnum",
                        won ? "text-turf-400" : lost ? "text-mist-500" : "text-chalk",
                      )}
                    >
                      {formatPoints(line.score)}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
