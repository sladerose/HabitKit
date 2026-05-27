import { getHabitById, getLogsForHabit } from "@/db/queries";
import { getLast365Days, computeStreak, computeLongestStreak, completionRate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import HeatmapGrid from "@/components/HeatmapGrid";
import { format, subYears } from "date-fns";

type Props = { params: Promise<{ id: string }> };

export default async function HabitDetailPage({ params }: Props) {
  const { id } = await params;
  const habit = await getHabitById(id);
  if (!habit) notFound();

  const today = format(new Date(), "yyyy-MM-dd");
  const yearAgo = format(subYears(new Date(), 1), "yyyy-MM-dd");
  const logs = await getLogsForHabit(id, yearAgo, today);
  const logDates = new Set(logs.map((l) => l.date));

  const streak = computeStreak(logDates);
  const longest = computeLongestStreak(logDates);
  const rate = completionRate(logDates, getLast365Days().length);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/habits" className="text-zinc-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: habit.color + "33", color: habit.color }}
        >
          {habit.icon}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">{habit.name}</h1>
        </div>
        <Link
          href={`/habits/${id}/edit`}
          className="text-zinc-500 hover:text-white text-sm transition-colors"
        >
          Edit
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "Streak", value: `${streak}d` },
          { label: "Longest", value: `${longest}d` },
          { label: "Rate", value: `${rate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white" style={{ color: habit.color }}>
              {value}
            </div>
            <div className="text-xs text-zinc-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Past year</h2>
        <HeatmapGrid logDates={logDates} color={habit.color} />
      </div>

      <div className="mt-4 text-xs text-zinc-600 text-right">
        {logs.length} completions in the past year
      </div>
    </div>
  );
}
