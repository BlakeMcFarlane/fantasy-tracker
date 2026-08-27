import Link from "next/link";
import { Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollRow } from "@/components/ui/ScrollRow";
import { TeamAvatar } from "@/components/ui/TeamAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { LEAGUE_MONEY } from "@/lib/data/league-config";
import type { Team } from "@/types/league";

/**
 * Who is actually in the league. Works before the draft (when standings would
 * be meaningless) and stays useful afterwards as a quick way into any profile.
 */
function firstName(owner: string | null): string | null {
  if (!owner) return null;
  return owner.trim().split(/\s+/)[0] || null;
}

export function LeagueRoll({ teams }: { teams: Team[] }) {
  return (
    <section aria-labelledby="roll-heading">
      <SectionHeading
        id="roll-heading"
        eyebrow={`${teams.length || LEAGUE_MONEY.teamCount} managers`}
        title="Who's In"
        description="Tap anyone to see their team."
        action={teams.length > 0 ? { label: "All teams", href: "/standings" } : undefined}
      />
      {teams.length === 0 ? (
        <EmptyState
          compact
          icon={<Users className="h-5 w-5" />}
          title="Teams are on the way"
          message="Once everyone joins the ESPN league, all 14 teams will show up right here."
        />
      ) : (
        <ScrollRow label="League teams">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/team/${team.id}`}
              className="group flex w-[5.75rem] shrink-0 snap-start flex-col items-center gap-2 rounded-2xl p-2 transition hover:bg-surface-hover active:scale-[0.97] motion-reduce:active:scale-100"
            >
              <TeamAvatar
                name={team.name}
                logoUrl={team.logoUrl}
                seed={team.colorSeed}
                size="lg"
                className="transition-transform duration-200 group-hover:scale-105 motion-reduce:group-hover:scale-100"
              />
              {/* The person reads faster than the team name here — this
                  section is about who's in the league. */}
              <span className="max-w-full truncate text-center text-xs font-bold text-chalk">
                {firstName(team.owner) ?? team.name}
              </span>
              <span className="-mt-1.5 line-clamp-2 text-center text-[0.625rem] leading-tight text-mist-500 group-hover:text-mist-400">
                {team.name}
              </span>
            </Link>
          ))}
        </ScrollRow>
      )}
    </section>
  );
}
