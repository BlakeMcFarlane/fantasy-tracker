import { Flame, Snowflake } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Streak } from "@/types/league";

/** "W3" / "L2" with an icon so the meaning reads without knowing the shorthand. */
export function StreakChip({
  streak,
  className,
}: {
  streak: Streak | null;
  className?: string;
}) {
  if (!streak || streak.length < 2) return null;
  const winning = streak.type === "W";
  const Icon = winning ? Flame : Snowflake;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide ring-1",
        winning
          ? "bg-turf-500/12 text-turf-400 ring-turf-500/25"
          : "bg-frost-500/10 text-frost-400 ring-frost-500/20",
        className,
      )}
      title={
        winning
          ? `Won ${streak.length} in a row`
          : `Lost ${streak.length} in a row`
      }
    >
      <Icon className="h-2.5 w-2.5" aria-hidden />
      {streak.length} {winning ? "wins" : "losses"} in a row
    </span>
  );
}
