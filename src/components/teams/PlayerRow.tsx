import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { cn } from "@/lib/utils/cn";
import { formatPoints } from "@/lib/utils/format";
import { injuryLabel, positionMeta } from "@/lib/utils/positions";
import type { RosterPlayer } from "@/types/league";

export function PlayerRow({ player }: { player: RosterPlayer }) {
  const meta = positionMeta(player.isStarter ? player.lineupSlot : player.position);
  const injury = injuryLabel(player.injuryStatus);
  // Before kickoff the projection is the number that means something; once the
  // game is played, the real score takes over.
  const played = player.points !== null;
  const primary = played ? player.points : player.projected;

  return (
    <li className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-3">
      <span
        className={cn(
          "flex h-9 w-10 shrink-0 items-center justify-center rounded-lg text-[0.6875rem] font-bold uppercase tracking-wide ring-1 sm:w-11",
          meta.tone,
        )}
        title={`${meta.full}${meta.blurb ? ` — ${meta.blurb}` : ""}`}
      >
        {player.isStarter ? player.lineupSlot : player.position}
      </span>

      <PlayerAvatar
        name={player.name}
        headshotUrl={player.headshotUrl}
        className="max-[359px]:hidden"
      />

      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[0.9375rem] font-semibold leading-tight text-chalk">
          {player.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-mist-500">
          <span className="truncate">
            {positionMeta(player.position).full}
            {player.proTeam ? ` · ${player.proTeam}` : ""}
          </span>
          {injury && (
            <span className="shrink-0 rounded-full bg-flare-500/12 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-wide text-flare-400">
              {injury}
            </span>
          )}
        </p>
      </div>

      <div className="w-[3.25rem] shrink-0 text-right">
        <p
          className={cn(
            "font-display text-lg font-bold leading-none tnum",
            played ? "text-chalk" : "text-mist-300",
          )}
        >
          {formatPoints(primary)}
        </p>
        <p className="mt-0.5 text-[0.625rem] font-medium uppercase tracking-wide text-mist-500">
          {played
            ? player.projected !== null
              ? `proj ${formatPoints(player.projected)}`
              : "points"
            : "projected"}
        </p>
      </div>
    </li>
  );
}
