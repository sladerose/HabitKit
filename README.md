# HabitKit

Personal PWA habit tracker. Inspired by the HabitKit iOS app. Built for daily use on mobile.

**Live:** [habit-kit-mu.vercel.app](https://habit-kit-mu.vercel.app)

## Stack

- Next.js 16 (App Router)
- Supabase (Postgres)
- Drizzle ORM
- Tailwind CSS
- Deployed on Vercel

## Features

- Daily habit check-off with streak tracking
- 365-day heatmap per habit
- Stats (streak, longest streak, completion rate)
- Drag-to-reorder habits
- PWA — installable on iOS and Android

## Development

```bash
npm install
npm run dev
```

### Environment variables

```
DATABASE_URL=          # Supabase transaction pooler URL (port 6543)
DIRECT_URL=            # Supabase direct connection URL (port 5432, for migrations)
```

### Database

```bash
npm run db:push        # Push schema to database
npm run db:seed        # Seed with sample habits
```

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features.
