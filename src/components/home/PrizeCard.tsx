import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { LEAGUE_MONEY } from "@/lib/data/league-config";

/**
 * The money shot. Deliberately the loudest element on the page after the
 * wordmark — it is the thing everyone actually cares about.
 */
export function PrizeCard() {
  const { winnerPrize, teamCount, buyIn, forfeit } = LEAGUE_MONEY;

  return (
    <Card tone="gold" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-gold-500/25 blur-[70px]"
        aria-hidden
      />
      <div className="relative px-5 py-6 text-center sm:py-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gold-500/15 px-3 py-1.5 ring-1 ring-gold-500/30">
          <Trophy className="h-3.5 w-3.5 text-gold-400" aria-hidden />
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
            Winner takes
          </span>
        </div>

        <p className="font-display text-[clamp(4rem,22vw,6rem)] font-extrabold leading-[0.85] tnum text-transparent bg-gradient-to-b from-gold-300 to-gold-600 bg-clip-text">
          <CountUp value={winnerPrize} prefix="$" />
        </p>

        <p className="mt-3 text-sm font-semibold text-mist-300">
          {teamCount} Teams
          <span className="mx-2 text-ink-500" aria-hidden>
            ·
          </span>
          ${buyIn} Buy-In
        </p>

        <div className="mt-5 flex items-center justify-center gap-2 border-t border-gold-500/15 pt-4 text-xs">
          <span className="font-semibold uppercase tracking-[0.12em] text-mist-500">
            Forfeit
          </span>
          <span className="rounded-full bg-ink-800 px-2.5 py-1 font-bold uppercase tracking-wide text-mist-300 ring-1 ring-white/8">
            {forfeit ?? "TBD"}
          </span>
        </div>
      </div>
    </Card>
  );
}
