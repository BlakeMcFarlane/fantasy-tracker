import type { Position } from "@/types/league";

interface PositionMeta {
  short: Position | string;
  full: string;
  /** One line a casual fan can actually use. */
  blurb: string;
  tone: string;
}

export const POSITION_META: Record<string, PositionMeta> = {
  QB: {
    short: "QB",
    full: "Quarterback",
    blurb: "Throws the ball. Usually your highest scorer.",
    tone: "bg-flare-500/15 text-flare-400 ring-flare-500/25",
  },
  RB: {
    short: "RB",
    full: "Running Back",
    blurb: "Runs the ball. Scores touchdowns on the ground.",
    tone: "bg-turf-500/15 text-turf-400 ring-turf-500/25",
  },
  WR: {
    short: "WR",
    full: "Wide Receiver",
    blurb: "Catches passes down the field.",
    tone: "bg-frost-500/15 text-frost-400 ring-frost-500/25",
  },
  TE: {
    short: "TE",
    full: "Tight End",
    blurb: "Blocks and catches. A hybrid of the two.",
    tone: "bg-gold-500/15 text-gold-400 ring-gold-500/25",
  },
  K: {
    short: "K",
    full: "Kicker",
    blurb: "Kicks field goals and extra points.",
    tone: "bg-violet-400/15 text-violet-400 ring-violet-400/25",
  },
  DST: {
    short: "DST",
    full: "Defense",
    blurb: "The whole defense scores as one unit.",
    tone: "bg-mist-400/15 text-mist-300 ring-mist-400/25",
  },
  FLEX: {
    short: "FLEX",
    full: "Flex Spot",
    blurb: "Any running back, receiver, or tight end.",
    tone: "bg-ink-600 text-mist-300 ring-ink-500",
  },
  BE: {
    short: "BE",
    full: "Bench",
    blurb: "Not playing this week — no points counted.",
    tone: "bg-ink-700 text-mist-400 ring-ink-600",
  },
  IR: {
    short: "IR",
    full: "Injured Reserve",
    blurb: "Out with an injury, held in a separate spot.",
    tone: "bg-flare-500/10 text-flare-400 ring-flare-500/20",
  },
};

const FALLBACK: PositionMeta = {
  short: "—",
  full: "Player",
  blurb: "",
  tone: "bg-ink-700 text-mist-400 ring-ink-600",
};

export function positionMeta(position: string): PositionMeta {
  return POSITION_META[position?.toUpperCase()] ?? FALLBACK;
}

/** ESPN lineup slot ids → readable slot names. */
export const LINEUP_SLOT_LABELS: Record<number, string> = {
  0: "QB",
  1: "TQB",
  2: "RB",
  3: "RB/WR",
  4: "WR",
  5: "WR/TE",
  6: "TE",
  7: "OP",
  8: "DT",
  9: "DE",
  10: "LB",
  11: "DL",
  12: "CB",
  13: "S",
  14: "DB",
  15: "DP",
  16: "DST",
  17: "K",
  18: "P",
  19: "HC",
  20: "BE",
  21: "IR",
  23: "FLEX",
  24: "EDR",
};

export const POSITION_BY_ID: Record<number, Position> = {
  1: "QB",
  2: "RB",
  3: "WR",
  4: "TE",
  5: "K",
  16: "DST",
};

/** Slots that do not count toward this week's score. */
export const BENCH_SLOTS = new Set([20, 21]);

/** Order starters the way a lineup card reads. */
const SLOT_ORDER = [
  "QB",
  "RB",
  "RB/WR",
  "WR",
  "WR/TE",
  "TE",
  "FLEX",
  "OP",
  "DST",
  "K",
  "BE",
  "IR",
];

export function slotSortIndex(slot: string): number {
  const index = SLOT_ORDER.indexOf(slot);
  return index === -1 ? SLOT_ORDER.length : index;
}

/** Short, non-scary injury labels. */
export function injuryLabel(status: string | null): string | null {
  if (!status) return null;
  const normalized = status.toUpperCase();
  switch (normalized) {
    case "ACTIVE":
    case "NORMAL":
      return null;
    case "QUESTIONABLE":
      return "Questionable";
    case "DOUBTFUL":
      return "Doubtful";
    case "OUT":
      return "Out";
    case "INJURY_RESERVE":
    case "IR":
      return "Injured";
    case "SUSPENSION":
      return "Suspended";
    case "BYE":
      return "Bye week";
    default:
      return normalized.charAt(0) + normalized.slice(1).toLowerCase().replace(/_/g, " ");
  }
}
