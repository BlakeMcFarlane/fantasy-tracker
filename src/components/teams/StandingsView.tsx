"use client";

import { useState } from "react";

import { StandingsList } from "./StandingsList";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { Team } from "@/types/league";

type Mode = "simple" | "detailed";

interface StandingsViewProps {
  teams: Team[];
  hasPlayed: boolean;
  playoffTeamCount: number;
}

/**
 * Defaults to the simple view — rank, record, points. "Detailed" adds points
 * for/against and win percentage for anyone who wants them, without making the
 * first look intimidating.
 */
export function StandingsView({
  teams,
  hasPlayed,
  playoffTeamCount,
}: StandingsViewProps) {
  const [mode, setMode] = useState<Mode>("simple");

  return (
    <div>
      {hasPlayed && (
        <div className="mb-3 flex items-center justify-end gap-3">
          <SegmentedControl
            label="Standings detail level"
            value={mode}
            onChange={setMode}
            options={[
              { value: "simple", label: "Simple" },
              { value: "detailed", label: "Detailed" },
            ]}
          />
        </div>
      )}

      <StandingsList
        teams={teams}
        hasPlayed={hasPlayed}
        playoffTeamCount={playoffTeamCount}
        detailed={mode === "detailed"}
      />
    </div>
  );
}
