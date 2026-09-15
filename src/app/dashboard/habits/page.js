"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, todayStr } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

function lastNDates(n) {
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function HabitsPage() {
  const [habits, setHabits] = useState(null);
  const [name, setName] = useState("");
  const days = lastNDates(28);

  async function load() {
    setHabits(await apiGet("/api/habits"));
  }

  useEffect(() => {
    load();
  }, []);

  async function addHabit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await apiPost("/api/habits", { name });
    setName("");
    load();
  }

  async function toggleDay(habitId, date) {
    await apiPost(`/api/habits/${habitId}/toggle`, { date });
    load();
  }

  return (
    <div>
      <PageHeader title="Habits" subtitle="Consistency over the last 28 days." />

      <form onSubmit={addHabit} className="panel p-4 flex gap-3 mb-8">
        <input
          className="field flex-1"
          placeholder="Add a habit, e.g. Read 10 pages"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn-primary">Add</button>
      </form>

      {habits && habits.length === 0 && (
        <EmptyState title="No habits yet" detail="Add one above — try something small and daily." />
      )}

      <div className="space-y-6">
        {habits?.map((habit) => (
          <div key={habit._id} className="panel p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">{habit.name}</p>
              <p className="text-xs text-ink-soft font-mono">
                {habit.loggedDates?.length || 0}/{days.length} days
              </p>
            </div>
            <div className="flex gap-1 flex-wrap">
              {days.map((date) => {
                const logged = habit.loggedDates?.includes(date);
                const isToday = date === todayStr();
                return (
                  <button
                    key={date}
                    title={date}
                    onClick={() => toggleDay(habit._id, date)}
                    className={`w-5 h-5 rounded-sm transition-colors ${
                      logged ? "bg-teal" : "bg-fog border border-line"
                    } ${isToday ? "ring-1 ring-ember ring-offset-1" : ""}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
