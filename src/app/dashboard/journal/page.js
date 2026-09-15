"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, todayStr } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

const MOODS = [
  { value: 1, emoji: "😞" },
  { value: 2, emoji: "🙁" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" }
];

export default function JournalPage() {
  const [entries, setEntries] = useState(null);
  const [body, setBody] = useState("");
  const [mood, setMood] = useState(3);

  async function load() {
    setEntries(await apiGet("/api/journal"));
  }

  useEffect(() => {
    load();
  }, []);

  const today = todayStr();
  const todaysEntry = entries?.find((e) => e.date === today);

  async function save(e) {
    e.preventDefault();
    if (!body.trim()) return;
    await apiPost("/api/journal", { date: today, mood, body });
    setBody("");
    load();
  }

  return (
    <div>
      <PageHeader title="Journal" subtitle="One entry a day." />

      {!todaysEntry && (
        <form onSubmit={save} className="panel p-5 mb-8">
          <div className="flex gap-2 mb-4">
            {MOODS.map((m) => (
              <button
                type="button"
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`text-2xl w-10 h-10 rounded flex items-center justify-center ${
                  mood === m.value ? "bg-teal-soft" : "hover:bg-fog"
                }`}
              >
                {m.emoji}
              </button>
            ))}
          </div>
          <textarea
            className="field h-28 resize-none mb-4"
            placeholder="How did today go?"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button className="btn-primary">Save today's entry</button>
        </form>
      )}

      {entries && entries.length === 0 && !todaysEntry && (
        <EmptyState title="No entries yet" detail="Write your first line above." />
      )}

      <ul className="space-y-4">
        {entries?.map((entry) => (
          <li key={entry._id} className="panel p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">
                {new Date(entry.date).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric"
                })}
              </p>
              <span className="text-xl">{MOODS.find((m) => m.value === entry.mood)?.emoji}</span>
            </div>
            <p className="text-sm text-ink-soft whitespace-pre-wrap">{entry.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
