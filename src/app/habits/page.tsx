import { getAllHabits } from "@/db/queries";
import Link from "next/link";

export default async function HabitsPage() {
  const habits = await getAllHabits();

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-white">Habits</h1>
        <Link
          href="/habits/new"
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
        >
          + New
        </Link>
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
            <li key={habit.id}>
              <Link
                href={`/habits/${habit.id}`}
                className="flex items-center gap-4 bg-zinc-900 hover:bg-zinc-800 rounded-xl p-4 border border-zinc-800 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: habit.color + "33", color: habit.color }}
                >
                  {habit.icon}
                </div>
                <span className="flex-1 text-sm font-medium text-white">{habit.name}</span>
                <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
