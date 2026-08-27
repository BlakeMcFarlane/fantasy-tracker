import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone =
  | "neutral"
  | "gold"
  | "win"
  | "loss"
  | "info"
  | "live"
  | "muted";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-white/8 text-mist-300 ring-white/10",
  gold: "bg-gold-500/15 text-gold-400 ring-gold-500/30",
  win: "bg-turf-500/15 text-turf-400 ring-turf-500/30",
  loss: "bg-flare-500/12 text-flare-400 ring-flare-500/25",
  info: "bg-frost-500/12 text-frost-400 ring-frost-500/25",
  live: "bg-flare-500/15 text-flare-400 ring-flare-500/35",
  muted: "bg-ink-700 text-mist-400 ring-white/5",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  /** Adds a soft pulsing dot — used for live games. */
  pulse?: boolean;
}

export function Badge({
  tone = "neutral",
  children,
  className,
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] ring-1 whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-current animate-pulse-ring" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
