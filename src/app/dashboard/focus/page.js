"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

const PRESETS = [25, 45, 60];

export default function FocusPage() {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState("Focus session");
  const [sessions, setSessions] = useState(null);
  const startedAtRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    apiGet("/api/focus").then(setSessions);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          finishSession();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  function start() {
    startedAtRef.current = new Date();
    setSecondsLeft(minutes * 60);
    setRunning(true);
  }

  function stop() {
    setRunning(false);
    clearInterval(intervalRef.current);
  }

  async function finishSession() {
    setRunning(false);
    const startedAt = startedAtRef.current || new Date();
    await apiPost("/api/focus", {
      label,
      durationMinutes: minutes,
      startedAt,
      completedAt: new Date()
    });
    setSessions(await apiGet("/api/focus"));
  }

  function selectPreset(m) {
    setMinutes(m);
    setSecondsLeft(m * 60);
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div>
      <PageHeader title="Focus" subtitle="Timed sessions, logged automatically." />

      <div className="grid md:grid-cols-[1fr_1.2fr] gap-6">
        <section className="panel p-8 text-center">
          <input
            className="field text-center mb-6"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What are you focusing on?"
          />

          <p className="stat-number text-7xl mb-6">
            {mm}:{ss}
          </p>

          <div className="flex justify-center gap-2 mb-6">
            {PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => selectPreset(m)}
                disabled={running}
                className={`px-3 py-1.5 rounded text-sm border ${
                  minutes === m ? "border-teal text-teal" : "border-line text-ink-soft"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            {!running ? (
              <button onClick={start} className="btn-primary px-8">
                Start
              </button>
            ) : (
              <button onClick={stop} className="btn-ghost px-8">
                Stop
              </button>
            )}
          </div>
        </section>

        <section>
          <p className="font-mono text-xs text-ink-soft mb-3">Recent sessions</p>
          {sessions && sessions.length === 0 && (
            <EmptyState title="No sessions yet" detail="Finish your first timer to see it here." />
          )}
          <ul className="panel divide-y divide-line">
            {sessions?.slice(0, 10).map((s) => (
              <li key={s._id} className="px-4 py-3 flex items-center justify-between text-sm">
                <span>{s.label}</span>
                <span className="text-ink-soft font-mono text-xs">
                  {s.durationMinutes}m · {new Date(s.startedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
