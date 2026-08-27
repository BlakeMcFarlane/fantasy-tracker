import { Badge } from "@/components/ui/Badge";
import { LEAGUE_BRAND, LEAGUE_MONEY } from "@/lib/data/league-config";
import { cn } from "@/lib/utils/cn";

interface HeroProps {
  statusLabel: string;
  statusTone?: "gold" | "live" | "neutral";
  isLive?: boolean;
}

/**
 * The first thing anyone sees. Full-bleed on phones, a rounded panel on
 * desktop, with a faint yard-line texture and a warm glow behind the wordmark.
 */
export function Hero({
  statusLabel,
  statusTone = "gold",
  isLive = false,
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative -mx-4 mb-5 overflow-hidden px-4 pb-8 pt-[calc(2rem+var(--safe-top))]",
        "md:mx-0 md:mt-6 md:rounded-card md:px-10 md:pb-11 md:pt-12 md:ring-1 md:ring-white/8",
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
        className="absolute -left-20 top-24 h-56 w-56 rounded-full bg-frost-500/8 blur-[70px]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/40 to-transparent"
        aria-hidden
      />

      <div className="relative">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge tone={statusTone} pulse={isLive}>
            {statusLabel}
          </Badge>
          <Badge tone="muted">{LEAGUE_BRAND.season} Season</Badge>
        </div>

        <h1 className="font-display font-extrabold uppercase leading-[0.84] tracking-[-0.01em]">
          <span className="block text-[clamp(3.25rem,16vw,5.5rem)] text-chalk">
            {LEAGUE_BRAND.wordmarkTop}
          </span>
          <span className="block bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 bg-clip-text text-[clamp(3.25rem,16vw,5.5rem)] text-transparent">
            {LEAGUE_BRAND.wordmarkBottom}
          </span>
        </h1>

        <p className="mt-4 text-[0.8125rem] font-semibold uppercase tracking-[0.13em] text-mist-400 sm:text-sm sm:tracking-[0.2em]">
          {LEAGUE_BRAND.tagline}
        </p>

        <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist-400 text-balance-pretty">
          {LEAGUE_BRAND.blurb}
        </p>

        <dl className="mt-6 flex items-center gap-5 border-t border-white/8 pt-5 text-left">
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-mist-500">
              Teams
            </dt>
            <dd className="font-display text-2xl font-bold tnum text-chalk">
              {LEAGUE_MONEY.teamCount}
            </dd>
          </div>
          <div className="h-8 w-px bg-white/10" aria-hidden />
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-mist-500">
              Buy-in
            </dt>
            <dd className="font-display text-2xl font-bold tnum text-chalk">
              ${LEAGUE_MONEY.buyIn}
            </dd>
          </div>
          <div className="h-8 w-px bg-white/10" aria-hidden />
          <div>
            <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-mist-500">
              Pot
            </dt>
            <dd className="font-display text-2xl font-bold tnum text-gold-400">
              ${LEAGUE_MONEY.winnerPrize}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
