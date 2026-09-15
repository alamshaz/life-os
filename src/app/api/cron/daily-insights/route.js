import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Insight from "@/models/Insight";
import { generateInsightsForUser } from "@/lib/insights";

// Vercel Cron calls this on the schedule defined in vercel.json. It's
// protected with a shared secret so the endpoint can't be triggered by
// anyone who finds the URL.
export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const users = await User.find({}).select("_id").lean();

  let generated = 0;
  for (const u of users) {
    try {
      const items = await generateInsightsForUser(u._id);
      if (items.length > 0) {
        await Insight.create({ user: u._id, items });
        generated++;
      }
    } catch (err) {
      console.error(`Insight generation failed for user ${u._id}`, err);
    }
  }

  return NextResponse.json({ usersProcessed: users.length, insightsGenerated: generated });
}
