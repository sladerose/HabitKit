# Architecture

**Analysis Date:** 2026-05-27

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     Browser / PWA Client                     │
├──────────────────┬──────────────────┬───────────────────────┤
│  Server Pages    │  Client Pages    │  Client Components    │
│  (async RSC)     │  ("use client")  │  ("use client")       │
│  `app/page.tsx`  │  `habits/new`    │  `HabitCheckbox`      │
│  `habits/[id]`   │  `habits/[id]`   │  `SortableHabitList`  │
│  `stats/page`    │  `/edit`         │  `HeatmapGrid`        │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │  DB direct       │  fetch()            │  fetch()
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                        │
│  `app/api/habits/route.ts`   GET / POST / PATCH             │
│  `app/api/habits/[id]/route.ts`  GET / PUT / DELETE         │
│  `app/api/logs/route.ts`     GET / POST                     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Query Layer                                │
│  `src/db/queries.ts`                                         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Drizzle ORM  →  postgres.js  →  Supabase PostgreSQL        │
│  `src/db/index.ts`  /  `src/db/schema.ts`                   │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root Layout | Shell, nav mount, SW registration, PWA meta | `src/app/layout.tsx` |
| TodayPage | SSR: fetch today's habits + logs, render checklist | `src/app/page.tsx` |
| HabitsPage | SSR: fetch all habits, pass to sortable list | `src/app/habits/page.tsx` |
| HabitDetailPage | SSR: fetch habit + 365-day logs, compute stats | `src/app/habits/[id]/page.tsx` |
| StatsPage | SSR: fetch all habits + logs, compute aggregate stats | `src/app/stats/page.tsx` |
| NewHabitPage | Client form: POST to `/api/habits` | `src/app/habits/new/page.tsx` |
| EditHabitPage | Client form: GET/PUT/DELETE `/api/habits/[id]` | `src/app/habits/[id]/edit/page.tsx` |
| HabitCheckbox | Client: optimistic toggle via POST `/api/logs` | `src/components/HabitCheckbox.tsx` |
| SortableHabitList | Client: dnd-kit drag-to-reorder, PATCH `/api/habits` | `src/components/SortableHabitList.tsx` |
| HeatmapGrid | Client: render 365-day contribution grid | `src/components/HeatmapGrid.tsx` |
| Navigation | Client: sidebar (desktop) + bottom bar (mobile) | `src/components/Navigation.tsx` |
| db client | Single postgres.js + Drizzle instance | `src/db/index.ts` |
| queries | All DB access functions (no raw SQL in pages) | `src/db/queries.ts` |
| schema | Table definitions + exported types | `src/db/schema.ts` |
| utils | Date helpers, streak computation, constants | `src/lib/utils.ts` |

## Pattern Overview

**Overall:** Server-first hybrid RSC + Islands

**Key Characteristics:**
- Read-heavy pages (Today, Habits, Detail, Stats) are React Server Components that query the DB directly — no API round-trip for initial load.
- Interactive islands (checkbox, drag list, forms) are `"use client"` components. They mutate data exclusively through the REST API routes.
- No shared client-side state store. Each interactive component is self-contained with local `useState`.

## Layers

**Page (Server):**
- Purpose: Fetch data from DB, pass as props to client components or render directly.
- Location: `src/app/**/page.tsx` (files without `"use client"`)
- Contains: Async server components, DB query calls, stat computation.
- Depends on: `src/db/queries.ts`, `src/lib/utils.ts`
- Used by: Next.js router

**Page (Client):**
- Purpose: Handle user-driven mutations (create, edit, delete).
- Location: `src/app/habits/new/page.tsx`, `src/app/habits/[id]/edit/page.tsx`
- Contains: Form state, fetch calls to API routes, router.push after success.
- Depends on: API routes, `src/lib/utils.ts` (constants)
- Used by: Next.js router

**API Routes:**
- Purpose: Thin HTTP handlers; validate input, delegate to query layer, return JSON.
- Location: `src/app/api/**/route.ts`
- Contains: NextResponse wrappers, basic validation, no business logic.
- Depends on: `src/db/queries.ts`
- Used by: Client components via fetch()

**Query Layer:**
- Purpose: All database access. The only layer that imports from `src/db/index.ts`.
- Location: `src/db/queries.ts`
- Contains: Named async functions, Drizzle query builders.
- Depends on: `src/db/index.ts`, `src/db/schema.ts`
- Used by: Server pages (direct) and API routes (via HTTP from client)

**DB Client:**
- Purpose: Singleton Drizzle + postgres.js connection.
- Location: `src/db/index.ts`
- Contains: Single exported `db` instance.
- Depends on: `DATABASE_URL` environment variable

**Utilities:**
- Purpose: Pure functions for date arithmetic, streak calculation, and shared constants.
- Location: `src/lib/utils.ts`
- Contains: `computeStreak`, `computeLongestStreak`, `completionRate`, `getLast365Days`, `HABIT_COLORS`, `HABIT_ICONS`
- Depends on: `date-fns`
- Used by: Server pages, client components

