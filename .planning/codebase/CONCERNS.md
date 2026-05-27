# Codebase Concerns

**Analysis Date:** 2026-05-27

---

## Security

**[CRITICAL] No authentication on any API route**

- Risk: Every API endpoint is fully public. Any client that knows the URL can read, create, update, delete, or reorder all habits and logs with no session check.
- Files: `src/app/api/habits/route.ts`, `src/app/api/habits/[id]/route.ts`, `src/app/api/logs/route.ts`
- Current mitigation: None. The ROADMAP explicitly documents "no auth complexity" as a design decision for personal use.
- Impact: Acceptable only while the app is single-user and the URL is not widely shared. Becomes a blocker the moment a second user or exposure occurs.
- Fix approach: Add a static API secret header check (simplest) or Supabase session cookie validation at the route level before any DB call.

**[HIGH] No input sanitisation or schema validation on API bodies**

- Risk: `updateHabit` in `src/app/api/habits/[id]/route.ts` passes the raw parsed body directly to Drizzle (`db.update(habits).set(data)`). A caller can supply arbitrary field keys including `id`, `createdAt`, or `sortOrder` — Drizzle will silently ignore unknown columns but any valid column name is writable without restriction.
- Files: `src/app/api/habits/[id]/route.ts` (line 16), `src/db/queries.ts` (line 33)
- Fix approach: Validate with Zod or manual allowlist before passing to `updateHabit`. Only permit `name`, `color`, `icon`, `reminderTime`.

**[HIGH] Date parameter accepted without validation in logs API**

- Risk: `from`, `to`, and `date` query params in `src/app/api/logs/route.ts` are passed directly to Drizzle queries. A malformed date string (e.g. `' OR 1=1`) does not reach raw SQL due to Drizzle's parameterisation, but Postgres may return unexpected results or errors that leak stack traces.
- Files: `src/app/api/logs/route.ts` (lines 11-18)
- Fix approach: Validate date strings match `YYYY-MM-DD` with a regex or `date-fns/isValid` before using them.

**[MEDIUM] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are referenced in `.env.local.example` but `@supabase/supabase-js` is installed and never actually used in source**

- Risk: The package ships in the production bundle, adding unnecessary weight. If keys are ever configured, they are exposed to the browser via the `NEXT_PUBLIC_` prefix.
- Files: `package.json` (`@supabase/supabase-js: ^2.106.2`), `.env.local.example`
- Fix approach: Remove `@supabase/supabase-js` from `dependencies` until it is needed. The app connects directly to Postgres via `postgres` + Drizzle; Supabase client is not required.

---

## Performance

**[HIGH] N+1 query pattern on the Stats page**

- Risk: `src/app/stats/page.tsx` fetches all habits then issues one `getLogsForHabit` query per habit inside `Promise.all`. With 10 habits this is 11 queries; with 50 it is 51. All run on every page load because `force-dynamic` disables caching.
- Files: `src/app/stats/page.tsx` (lines 13-25), `src/db/queries.ts` (`getLogsForHabit`)
- Fix approach: Add a single query that joins `habit_logs` to `habits` for the target date range, returning all logs in one round trip, then group in application code.

**[HIGH] `force-dynamic` on every server page disables all Next.js caching**

- Risk: All four server-rendered pages (`/`, `/habits`, `/habits/[id]`, `/stats`) carry `export const dynamic = "force-dynamic"`. Every navigation triggers a fresh DB round trip with no cache layer. Under Vercel Serverless this means cold-start latency compounds with query latency on every load.
- Files: `src/app/page.tsx:1`, `src/app/habits/page.tsx:1`, `src/app/habits/[id]/page.tsx:1`, `src/app/stats/page.tsx:1`
- Current reason: Required to avoid stale data from Next.js static generation (documented in project memory as a known fix).
- Fix approach: Replace with `revalidatePath` / `revalidateTag` calls after mutations, allowing static/ISR caching to resume while still seeing fresh data after writes.

