import { Settings2 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LeagueMeta } from "@/types/league";
import { longDate } from "@/lib/utils/dates";

/** Plain-English explanation of how the draft runs. */
function draftTypeHint(draftType: string): string | undefined {
  const normalized = draftType.toLowerCase();
  if (normalized.includes("snake")) {
    return "Pick order reverses every round, so nobody gets stuck picking last all night.";
  }
  if (normalized.includes("auction")) {
    return "Everyone gets a budget and bids on the players they want.";
  }
  if (normalized.includes("offline")) {
    return "Picks happen in person and get entered into ESPN afterwards.";
  }
  return undefined;
}

/**
 * ESPN's settings, translated. Anything ESPN did not send is dropped rather
 * than shown as a blank row.
 */
export function SettingsGrid({ meta }: { meta: LeagueMeta | null }) {
  if (!meta) {
    return (
      <EmptyState
        compact
        icon={<Settings2 className="h-5 w-5" />}
        title="Settings not loaded"
        message="Once the ESPN league is connected, scoring, roster and playoff settings show up here automatically."
      />
    );
  }

  const settings = meta.settings;

  const rows: { label: string; value: string; hint?: string }[] = [
    { label: "League size", value: `${meta.size || 14} teams` },
    {
      label: "Scoring",
      value: settings.scoringFormat,
      hint:
        settings.receptionPoints > 0
          ? `Every catch is worth ${settings.receptionPoints} extra ${
              settings.receptionPoints === 1 ? "point" : "points"
            } — that's what "PPR" means.`
          : "Catches on their own are worth nothing; only yards and touchdowns score.",
    },
    {
      label: "Draft type",
      value: settings.draftType,
      hint: draftTypeHint(settings.draftType),
    },
    settings.draftDate
      ? { label: "Draft date", value: longDate(settings.draftDate) }
      : null,
    settings.rosterSize > 0
      ? {
          label: "Roster size",
          value: `${settings.rosterSize} players`,
          hint: `${settings.starterCount} starters · ${settings.benchCount} on the bench`,
        }
      : null,
    settings.regularSeasonWeeks > 0
      ? {
          label: "Regular season",
          value: `${settings.regularSeasonWeeks} weeks`,
        }
      : null,
    settings.playoffTeamCount > 0
      ? {
          label: "Playoffs",
          value: `${settings.playoffTeamCount} teams`,
          hint: settings.playoffFormat,
        }
      : null,
    settings.tradeDeadline
      ? {
          label: "Trade deadline",
          value: longDate(settings.tradeDeadline),
          hint: "Last day to swap players with another manager.",
        }
      : null,
    settings.waiverType !== "—"
      ? {
          label: "Dropped players",
          value: settings.waiverType,
          hint: settings.waiverHours
            ? `Anyone dropped sits for ${settings.waiverHours} hours, then goes to whoever claims them first in waiver order.`
            : "How dropped players get picked back up.",
        }
      : null,
  ].filter((row): row is { label: string; value: string; hint?: string } =>
    Boolean(row),
  );

  return (
    <Card>
      <dl className="divide-y divide-white/6">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-4 px-4 py-3.5 sm:px-5">
            <dt className="w-[8.5rem] shrink-0 text-sm font-medium text-mist-400">
              {row.label}
            </dt>
            <dd className="min-w-0 flex-1 text-right">
              <p className="font-semibold text-chalk">{row.value}</p>
              {row.hint && (
                <p className="mt-0.5 text-xs leading-relaxed text-mist-500">
                  {row.hint}
                </p>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