## Data Flow

### Today Page (Server-rendered read)

1. Next.js invokes `TodayPage` as async RSC (`src/app/page.tsx`)
2. `getTodayData()` calls `getAllHabits()` and `getLogsForDate(today)` in parallel (`src/db/queries.ts`)
3. Drizzle executes SQL via `postgres` against Supabase PostgreSQL
4. Results rendered into HTML on server; `HabitCheckbox` hydrated as client island with `initialChecked` prop

### Toggle Habit Completion (Client mutation)

1. User clicks `HabitCheckbox` (`src/components/HabitCheckbox.tsx`)
2. Optimistic UI update: `setChecked(!checked)` immediately
3. `fetch POST /api/logs` with `{ habitId, date }` (`src/app/api/logs/route.ts`)
4. `toggleLog()` in `src/db/queries.ts` checks for existing log; inserts or deletes
5. Response `{ completed: boolean }` reconciles optimistic state

### Drag-to-Reorder Habits

1. `SortableHabitList` handles `DragEndEvent` from dnd-kit (`src/components/SortableHabitList.tsx`)
2. `arrayMove` reorders local state immediately
3. `fetch PATCH /api/habits` with `{ ids: string[] }` (`src/app/api/habits/route.ts`)
4. `reorderHabits()` fires N parallel `UPDATE` queries setting `sort_order` column

### Create / Edit Habit (Client form)

1. Client page submits form via `fetch POST/PUT /api/habits[/id]`
2. API route validates, calls `createHabit` or `updateHabit` in `src/db/queries.ts`
3. On success, `router.push()` + `router.refresh()` invalidates RSC cache and re-renders server page

**State Management:**
- No global state. Server pages carry data as props. Client components use `useState` locally. Mutations invalidate RSC cache via `router.refresh()`.

## Key Abstractions

**Habit:**
- Purpose: Core entity — a named recurring behavior with color, icon, sort order.
- Schema: `src/db/schema.ts` (`habits` table)
- Type: `Habit` (Drizzle inferred select type)

**HabitLog:**
- Purpose: A single completion record — one row per (habit, date) pair. Unique constraint enforced at DB level.
- Schema: `src/db/schema.ts` (`habit_logs` table, `uniqueIndex` on `habitId + date`)
- Type: `HabitLog`

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page request
- Responsibilities: HTML shell, Geist font, Navigation component, service worker registration

**Today Page:**
- Location: `src/app/page.tsx`
- Triggers: GET `/`
- Responsibilities: Default view, habit checklist for current day

## Architectural Constraints

- **Rendering:** All data-fetching pages use `export const dynamic = "force-dynamic"` to prevent Next.js static caching. This is required because Supabase connection pooling and server-side `new Date()` calls are not cache-safe.
- **DB connection:** Single `postgres()` client instantiated at module load in `src/db/index.ts`. Not pooled separately — relies on Supabase's built-in connection pooler via `DATABASE_URL`.
- **No auth:** No authentication layer. The app is single-user by design; all habits are global.
- **Global state:** None. No Zustand, Context, or Redux.
- **Circular imports:** None detected. Dependency direction is strictly: pages/API routes -> queries -> db client/schema.

## Anti-Patterns

### Edit page fetches on mount via useEffect

**What happens:** `EditHabitPage` (`src/app/habits/[id]/edit/page.tsx`) is a client component that fetches the habit via `fetch(/api/habits/${id})` in a `useEffect`.
**Why it's wrong:** This causes a loading flash and an unnecessary API round-trip. The data is available server-side.
**Do this instead:** Convert to an async server component that fetches directly from `src/db/queries.ts` and passes data as props to a client form component.

### N+1 queries in StatsPage

**What happens:** `StatsPage` (`src/app/stats/page.tsx`) calls `getLogsForHabit()` inside `Promise.all(habits.map(...))`, issuing one DB query per habit.
**Why it's wrong:** Performance degrades linearly with habit count. A single query joining habits and logs would be more efficient.
**Do this instead:** Add a `getLogsForAllHabits(from, to)` query that fetches all logs in one statement and groups by `habitId` in application code.

## Error Handling

**Strategy:** Minimal. API routes return JSON error objects with appropriate HTTP status codes. Client components catch fetch errors and display inline error strings. Server pages call `notFound()` from Next.js when a resource is missing.

**Patterns:**
- API: `NextResponse.json({ error: "..." }, { status: 4xx })`
- Client: try/catch around fetch with `setError()` state
- Server page: `if (!habit) notFound()`

## Cross-Cutting Concerns

**Logging:** None. No logging framework in place.
**Validation:** Input validation is done inline in API route handlers (presence checks only). No schema validation library.
**Authentication:** Not present. Single-user app with no auth layer.

---

*Architecture analysis: 2026-05-27*
