import { NextResponse } from "next/server";
import { withUser } from "@/lib/crud";
import Task from "@/models/Task";

export async function PATCH(request, { params }) {
  return withUser(async (user) => {
    const body = await request.json();

    // Stamp completedAt whenever `completed` transitions to true — this
    // timestamp is what the recommendation engine analyzes.
    if (body.completed === true) {
      body.completedAt = new Date();
    } else if (body.completed === false) {
      body.completedAt = null;
    }

    const doc = await Task.findOneAndUpdate({ _id: params.id, user: user.id }, { $set: body }, { new: true });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(doc);
  });
}

export async function DELETE(request, { params }) {
  return withUser(async (user) => {
    const doc = await Task.findOneAndDelete({ _id: params.id, user: user.id });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  });
}
