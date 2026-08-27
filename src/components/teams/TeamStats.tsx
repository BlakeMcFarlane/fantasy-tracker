import { Activity, ArrowDownRight, ArrowUpRight, Hash, Sigma } from "lucide-react";

import { StatTile } from "@/components/ui/StatTile";
import { formatPoints, formatWholeNumber, ordinal } from "@/lib/utils/format";
import type { Team, TeamSeasonStats } from "@/types/league";

interface TeamStatsProps {
  team: Team;
  stats: TeamSeasonStats;
  hasPlayed: boolean;
}

/** Only the numbers that mean something. No charts for the sake of charts. */
export function TeamStats({ team, stats, hasPlayed }: TeamStatsProps) {
  if (!hasPlayed || stats.gamesPlayed === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <StatTile
        label="Points scored"
        value={formatWholeNumber(stats.totalPoints)}
        detail={`Across ${stats.gamesPlayed} ${stats.gamesPlayed === 1 ? "week" : "weeks"}`}
        icon={<Sigma className="h-3.5 w-3.5" aria-hidden />}
        tone="gold"
      />
      <StatTile
        label="Average week"
        value={formatPoints(stats.averagePoints)}
        detail="Points per week"
        icon={<Activity className="h-3.5 w-3.5" aria-hidden />}
      />
      <StatTile
        label="League rank"
        value={ordinal(team.rank)}
        detail="Current standing"
        icon={<Hash className="h-3.5 w-3.5" aria-hidden />}
      />
      {stats.highWeek && (
        <StatTile
          label="Best week"
          value={formatPoints(stats.highWeek.points)}
          detail={`Week ${stats.highWeek.week}`}
          icon={<ArrowUpRight className="h-3.5 w-3.5" aria-hidden />}
          tone="win"
        />
      )}
      {stats.lowWeek && stats.gamesPlayed > 1 && (
        <StatTile
          label="Worst week"
          value={formatPoints(stats.lowWeek.points)}
          detail={`Week ${stats.lowWeek.week}`}
          icon={<ArrowDownRight className="h-3.5 w-3.5" aria-hidden />}
          tone="loss"
        />
      )}
      <StatTile
        label="Points against"
        value={formatWholeNumber(team.pointsAgainst)}
        detail="Scored by opponents"
      />
    </div>
  );
}
