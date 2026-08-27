import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { formatPoints } from "@/lib/utils/format";

interface Entry {
  week: number;
  points: number;
  opponentId: number;
  won: boolean;
}

/**
 * Week-by-week scoring as proportional bars. It answers "are they heating up or
 * cooling off?" at a glance, which a table of numbers does not.
 */
export function SeasonTimeline({
  entries,
  opponentNames,
}: {
  entries: Entry[];
  opponentNames: Map<number, string>;
}) {
  if (entries.length < 2) return null;

  const max = Math.max(...entries.map((entry) => entry.points), 1);

  return (
    <Card>
      <div className="p-4 sm:p-5">
        <div className="flex items-end gap-1.5" role="list">
          {entries.map((entry) => {
            const height = Math.max(12, Math.round((entry.points / max) * 100));
            return (
              <div
                key={entry.week}
                role="listitem"
                className="group flex flex-1 flex-col items-center gap-1.5"
                title={`Week ${entry.week}: ${formatPoints(entry.points)} points ${
                  entry.won ? "(win)" : "(loss)"
                } vs ${opponentNames.get(entry.opponentId) ?? "opponent"}`}
              >
                <span className="text-[0.5625rem] font-bold tnum text-mist-500">
                  {Math.round(entry.points)}
                </span>
                <div className="flex h-24 w-full items-end">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all duration-500 ease-out",
                      entry.won
                        ? "bg-gradient-to-t from-turf-600 to-turf-500"
                        : "bg-gradient-to-t from-ink-600 to-ink-500",
                    )}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[0.5625rem] font-semibold uppercase tracking-wide text-mist-600">
                  {entry.week}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 border-t border-hairline pt-3 text-[0.6875rem] text-mist-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-turf-500" aria-hidden />
            Win
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-ink-500" aria-hidden />
            Loss
          </span>
          <span>Week number below each bar</span>
        </div>
      </div>
    </Card>
  );
}
