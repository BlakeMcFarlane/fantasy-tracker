
import { Hero } from "@/components/home/Hero";
import { PrizeCard } from "@/components/home/PrizeCard";
import { LeaguePulse } from "@/components/home/LeaguePulse";
import { LeagueRoll } from "@/components/home/LeagueRoll";
import { EventsSection } from "@/components/events/EventsSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StandingsList } from "@/components/teams/StandingsList";
import { DataNotice } from "@/components/ui/DataNotice";

import { getLeagueBundle } from "@/lib/espn/service";
import { getServerNow } from "@/lib/utils/server-time";
import { hasPlayedGames } from "@/lib/espn/derive";
import { resolveEvents, upcomingEvents } from "@/lib/data/events";
import { relativeLabel, timeRemaining } from "@/lib/utils/dates";
import type { BadgeTone } from "@/components/ui/Badge";
import type { LeagueEvent } from "@/types/events";

export const revalidate = 300;

/** Turns league phase + calendar into one short, human status line. */
function heroStatus(
  phase: string | undefined,
  currentWeek: number | undefined,
  serverNow: number,
  events: LeagueEvent[],
): { label: string; tone: BadgeTone; isLive: boolean } {
  if (phase === "regular" && currentWeek) {
    return { label: `Week ${currentWeek}`, tone: "live", isLive: true };
  }
  if (phase === "playoffs") return { label: "Playoffs", tone: "gold", isLive: true };
  if (phase === "complete") return { label: "Season complete", tone: "neutral", isLive: false };
  if (phase === "drafting") return { label: "Draft in progress", tone: "gold", isLive: true };

  const draft = upcomingEvents(serverNow, events).find(
    (event) => event.kind === "draft",
  );
  if (draft) {
    return {
      label: `Draft ${relativeLabel(timeRemaining(draft.startsAt, serverNow))}`,
      tone: "gold",
      isLive: false,
    };
  }
  return { label: "Preseason", tone: "gold", isLive: false };
}

export default async function HomePage() {
  const bundle = await getLeagueBundle();
  const serverNow = getServerNow();
  const played = hasPlayedGames(bundle);
  const events = resolveEvents(bundle.meta?.settings.draftDate);
  const upcoming = upcomingEvents(serverNow, events);
  const draft = upcoming.find((event) => event.kind === "draft") ?? null;
  const status = heroStatus(
    bundle.meta?.phase,
    bundle.meta?.currentWeek,
    serverNow,
    events,
  );

  return (
    <>
      <Hero
        statusLabel={status.label}
        statusTone={status.tone === "live" ? "live" : "gold"}
        isLive={status.isLive}
        draft={draft}
        serverNow={serverNow}
      />

      <div className="space-y-8 pt-1">
        <DataNotice source={bundle.source} error={bundle.error} />

        <PrizeCard />

        <EventsSection serverNow={serverNow} events={events} />

        {played && <LeaguePulse bundle={bundle} />}

        {played && bundle.teams.length > 0 && (
          <section aria-labelledby="top-heading">
            <SectionHeading
              id="top-heading"
              eyebrow="Right now"
              title="Top of the Table"
              action={{ label: "Full standings", href: "/standings" }}
            />
            <StandingsList teams={bundle.teams} hasPlayed limit={3} />
          </section>
        )}

        <LeagueRoll teams={bundle.teams} />

      </div>
    </>
  );
}
