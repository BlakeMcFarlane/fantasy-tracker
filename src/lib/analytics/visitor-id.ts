import type { Visit } from "./types";

/**
 * Turns an IP + user agent into a short, stable, pseudonymous id.
 *
 * The raw IP is never stored or returned — only this salted SHA-256 digest,
 * which is enough to tell "this is the same person again" without holding
 * anything that identifies them. Uses Web Crypto so it runs in middleware.
 */
export async function makeVisitorId(
  ip: string,
  userAgent: string,
  salt: string,
): Promise<string> {
  const data = new TextEncoder().encode(`${salt}|${ip}|${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 6)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const BOT_PATTERN =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|headless|lighthouse|preview|monitor|curl|wget|python-requests/i;

export function classifyDevice(userAgent: string): Visit["device"] {
  if (!userAgent || BOT_PATTERN.test(userAgent)) return "bot";
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(userAgent)) return "phone";
  return "desktop";
}

export function classifyBrowser(userAgent: string): string {
  if (!userAgent) return "Unknown";
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/OPR\/|Opera/.test(userAgent)) return "Opera";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/CriOS|Chrome\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Other";
}

/** Referrer host only — no paths, no query strings. */
export function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).host || null;
  } catch {
    return null;
  }
}
