import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { LEAGUE_RULES } from "@/lib/data/league-config";

/** House rules. Driven entirely by `LEAGUE_RULES` so new rules are a data edit. */
export function RulesCard() {
  return (
    <Card>
      <ul className="divide-y divide-white/6">
        {LEAGUE_RULES.map((rule) => (
          <li key={rule.id} className="flex gap-4 p-4 sm:p-5">
            <div className="min-w-0 flex-1">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-mist-500">
                {rule.label}
              </p>
              <p
                className={cn(
                  "mt-1 font-display text-xl font-bold uppercase tracking-wide",
                  rule.emphasis ? "text-gold-400" : "text-chalk",
                )}
              >
                {rule.value}
              </p>
              {rule.detail && (
                <p className="mt-1 text-sm leading-relaxed text-mist-400 text-balance-pretty">
                  {rule.detail}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
