import { NextResponse } from "next/server";
import { getHabitById, updateHabit, deleteHabit } from "@/db/queries";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const habit = await getHabitById(id);
  if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(habit);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const habit = await updateHabit(id, body);
  return NextResponse.json(habit);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await deleteHabit(id);
  return NextResponse.json({ success: true });
}
