import { NextResponse } from "next/server";
import { getLogsForHabit, getLogsForDate, toggleLog } from "@/db/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habit_id");
  const date = searchParams.get("date");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (habitId && from && to) {
    const logs = await getLogsForHabit(habitId, from, to);
    return NextResponse.json(logs);
  }

  if (date) {
    const logs = await getLogsForDate(date);
    return NextResponse.json(logs);
  }

  return NextResponse.json({ error: "Invalid query" }, { status: 400 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { habitId, date } = body;

  if (!habitId || !date) {
    return NextResponse.json({ error: "habitId and date required" }, { status: 400 });
  }

  const result = await toggleLog(habitId, date);
  return NextResponse.json(result);
}
