import { CalendarCheck } from "lucide-react";
import { EventCard } from "./EventCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { upcomingEvents } from "@/lib/data/events";
import type { LeagueEvent } from "@/types/events";

interface EventsSectionProps {
  serverNow: number;
  /** Resolved calendar (ESPN draft date applied). */
  events?: LeagueEvent[];
  /** Hide the featured treatment when the section is not the page's focus. */
  featureFirst?: boolean;
  heading?: string;
  eyebrow?: string;
}

export function EventsSection({
  serverNow,
  events: allEvents,
  featureFirst = true,
  heading = "Upcoming Events",
  eyebrow = "Mark your calendar",
}: EventsSectionProps) {
  const events = upcomingEvents(serverNow, allEvents);

  return (
    <section aria-labelledby="events-heading">
      <SectionHeading id="events-heading" eyebrow={eyebrow} title={heading} />

      {events.length === 0 ? (
        <EmptyState
          compact
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Nothing on the calendar"
          message="No league events scheduled right now. Enjoy the quiet — it never lasts."
        />
      ) : (
        <div className="stagger space-y-3">
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              serverNow={serverNow}
              featured={featureFirst && index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
