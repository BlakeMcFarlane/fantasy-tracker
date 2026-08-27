import { Badge } from "@/components/ui/Badge";
import { Countdown } from "@/components/ui/Countdown";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LEAGUE_BRAND } from "@/lib/data/league-config";
import { longDate } from "@/lib/utils/dates";
import type { LeagueEvent } from "@/types/events";
import { cn } from "@/lib/utils/cn";

interface HeroProps {
  statusLabel: string;
  statusTone?: "gold" | "live" | "neutral";
  isLive?: boolean;
  /** The draft, when it is still ahead of us — gets the countdown treatment. */
  draft?: LeagueEvent | null;
  serverNow: number;
}

/**
 * The first thing anyone sees: the wordmark, and the one date that matters.
 * Deliberately holds only those two things — the money, the calendar and the
 * standings each get their own card below.
 */
export function Hero({
  statusLabel,
  statusTone = "gold",
  isLive = false,
  draft,
  serverNow,
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative -mx-4 mb-5 overflow-hidden px-4 pb-7 pt-[calc(1.5rem+var(--safe-top))]",
        "md:mx-0 md:mt-6 md:rounded-card md:px-10 md:pb-9 md:pt-10 md:ring-1 md:ring-hairline",
      )}
    >
      {/* Layered background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink-850 via-ink-900 to-ink-950"
        aria-hidden
      />
      <div
        className="field-lines absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden
      />
      <div
        className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-gold-500/18 blur-[80px]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent"
        aria-hidden
      />

      <div className="relative">
        <div className="mb-4 flex items-start justify-between gap-3">
          <Badge tone={statusTone} pulse={isLive}>
            {statusLabel}
          </Badge>
          {/* Home has no mobile title bar, so the theme switch lives here. */}
          <ThemeToggle className="-mr-2 -mt-2 md:hidden" />
        </div>

        <h1 className="font-display font-extrabold uppercase leading-[0.84] tracking-[-0.01em]">
          <span className="block text-[clamp(3.25rem,16vw,5.5rem)] text-chalk">
            {LEAGUE_BRAND.wordmarkTop}
          </span>
          <span className="text-brand-gradient block text-[clamp(3.25rem,16vw,5.5rem)]">
            {LEAGUE_BRAND.wordmarkBottom}
          </span>
        </h1>

        <p className="mt-3.5 text-[0.8125rem] font-semibold uppercase tracking-[0.13em] text-mist-400 sm:text-sm sm:tracking-[0.2em]">
          {LEAGUE_BRAND.tagline}
        </p>

        {draft && (
          <div className="mt-6 border-t border-hairline pt-5">
            <p className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-gold-400">
              Draft day
              <span className="ml-2 font-semibold text-mist-500">
                {longDate(draft.startsAt)} · {draft.timeLabel}
              </span>
            </p>
            <Countdown
              target={draft.startsAt}
              serverNow={serverNow}
              size="lg"
              onComplete="Draft is live"
            />
          </div>
        )}
      </div>
    </section>
  );
}
