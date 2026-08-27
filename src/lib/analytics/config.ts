/** Path prefix for the unlisted admin area. Kept in one place. */
export const ADMIN_PATH_PREFIX = "/backdoor";

/** Most recent visits retained. Older ones roll off. */
export const MAX_VISITS = 2000;

const FALLBACK_SALT = "chase-and-champions-dev-salt";

/**
 * Without a real secret here the visitor hash could be brute-forced back to an
 * IP (the IPv4 space is small), so the admin page nags when it is missing.
 */
export function analyticsSalt(): string {
  return process.env.ANALYTICS_SALT?.trim() || FALLBACK_SALT;
}

export function saltConfigured(): boolean {
  return Boolean(process.env.ANALYTICS_SALT?.trim());
}

/** Set by middleware after a correct ?key so the URL can stay clean. */
export const ADMIN_COOKIE = "cc-admin";

/** When set, the admin page also requires ?key=<token>. */
export function adminToken(): string | null {
  return process.env.ADMIN_TOKEN?.trim() || null;
}
