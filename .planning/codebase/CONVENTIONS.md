# Coding Conventions

**Analysis Date:** 2026-05-27

## TypeScript

**Mode:** Strict (`"strict": true` in `tsconfig.json`). No relaxations observed.

**Types vs Interfaces:**
- Use `interface` for component prop shapes: `interface Props { habitId: string; ... }` (see `src/components/HabitCheckbox.tsx`)
- Use `type` for aliasing inferred Drizzle types: `export type Habit = typeof habits.$inferSelect;` (see `src/db/schema.ts`)
- Inline object types used for one-off function parameters in `src/db/queries.ts`

**Type Assertions:**
- Non-null assertion (`!`) used sparingly: `process.env.DATABASE_URL!` in `src/db/index.ts`
- Prefer `?? null` fallback over forcing non-null where possible

**Async:**
- All DB calls are `async`/`await`. No `.then()` chains.
- Parallel fetches use `Promise.all([...])` pattern (see `src/app/page.tsx`)

**Route params (Next.js 16):**
- `params` is a `Promise` — must be awaited before accessing: `const { id } = await params;`
- Type alias: `type Props = { params: Promise<{ id: string }> };` (see `src/app/habits/[id]/page.tsx`, `src/app/api/habits/[id]/route.ts`)
- This is a breaking change from Next.js 14/15. Do not access `params` synchronously.

## File Naming

**Pages:** `page.tsx` in route directories per App Router convention.
**API Routes:** `route.ts` in `app/api/` directories.
**Components:** PascalCase filename matching the exported component name (e.g., `HabitCheckbox.tsx`, `SortableHabitList.tsx`).
**Utilities/DB:** camelCase or descriptive lowercase (`utils.ts`, `queries.ts`, `schema.ts`, `index.ts`).
**Config files:** lowercase with appropriate extension (`drizzle.config.ts`, `next.config.ts`, `eslint.config.mjs`).

## Component Patterns

**Server Components (default):**
- No directive required — all pages without `"use client"` are server components.
- Fetch data directly in the component body via async functions or `Promise.all`.
- Pattern in use: async page function calls query helpers, passes data to client child components.
- Examples: `src/app/page.tsx`, `src/app/stats/page.tsx`, `src/app/habits/[id]/page.tsx`

**Client Components:**
- Declare `"use client"` as the first line (before imports).
- Used when: hooks (`useState`, `useMemo`, `usePathname`, `useRouter`), event handlers, or browser APIs are needed.
- Examples: `src/components/HabitCheckbox.tsx`, `src/components/Navigation.tsx`, `src/components/HeatmapGrid.tsx`, `src/components/SortableHabitList.tsx`, `src/app/habits/new/page.tsx`

**Force Dynamic:**
- All DB-querying pages export `export const dynamic = "force-dynamic";` as the first line (before imports).
- Required to prevent static rendering of pages that query Supabase at request time.
- Applied to: `src/app/page.tsx`, `src/app/habits/page.tsx`, `src/app/habits/[id]/page.tsx`, `src/app/stats/page.tsx`

**Component Exports:**
- Always `export default function ComponentName(...)` — no named exports for components.
- Internal-only sub-components (e.g., `SortableHabit`) are declared as regular functions in the same file and not exported.

**Props:**
- Destructure props inline in the function signature.
- Use `interface Props` for the prop type, not inline or generic naming.

## Import Conventions

**Order (observed pattern):**
1. Directives (`"use client"`) — not an import, but appears first
2. External packages (`react`, `next/*`, `date-fns`, `@dnd-kit/*`)
3. Internal aliases (`@/db/queries`, `@/lib/utils`, `@/components/*`, `@/db/schema`)
4. Relative imports (not observed — alias `@/` used exclusively for internal modules)

**Path Alias:**
- `@/` maps to `src/` (configured in `tsconfig.json` paths).
- Use `@/` for all internal imports. Never use relative paths like `../../`.

**Type-only imports:**
- Use `import type` for type-only imports: `import type { Habit } from "@/db/schema";` (see `src/components/SortableHabitList.tsx`), `import type { Metadata, Viewport } from "next";` (see `src/app/layout.tsx`).

## Styling

**Framework:** Tailwind CSS v4 via `@tailwindcss/postcss`.

**Configuration:** `postcss.config.mjs` drives the build. No `tailwind.config.js` — Tailwind v4 uses CSS-first configuration.

**Palette:** Dark theme only. Core palette:
- Backgrounds: `zinc-950` (page), `zinc-900` (cards), `zinc-800` (hover/border)
- Text: `white` (primary), `zinc-400` (secondary), `zinc-500/600` (muted)
- Accent: `indigo-600` (primary CTA), `indigo-500` (hover state)
- Habit color: dynamic via `style={{ color: habit.color }}` inline styles for per-habit branding

**Approach:**
- Utility classes only — no CSS modules, no styled-components.
- `globals.css` exists (imported in `src/app/layout.tsx`) for base styles and font variable.
- Inline `style` prop used only when values are dynamic (habit colors, transforms from dnd-kit).
- Responsive via Tailwind breakpoints: `md:` prefix for desktop variants (sidebar vs bottom nav pattern in `src/components/Navigation.tsx`).

**Common Patterns:**
- Cards: `bg-zinc-900 border border-zinc-800 rounded-xl p-4`
- Inputs: `bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-zinc-600`
- Transitions: `transition-colors` on interactive elements
- Disabled state: `disabled:opacity-50`

## Error Handling

**Client-side fetch errors:**
- Wrap `fetch` calls in `try/catch`.
- On catch: revert optimistic UI state and set a local `error` string for display.
- Pattern from `src/components/HabitCheckbox.tsx`: optimistic toggle, revert on error.
- Pattern from `src/app/habits/new/page.tsx`: set `error` state string, render `<p className="text-red-400 text-sm">{error}</p>`.

**API route errors:**
- Return `NextResponse.json({ error: "..." }, { status: 4xx })` for validation failures.
- No try/catch in route handlers — errors propagate (no global error boundary observed).
- 404 pattern in pages: call `notFound()` from `next/navigation` (see `src/app/habits/[id]/page.tsx`).

**No logging framework** — no error tracking or structured logging observed.

## Linting

**Tool:** ESLint v9 with flat config (`eslint.config.mjs`).
**Config:** `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`.
**Run:** `npm run lint` (calls `eslint` with no extra flags — uses flat config auto-discovery).
**No Prettier detected** — no `.prettierrc` or prettier config file present.

## Function Design

**Naming:** camelCase for all functions and async functions (`getAllHabits`, `handleDragEnd`, `toggleLog`).
**Size:** Functions are small and single-purpose. DB query functions each perform one operation.
**Parameters:** Object destructuring preferred for multi-param functions (e.g., `createHabit({ name, color, icon, reminderTime })`).
**Return values:** DB queries return row objects or arrays directly. API helpers return plain objects. No wrapper result types.

## Module Design

**Barrel files:** Not used. Import directly from the module file (`@/db/queries`, `@/db/schema`).
**Exports:** One `export default` per component file. Utility modules (`src/lib/utils.ts`, `src/db/queries.ts`, `src/db/schema.ts`) use named exports.

---

*Convention analysis: 2026-05-27*
