import { NextResponse } from "next/server";
import { withUser } from "@/lib/crud";
import Habit from "@/models/Habit";
import HabitLog from "@/models/HabitLog";

export async function POST(request, { params }) {
  return withUser(async (user) => {
    const { date } = await request.json(); // "YYYY-MM-DD"
    if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

    const habit = await Habit.findOne({ _id: params.id, user: user.id });
    if (!habit) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await HabitLog.findOne({ habit: habit._id, date });
    if (existing) {
      await existing.deleteOne();
      return NextResponse.json({ logged: false, date });
    }

    await HabitLog.create({ user: user.id, habit: habit._id, date });
    return NextResponse.json({ logged: true, date });
  });
}
