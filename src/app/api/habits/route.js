import { NextResponse } from "next/server";
import { withUser } from "@/lib/crud";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";
import { subDays } from "date-fns";

export async function GET() {
  return withUser(async (user) => {
    const habits = await Habit.find({ user: user.id, archived: false }).sort("createdAt").lean();
    const since = subDays(new Date(), 27).toISOString().slice(0, 10);
    const logs = await HabitLog.find({ user: user.id, date: { $gte: since } }).lean();

    const withLogs = habits.map((h) => ({
      ...h,
      loggedDates: logs.filter((l) => String(l.habit) === String(h._id)).map((l) => l.date)
    }));

    return NextResponse.json(withLogs);
  });
}

export async function POST(request) {
  return withUser(async (user) => {
    const body = await request.json();
    const habit = await Habit.create({ ...body, user: user.id });
    return NextResponse.json(habit, { status: 201 });
  });
}
