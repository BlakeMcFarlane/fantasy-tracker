import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import {
  ADMIN_COOKIE,
  ADMIN_PATH_PREFIX,
  adminToken,
  analyticsSalt,
} from "@/lib/analytics/config";
import { getVisitStore } from "@/lib/analytics/store";
import {
  classifyBrowser,
  classifyDevice,
  makeVisitorId,
  referrerHost,
} from "@/lib/analytics/visitor-id";

/**
 * Two jobs, in this order:
 *
 *  1. Record one row per page view (including blocked admin attempts, which
 *     are worth seeing).
 *  2. Gate the unlisted admin area when ADMIN_TOKEN is set.
 *
 * Runs before the page — including cached/ISR pages — so it sees every
 * request. The analytics write goes through `waitUntil`, so nothing is
 * awaited on the response path.
 */
export function middleware(request: NextRequest, event: NextFetchEvent) {
  // Link prefetches are not visits — hovering a nav item shouldn't count.
  const isPrefetch =
    request.headers.get("next-router-prefetch") === "1" ||
    request.headers.get("purpose") === "prefetch" ||
    request.headers.get("x-purpose") === "prefetch";

  if (!isPrefetch) {
    event.waitUntil(recordVisit(request));
  }

  const { pathname, searchParams } = request.nextUrl;
  if (pathname.startsWith(ADMIN_PATH_PREFIX)) {
    return gateAdmin(request, searchParams.get("key"));
  }

  return NextResponse.next();
}

/**
 * A wrong or missing key gets a bare 404 — the same thing any nonexistent URL
 * returns, so probing tells an attacker nothing. Doing this here rather than in
 * the page means the real status code is sent and the page never renders.
 */
function gateAdmin(request: NextRequest, key: string | null): NextResponse {
  const token = adminToken();
  if (!token) return NextResponse.next();

  const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
  if (key !== token && cookie !== token) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain" },
    });
  }

  const response = NextResponse.next();
  if (key === token) {
    // Remember the key so the URL doesn't have to carry it around.
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: ADMIN_PATH_PREFIX,
      maxAge: 60 * 60 * 12,
    });
  }
  return response;
}

async function recordVisit(request: NextRequest): Promise<void> {
  try {
    const headers = request.headers;
    const ip =
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headers.get("x-real-ip")?.trim() ||
      "unknown";
    const userAgent = headers.get("user-agent") ?? "";

    await getVisitStore().record({
      visitorId: await makeVisitorId(ip, userAgent, analyticsSalt()),
      path: request.nextUrl.pathname,
      at: Date.now(),
      country: headers.get("x-vercel-ip-country"),
      region: headers.get("x-vercel-ip-country-region"),
      device: classifyDevice(userAgent),
      browser: classifyBrowser(userAgent),
      referrer: referrerHost(headers.get("referer")),
    });
  } catch {
    // Analytics must never break a page load.
  }
}

export const config = {
  // Node runtime so the development file store can use fs.
  runtime: "nodejs",
  matcher: [
    /*
     * Every page route. Skips Next internals, the API, and static assets so
     * one page load is one row.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
  ],
};
