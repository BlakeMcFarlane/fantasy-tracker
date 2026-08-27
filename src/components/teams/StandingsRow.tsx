import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { Badge } from "@/components/ui/Badge";
import { RankBadge } from "./RankBadge";
import { StreakChip } from "./StreakChip";
import { cn } from "@/lib/utils/cn";
import {
  formatPoints,
  formatRecord,
  formatWholeNumber,
  formatWinPct,
  winPercentage,
} from "@/lib/utils/format";
import { isDefendingChampion } from "@/lib/data/league-config";
import type { Team } from "@/types/league";

interface StandingsRowProps {
  team: Team;
  /** Show the "Last place" ribbon on the bottom team once games are played. */
  isLast?: boolean;
  showPoints?: boolean;
  hasPlayed?: boolean;
  /** Adds a points-for / points-against / win-% strip under the row. */
  detailed?: boolean;
}

export function StandingsRow({
  team,
  isLast = false,
  showPoints = true,
  hasPlayed = true,
  detailed = false,
}: StandingsRowProps) {
  const champion = isDefendingChampion(team.name, team.owner);
  const podium = team.rank <= 3 && hasPlayed;

  return (
    <Link
      href={`/team/${team.id}`}
      className={cn(
        "group relative block overflow-hidden rounded-card px-3 py-3 ring-1 transition duration-200",
        "bg-ink-850 ring-hairline hover:ring-hairline-strong active:scale-[0.99] motion-reduce:active:scale-100",
        podium && "bg-gradient-to-r from-gold-500/[0.07] to-transparent",
      )}
    >
      <span className="flex items-center gap-2.5 sm:gap-3">
      {podium && (
        <span
          className={cn(
            "absolute inset-y-0 left-0 w-1",
            team.rank === 1 && "bg-gold-500",
            team.rank === 2 && "bg-mist-400",
            team.rank === 3 && "bg-bronze",
          )}
          aria-hidden
        />
      )}

      {/* No games played means no real order — a rank number there would
          imply a standing that does not exist yet. */}
      {hasPlayed && <RankBadge rank={team.rank} className={cn(podium && "ml-1")} />}

      <TeamAvatar
        name={team.name}
        logoUrl={team.logoUrl}
        seed={team.colorSeed}
        size="sm"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[0.9375rem] font-semibold leading-tight text-chalk">
            {team.name}
          </p>
          {champion && (
            <Badge tone="gold" className="shrink-0 px-1.5 py-0.5 text-[0.5625rem]">
              Champ
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          {team.owner && (
            <span className="truncate text-xs text-mist-500">{team.owner}</span>
          )}
          {hasPlayed && <StreakChip streak={team.streak} />}
          {isLast && (
            <span className="shrink-0 rounded-full bg-ink-700 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-mist-400">
              Last place
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-display text-xl font-bold leading-none tnum text-chalk">
          {hasPlayed ? formatRecord(team.wins, team.losses, team.ties) : "—"}
        </p>
        {showPoints && (
          <p className="mt-1 text-[0.6875rem] tnum text-mist-500">
            {hasPlayed
              ? `${formatWholeNumber(team.pointsFor)} pts`
              : "Not started"}
          </p>
        )}
      </div>

      <ChevronRight
        className="h-4 w-4 shrink-0 text-ink-500 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-mist-400 max-[359px]:hidden"
        aria-hidden
      />
      </span>

      {detailed && hasPlayed && (
        <span className="mt-2.5 flex items-stretch gap-2 border-t border-hairline pt-2.5 pl-1">
          <DetailStat label="Pts for" value={formatPoints(team.pointsFor)} />
          <DetailStat
            label="Pts against"
            value={formatPoints(team.pointsAgainst)}
          />
          <DetailStat
            label="Win %"
            value={formatWinPct(winPercentage(team.wins, team.losses, team.ties))}
          />
        </span>
      )}
    </Link>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex-1">
      <span className="block whitespace-nowrap text-[0.5625rem] font-semibold uppercase tracking-[0.08em] text-mist-500">
        {label}
      </span>
      <span className="block font-display text-base font-bold tnum text-mist-300">
        {value}
      </span>
    </span>
  );
}
