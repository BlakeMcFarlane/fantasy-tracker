"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CalendarX2 } from "lucide-react";

import { TeamSelector } from "./TeamSelector";
import { MatchupCard } from "./MatchupCard";
import { ScrollRow } from "@/components/ui/ScrollRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils/cn";
import { formatRecord } from "@/lib/utils/format";
import type { Matchup, Team } from "@/types/league";

interface MatchupsBrowserProps {
  teams: Team[];
  matchups: Matchup[];
  initialTeamId: number;
  currentWeek: number;
  hasPlayed: boolean;
}

export function MatchupsBrowser({
  teams,
  matchups,
  initialTeamId,
  currentWeek,
  hasPlayed,
}: MatchupsBrowserProps) {
  const [selectedId, setSelectedId] = useState(initialTeamId);
  const weekRefs = useRef(new Map<number, HTMLLIElement>());

  const teamsById = useMemo(
    () => new Map(teams.map((team) => [team.id, team])),
    [teams],
  );

  const selected = teamsById.get(selectedId) ?? teams[0];

  const teamMatchups = useMemo(
    () =>
      matchups
        .filter(
          (matchup) =>
            matchup.home.teamId === selectedId || matchup.away?.teamId === selectedId,
        )
        .sort((a, b) => a.week - b.week),
    [matchups, selectedId],
  );

  const weeks = useMemo(
    () => [...new Set(teamMatchups.map((matchup) => matchup.week))],
    [teamMatchups],
  );

  const handleSelect = useCallback((id: number) => {
    setSelectedId(id);
    // Keep the URL shareable without a full navigation.
    const url = new URL(window.location.href);
    url.searchParams.set("team", String(id));
    window.history.replaceState(null, "", url);
  }, []);

  const jumpToWeek = useCallback((week: number) => {
    weekRefs.current.get(week)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  const record = selected
    ? formatRecord(selected.wins, selected.losses, selected.ties)
    : null;

  return (
    <div>
      <div className="sticky top-12 z-30 -mx-4 bg-ink-950/92 pb-2 pt-2 backdrop-blur-xl md:top-16 md:-mx-6">
        <TeamSelector
          teams={teams}
          selectedId={selectedId}
          onSelect={handleSelect}
          bleed={false}
        />
      </div>

      {selected && (
        <p className="mt-3 truncate px-1 text-sm text-mist-400">
          <span className="font-semibold text-chalk">{selected.name}</span>
          {selected.owner ? ` · ${selected.owner}` : ""}
          {hasPlayed ? ` · ${record}` : ""}
        </p>
      )}

      {weeks.length > 1 && (
        <div className="mt-3">
          <ScrollRow label="Jump to a week">
            {weeks.map((week) => (
              <button
                key={week}
                type="button"
                onClick={() => jumpToWeek(week)}
                className={cn(
                  "min-h-9 shrink-0 snap-start rounded-full px-3.5 text-xs font-bold uppercase tracking-wide ring-1 transition",
                  week === currentWeek
                    ? "bg-gold-500/15 text-gold-400 ring-gold-500/30"
                    : "bg-ink-800 text-mist-400 ring-hairline hover:text-chalk",
                )}
              >
                Wk {week}
              </button>
            ))}
          </ScrollRow>
        </div>
      )}

      {teamMatchups.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={<CalendarX2 className="h-5 w-5" />}
          title="Schedule not set"
          message="ESPN builds the schedule once the league is finalised. It'll show up here the moment it does."
        />
      ) : (
        <ul className="mt-4 space-y-2.5">
          {teamMatchups.map((matchup) => (
            <li
              key={matchup.id}
              ref={(node) => {
                if (node) weekRefs.current.set(matchup.week, node);
                else weekRefs.current.delete(matchup.week);
              }}
              className="scroll-mt-32"
            >
              <MatchupCard
                matchup={matchup}
                teamsById={teamsById}
                perspectiveTeamId={selectedId}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
