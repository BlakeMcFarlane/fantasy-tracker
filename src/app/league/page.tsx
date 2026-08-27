import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DataNotice } from "@/components/ui/DataNotice";
import { RulesCard } from "@/components/league/RulesCard";
import { ImportantDates } from "@/components/league/ImportantDates";
import { SettingsGrid } from "@/components/league/SettingsGrid";
import { LineupCard } from "@/components/league/LineupCard";
import { getLeagueBundle } from "@/lib/espn/service";
import { getServerNow } from "@/lib/utils/server-time";
import { LEAGUE_BRAND, LEAGUE_LINKS } from "@/lib/data/league-config";
import { resolveEvents } from "@/lib/data/events";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "League",
  description: "Rules, money, key dates, and how the season works.",
};

export default async function LeaguePage() {
  const bundle = await getLeagueBundle();
  const serverNow = getServerNow();
  const lineup = bundle.meta?.settings.lineup ?? [];
  const events = resolveEvents(bundle.meta?.settings.draftDate);

  return (
    <>
      <PageHeader
        eyebrow={`${LEAGUE_BRAND.season} Season`}
        title="League Info"
        description="Everything about how this league runs — the money, the dates, and the settings."
      />

      <div className="space-y-8">
        <DataNotice source={bundle.source} error={bundle.error} />

        <section>
          <SectionHeading
            eyebrow="The deal"
            title="League Rules"
            description="The house rules everyone agreed to."
          />
          <RulesCard />
        </section>

        <section>
          <SectionHeading
            eyebrow="Save the date"
            title="Important Dates"
            description="Don't be the person who misses the draft."
          />
          <ImportantDates serverNow={serverNow} events={events} />
        </section>

        {lineup.length > 0 && (
          <section>
            <SectionHeading
              eyebrow="How it works"
              title="Starting Lineup"
              description="The spots you fill every week."
            />
            <LineupCard lineup={lineup} />
          </section>
        )}

        <section>
          <SectionHeading
            eyebrow="From ESPN"
            title="League Settings"
            description="Pulled straight from the league, in plain English."
          />
          <SettingsGrid meta={bundle.meta} />
        </section>

        {LEAGUE_LINKS.espnLeagueUrl && (
          <a
            href={LEAGUE_LINKS.espnLeagueUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink-800 px-5 text-sm font-semibold text-mist-300 ring-1 ring-hairline transition hover:bg-ink-700 hover:text-chalk"
          >
            Open the league on ESPN
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
    </>
  );
}
