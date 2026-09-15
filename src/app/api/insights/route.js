import { NextResponse } from "next/server";
import { withUser } from "@/lib/crud";
import { generateInsightsForUser } from "@/lib/insights";
import Insight from "@/models/Insight";

export async function GET() {
  return withUser(async (user) => {
    const items = await generateInsightsForUser(user.id);
    return NextResponse.json({ items, generatedAt: new Date() });
  });
}

// Persist the current computation as today's snapshot (used by the manual
// "Refresh insights" button, distinct from the nightly cron).
export async function POST() {
  return withUser(async (user) => {
    const items = await generateInsightsForUser(user.id);
    const doc = await Insight.create({ user: user.id, items });
    return NextResponse.json(doc, { status: 201 });
  });
}