**[MEDIUM] Reorder writes N individual UPDATE queries**

- Risk: `reorderHabits` in `src/db/queries.ts` issues one `UPDATE` per habit ID via `Promise.all`. Reordering 20 habits fires 20 separate queries. No transaction wraps them, so a partial failure leaves sort order inconsistent.
- Files: `src/db/queries.ts` (lines 41-47)
- Fix approach: Use a single `unnest` + `UPDATE FROM` bulk statement, or wrap individual updates in a Drizzle transaction.

**[MEDIUM] `toggleLog` requires two round trips for every toggle**

- Risk: `toggleLog` in `src/db/queries.ts` first SELECTs to check existence, then DELETEs or INSERTs. A single `INSERT ... ON CONFLICT DO DELETE` or upsert pattern would halve the round trips.
- Files: `src/db/queries.ts` (lines 66-79)
- Fix approach: Use `INSERT INTO habit_logs ... ON CONFLICT (habit_id, date) DO NOTHING` and infer the result, or use a stored procedure/function.

**[LOW] `getLast365Days` recalculated on every render in HeatmapGrid**

- Risk: The function iterates 365 days and calls `eachDayOfInterval` on every mount. `useMemo` with an empty dependency array mitigates this within a session, but the computation still runs fresh on each page load.
- Files: `src/components/HeatmapGrid.tsx` (line 13), `src/lib/utils.ts` (lines 25-31)
- Fix approach: Acceptable at current scale. Could be module-level memoised if profiling shows it contributes to render latency.

---

## Reliability / Fragile Areas

**[HIGH] No error boundaries anywhere in the component tree**

- Risk: Any unhandled exception in a client component (network failure, unexpected API shape) will crash the entire page with no recovery UI.
- Files: `src/app/layout.tsx` — no `ErrorBoundary` wrapping `<main>` or `<Navigation>`; none of the client components wrap themselves.
- Fix approach: Add a root-level React `ErrorBoundary` in `src/app/layout.tsx` and per-page boundaries for the Today and Stats pages which make live fetch calls.

**[HIGH] `EditHabitPage` fetches habit data client-side with no error handling**

- Risk: The `useEffect` fetch in `src/app/habits/[id]/edit/page.tsx` (lines 21-29) has no `.catch`. If the request fails or the habit is not found, the component stays in the loading spinner state indefinitely with no user feedback.
- Files: `src/app/habits/[id]/edit/page.tsx` (lines 21-29)
- Fix approach: Add `.catch` to set an error state and render an error message with a back link.

**[MEDIUM] Reorder has no error handling or rollback on failure**

- Risk: `handleDragEnd` in `src/components/SortableHabitList.tsx` fires the PATCH and updates optimistic state before the call completes, but never handles a failed response. If the server rejects the reorder, the UI shows the new order while the database retains the old one.
- Files: `src/components/SortableHabitList.tsx` (lines 81-95)
- Fix approach: Await the fetch, check `res.ok`, and revert `setHabits` to the pre-drag state on failure.

**[MEDIUM] Month label positioning in HeatmapGrid is broken**

- Risk: The month label rendering in `src/components/HeatmapGrid.tsx` (lines 53-59) uses `position: absolute` with manually calculated `marginLeft` values. The formula references `monthLabels.indexOf(monthLabels.find(...))` which is always the current index — the offset computation is incorrect and labels will overlap or misalign on most screen widths.
- Files: `src/components/HeatmapGrid.tsx` (lines 50-60)
- Fix approach: Use a flex row with `minWidth` calculated from column index multiplied by cell size, or switch to CSS Grid with explicit `gridColumnStart`.

**[MEDIUM] Service worker uses stale-while-revalidate-absent strategy**

