import { Trophy } from "lucide-react";
import { StandingsRow } from "./StandingsRow";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Team } from "@/types/league";

interface StandingsListProps {
  teams: Team[];
  hasPlayed: boolean;
  /** Draw the playoff cut line after this many teams. 0 hides it. */
  playoffTeamCount?: number;
  limit?: number;
  detailed?: boolean;
}

export function StandingsList({
  teams,
  hasPlayed,
  playoffTeamCount = 0,
  limit,
  detailed = false,
}: StandingsListProps) {
  const visible = limit ? teams.slice(0, limit) : teams;

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="h-5 w-5" />}
        title="No standings yet"
        message="Standings will fill in as soon as the league is set up and Week 1 kicks off."
      />
    );
  }

  const showCut =
    hasPlayed && !limit && playoffTeamCount > 0 && playoffTeamCount < teams.length;

  return (
    <ol className="space-y-2">
      {visible.map((team, index) => (
        <li key={team.id}>
          <StandingsRow
            team={team}
            hasPlayed={hasPlayed}
            detailed={detailed}
            isLast={hasPlayed && !limit && index === visible.length - 1}
          />
          {showCut && index === playoffTeamCount - 1 && (
            <div
              className="my-3 flex items-center gap-3"
              aria-label={`Playoff cut line — top ${playoffTeamCount} make the playoffs`}
            >
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-turf-500/40" />
              <span className="text-[0.625rem] font-bold uppercase tracking-[0.14em] text-turf-400">
                Playoff line
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-turf-500/40" />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
