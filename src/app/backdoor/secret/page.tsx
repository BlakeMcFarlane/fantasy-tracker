import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  Activity,
  Database,
  Eye,
  KeyRound,
  Repeat,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { ADMIN_COOKIE, adminToken } from "@/lib/analytics/config";
import { getAnalyticsSummary } from "@/lib/analytics/summarize";
import type { AnalyticsSummary, Visit } from "@/lib/analytics/types";
import { LEAGUE_TIMEZONE } from "@/lib/data/league-config";
import { cn } from "@/lib/utils/cn";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Control Room",
  // Unlisted: never indexed, never linked from the site.
  robots: { index: false, follow: false, nocache: true },
};

const stamp = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: LEAGUE_TIMEZONE,
});

const dayLabel = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  timeZone: "UTC",
});

function relative(from: number): string {
  const seconds = Math.max(0, Math.round((Date.now() - from) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const DEVICE_LABEL: Record<Visit["device"], string> = {
  phone: "Phone",
  tablet: "Tablet",
  desktop: "Desktop",
  bot: "Bot",
};

export default async function ControlRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const token = adminToken();
  const [{ key }, cookieStore] = await Promise.all([searchParams, cookies()]);

  // Middleware already returned a 404 for a bad key; this is the same check
  // again so the page is never readable if the matcher is ever changed.
  if (token && key !== token && cookieStore.get(ADMIN_COOKIE)?.value !== token) {
    notFound();
  }

  const data = await getAnalyticsSummary();

  return (
    <div className="py-6">
      <header className="mb-6">
        <p className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold-400">
          <KeyRound className="h-3.5 w-3.5" aria-hidden />
          Private
        </p>
        <h1 className="font-display text-[2rem] font-extrabold uppercase leading-none tracking-tight text-chalk sm:text-4xl">
          Control Room
        </h1>
        <p className="mt-2 text-sm text-mist-400">
          Who&apos;s been looking at Chase &amp; Champions.
        </p>
      </header>

      <Warnings data={data} hasToken={Boolean(token)} />

      <section className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile
          label="Total visits"
          value={data.totalVisits.toLocaleString("en-US")}
          icon={<Eye className="h-3.5 w-3.5" aria-hidden />}
          tone="gold"
        />
        <StatTile
          label="People"
          value={data.uniqueVisitors.toLocaleString("en-US")}
          detail="Distinct devices"
          icon={<Users className="h-3.5 w-3.5" aria-hidden />}
        />
        <StatTile
          label="Today"
          value={data.visitsToday.toLocaleString("en-US")}
          detail={`${data.visitorsToday} ${data.visitorsToday === 1 ? "person" : "people"}`}
          icon={<Activity className="h-3.5 w-3.5" aria-hidden />}
        />
        <StatTile
          label="Came back"
          value={data.returningVisitors.toLocaleString("en-US")}
          detail="Visited more than once"
          icon={<Repeat className="h-3.5 w-3.5" aria-hidden />}
          tone="win"
        />
      </section>

      <DailyChart data={data} />

      <section className="mb-6">
        <h2 className="mb-2 px-1 font-display text-lg font-bold uppercase tracking-wide text-chalk">
          Visitors
        </h2>
        <Card>
          {data.visitors.length === 0 ? (
            <p className="p-6 text-center text-sm text-mist-400">
              Nobody yet. Share the link and refresh.
            </p>
          ) : (
            <ul className="divide-y divide-hairline">
              {data.visitors.map((visitor) => (
                <li
                  key={visitor.visitorId}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <span className="font-mono text-xs font-semibold text-gold-400">
                    {visitor.visitorId.slice(0, 6)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-chalk">
                      {visitor.visits} {visitor.visits === 1 ? "visit" : "visits"}
                      <span className="ml-2 font-normal text-mist-500">
                        {DEVICE_LABEL[visitor.device]} · {visitor.browser}
                        {visitor.country ? ` · ${visitor.country}` : ""}
                      </span>
                    </p>
                    <p className="truncate text-xs text-mist-500">
                      {stamp.format(visitor.firstSeen)} &rarr;{" "}
                      {relative(visitor.lastSeen)} · {visitor.paths.length}{" "}
                      {visitor.paths.length === 1 ? "page" : "pages"}
                    </p>
                  </div>
                  {visitor.visits > 1 && (
                    <span className="shrink-0 rounded-full bg-turf-500/12 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-turf-400">
                      Repeat
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-2 px-1 font-display text-lg font-bold uppercase tracking-wide text-chalk">
            Top pages
          </h2>
          <Card>
            {data.topPaths.length === 0 ? (
              <p className="p-5 text-center text-sm text-mist-400">No data yet.</p>
            ) : (
              <ul className="divide-y divide-hairline">
                {data.topPaths.map((entry) => (
                  <li
                    key={entry.path}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <span className="truncate font-mono text-xs text-mist-300">
                      {entry.path}
                    </span>
                    <span className="shrink-0 font-display text-base font-bold tnum text-chalk">
                      {entry.visits}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section>
          <h2 className="mb-2 px-1 font-display text-lg font-bold uppercase tracking-wide text-chalk">
            Recent activity
          </h2>
          <Card>
            {data.recent.length === 0 ? (
              <p className="p-5 text-center text-sm text-mist-400">No data yet.</p>
            ) : (
              <ul className="divide-y divide-hairline">
                {data.recent.slice(0, 15).map((visit, index) => (
                  <li
                    key={`${visit.visitorId}-${visit.at}-${index}`}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs"
                  >
                    <span className="font-mono font-semibold text-gold-400">
                      {visit.visitorId.slice(0, 6)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-mist-300">
                      {visit.path}
                    </span>
                    <span className="shrink-0 text-mist-500">
                      {relative(visit.at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-mist-500">
        Visitor IDs are a salted SHA-256 of IP address plus browser string. The
        raw IP is never written down or shown here — the hash only tells you
        &ldquo;same device as before&rdquo;. Two people on the same phone, or one
        person switching from phone to laptop, will not be matched up.
        Prefetches and known bots are excluded. Holding the last{" "}
        {data.capacity.toLocaleString("en-US")} visits.
      </p>
    </div>
  );
}

function Warnings({
  data,
  hasToken,
}: {
  data: AnalyticsSummary;
  hasToken: boolean;
}) {
  const notes: { text: string; tone: "warn" | "info" }[] = [];

  if (data.storeKind === "memory") {
    notes.push({
      tone: "warn",
      text:
        "No storage connected, so nothing is being recorded and these numbers will stay at zero. Visits are written by middleware and read by this page, and on Vercel those run as separate instances that cannot share memory. Add a Redis store (Vercel dashboard → Storage → Upstash, free tier) — it sets KV_REST_API_URL and KV_REST_API_TOKEN for you, and this page starts working on the next deploy.",
    });
  }
  if (data.storeKind === "file") {
    notes.push({
      tone: "info",
      text:
        "Local development: visits are being written to .analytics/visits.json. On Vercel this switches to Redis if configured, or to memory if not.",
    });
  }
  if (!data.saltConfigured) {
    notes.push({
      tone: "warn",
      text:
        "ANALYTICS_SALT is not set, so visitor hashes use a default salt. Set it to a long random string — without it, someone with the hashes could in theory brute-force them back to IP addresses.",
    });
  }
  if (!hasToken) {
    notes.push({
      tone: "info",
      text:
        "This page is protected only by its URL. Set ADMIN_TOKEN to also require ?key=<token>.",
    });
  }
  if (data.adminViews > 0) {
    notes.push({
      tone: "info",
      text: `This page has been loaded ${data.adminViews} ${data.adminViews === 1 ? "time" : "times"} (yours included).`,
    });
  }

  if (notes.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {notes.map((note) => (
        <div
          key={note.text}
          className={cn(
            "flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-sm ring-1",
            note.tone === "warn"
              ? "bg-gold-500/8 text-mist-300 ring-gold-500/25"
              : "bg-frost-500/8 text-mist-300 ring-frost-500/20",
          )}
        >
          {note.tone === "warn" ? (
            <ShieldAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-gold-400"
              aria-hidden
            />
          ) : (
            <Database
              className="mt-0.5 h-4 w-4 shrink-0 text-frost-400"
              aria-hidden
            />
          )}
          <p>{note.text}</p>
        </div>
      ))}
    </div>
  );
}

function DailyChart({ data }: { data: AnalyticsSummary }) {
  const max = Math.max(...data.byDay.map((entry) => entry.visits), 1);

  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 font-display text-lg font-bold uppercase tracking-wide text-chalk">
        Last 14 days
      </h2>
      <Card>
        <div className="p-4 sm:p-5">
          <div className="flex items-end gap-1.5">
            {data.byDay.map((entry) => (
              <div
                key={entry.day}
                className="flex flex-1 flex-col items-center gap-1.5"
                title={`${entry.day}: ${entry.visits} visits from ${entry.visitors} people`}
              >
                <span className="text-[0.5625rem] font-bold tnum text-mist-500">
                  {entry.visits || ""}
                </span>
                <div className="flex h-20 w-full items-end">
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all duration-500",
                      entry.visits > 0
                        ? "bg-gradient-to-t from-gold-600 to-gold-500"
                        : "bg-ink-700",
                    )}
                    style={{
                      height: entry.visits
                        ? `${Math.max(8, (entry.visits / max) * 100)}%`
                        : "3px",
                    }}
                  />
                </div>
                <span className="text-[0.5625rem] tnum text-mist-600">
                  {dayLabel.format(new Date(`${entry.day}T00:00:00Z`))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
