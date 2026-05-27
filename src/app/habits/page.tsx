export const dynamic = "force-dynamic";
import { getAllHabits } from "@/db/queries";
import Link from "next/link";
import SortableHabitList from "@/components/SortableHabitList";

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
        <SortableHabitList initialHabits={habits} />
      )}
    </div>
  );
}
