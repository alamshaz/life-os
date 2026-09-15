"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function GoalsPage() {
  const [goals, setGoals] = useState(null);
  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState("%");

  async function load() {
    setGoals(await apiGet("/api/goals"));
  }

  useEffect(() => {
    load();
  }, []);

  async function addGoal(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await apiPost("/api/goals", { title, targetValue: Number(targetValue), unit, currentValue: 0 });
    setTitle("");
    load();
  }

  async function updateProgress(goal, delta) {
    const currentValue = Math.max(0, Math.min(goal.targetValue, goal.currentValue + delta));
    const status = currentValue >= goal.targetValue ? "done" : "active";
    await apiPatch(`/api/goals/${goal._id}`, { currentValue, status });
    load();
  }

  return (
    <div>
      <PageHeader title="Goals" subtitle="Track progress toward something specific." />

      <form onSubmit={addGoal} className="panel p-4 flex flex-col md:flex-row gap-3 mb-8">
        <input
          className="field flex-1"
          placeholder="Goal, e.g. Run 100km this month"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          className="field md:w-28"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
        />
        <input className="field md:w-20" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <button className="btn-primary">Add</button>
      </form>

      {goals && goals.length === 0 && (
        <EmptyState title="No goals yet" detail="Add one above with a clear number to hit." />
      )}

      <div className="space-y-4">
        {goals?.map((goal) => {
          const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
          return (
            <div key={goal._id} className="panel p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">{goal.title}</p>
                <p className="text-xs font-mono text-ink-soft">
                  {goal.currentValue}/{goal.targetValue} {goal.unit}
                </p>
              </div>
              <div className="h-2 bg-fog rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${goal.status === "done" ? "bg-teal" : "bg-ember"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateProgress(goal, 1)} className="btn-ghost text-xs px-3 py-1">
                  +1
                </button>
                <button onClick={() => updateProgress(goal, 10)} className="btn-ghost text-xs px-3 py-1">
                  +10
                </button>
                <button onClick={() => updateProgress(goal, -1)} className="btn-ghost text-xs px-3 py-1">
                  −1
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
