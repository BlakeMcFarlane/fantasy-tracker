import Link from "next/link";
import { ArrowRight, ScrollText, Swords } from "lucide-react";

import { Hero } from "@/components/home/Hero";
import { PrizeCard } from "@/components/home/PrizeCard";
import { LeaguePulse } from "@/components/home/LeaguePulse";
import { LeagueRoll } from "@/components/home/LeagueRoll";
import { EventsSection } from "@/components/events/EventsSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StandingsList } from "@/components/teams/StandingsList";
import { DataNotice } from "@/components/ui/DataNotice";
import { Card } from "@/components/ui/Card";

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

        <section aria-label="Explore the league">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <QuickLink
              href="/matchups"
              title="Matchups"
              description="Every team's week-by-week schedule"
              icon={<Swords className="h-5 w-5" aria-hidden />}
              tone="frost"
            />
            <QuickLink
              href="/league"
              title="League Info"
              description="Rules, money, dates, and settings"
              icon={<ScrollText className="h-5 w-5" aria-hidden />}
              tone="gold"
            />
          </div>
        </section>
      </div>
    </>
  );
}

function QuickLink({
  href,
  title,
  description,
  icon,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: "frost" | "gold";
}) {
  return (
    <Link href={href} className="block">
      <Card interactive>
        <div className="flex items-center gap-3.5 p-4">
          <div
            className={
              tone === "frost"
                ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-frost-500/12 text-frost-400 ring-1 ring-frost-500/20"
                : "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-500/12 text-gold-400 ring-1 ring-gold-500/20"
            }
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-bold uppercase tracking-wide text-chalk">
              {title}
            </p>
            <p className="text-xs text-mist-400">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-ink-500" aria-hidden />
        </div>
      </Card>
    </Link>
  );
}
