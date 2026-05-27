import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";

export const HABIT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export const HABIT_ICONS = [
  "✦", "🏃", "💪", "📚", "🧘", "💧", "🥗", "😴", "✍️", "🎯",
  "🎵", "🧠", "💊", "🌿", "🚴", "🏊", "🧹", "💻", "🎨", "🙏",
];

export function todayISO() {
  return format(new Date(), "yyyy-MM-dd");
}

export function getLast365Days(): string[] {
  const today = new Date();
  const start = subDays(today, 364);
  return eachDayOfInterval({ start, end: today }).map((d) =>
    format(d, "yyyy-MM-dd")
  );
}

export function computeStreak(logDates: Set<string>): number {
  let streak = 0;
  let cursor = new Date();

  while (true) {
    const dateStr = format(cursor, "yyyy-MM-dd");
    if (!logDates.has(dateStr)) break;
    streak++;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function computeLongestStreak(logDates: Set<string>): number {
  if (logDates.size === 0) return 0;

  const sorted = [...logDates].sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = parseISO(sorted[i - 1]);
    const curr = parseISO(sorted[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export function completionRate(logDates: Set<string>, totalDays: number): number {
  if (totalDays === 0) return 0;
  return Math.round((logDates.size / totalDays) * 100);
}
