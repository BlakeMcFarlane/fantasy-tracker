import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface StatTileProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "gold" | "win" | "loss";
  className?: string;
}

const VALUE_TONES = {
  default: "text-chalk",
  gold: "text-gold-400",
  win: "text-turf-400",
  loss: "text-flare-400",
} as const;

export function StatTile({
  label,
  value,
  detail,
  icon,
  tone = "default",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-tile bg-ink-800/80 p-3.5 ring-1 ring-hairline sm:p-4",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-mist-500">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <p
        className={cn(
          "mt-1.5 font-display text-2xl font-bold tnum leading-none sm:text-[1.75rem]",
          VALUE_TONES[tone],
        )}
      >
        {value}
      </p>
      {detail && (
        <p className="mt-1.5 truncate text-xs text-mist-400">{detail}</p>
      )}
    </div>
  );
}