- Risk: `public/sw.js` serves cached pages for `/`, `/habits`, and `/stats` without any cache invalidation beyond a hardcoded `CACHE_NAME = "habitkit-v1"`. Deployments that do not bump the cache name will serve stale HTML to returning users until they manually clear the cache.
- Files: `public/sw.js`
- Fix approach: Append a build hash to `CACHE_NAME` at deploy time, or use a network-first strategy for HTML documents and cache-first only for static assets.

**[LOW] `computeStreak` does not account for today being incomplete**

- Risk: If today has no log entry, `computeStreak` immediately returns 0 even if yesterday started a long streak. Many habit apps treat "streak still live if yesterday was completed" as the correct behaviour for mid-day checks.
- Files: `src/lib/utils.ts` (lines 33-45)
- Fix approach: Start the cursor from yesterday if today has no log, so an in-progress day does not break the displayed streak.

---

## Technical Debt

**[MEDIUM] `drizzle-kit` listed as a runtime dependency**

- Risk: `drizzle-kit` is a CLI migration tool that should be in `devDependencies`. Listing it under `dependencies` means it is installed in the production bundle, adding ~50 MB to `node_modules` on Vercel.
- Files: `package.json` (line `"drizzle-kit": "^0.31.10"`)
- Fix approach: Move `drizzle-kit` to `devDependencies`.

**[MEDIUM] No database connection pooling configuration**

- Risk: `src/db/index.ts` creates a `postgres()` client with default settings (typically 10 connections). Under Vercel Serverless each function instance creates its own pool. With concurrent invocations this exhausts Supabase's connection limit quickly. The project memory notes "Supabase pooler quirks" as a known issue.
- Files: `src/db/index.ts`
- Fix approach: Configure `postgres({ max: 1 })` for serverless, or route through Supabase's PgBouncer transaction-mode pooler URL (`?pgbouncer=true&connection_limit=1`).

**[MEDIUM] Reminder time stored as plain text, never acted upon**

- Risk: `reminderTime` is captured in the habit creation and edit forms and stored in the schema, but no push notification implementation exists. The ROADMAP lists push notifications as M3. Users who set a reminder time see no indication that it is inactive.
- Files: `src/db/schema.ts` (line 9), `src/app/habits/new/page.tsx` (lines 113-129), `src/app/habits/[id]/edit/page.tsx` (lines 137-147)
- Current state: The UI hint "Push notifications require adding this app to your home screen" implies functionality that does not exist yet.

**[LOW] No test suite**

- Risk: Zero test files exist in `src/`. All logic in `src/lib/utils.ts` (streak calculation, completion rate) is untested. The stat computation functions are pure and straightforward to unit test, but any refactor carries full regression risk with no safety net.
- Files: `src/lib/utils.ts`, `src/db/queries.ts`
- Fix approach: Add Vitest with unit tests for `computeStreak`, `computeLongestStreak`, `completionRate`, and integration tests for the query functions using a test database or mocks.

**[LOW] `@supabase/supabase-js` installed but unused**

- Risk: Adds ~200 KB to the dependency tree. Was likely added in anticipation of auth or real-time features. No import of `@supabase/supabase-js` exists anywhere in `src/`.
- Files: `package.json`
- Fix approach: Remove until required.

---

## Scalability

**[MEDIUM] Single-user design has no user isolation in schema**

- Risk: The `habits` and `habit_logs` tables have no `user_id` column. Adding multi-user support later requires a migration that adds the column, backfills data, and updates every query with a `WHERE user_id = ?` clause. The longer this waits the more data there is to migrate.
- Files: `src/db/schema.ts`
- Note: The ROADMAP explicitly defers auth. This is a known, accepted trade-off — documenting it here for when M-auth is scoped.

**[LOW] No pagination on habit or log queries**

- Risk: `getAllHabits` and `getLogsForHabit` return all rows unconditionally. For a personal app with dozens of habits this is fine. If habit count grows into the hundreds or log history spans years, query time and payload size will degrade.
- Files: `src/db/queries.ts` (lines 5-9, 49-60)

---

*Concerns audit: 2026-05-27*
