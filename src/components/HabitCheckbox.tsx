"use client";

import { useState } from "react";
import { todayISO } from "@/lib/utils";

interface Props {
  habitId: string;
  color: string;
  initialChecked: boolean;
  onToggle?: (completed: boolean) => void;
}

export default function HabitCheckbox({ habitId, color, initialChecked, onToggle }: Props) {
  const [checked, setChecked] = useState(initialChecked);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (loading) return;
    setLoading(true);
    const next = !checked;
    setChecked(next);

    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, date: todayISO() }),
      });
      const data = await res.json();
      setChecked(data.completed);
      onToggle?.(data.completed);
    } catch {
      setChecked(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0"
      style={{
        borderColor: color,
        backgroundColor: checked ? color : "transparent",
      }}
      aria-label="Toggle habit"
    >
      {checked && (
        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
