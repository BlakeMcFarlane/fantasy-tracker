import { CalendarClock, ClipboardList, Flag, Gamepad2, Timer } from "lucide-react";
import type { EventKind, EventKindStyle } from "@/types/events";

export const EVENT_STYLES: Record<EventKind, EventKindStyle> = {
  draft: {
    icon: ClipboardList,
    accent: "text-gold-400",
    chip: "bg-gold-500/15 text-gold-400 ring-gold-500/30",
    glow: "from-gold-500/20",
    label: "Draft",
  },
  tournament: {
    icon: Gamepad2,
    accent: "text-frost-400",
    chip: "bg-frost-500/12 text-frost-400 ring-frost-500/25",
    glow: "from-frost-500/18",
    label: "League event",
  },
  deadline: {
    icon: Timer,
    accent: "text-flare-400",
    chip: "bg-flare-500/12 text-flare-400 ring-flare-500/25",
    glow: "from-flare-500/18",
    label: "Deadline",
  },
  social: {
    icon: CalendarClock,
    accent: "text-violet-400",
    chip: "bg-violet-400/12 text-violet-400 ring-violet-400/25",
    glow: "from-violet-400/18",
    label: "Hangout",
  },
  kickoff: {
    icon: Flag,
    accent: "text-turf-400",
    chip: "bg-turf-500/12 text-turf-400 ring-turf-500/25",
    glow: "from-turf-500/18",
    label: "Kickoff",
  },
};
