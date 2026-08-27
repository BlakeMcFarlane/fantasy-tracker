import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EVENT_STYLES } from "./event-styles";
import type { LeagueEvent } from "@/types/events";
import { cn } from "@/lib/utils/cn";
import {
  dayOfMonth,
  monthShort,
  relativeLabel,
  timeRemaining,
  weekdayShort,
} from "@/lib/utils/dates";

interface EventCardProps {
  event: LeagueEvent;
  serverNow: number;
  /** The soonest event gets the countdown and a gold frame. */
  featured?: boolean;
}

export function EventCard({ event, serverNow, featured = false }: EventCardProps) {
  const style = EVENT_STYLES[event.kind];
  const Icon = style.icon;
  const remaining = timeRemaining(event.startsAt, serverNow);

  return (
    <Card
      as="article"
      tone={featured ? "gold" : "default"}
      className={cn("relative overflow-hidden", featured && "shadow-lift")}
    >
      {featured && (
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-radial blur-2xl",
            "bg-gradient-to-br to-transparent",
            style.glow,
          )}
          aria-hidden
        />
      )}

      <div className="relative flex gap-3.5 p-4 sm:p-5">
        {/* Date block */}
        <div
          className={cn(
            "flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ring-1",
            featured
              ? "bg-gold-500 text-on-accent ring-gold-400/50"
              : "bg-ink-800 text-chalk ring-hairline",
          )}
        >
          <span
            className={cn(
              "font-display text-[0.625rem] font-bold uppercase tracking-[0.14em]",
              featured ? "text-on-accent/70" : "text-mist-500",
            )}
          >
            {monthShort(event.startsAt)}
          </span>
          <span className="font-display text-2xl font-extrabold leading-none tnum">
            {dayOfMonth(event.startsAt)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <Badge tone="neutral" className={cn("mb-1.5 ring-1", style.chip)}>
            <Icon className="h-3 w-3" aria-hidden />
            {style.label}
          </Badge>

          <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide text-chalk sm:text-xl">
            {event.title}
          </h3>

          <p className="mt-0.5 text-sm font-medium text-mist-300">
            {weekdayShort(event.startsAt)} · {event.timeLabel}
            <span className="text-mist-500">
              {" · "}
              {relativeLabel(remaining)}
            </span>
          </p>

          <p className="mt-2 text-sm leading-relaxed text-mist-400 text-balance-pretty">
            {event.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
