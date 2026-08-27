import { MAX_VISITS } from "./config";
import type { Visit } from "./types";

/**
 * Where visits live.
 *
 * Two backends, chosen automatically:
 *
 *  - `redis`  — used when Vercel KV / Upstash env vars are present. Survives
 *               deploys and cold starts. This is what you want in production.
 *  - `file`   — local development only. Middleware and page rendering are
 *               separate runtimes, so a shared file is the only way the two
 *               see the same data without standing up Redis to try the
 *               feature locally.
 *  - `memory` — last resort. Each instance keeps its own list and loses it
 *               when the instance recycles, so counts undercount and reset.
 *
 * The admin page shows which one is active so the numbers are never
 * misread as authoritative when they aren't.
 */

export type StoreKind = "memory" | "file" | "redis";

export interface VisitStore {
  kind: StoreKind;
  record(visit: Visit): Promise<void>;
  list(): Promise<Visit[]>;
}

/* ---- Memory ------------------------------------------------------- */

const buffer: Visit[] = [];

const memoryStore: VisitStore = {
  kind: "memory",
  async record(visit) {
    buffer.unshift(visit);
    if (buffer.length > MAX_VISITS) buffer.length = MAX_VISITS;
  },
  async list() {
    return [...buffer];
  },
};

/* ---- File (development) -------------------------------------------- */

const FILE_PATH = ".analytics/visits.json";

async function readFileVisits(): Promise<Visit[]> {
  const { readFile } = await import("node:fs/promises");
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Visit[]) : [];
  } catch {
    return [];
  }
}

const fileStore: VisitStore = {
  kind: "file",
  async record(visit) {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const { dirname } = await import("node:path");
    const visits = await readFileVisits();
    visits.unshift(visit);
    await mkdir(dirname(FILE_PATH), { recursive: true });
    await writeFile(
      FILE_PATH,
      JSON.stringify(visits.slice(0, MAX_VISITS)),
      "utf8",
    );
  },
  list: readFileVisits,
};

/* ---- Redis over REST (Vercel KV or Upstash) ------------------------ */

const REDIS_KEY = "cc:visits";

interface RedisConfig {
  url: string;
  token: string;
}

/**
 * Finds the Redis REST credentials no matter how the integration named them.
 *
 * Vercel's Upstash marketplace integration lets you set an env-var prefix when
 * you attach the store, so the vars can arrive as `KV_REST_API_URL`,
 * `UPSTASH_REDIS_REST_URL`, or something prefixed like
 * `BACKDOOR_STORAGE_KV_REST_API_URL`. Rather than hardcode one, this looks for
 * any `*KV_REST_API_URL` and pairs it with the write token that shares its
 * prefix (never the read-only token — this store writes).
 */
function redisConfig(): RedisConfig | null {
  // Preferred exact names first, for a clean local .env.
  const directUrl =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();
  const directToken =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (directUrl && directToken) {
    return { url: directUrl.replace(/\/$/, ""), token: directToken };
  }

  // Otherwise discover a prefixed pair (e.g. BACKDOOR_STORAGE_KV_REST_API_URL).
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.endsWith("KV_REST_API_URL") || !value?.trim()) continue;
    const prefix = key.slice(0, -"KV_REST_API_URL".length);
    const token = process.env[`${prefix}KV_REST_API_TOKEN`]?.trim();
    if (token) {
      return { url: value.trim().replace(/\/$/, ""), token };
    }
  }

  return null;
}

async function redisPipeline(
  config: RedisConfig,
  commands: (string | number)[][],
): Promise<unknown[]> {
  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Redis returned ${response.status}`);
  }
  const payload = (await response.json()) as { result?: unknown }[];
  return payload.map((entry) => entry?.result);
}

function makeRedisStore(config: RedisConfig): VisitStore {
  return {
    kind: "redis",
    async record(visit) {
      await redisPipeline(config, [
        ["LPUSH", REDIS_KEY, JSON.stringify(visit)],
        ["LTRIM", REDIS_KEY, 0, MAX_VISITS - 1],
      ]);
    },
    async list() {
      const [raw] = await redisPipeline(config, [
        ["LRANGE", REDIS_KEY, 0, MAX_VISITS - 1],
      ]);
      if (!Array.isArray(raw)) return [];
      return raw
        .map((entry) => {
          try {
            return JSON.parse(String(entry)) as Visit;
          } catch {
            return null;
          }
        })
        .filter((visit): visit is Visit => visit !== null);
    },
  };
}

/* ---- Selection ---------------------------------------------------- */

export function getVisitStore(): VisitStore {
  const config = redisConfig();
  if (config) return makeRedisStore(config);
  // Serverless filesystems are read-only, so the file store is dev-only.
  if (process.env.NODE_ENV !== "production") return fileStore;
  return memoryStore;
}
