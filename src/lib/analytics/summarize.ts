import { ADMIN_PATH_PREFIX, MAX_VISITS, saltConfigured } from "./config";
import { getVisitStore } from "./store";
import type { AnalyticsSummary, Visit, VisitorSummary } from "./types";

const DAY_MS = 86_400_000;

function dayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

/** Reads the raw log and rolls it up for the admin page. */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const store = getVisitStore();
  let visits: Visit[] = [];
  try {
    visits = await store.list();
  } catch {
    visits = [];
  }

  // Admin views and bots are tracked, but kept out of the headline numbers.
  const adminViews = visits.filter((visit) =>
    visit.path.startsWith(ADMIN_PATH_PREFIX),
  ).length;
  const real = visits.filter(
    (visit) =>
      !visit.path.startsWith(ADMIN_PATH_PREFIX) && visit.device !== "bot",
  );

  const now = Date.now();
  const startOfToday = new Date(new Date(now).toDateString()).getTime();
  const weekAgo = now - 7 * DAY_MS;

  const byVisitor = new Map<string, VisitorSummary>();
  for (const visit of real) {
    const existing = byVisitor.get(visit.visitorId);
    if (existing) {
      existing.visits += 1;
      existing.firstSeen = Math.min(existing.firstSeen, visit.at);
      existing.lastSeen = Math.max(existing.lastSeen, visit.at);
      if (!existing.paths.includes(visit.path)) existing.paths.push(visit.path);
    } else {
      byVisitor.set(visit.visitorId, {
        visitorId: visit.visitorId,
        visits: 1,
        firstSeen: visit.at,
        lastSeen: visit.at,
        device: visit.device,
        browser: visit.browser,
        country: visit.country,
        paths: [visit.path],
      });
    }
  }

  const days = new Map<string, { visits: number; visitors: Set<string> }>();
  for (let offset = 13; offset >= 0; offset -= 1) {
    days.set(dayKey(now - offset * DAY_MS), { visits: 0, visitors: new Set() });
  }
  for (const visit of real) {
    const bucket = days.get(dayKey(visit.at));
    if (!bucket) continue;
    bucket.visits += 1;
    bucket.visitors.add(visit.visitorId);
  }

  const pathCounts = new Map<string, number>();
  for (const visit of real) {
    pathCounts.set(visit.path, (pathCounts.get(visit.path) ?? 0) + 1);
  }

  const todayVisits = real.filter((visit) => visit.at >= startOfToday);

  return {
    totalVisits: real.length,
    uniqueVisitors: byVisitor.size,
    visitsToday: todayVisits.length,
    visitorsToday: new Set(todayVisits.map((visit) => visit.visitorId)).size,
    visitsLast7Days: real.filter((visit) => visit.at >= weekAgo).length,
    returningVisitors: [...byVisitor.values()].filter(
      (visitor) => visitor.visits > 1,
    ).length,
    adminViews,
    byDay: [...days.entries()].map(([day, bucket]) => ({
      day,
      visits: bucket.visits,
      visitors: bucket.visitors.size,
    })),
    topPaths: [...pathCounts.entries()]
      .map(([path, count]) => ({ path, visits: count }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8),
    visitors: [...byVisitor.values()].sort((a, b) => b.lastSeen - a.lastSeen),
    recent: real.slice(0, 40),
    storeKind: store.kind,
    saltConfigured: saltConfigured(),
    capacity: MAX_VISITS,
  };
}
