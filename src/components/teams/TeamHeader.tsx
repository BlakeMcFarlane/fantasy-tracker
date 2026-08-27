import { Crown } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { StreakChip } from "./StreakChip";
import { isDefendingChampion } from "@/lib/data/league-config";
import { formatRecord, ordinal } from "@/lib/utils/format";
import type { Team } from "@/types/league";

interface TeamHeaderProps {
  team: Team;
  teamCount: number;
  hasPlayed: boolean;
  isLast: boolean;
}

export function TeamHeader({
  team,
  teamCount,
  hasPlayed,
  isLast,
}: TeamHeaderProps) {
  const champion = isDefendingChampion(team.name, team.owner);

  return (
    <header className="relative -mx-4 mb-6 overflow-hidden px-4 pb-6 pt-5 md:mx-0 md:rounded-card md:px-8 md:ring-1 md:ring-white/8">
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink-850 to-ink-950"
        aria-hidden
      />
      <div
        className="field-lines absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        aria-hidden
      />
      {team.rank === 1 && hasPlayed && (
        <div
          className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-gold-500/16 blur-[70px]"
          aria-hidden
        />
      )}

      <div className="relative flex items-start gap-4">
        <TeamAvatar
          name={team.name}
          logoUrl={team.logoUrl}
          seed={team.colorSeed}
          size="xl"
        />

        <div className="min-w-0 flex-1 pt-0.5">
          <h1 className="font-display text-[1.75rem] font-extrabold uppercase leading-[0.95] tracking-tight text-chalk sm:text-4xl">
            {team.name}
          </h1>
          {team.owner && (
            <p className="mt-1 text-sm font-medium text-mist-400">{team.owner}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {hasPlayed && (
              <Badge tone={team.rank === 1 ? "gold" : "neutral"}>
                {team.rank === 1 && <Crown className="h-3 w-3" aria-hidden />}
                {ordinal(team.rank)} of {teamCount}
              </Badge>
            )}
            {champion && <Badge tone="gold">Defending Champion</Badge>}
            {hasPlayed && <StreakChip streak={team.streak} />}
            {isLast && hasPlayed && <Badge tone="muted">Last place</Badge>}
            {!hasPlayed && <Badge tone="neutral">Season not started</Badge>}
          </div>
        </div>
      </div>

      {hasPlayed && (
        <p className="relative mt-5 font-display text-5xl font-extrabold leading-none tnum text-chalk">
          {formatRecord(team.wins, team.losses, team.ties)}
          <span className="ml-2 align-middle text-sm font-semibold uppercase tracking-[0.14em] text-mist-500">
            Record
          </span>
        </p>
      )}
    </header>
  );
}
