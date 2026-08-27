"use client";

import { useEffect, useMemo, useRef } from "react";

import { ScrollRow } from "@/components/ui/ScrollRow";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { cn } from "@/lib/utils/cn";
import { shortTeamLabels } from "@/lib/utils/format";
import type { Team } from "@/types/league";

interface TeamSelectorProps {
  teams: Team[];
  selectedId: number;
  onSelect: (id: number) => void;
  bleed?: boolean;
}

/** Horizontal, thumb-friendly picker for all 14 teams. */
export function TeamSelector({
  teams,
  selectedId,
  onSelect,
  bleed = true,
}: TeamSelectorProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);
  const labels = useMemo(() => shortTeamLabels(teams), [teams]);

  // Keep the active team visible when it changes (e.g. from a deep link).
  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedId]);

  return (
    <ScrollRow label="Choose a team" bleed={bleed}>
      {teams.map((team) => {
        const selected = team.id === selectedId;
        return (
          <button
            key={team.id}
            ref={selected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(team.id)}
            aria-pressed={selected}
            className={cn(
              "flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl px-1 py-2 transition duration-200",
              selected
                ? "bg-gold-500/12 ring-1 ring-gold-500/40"
                : "hover:bg-surface-hover active:scale-[0.97] motion-reduce:active:scale-100",
            )}
          >
            <TeamAvatar
              name={team.name}
              logoUrl={team.logoUrl}
              seed={team.colorSeed}
              size="md"
              className={cn(
                "transition duration-200",
                selected && "ring-2 ring-gold-400",
              )}
            />
            <span
              className={cn(
                "max-w-full truncate text-[0.6875rem] font-bold uppercase tracking-wide",
                selected ? "text-gold-400" : "text-mist-400",
              )}
            >
              {labels.get(team.id) ?? team.abbrev}
            </span>
          </button>
        );
      })}
    </ScrollRow>
  );
}
