import "server-only";

/**
 * Small in-process TTL cache.
 *
 * Next's fetch cache covers `raw-client.ts`, but the npm package talks to ESPN
 * through axios, which Next cannot see. Without this, a dynamically-rendered
 * route (like /matchups, which reads a search param) would hit ESPN on every
 * single request. Serverless instances are reused between requests, so this
 * keeps the call rate sane.
 */

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

export async function withTtl<T>(
  key: string,
  ttlSeconds: number,
  load: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }

  const value = await load();
  store.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
  return value;
}

/** Exposed for tests and for a future manual "refresh" action. */
export function clearTtlCache(): void {
  store.clear();
}
