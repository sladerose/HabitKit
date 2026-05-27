# HabitKit Roadmap

Personal PWA habit tracker. Cloning HabitKit iOS. Ship fast, no auth complexity.

## Done

- [x] Today view (checkbox per habit)
- [x] Habits list
- [x] Create / Edit / Delete habits (name, color, icon)
- [x] Habit detail with 365-day heatmap
- [x] Stats page (streak, longest streak, completion rate)
- [x] PWA manifest + service worker + icons
- [x] Supabase + Drizzle ORM
- [x] Vercel deploy (habit-kit-mu.vercel.app)
- [x] Drag-to-reorder habits

## Next (priority order)

### M2 — Core UX Polish
- [ ] Archive habits (hide without deleting, toggle visibility)
- [ ] Week start day preference (Sunday vs Monday)
- [ ] Today view reorders to match habits list order
- [ ] Empty state improvements (onboarding copy)

### M3 — Notifications
- [ ] Push notification reminders per habit (Web Push API)
- [ ] Multiple reminder times per habit (up to 3)
- [ ] Daily check-in notification
- Note: iOS PWA supports Web Push since iOS 16.4 — viable

### M4 — Richer Tracking
- [ ] Numeric/quantitative habits (e.g. "8 glasses water" with increment)
- [ ] Habit notes/journal per log entry
- [ ] Weekly completion view (calendar grid)

### M5 — Data & Settings
- [ ] Export data (CSV or JSON)
- [ ] Import data (for device switching)
- [ ] Settings page (week start, theme)

## Out of scope (for now)
- Auth / multi-user (personal app only)
- Cross-device sync beyond Supabase (already handled)
- Native app / Expo
- Home screen widgets (PWA limitation)
- Shortcuts app integration (iOS-native only)
