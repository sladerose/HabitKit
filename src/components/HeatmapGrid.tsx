"use client";

import { getLast365Days } from "@/lib/utils";
import { format, parseISO, getDay, startOfWeek, subDays } from "date-fns";
import { useMemo } from "react";

interface Props {
  logDates: Set<string>;
  color: string;
}

export default function HeatmapGrid({ logDates, color }: Props) {
  const weeks = useMemo(() => {
    const days = getLast365Days();

    // Pad start so grid aligns to Sunday
    const firstDay = parseISO(days[0]);
    const dayOfWeek = getDay(firstDay);
    const paddedDays: (string | null)[] = [
      ...Array(dayOfWeek).fill(null),
      ...days,
    ];

    const result: (string | null)[][] = [];
    for (let i = 0; i < paddedDays.length; i += 7) {
      result.push(paddedDays.slice(i, i + 7));
    }
    return result;
  }, []);

  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
      const firstReal = week.find((d) => d !== null);
      if (!firstReal) return;
      const month = parseISO(firstReal).getMonth();
      if (month !== lastMonth) {
        labels.push({ label: format(parseISO(firstReal), "MMM"), col });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-max">
        {/* Month labels */}
        <div className="flex mb-1 ml-8 text-xs text-zinc-500">
          {monthLabels.map(({ label, col }) => (
            <div
              key={`${label}-${col}`}
              style={{ gridColumnStart: col + 1, marginLeft: col === 0 ? 0 : `${(col - (monthLabels[monthLabels.indexOf(monthLabels.find(l => l.col === col)!)]?.col ?? 0)) * 14}px` }}
              className="absolute"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1 mt-4">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1 text-xs text-zinc-500 w-6">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="h-3 flex items-center justify-end pr-1">
                {i % 2 !== 0 ? d : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="w-3 h-3" />;
                }
                const done = logDates.has(day);
                return (
                  <div
                    key={day}
                    title={`${day}${done ? " ✓" : ""}`}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: done ? color : "#27272a",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
