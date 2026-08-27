import type { LeagueEvent } from "@/types/events";
import { timeLabel } from "@/lib/utils/dates";

/**
 * Upcoming league events. Add new entries here — the Home and League pages
 * sort them by date, highlight whichever is next, and hide anything past.
 */
export const LEAGUE_EVENTS: LeagueEvent[] = [
  {
    id: "mario-kart-2026",
    title: "Mario Kart Tournament",
    startsAt: "2026-09-04T19:00:00-04:00",
    timeLabel: "7:00 PM",
    description:
      "League night before the draft. Bracket play, bragging rights, zero mercy on Rainbow Road.",
    kind: "tournament",
  },
  {
    id: "draft-2026",
    title: "Fantasy Football Draft",
    startsAt: "2026-09-05T19:00:00-04:00",
    timeLabel: "7:00 PM",
    description:
      "The 2026 Chase & Champions draft. Show up on time or the computer picks for you.",
    kind: "draft",
  },
];

/**
 * The calendar, with the draft's date taken from ESPN when we have it. If the
 * draft gets rescheduled in ESPN, every countdown in the app follows without a
 * code change.
 */
export function resolveEvents(espnDraftDate?: string | null): LeagueEvent[] {
  if (!espnDraftDate) return LEAGUE_EVENTS;
  return LEAGUE_EVENTS.map((event) =>
    event.kind === "draft"
      ? {
          ...event,
          startsAt: espnDraftDate,
          timeLabel: timeLabel(espnDraftDate),
        }
      : event,
  );
}

/** Events that have not started yet, soonest first. */
export function upcomingEvents(
  now: number = Date.now(),
  events: LeagueEvent[] = LEAGUE_EVENTS,
): LeagueEvent[] {
  return [...events]
    .filter((event) => new Date(event.startsAt).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
}

/** The single next event, or null once the calendar is empty. */
export function nextEvent(
  now: number = Date.now(),
  events: LeagueEvent[] = LEAGUE_EVENTS,
): LeagueEvent | null {
  return upcomingEvents(now, events)[0] ?? null;
}

export function eventById(id: string): LeagueEvent | undefined {
  return LEAGUE_EVENTS.find((event) => event.id === id);
}
