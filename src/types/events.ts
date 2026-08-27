import type { LucideIcon } from "lucide-react";

export type EventKind = "draft" | "tournament" | "deadline" | "social" | "kickoff";

export interface LeagueEvent {
  id: string;
  title: string;
  /** ISO 8601 with offset so countdowns are unambiguous across timezones. */
  startsAt: string;
  /** Human label for the time, e.g. "7:00 PM". */
  timeLabel: string;
  description: string;
  kind: EventKind;
  location?: string;
}

export interface EventKindStyle {
  icon: LucideIcon;
  accent: string;
  chip: string;
  glow: string;
  label: string;
}
