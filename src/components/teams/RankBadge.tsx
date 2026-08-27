import { Crown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MEDALS: Record<number, string> = {
  1: "text-gold-400",
  2: "text-mist-300",
  3: "text-bronze",
};

/** Rank number, with a crown for first place. */
export function RankBadge({
  rank,
  className,
}: {
  rank: number;
  className?: string;
}) {
  const medal = MEDALS[rank];
  return (
    <span
      className={cn(
        "flex w-7 shrink-0 flex-col items-center justify-center",
        className,
      )}
    >
      {rank === 1 && (
        <Crown className="mb-0.5 h-3 w-3 text-gold-400" aria-hidden />
      )}
      <span
        className={cn(
          "font-display text-lg font-bold leading-none tnum",
          medal ?? "text-mist-500",
        )}
      >
        {rank}
      </span>
    </span>
  );
}
