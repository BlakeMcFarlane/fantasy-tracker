import type { Metadata } from "next";
import { Swords } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { DataNotice } from "@/components/ui/DataNotice";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchupsBrowser } from "@/components/matchups/MatchupsBrowser";
import { getLeagueBundle } from "@/lib/espn/service";
import { hasPlayedGames } from "@/lib/espn/derive";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Matchups",
  description: "Every team's schedule, week by week.",
};

export default async function MatchupsPage({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const [bundle, params] = await Promise.all([
    getLeagueBundle(),
    searchParams,
  ]);

  const requested = Number(params.team);
  const initialTeamId =
    bundle.teams.find((team) => team.id === requested)?.id ??
    bundle.teams[0]?.id ??
    0;

  return (
    <>
      <PageHeader
        eyebrow="Week by week"
        title="Matchups"
        description="Pick a team to see who they play, and how it went."
      />

      <div className="space-y-5">
        <DataNotice source={bundle.source} error={bundle.error} />

        {bundle.teams.length === 0 ? (
          <EmptyState
            icon={<Swords className="h-5 w-5" />}
            title="No matchups yet"
            message="Once the league is set up on ESPN, every team's full schedule lands here."
          />
        ) : (
          <MatchupsBrowser
            teams={bundle.teams}
            matchups={bundle.matchups}
            initialTeamId={initialTeamId}
            currentWeek={bundle.meta?.currentWeek ?? 1}
            hasPlayed={hasPlayedGames(bundle)}
          />
        )}
      </div>
    </>
  );
}
