"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { HABIT_COLORS, HABIT_ICONS } from "@/lib/utils";
import Link from "next/link";

export default function EditHabitPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [color, setColor] = useState(HABIT_COLORS[5]);
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [reminderTime, setReminderTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/habits/${id}`)
      .then((r) => r.json())
      .then((h) => {
        setName(h.name);
        setColor(h.color);
        setIcon(h.icon);
        setReminderTime(h.reminderTime ?? "");
        setLoading(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, icon, reminderTime: reminderTime || null }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push(`/habits/${id}`);
      router.refresh();
    } catch {
      setError("Failed to save. Try again.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this habit? All logs will be lost.")) return;
    setDeleting(true);
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
    router.push("/habits");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/habits/${id}`} className="text-zinc-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-white">Edit Habit</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: color + "33", color }}
          >
            {icon}
          </div>
          <span className="text-white font-medium">{name || "Habit name"}</span>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {HABIT_ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`w-10 h-10 rounded-lg text-lg transition-all ${
                  icon === i ? "bg-zinc-700 ring-2 ring-white" : "bg-zinc-900 hover:bg-zinc-800"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

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
              />
            ))}
          </div>
        </div>

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
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: color }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="w-full py-3 rounded-xl font-medium text-red-400 border border-red-900 hover:bg-red-950 transition-colors disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete Habit"}
        </button>
      </form>
    </div>
  );
}
