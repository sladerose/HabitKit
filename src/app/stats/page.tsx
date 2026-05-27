import { getAllHabits, getLogsForHabit } from "@/db/queries";
import { getLast365Days, computeStreak, computeLongestStreak, completionRate } from "@/lib/utils";
import { format, subYears } from "date-fns";
import Link from "next/link";

export default async function StatsPage() {
  const habits = await getAllHabits();
  const today = format(new Date(), "yyyy-MM-dd");
  const yearAgo = format(subYears(new Date(), 1), "yyyy-MM-dd");
  const days365 = getLast365Days().length;

  const habitStats = await Promise.all(
    habits.map(async (habit) => {
      const logs = await getLogsForHabit(habit.id, yearAgo, today);
      const logDates = new Set(logs.map((l) => l.date));
      return {
        habit,
        streak: computeStreak(logDates),
        longest: computeLongestStreak(logDates),
        rate: completionRate(logDates, days365),
        total: logs.length,
      };
    })
  );

  const totalCompletions = habitStats.reduce((s, h) => s + h.total, 0);
  const avgRate =
    habitStats.length > 0
      ? Math.round(habitStats.reduce((s, h) => s + h.rate, 0) / habitStats.length)
      : 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-white mb-8">Stats</h1>

      {habits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 mb-4">No habits to show stats for.</p>
          <Link
            href="/habits/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
          >
            Add a habit
          </Link>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-3xl font-bold text-white">{totalCompletions}</div>
              <div className="text-xs text-zinc-500 mt-1">Total completions</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-3xl font-bold text-white">{avgRate}%</div>
              <div className="text-xs text-zinc-500 mt-1">Avg completion rate</div>
            </div>
          </div>

          {/* Per-habit table */}
          <div className="flex flex-col gap-3">
            {habitStats
              .sort((a, b) => b.streak - a.streak)
              .map(({ habit, streak, longest, rate, total }) => (
                <Link
                  key={habit.id}
                  href={`/habits/${habit.id}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-4 hover:bg-zinc-800 transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: habit.color + "33", color: habit.color }}
                  >
                    {habit.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{habit.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{total} completions</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold" style={{ color: habit.color }}>
                      {streak}d streak
                    </div>
                    <div className="text-xs text-zinc-500">{rate}% rate</div>
                  </div>
                </Link>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
