# Chase & Champions

**Live:** https://chase-and-champions.vercel.app

A custom app for a 14-person fantasy football league. Mobile-first, built with
Next.js, and designed to be handed to friends as a link.

- **Home** — league identity, prize pot, countdowns, and what's happening now
- **League** — house rules, key dates, and ESPN settings in plain English
- **Matchups** — pick any team, see their full week-by-week schedule
- **Standings** — all 14 teams ranked, each one clicking through to a full profile

Plus a dark/light switch, and an unlisted page showing who has been visiting.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Data | [`espn-fantasy-football-api`](https://www.npmjs.com/package/espn-fantasy-football-api) + ESPN's v3 league views |
| Icons | `lucide-react` |
| Hosting | Vercel (zero config) |

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

With no ESPN credentials set, local development automatically falls back to a
built-in demo league so every screen is explorable. See
[Demo data](#demo-data) below.

## Connecting the ESPN league

Add these to `.env.local` (and to your Vercel project's environment variables):

```env
ESPN_LEAGUE_ID=123456
ESPN_SEASON_ID=2026
ESPN_S2=
SWID=
```

**`ESPN_LEAGUE_ID`** — from the league URL:
`https://fantasy.espn.com/football/league?leagueId=`**`123456`**`&seasonId=2026`

**`ESPN_S2` and `SWID`** — only needed if the league is **private**. To get them:

1. Log in to ESPN in a browser and open the league page.
2. Open DevTools → **Application** → **Cookies** → `https://fantasy.espn.com`.
3. Copy the value of the `espn_s2` cookie into `ESPN_S2`.
4. Copy the value of the `SWID` cookie into `SWID` (the braces are optional —
   the app adds them if missing).

These two values are secrets. They are read only in server-only modules
(`src/lib/espn/*` all start with `import "server-only"`), never sent to the
browser, and must **never** be prefixed with `NEXT_PUBLIC_`.

Optional settings:

```env
LEAGUE_REVALIDATE_SECONDS=300      # how often to re-check ESPN (default 5 min)
USE_MOCK_DATA=                     # "true" forces the demo league
MOCK_PHASE=regular                 # "regular" or "preseason" demo scenario
NEXT_PUBLIC_ESPN_LEAGUE_URL=       # adds an "Open on ESPN" link to /league
```

## Demo data

Because the 2026 league is not populated until draft night, the app ships with a
deterministic demo league (14 teams, full schedule, rosters) in
[`src/lib/espn/mock.ts`](src/lib/espn/mock.ts).

- **On** by default in local development when `ESPN_LEAGUE_ID` is empty.
- **Off** in production unless you explicitly set `USE_MOCK_DATA=true`.
- Whenever it is on, a **"Demo data"** banner appears on every page, so nobody
  mistakes sample numbers for real ones.
- `MOCK_PHASE=preseason` previews exactly what the league will look like before
  the draft.

Deleting `mock.ts` and its single import in `service.ts` removes it entirely.

When ESPN is connected but the season has not started, the app does **not**
invent data — it hides anything that would be meaningless (League Pulse, top of
the table, scoring trends) and shows real empty states instead
("Rosters appear after the draft").

## Architecture

```
src/
  app/
    page.tsx              Home
    league/               Rules, dates, settings
    standings/            All 14 teams, ranked
    matchups/             Team picker + week-by-week schedule
    team/[id]/            Team profile (prerendered for all 14)
    backdoor/secret/      Unlisted visitor stats
    layout.tsx            Fonts, nav, metadata, safe areas
    loading/error/not-found

  components/
    ui/                   Design system: Card, Button, Badge, SectionHeading,
                          TeamAvatar, PlayerAvatar, StatTile, EmptyState,
                          Skeleton, ScrollRow, Countdown, CountUp, ...
    navigation/           BottomNav (mobile), TopNav (desktop), MobileTopBar
    home/ league/ teams/ matchups/ events/

  lib/
    espn/                 The only place that talks to ESPN
      config.ts             env parsing, demo-data switch
      raw-client.ts         ESPN v3 multi-view fetch (Next fetch cache)
      package-client.ts     espn-fantasy-football-api wrapper
      transform.ts          ESPN shapes -> app domain types
      derive.ts             highlights, per-team season stats
      service.ts            public API — getLeagueBundle() and friends
      mock.ts               demo league
      ttl-cache.ts          in-process cache for non-fetch calls
    data/                 League facts that ESPN doesn't know (money, events)
    analytics/            Visit recording, storage backends, roll-ups
    utils/                formatting, dates, position labels

  middleware.ts           Records visits; gates the unlisted admin path
  types/                  Domain types
```

### Data flow

Every page is a Server Component that calls `getLeagueBundle()`. That function:

1. Returns the demo league if demo mode is on.
2. Otherwise fetches ESPN's `mSettings`, `mTeam`, `mRoster`, `mMatchup` and
   `mDraftDetail` views in **one** request, alongside the npm package's
   `getLeagueInfo`.
3. Normalises everything into the domain types in `src/types/league.ts`.
4. Never throws — failures come back as `{ source: "none", error }`, which the
   UI renders as a friendly notice instead of a crash.

React's `cache()` dedupes it within a render; page-level `revalidate = 300`
means ESPN is contacted at most once per five minutes, not once per visitor.
Components never call ESPN directly, so swapping or extending the data source
is a change to `src/lib/espn/` alone.

There are no client-side API routes: nothing about ESPN ever reaches the
browser, which is a stronger guarantee than proxying through `/api`.

### Changing league details

Nothing about the league is hardcoded into components:

- Money, branding, house rules, defending champion →
  [`src/lib/data/league-config.ts`](src/lib/data/league-config.ts)
- Events and countdowns → [`src/lib/data/events.ts`](src/lib/data/events.ts)

Adding an event is one object in the `LEAGUE_EVENTS` array; Home and League
pick it up, sort it, and highlight whichever comes next.

## Light and dark mode

Dark is the default. The switch is an icon button that lives in existing chrome
— the desktop header, the mobile title bar, and the top-right of the home hero
— so it never takes a navigation slot.

`<html data-theme>` is the single source of truth. An inline boot script applies
the saved choice before first paint (no flash), every toggle subscribes to one
shared store, and the choice persists in `localStorage`.

Colours are defined once in [`globals.css`](src/app/globals.css) as two ramps:

- `ink-*` is a **surface** ramp and `chalk` / `mist-*` is a **text** ramp —
  lower numbers are always the more prominent end. Their literal values invert
  between themes, so components never branch on the active theme.
- Accent steps `500`/`600` are fixed in both themes (used as fills and tinted
  backgrounds). Step `400` is the **text-safe** step and darkens in light mode
  so it stays readable on a pale background.

Adding a colour means adding it to both blocks in `globals.css` — nowhere else.

## Visitor stats

There is an unlisted page at **`/backdoor/secret`**. Nothing on the site links
to it, it is marked `noindex, nofollow`, and it renders without the league
navigation. Share the path with whoever should see it.

It shows total visits, how many distinct people, who came back more than once,
a 14-day chart, top pages, and recent activity.

### How visitors are told apart

[`middleware.ts`](src/middleware.ts) records one row per page view. Instead of
storing an IP address, it stores a **salted SHA-256 hash of IP + browser
string**, truncated to 12 characters:

```
visitorId = sha256(ANALYTICS_SALT + ip + userAgent).slice(0, 12)
```

That is enough to say "this is the same device as before" without keeping
anything that identifies a person. The raw IP is never written down or shown.
Link prefetches and known bots are excluded so one page load is one row.

The honest limits, which the page states too: two people sharing a phone look
like one visitor, and one person on both a phone and a laptop looks like two.

### Setup

```env
# REQUIRED in production. Without it the hashes use a default salt and could,
# in theory, be brute-forced back to IP addresses (the IPv4 space is small).
ANALYTICS_SALT=          # openssl rand -hex 32

# Optional but recommended: a second lock. When set, the page only opens with
# ?key=<token> and anything else gets a plain 404 — identical to any other
# nonexistent URL, so probing reveals nothing. A correct key sets a short-lived
# cookie so the URL doesn't have to carry it around.
ADMIN_TOKEN=

# Durable storage. Add a Redis store from the Vercel marketplace (Upstash) and
# these appear automatically.
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

**Storage is not optional in production.** Visits are written by middleware and
read by the page, and on Vercel those run as separate instances with no shared
memory — so without Redis the page shows zero, not an undercount. Three backends
are selected automatically:

| Backend | When | Durable |
|---|---|---|
| `redis` | `KV_REST_API_*` or `UPSTASH_REDIS_REST_*` set | Yes |
| `file` | local development, no Redis | Yes, in `.analytics/` |
| `memory` | production with no Redis | **No** — records nothing usable |

The page shows which backend is live and warns when the numbers can't be
trusted.

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — the Next.js preset is
   detected automatically, no `vercel.json` needed.
3. Add `ESPN_LEAGUE_ID`, `ESPN_SEASON_ID`, and (for a private league) `ESPN_S2`
   and `SWID` under **Settings → Environment Variables**.
4. Add `ANALYTICS_SALT` (and ideally `ADMIN_TOKEN`) for the visitor stats page.
5. Optionally add a Redis store from the marketplace so visit history survives
   deploys.
6. Deploy, then share the URL.

Pages are statically rendered and revalidated every five minutes, so the app
stays fast on mobile and stays polite to ESPN's servers.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```
