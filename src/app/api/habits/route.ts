import { NextResponse } from "next/server";
import { getAllHabits, createHabit, reorderHabits } from "@/db/queries";

export async function GET() {
  const data = await getAllHabits();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, color, icon, reminderTime } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const habit = await createHabit({ name: name.trim(), color, icon, reminderTime });
  return NextResponse.json(habit, { status: 201 });
}

export async function PATCH(req: Request) {
  const { ids } = await req.json();
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "ids must be an array" }, { status: 400 });
  }
  await reorderHabits(ids);
  return NextResponse.json({ ok: true });
}
