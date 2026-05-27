# Technology Stack

**Analysis Date:** 2026-05-27

## Languages

**Primary:**
- TypeScript 5.x — all application code under `src/`
- TSX — React component files

**Secondary:**
- JavaScript — `public/sw.js` (service worker, static file)

## Runtime

**Environment:**
- Node.js (version not pinned; no `.nvmrc` or `.node-version` present)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.2.6 — full-stack framework, App Router only (no Pages Router usage)
- React 19.2.4 — UI rendering
- React DOM 19.2.4 — DOM rendering

**Build/Dev:**
- Tailwind CSS 4.x — utility-first CSS (`@tailwindcss/postcss` integration via `postcss.config.mjs`)
- PostCSS — CSS processing pipeline
- TypeScript compiler — type checking via `tsconfig.json` (noEmit; Next.js handles transpilation)
- ESLint 9.x — linting via `eslint.config.mjs` with `eslint-config-next` presets (core-web-vitals + typescript)

**Database ORM:**
- Drizzle ORM 0.45.2 — type-safe SQL query builder
- drizzle-kit 0.31.10 — schema migrations and studio (`db:generate`, `db:migrate`, `db:push`, `db:studio`)

## Key Dependencies

**Critical:**
- `next` 16.2.6 — framework with App Router, Server Components, Route Handlers
- `react` / `react-dom` 19.2.4 — UI layer
- `drizzle-orm` 0.45.2 — database access layer; all queries in `src/db/queries.ts`
- `postgres` 3.4.9 — low-level PostgreSQL client used by Drizzle (`src/db/index.ts`)
- `@supabase/supabase-js` 2.106.2 — Supabase JS client (installed but not yet imported in source; DB access goes via direct `postgres` driver)

**UI / Interaction:**
- `@dnd-kit/core` 6.3.1 — drag-and-drop primitives
- `@dnd-kit/sortable` 10.0.0 — sortable list abstraction (used in `src/components/SortableHabitList.tsx`)
- `@dnd-kit/utilities` 3.2.2 — dnd-kit CSS transform helpers

**Utilities:**
- `date-fns` 4.3.0 — date arithmetic and formatting (`src/lib/utils.ts`)

**Type support:**
- `@types/pg` 8.20.0 — PostgreSQL types
- `@types/node` 20.x — Node.js types
- `@types/react` / `@types/react-dom` 19.x — React types

## Configuration

**TypeScript:**
- `tsconfig.json`: strict mode, `bundler` module resolution, path alias `@/*` maps to `src/*`

**Tailwind:**
- Tailwind v4 configured via PostCSS; no separate `tailwind.config.*` file (v4 uses CSS-first config)
- Global styles: `src/app/globals.css`

**Next.js:**
- `next.config.ts`: minimal, no custom config active

**Drizzle:**
- `drizzle.config.ts`: schema at `src/db/schema.ts`, output at `drizzle/`, dialect `postgresql`
- Manually reads `.env.local` via `fs.readFileSync` (workaround for drizzle-kit env loading)

**ESLint:**
- `eslint.config.mjs`: flat config format, extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

## PWA

- Web App Manifest: `public/manifest.json` (standalone display, portrait, dark theme)
- Service Worker: `public/sw.js` (registered inline in `src/app/layout.tsx`)
- Icons: `public/icon-192.png`, `public/icon-512.png`
- Apple Web App meta configured in Next.js metadata export

## Platform Requirements

**Development:**
- Node.js with npm
- PostgreSQL-compatible database (Supabase project)
- `.env.local` with `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Production:**
- Vercel (implied by `vercel.svg` in public and project history)
- Supabase PostgreSQL as managed database

---

*Stack analysis: 2026-05-27*
