"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { apiGet } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import InsightsPanel from "@/components/InsightsPanel";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    async function load() {
      const [tasks, habits, focusSessions] = await Promise.all([
        apiGet("/api/tasks"),
        apiGet("/api/habits"),
        apiGet("/api/focus")
      ]);

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);

      const completedThisWeek = tasks.filter(
        (t) => t.completed && t.completedAt && new Date(t.completedAt) >= weekAgo
      ).length;

      const completedToday = tasks.filter(
        (t) => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === now.toDateString()
      ).length;

      const focusToday = focusSessions
        .filter((f) => new Date(f.startedAt).toDateString() === now.toDateString())
        .reduce((sum, f) => sum + f.durationMinutes, 0);

      const longestStreak = habits.reduce((max, h) => Math.max(max, longestRun(h.loggedDates || [])), 0);

      setStats({ completedThisWeek, completedToday, focusToday, longestStreak, habitCount: habits.length });

      // Build a 7-day bar chart of tasks completed per day
      const buckets = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(now.getTime() - (6 - i) * 86400000);
        return { day: DAY_LABELS[d.getDay()], date: d.toDateString(), count: 0 };
      });
      tasks.forEach((t) => {
        if (!t.completed || !t.completedAt) return;
        const key = new Date(t.completedAt).toDateString();
        const bucket = buckets.find((b) => b.date === key);
        if (bucket) bucket.count++;
      });
      setChartData(buckets);
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader title="Overview" subtitle="Where things stand right now." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Completed today" value={stats?.completedToday ?? "–"} />
        <Stat label="Completed this week" value={stats?.completedThisWeek ?? "–"} />
        <Stat label="Focus minutes today" value={stats?.focusToday ?? "–"} />
        <Stat label="Longest habit streak" value={stats ? `${stats.longestStreak}d` : "–"} />
      </div>

      <div className="grid md:grid-cols-[1.3fr_1fr] gap-6">
        <section className="panel p-6">
          <p className="font-mono text-xs text-ink-soft mb-4">Tasks completed, last 7 days</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#D9D6C8" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#4A534F" }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#4A534F" }} width={24} />
                <Tooltip
                  cursor={{ fill: "rgba(47,93,98,0.08)" }}
                  contentStyle={{ borderRadius: 4, border: "1px solid #D9D6C8", fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#2F5D62" radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <InsightsPanel />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="panel p-5">
      <p className="stat-number text-3xl">{value}</p>
      <p className="text-xs text-ink-soft mt-1">{label}</p>
    </div>
  );
}

function longestRun(dates) {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates)].sort();
  let longest = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const cur = new Date(sorted[i]);
    const diffDays = Math.round((cur - prev) / 86400000);
    current = diffDays === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}
