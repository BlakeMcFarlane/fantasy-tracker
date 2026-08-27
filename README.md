# Chase & Champions

A custom app for a 14-person fantasy football league. Mobile-first, built with
Next.js, and designed to be handed to friends as a link.

- **Home** — league identity, prize pot, countdowns, and what's happening now
- **League** — house rules, key dates, and ESPN settings in plain English
- **Matchups** — pick any team, see their full week-by-week schedule
- **Standings** — all 14 teams ranked, each one clicking through to a full profile

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
    utils/                formatting, dates, position labels

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

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) — the Next.js preset is
   detected automatically, no `vercel.json` needed.
3. Add `ESPN_LEAGUE_ID`, `ESPN_SEASON_ID`, and (for a private league) `ESPN_S2`
   and `SWID` under **Settings → Environment Variables**.
4. Deploy, then share the URL.

Pages are statically rendered and revalidated every five minutes, so the app
stays fast on mobile and stays polite to ESPN's servers.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```
