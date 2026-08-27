export interface Visit {
  /** Pseudonymous, salted hash of IP + user agent. Never the raw IP. */
  visitorId: string;
  path: string;
  /** Epoch milliseconds. */
  at: number;
  country: string | null;
  region: string | null;
  device: "phone" | "tablet" | "desktop" | "bot";
  browser: string;
  /** Host only — query strings and paths are dropped. */
  referrer: string | null;
}

export interface VisitorSummary {
  visitorId: string;
  visits: number;
  firstSeen: number;
  lastSeen: number;
  device: Visit["device"];
  browser: string;
  country: string | null;
  paths: string[];
}

export interface AnalyticsSummary {
  totalVisits: number;
  uniqueVisitors: number;
  visitsToday: number;
  visitorsToday: number;
  visitsLast7Days: number;
  returningVisitors: number;
  adminViews: number;
  byDay: { day: string; visits: number; visitors: number }[];
  topPaths: { path: string; visits: number }[];
  visitors: VisitorSummary[];
  recent: Visit[];
  storeKind: string;
  saltConfigured: boolean;
  capacity: number;
}
