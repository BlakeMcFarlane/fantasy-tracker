import { Card } from "@/components/ui/Card";
import { positionMeta } from "@/lib/utils/positions";
import { cn } from "@/lib/utils/cn";
import type { LineupSlotSummary } from "@/types/league";

/**
 * What a legal starting lineup looks like, spelled out. This is the single
 * most-asked question from people who have never played fantasy before.
 */
export function LineupCard({ lineup }: { lineup: LineupSlotSummary[] }) {
  const starters = lineup.filter((slot) => slot.slot !== "BE" && slot.slot !== "IR");
  const bench = lineup.find((slot) => slot.slot === "BE");

  if (starters.length === 0) return null;

  return (
    <Card>
      <div className="p-4 sm:p-5">
        <p className="mb-3 text-sm text-mist-400">
          Each week you start these spots. Everyone else sits on the bench and
          scores nothing.
        </p>

        <ul className="flex flex-wrap gap-2">
          {starters.map((slot) => {
            const meta = positionMeta(slot.slot);
            return (
              <li
                key={slot.slot}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 ring-1",
                  meta.tone,
                )}
              >
                <span className="font-display text-base font-bold uppercase tracking-wide">
                  {slot.count}× {slot.slot}
                </span>
                <span className="text-xs font-medium opacity-80">{meta.full}</span>
              </li>
            );
          })}
        </ul>

        {bench && bench.count > 0 && (
          <p className="mt-3 text-xs text-mist-500">
            Plus {bench.count} bench spots for backups.
          </p>
        )}
      </div>
    </Card>
  );
}
