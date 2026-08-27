import type { Metadata } from "next";
import { Trophy } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { DataNotice } from "@/components/ui/DataNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { StandingsView } from "@/components/teams/StandingsView";
import { getLeagueBundle } from "@/lib/espn/service";
import { hasPlayedGames } from "@/lib/espn/derive";
import { nextEvent } from "@/lib/data/events";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Standings",
  description: "Every team in the league, ranked.",
};

export default async function StandingsPage() {
  const bundle = await getLeagueBundle();
  const played = hasPlayedGames(bundle);
  const upcomingDraft = nextEvent()?.kind === "draft";

  return (
    <>
      <PageHeader
        eyebrow={
          played ? `Through week ${bundle.meta?.currentWeek ?? 1}` : "Season not started"
        }
        title="Standings"
        description={
          played
            ? "Best record at the top. Tap any team to see their roster and season."
            : "Everyone starts at 0-0, so there's nothing to rank yet — listed A–Z until Week 1 kicks off."
        }
      />

      <div className="space-y-5">
        <DataNotice source={bundle.source} error={bundle.error} />

        {bundle.teams.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-5 w-5" />}
            title="No teams yet"
            message={
              upcomingDraft
                ? "Teams will appear here as everyone joins the ESPN league before the draft."
                : "Connect the ESPN league to see all 14 teams ranked here."
            }
          />
        ) : (
          <StandingsView
            teams={bundle.teams}
            hasPlayed={played}
            playoffTeamCount={bundle.meta?.settings.playoffTeamCount ?? 0}
          />
        )}
      </div>
    </>
  );
}
