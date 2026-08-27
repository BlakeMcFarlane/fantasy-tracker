import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { TeamHeader } from "@/components/teams/TeamHeader";
import { TeamStats } from "@/components/teams/TeamStats";
import { RosterList } from "@/components/teams/RosterList";
import { SeasonTimeline } from "@/components/teams/SeasonTimeline";
import { MatchupCard } from "@/components/matchups/MatchupCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DataNotice } from "@/components/ui/DataNotice";
import { getLeagueBundle } from "@/lib/espn/service";
import { hasPlayedGames, teamSeasonStats, weeklyScores } from "@/lib/espn/derive";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Pre-render every team profile — there are only 14 of them. */
export async function generateStaticParams() {
  const bundle = await getLeagueBundle();
  return bundle.teams.map((team) => ({ id: String(team.id) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const bundle = await getLeagueBundle();
  const team = bundle.teams.find((entry) => entry.id === Number(id));
  if (!team) return { title: "Team" };
  return {
    title: team.name,
    description: team.owner
      ? `${team.name} — managed by ${team.owner}.`
      : `${team.name} team profile.`,
  };
}

export default async function TeamPage({ params }: PageProps) {
  const { id } = await params;
  const bundle = await getLeagueBundle();
  const team = bundle.teams.find((entry) => entry.id === Number(id));

  if (!team) notFound();

  const played = hasPlayedGames(bundle);
  const stats = teamSeasonStats(bundle, team);
  const roster = bundle.rosters.find((entry) => entry.teamId === team.id) ?? null;
  const scores = weeklyScores(bundle, team.id);
  const opponentNames = new Map(
    bundle.teams.map((entry) => [entry.id, entry.name]),
  );
  const isLast = team.rank === bundle.teams.length && bundle.teams.length > 1;
  const teamsById = new Map(bundle.teams.map((entry) => [entry.id, entry]));
  const upcoming = bundle.matchups
    .filter(
      (matchup) =>
        matchup.status !== "final" &&
        (matchup.home.teamId === team.id || matchup.away?.teamId === team.id),
    )
    .sort((a, b) => a.week - b.week)
    .slice(0, 3);

  return (
    <>
      <div className="pt-3">
        <Link
          href="/standings"
          className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-mist-400 transition hover:text-chalk"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Standings
        </Link>
      </div>

      <TeamHeader
        team={team}
        teamCount={bundle.teams.length}
        hasPlayed={played}
        isLast={isLast}
      />

      <div className="space-y-8">
        <DataNotice source={bundle.source} error={bundle.error} />

        {played && stats.gamesPlayed > 0 && (
          <section>
            <SectionHeading eyebrow="Season so far" title="The Numbers" />
            <TeamStats team={team} stats={stats} hasPlayed={played} />
          </section>
        )}

        {scores.length >= 2 && (
          <section>
            <SectionHeading
              eyebrow="Week by week"
              title="Scoring Trend"
              description="How many points they put up each week."
            />
            <SeasonTimeline entries={scores} opponentNames={opponentNames} />
          </section>
        )}

        {upcoming.length > 0 && (
          <section>
            <SectionHeading
              eyebrow="On deck"
              title="Next Up"
              description={`Who ${team.name} plays next.`}
              action={{ label: "Full schedule", href: `/matchups?team=${team.id}` }}
            />
            <ul className="space-y-2.5">
              {upcoming.map((matchup) => (
                <li key={matchup.id}>
                  <MatchupCard
                    matchup={matchup}
                    teamsById={teamsById}
                    perspectiveTeamId={team.id}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <SectionHeading
            eyebrow={
              roster ? `Week ${roster.week} lineup` : "Not drafted yet"
            }
            title="Roster"
          />
          <RosterList
            roster={roster}
            hasDrafted={bundle.meta?.hasDrafted ?? false}
            teamName={team.name}
          />
        </section>

        <Link
          href={`/matchups?team=${team.id}`}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink-800 px-5 text-sm font-semibold text-mist-300 ring-1 ring-hairline transition hover:bg-ink-700 hover:text-chalk"
        >
          See {team.name}&apos;s full schedule
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </>
  );
}
