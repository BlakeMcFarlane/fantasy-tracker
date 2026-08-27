import { LEAGUE_TIMEZONE } from "@/lib/data/league-config";

export interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export function timeRemaining(target: string | number | Date, from: number): TimeRemaining {
  const targetMs = new Date(target).getTime();
  const total = Math.max(0, targetMs - from);
  return {
    total,
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total / 3_600_000) % 24),
    minutes: Math.floor((total / 60_000) % 60),
    seconds: Math.floor((total / 1000) % 60),
    isPast: targetMs <= from,
  };
}

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: LEAGUE_TIMEZONE,
});
const dayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  timeZone: LEAGUE_TIMEZONE,
});
const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: LEAGUE_TIMEZONE,
});
const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: LEAGUE_TIMEZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: LEAGUE_TIMEZONE,
});

/** "7:00 PM" in the league's timezone. */
export function timeLabel(value: string | Date): string {
  return timeFormatter.format(new Date(value));
}

export function monthShort(value: string | Date): string {
  return monthFormatter.format(new Date(value)).toUpperCase();
}

export function dayOfMonth(value: string | Date): string {
  return dayFormatter.format(new Date(value));
}

export function weekdayShort(value: string | Date): string {
  return weekdayFormatter.format(new Date(value));
}

export function longDate(value: string | Date): string {
  return longDateFormatter.format(new Date(value));
}

/** "in 9 days", "in 4 hours", "starting now". */
export function relativeLabel(remaining: TimeRemaining): string {
  if (remaining.isPast) return "Happening now";
  if (remaining.days >= 1) {
    return `in ${remaining.days} ${remaining.days === 1 ? "day" : "days"}`;
  }
  if (remaining.hours >= 1) {
    return `in ${remaining.hours} ${remaining.hours === 1 ? "hour" : "hours"}`;
  }
  if (remaining.minutes >= 1) {
    return `in ${remaining.minutes} min`;
  }
  return "starting now";
}
