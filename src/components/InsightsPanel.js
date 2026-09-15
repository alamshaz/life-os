"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

const CONFIDENCE_LABEL = { high: "Strong pattern", medium: "Pattern", low: "Early signal" };

export default function InsightsPanel() {
  const [items, setItems] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const data = await apiGet("/api/insights");
    setItems(data.items);
  }

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  async function refresh() {
    setRefreshing(true);
    try {
      await apiPost("/api/insights", {});
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <section className="panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono text-xs text-teal">Recommendation engine</p>
          <h2 className="font-display text-xl">What your data is telling you</h2>
        </div>
        <button onClick={refresh} disabled={refreshing} className="btn-ghost text-xs px-3 py-1.5">
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {items === null && <p className="text-sm text-ink-soft">Looking for patterns…</p>}

      {items && items.length === 0 && (
        <p className="text-sm text-ink-soft">
          Not enough history yet. Log a couple weeks of tasks and habits and insights will start
          showing up here — like which hours you get the most done in.
        </p>
      )}

      <ul className="space-y-4">
        {items?.map((item, i) => (
          <li key={i} className="border-l-2 border-ember pl-4">
            <p className="text-sm font-medium">{item.headline}</p>
            {item.detail && <p className="text-sm text-ink-soft mt-0.5">{item.detail}</p>}
            <p className="text-xs text-ink-soft/70 mt-1 font-mono">
              {CONFIDENCE_LABEL[item.confidence] || "Pattern"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
