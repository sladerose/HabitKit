import { readFileSync } from "fs";
import { resolve } from "path";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
for (const line of env.split("\n")) {
  const eq = line.indexOf("=");
  if (eq > 0 && !line.startsWith("#")) {
    process.env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
}

const SAMPLE_HABITS = [
  { name: "Morning Run", color: "#f97316", icon: "🏃" },
  { name: "Read", color: "#8b5cf6", icon: "📚" },
  { name: "Meditate", color: "#06b6d4", icon: "🧘" },
  { name: "Drink Water", color: "#3b82f6", icon: "💧" },
  { name: "No Sugar", color: "#10b981", icon: "🥗" },
  { name: "Journal", color: "#f59e0b", icon: "✍️" },
];

const RATES = [0.65, 0.8, 0.55, 0.9, 0.45, 0.7];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

async function seed() {
  // Dynamic imports run after env is loaded
  const { db } = await import("./index");
  const { habits, habitLogs } = await import("./schema");

  console.log("Clearing existing data...");
  await db.delete(habitLogs);
  await db.delete(habits);

  console.log("Inserting habits...");
  const inserted = await db.insert(habits).values(SAMPLE_HABITS).returning();

  console.log("Inserting logs (90 days)...");
  const logs: { habitId: string; date: string }[] = [];

  for (let i = 0; i < inserted.length; i++) {
    const rate = RATES[i];
    for (let d = 0; d < 90; d++) {
      if (Math.random() < rate) {
        logs.push({ habitId: inserted[i].id, date: daysAgo(d) });
      }
    }
  }

  await db.insert(habitLogs).values(logs);
  console.log(`Done. ${inserted.length} habits, ${logs.length} log entries.`);
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
