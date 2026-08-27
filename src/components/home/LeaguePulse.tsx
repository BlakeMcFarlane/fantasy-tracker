import { Flame, Snowflake, Swords, Target, TrendingUp } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { leagueHighlights } from "@/lib/espn/derive";
import type { LeagueBundle } from "@/types/league";
import { formatPoints } from "@/lib/utils/format";

/**
 * Week-to-week talking points. Every tile is individually conditional — before
 * games are played this whole section renders nothing rather than a grid of
 * zeroes.
 */
export function LeaguePulse({ bundle }: { bundle: LeagueBundle }) {
  const highlights = leagueHighlights(bundle);
  const byId = new Map(bundle.teams.map((team) => [team.id, team]));

  const tiles = [
    highlights.leader && {
      key: "leader",
      label: "League leader",
      value: highlights.leader.detail ?? "—",
      detail: `${highlights.leader.value} record`,
      icon: <TrendingUp className="h-3.5 w-3.5" aria-hidden />,
      tone: "gold" as const,
    },
    highlights.topScorer && {
      key: "top",
      label: "Most points",
      value: highlights.topScorer.detail ?? "—",
      detail: `${highlights.topScorer.value} total`,
      icon: <Flame className="h-3.5 w-3.5" aria-hidden />,
      tone: "win" as const,
    },
    highlights.lowScorer && {
      key: "low",
      label: "Fewest points",
      value: highlights.lowScorer.detail ?? "—",
      detail: `${highlights.lowScorer.value} total`,
      icon: <Snowflake className="h-3.5 w-3.5" aria-hidden />,
      tone: "default" as const,
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    value: string;
    detail: string;
    icon: React.ReactNode;
    tone: "gold" | "win" | "default";
  }[];

  const closest = highlights.closestGame;
  const blowout = highlights.biggestWin;

  if (tiles.length === 0 && !closest && !blowout) return null;

  return (
    <section aria-labelledby="pulse-heading">
      <SectionHeading
        id="pulse-heading"
        eyebrow="How it's going"
        title="League Pulse"
        description="The stories worth talking about this season."
      />
      {tiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {tiles.map((tile) => (
            <StatTile
              key={tile.key}
              label={tile.label}
              value={
                <span className="block truncate text-xl sm:text-2xl">
                  {tile.value}
                </span>
              }
              detail={tile.detail}
              icon={tile.icon}
              tone={tile.tone}
            />
          ))}
        </div>
      )}

      {(closest || blowout) && (
        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
          {blowout && byId.get(blowout.teamId) && (
            <Card tone="outline">
              <div className="flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-flare-500/12 text-flare-400 ring-1 ring-flare-500/20">
                  <Swords className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-mist-500">
                    Biggest beatdown
                  </p>
                  <p className="mt-0.5 truncate font-display text-lg font-bold uppercase tracking-wide text-chalk">
                    {byId.get(blowout.teamId)!.name}
                  </p>
                  <p className="text-xs text-mist-400">
                    beat {byId.get(blowout.opponentId)?.name ?? "an opponent"} ·{" "}
                    {blowout.value}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {closest && byId.get(closest.winnerId) && (
            <Card tone="outline">
              <div className="flex items-start gap-3 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-frost-500/12 text-frost-400 ring-1 ring-frost-500/20">
                  <Target className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-mist-500">
                    Closest finish
                  </p>
                  <p className="mt-0.5 truncate font-display text-lg font-bold uppercase tracking-wide text-chalk">
                    {byId.get(closest.winnerId)!.name}
                  </p>
                  <p className="text-xs text-mist-400">
                    edged {byId.get(closest.loserId)?.name ?? "an opponent"} by{" "}
                    {formatPoints(closest.margin)} in Week {closest.week}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
