import { Users } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlayerRow } from "./PlayerRow";
import { POSITION_META } from "@/lib/utils/positions";
import type { TeamRoster } from "@/types/league";

const LEGEND_ORDER = ["QB", "RB", "WR", "TE", "K", "DST"];

interface RosterListProps {
  roster: TeamRoster | null;
  hasDrafted: boolean;
  teamName: string;
}

export function RosterList({ roster, hasDrafted, teamName }: RosterListProps) {
  if (!roster || (roster.starters.length === 0 && roster.bench.length === 0)) {
    return (
      <EmptyState
        icon={<Users className="h-5 w-5" />}
        title={hasDrafted ? "Roster unavailable" : "Rosters appear after the draft"}
        message={
          hasDrafted
            ? `We couldn't load ${teamName}'s roster from ESPN right now. Try again in a few minutes.`
            : "Nobody has picked a single player yet. Come back after draft night and this will be full of them."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <RosterGroup
        title="Starters"
        subtitle="These players score points this week."
        players={roster.starters}
        showLegend
      />
      {roster.bench.length > 0 && (
        <RosterGroup
          title="Bench"
          subtitle="Backups. They don't score this week."
          players={roster.bench}
        />
      )}
    </div>
  );
}

function RosterGroup({
  title,
  subtitle,
  players,
  showLegend = false,
}: {
  title: string;
  subtitle: string;
  players: TeamRoster["starters"];
  showLegend?: boolean;
}) {
  if (players.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
        <h3 className="font-display text-base font-bold uppercase tracking-[0.1em] text-chalk">
          {title}
        </h3>
        <span className="text-xs text-mist-500">{subtitle}</span>
      </div>

      <Card>
        <ul className="divide-y divide-hairline py-1">
          {players.map((player) => (
            <PlayerRow key={`${player.id}-${player.lineupSlot}`} player={player} />
          ))}
        </ul>
      </Card>

      {showLegend && (
        <details className="group mt-2 rounded-2xl bg-ink-850/60 px-4 py-3 ring-1 ring-hairline">
          <summary className="cursor-pointer list-none text-xs font-semibold text-mist-400 transition hover:text-chalk">
            New to fantasy? What the position labels mean
            <span className="ml-1 text-mist-600 group-open:hidden" aria-hidden>
              ▾
            </span>
          </summary>
          <dl className="mt-3 space-y-2">
            {LEGEND_ORDER.map((key) => {
              const meta = POSITION_META[key];
              if (!meta) return null;
              return (
                <div key={key} className="flex gap-3 text-xs">
                  <dt className="w-10 shrink-0 font-bold uppercase text-mist-300">
                    {key}
                  </dt>
                  <dd className="text-mist-500">
                    <span className="font-medium text-mist-300">{meta.full}</span>
                    {" — "}
                    {meta.blurb}
                  </dd>
                </div>
              );
            })}
          </dl>
        </details>
      )}
    </section>
  );
}
