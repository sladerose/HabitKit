"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useState } from "react";
import type { Habit } from "@/db/schema";

function SortableHabit({ habit }: { habit: Habit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-2 text-zinc-600 hover:text-zinc-400 touch-none cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Drag to reorder"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5" />
            <circle cx="11" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
          </svg>
        </button>
        <Link
          href={`/habits/${habit.id}`}
          className="flex items-center gap-4 flex-1 bg-zinc-900 hover:bg-zinc-800 rounded-xl p-4 border border-zinc-800 transition-colors min-w-0"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ backgroundColor: habit.color + "33", color: habit.color }}
          >
            {habit.icon}
          </div>
          <span className="flex-1 text-sm font-medium text-white truncate">{habit.name}</span>
          <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </li>
  );
}

export default function SortableHabitList({ initialHabits }: { initialHabits: Habit[] }) {
  const [habits, setHabits] = useState(initialHabits);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = habits.findIndex((h) => h.id === active.id);
    const newIndex = habits.findIndex((h) => h.id === over.id);
    const reordered = arrayMove(habits, oldIndex, newIndex);
    setHabits(reordered);

    await fetch("/api/habits", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((h) => h.id) }),
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-3">
          {habits.map((habit) => (
            <SortableHabit key={habit.id} habit={habit} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
