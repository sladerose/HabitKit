# Testing Patterns

**Analysis Date:** 2026-05-27

## Test Framework

**Runner:** None installed.

No test runner (Jest, Vitest, Playwright, Cypress) is present in `package.json` dependencies or devDependencies. No test config files (`jest.config.*`, `vitest.config.*`, `playwright.config.*`) exist in the project root.

**Run Commands:**
```bash
# No test scripts defined in package.json
# scripts available: dev, build, start, lint, db:*
```

## Test File Organization

**No test files exist.** A full recursive scan of `src/` found zero files matching `*.test.*` or `*.spec.*` patterns.

## Coverage

**Requirements:** None enforced.
**Current coverage:** 0%.

## What Is and Is Not Tested

**Tested:** Nothing.

**Untested (entire surface area):**

- `src/lib/utils.ts` — Pure functions (`computeStreak`, `computeLongestStreak`, `completionRate`, `getLast365Days`, `todayISO`). These are the highest-value unit test targets: no I/O, deterministic, business-critical logic.
- `src/db/queries.ts` — All database query functions (`getAllHabits`, `createHabit`, `updateHabit`, `deleteHabit`, `reorderHabits`, `toggleLog`, `getLogsForDate`, `getLogsForHabit`).
- `src/app/api/habits/route.ts` — GET, POST, PATCH handlers including input validation.
- `src/app/api/habits/[id]/route.ts` — GET, PUT, DELETE handlers.
- `src/app/api/logs/route.ts` — GET and POST handlers including query parameter branching logic.
- `src/components/HabitCheckbox.tsx` — Toggle interaction, optimistic UI, error revert.
- `src/components/SortableHabitList.tsx` — Drag-and-drop reorder, PATCH call on drag end.
- `src/components/HeatmapGrid.tsx` — Grid construction, padding alignment, month label placement.
- All page components (`src/app/page.tsx`, `src/app/habits/page.tsx`, `src/app/stats/page.tsx`, `src/app/habits/[id]/page.tsx`, `src/app/habits/new/page.tsx`, `src/app/habits/[id]/edit/page.tsx`).

## Coverage Gaps by Priority

**High — business logic, no I/O:**

`src/lib/utils.ts` — `computeStreak` and `computeLongestStreak` contain branching logic that is easy to unit test and directly affects user-facing stats. Edge cases: empty set, single day, non-consecutive days, streak broken today. No mocking required.

**High — API input validation:**

`src/app/api/habits/route.ts` and `src/app/api/logs/route.ts` — Validation paths (missing `name`, missing `habitId`/`date`, malformed `ids` array) have no test coverage. A regression here silently corrupts data or returns unhelpful errors.

**Medium — client interaction:**

`src/components/HabitCheckbox.tsx` — The optimistic-update-then-revert pattern is a fragile interaction. No test verifies the revert fires on fetch failure.

**Medium — API query routing:**

`src/app/api/logs/route.ts` GET handler branches on three query param combinations. No test confirms the "Invalid query" 400 path or the habit+date range path.

**Low — rendering:**

Page components and `HeatmapGrid` are render-heavy with little logic. Lower priority until the above gaps are addressed.

## E2E vs Unit vs Integration Breakdown

**Unit tests:** 0 (recommended starting point: `src/lib/utils.ts`)
**Integration tests:** 0
**E2E tests:** 0

## Recommended Setup (when testing is introduced)

**Unit testing** (pure logic, no DB):
- Vitest is the natural choice given the TypeScript + ESM setup. Add `vitest` to devDependencies and a `test` script.
- Place test files co-located: `src/lib/utils.test.ts`

**API route integration testing:**
- Use `next/experimental/testmode` or mock the DB layer (`src/db/queries.ts`) to test route handlers in isolation.

**E2E:**
- Playwright suits the PWA/mobile-first nature of the app. Not a priority until core logic is tested.

---

*Testing analysis: 2026-05-27*
