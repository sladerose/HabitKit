import { db } from "./index";
import { habits, habitLogs } from "./schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export async function getAllHabits() {
  return db.select().from(habits).orderBy(desc(habits.createdAt));
}

export async function getHabitById(id: string) {
  const rows = await db.select().from(habits).where(eq(habits.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createHabit(data: {
  name: string;
  color: string;
  icon: string;
  reminderTime?: string;
}) {
  const rows = await db.insert(habits).values(data).returning();
  return rows[0];
}

export async function updateHabit(
  id: string,
  data: { name?: string; color?: string; icon?: string; reminderTime?: string | null }
) {
  const rows = await db.update(habits).set(data).where(eq(habits.id, id)).returning();
  return rows[0];
}

export async function deleteHabit(id: string) {
  await db.delete(habits).where(eq(habits.id, id));
}

export async function getLogsForHabit(habitId: string, from: string, to: string) {
  return db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, habitId),
        gte(habitLogs.date, from),
        lte(habitLogs.date, to)
      )
    );
}

export async function getLogsForDate(date: string) {
  return db.select().from(habitLogs).where(eq(habitLogs.date, date));
}

export async function toggleLog(habitId: string, date: string) {
  const existing = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, date)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(habitLogs).where(eq(habitLogs.id, existing[0].id));
    return { completed: false };
  } else {
    await db.insert(habitLogs).values({ habitId, date });
    return { completed: true };
  }
}
