import { CalendarDays, Check } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EVENT_STYLES } from "@/components/events/event-styles";
import { LEAGUE_EVENTS } from "@/lib/data/events";
import type { LeagueEvent } from "@/types/events";
import { cn } from "@/lib/utils/cn";
import { longDate, relativeLabel, timeRemaining } from "@/lib/utils/dates";

/** Every date on the league calendar, past ones included and clearly done. */
export function ImportantDates({
  serverNow,
  events = LEAGUE_EVENTS,
}: {
  serverNow: number;
  events?: LeagueEvent[];
}) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );

  return (
    <Card>
      <ul className="divide-y divide-hairline">
        {sorted.map((event) => {
          const remaining = timeRemaining(event.startsAt, serverNow);
          const style = EVENT_STYLES[event.kind];
          const Icon = remaining.isPast ? Check : style.icon;

          return (
            <li key={event.id} className="flex items-center gap-3.5 p-4">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                  remaining.isPast
                    ? "bg-ink-700 text-mist-500 ring-hairline"
                    : cn("ring-1", style.chip),
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "truncate font-semibold",
                    remaining.isPast ? "text-mist-500 line-through" : "text-chalk",
                  )}
                >
                  {event.title}
                </p>
                <p className="truncate text-xs text-mist-500">
                  {longDate(event.startsAt)} · {event.timeLabel}
                </p>
              </div>

              <span
                className={cn(
                  "shrink-0 text-xs font-semibold",
                  remaining.isPast ? "text-mist-600" : "text-gold-400",
                )}
              >
                {remaining.isPast ? "Done" : relativeLabel(remaining)}
              </span>
            </li>
          );
        })}

        {sorted.length === 0 && (
          <li className="flex items-center gap-3 p-5 text-sm text-mist-400">
            <CalendarDays className="h-4 w-4" aria-hidden />
            No dates on the calendar yet.
          </li>
        )}
      </ul>
    </Card>
  );
}
