"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HABIT_COLORS, HABIT_ICONS } from "@/lib/utils";
import Link from "next/link";

export default function NewHabitPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(HABIT_COLORS[5]);
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [reminderTime, setReminderTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon, reminderTime: reminderTime || null }),
      });

      if (!res.ok) throw new Error("Failed to save");
      router.push("/habits");
      router.refresh();
    } catch {
      setError("Failed to save habit. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/habits" className="text-zinc-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-white">New Habit</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Preview */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: color + "33", color }}
          >
            {icon}
          </div>
          <span className="text-white font-medium">{name || "Habit name"}</span>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning run"
            maxLength={60}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 text-sm"
          />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {HABIT_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`w-10 h-10 rounded-lg text-lg transition-all ${
                  icon === i
                    ? "bg-zinc-700 ring-2 ring-white"
                    : "bg-zinc-900 hover:bg-zinc-800"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950" : ""
                }`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        {/* Reminder */}
        <div>
          <label className="block text-sm text-zinc-400 mb-2">
            Reminder <span className="text-zinc-600">(optional)</span>
          </label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-zinc-600 text-sm"
          />
          <p className="text-xs text-zinc-600 mt-1">
            Push notifications require adding this app to your home screen.
          </p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: color }}
        >
          {saving ? "Saving..." : "Create Habit"}
        </button>
      </form>
    </div>
  );
}
