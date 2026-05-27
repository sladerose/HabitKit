export const dynamic = "force-dynamic";
import { getAllHabits, getLogsForDate } from "@/db/queries";
import { todayISO } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import HabitCheckbox from "@/components/HabitCheckbox";

async function getTodayData() {
  const today = todayISO();
  const [habits, todayLogs] = await Promise.all([
    getAllHabits(),
    getLogsForDate(today),
  ]);
  const completedIds = new Set(todayLogs.map((l) => l.habitId));
  return { habits, completedIds, today };
}

export default async function TodayPage() {
  const { habits, completedIds, today } = await getTodayData();
  const dateLabel = format(new Date(), "EEEE, d MMMM");
  const completedCount = [...completedIds].filter((id) =>
    habits.some((h) => h.id === id)
  ).length;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-zinc-500 text-sm">{dateLabel}</p>
        <h1 className="text-2xl font-semibold text-white">Today</h1>
        {habits.length > 0 && (
          <p className="text-zinc-400 text-sm mt-1">
            {completedCount} / {habits.length} completed
          </p>
        )}
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 mb-4">No habits yet.</p>
          <Link
            href="/habits/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
          >
            Add your first habit
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {habits.map((habit) => (
            <li
              key={habit.id}
              className="flex items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800"
            >
              <HabitCheckbox
                habitId={habit.id}
                color={habit.color}
                initialChecked={completedIds.has(habit.id)}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white">{habit.icon} {habit.name}</span>
              </div>
              <Link
                href={`/habits/${habit.id}`}
                className="text-zinc-600 hover:text-zinc-400 transition-colors shrink-0"
                aria-label="View habit"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/habits/new"
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition-colors"
        aria-label="Add habit"
      >
        +
      </Link>
    </div>
  );
}
