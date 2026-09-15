"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { apiGet, apiPost, apiDelete, todayStr } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

const CATEGORIES = ["food", "transport", "housing", "health", "leisure", "shopping", "subscriptions", "other"];
const COLORS = ["#2F5D62", "#C08A3E", "#B4544A", "#4A534F", "#8FA79C", "#D9B36C", "#7A8C99", "#A9A28C"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");

  async function load() {
    setExpenses(await apiGet("/api/expenses"));
  }

  useEffect(() => {
    load();
  }, []);

  async function addExpense(e) {
    e.preventDefault();
    if (!amount) return;
    await apiPost("/api/expenses", { amount: Number(amount), category, note, date: todayStr() });
    setAmount("");
    setNote("");
    load();
  }

  async function remove(id) {
    await apiDelete(`/api/expenses/${id}`);
    load();
  }

  const chartData = useMemo(() => {
    if (!expenses) return [];
    const totals = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));
  }, [expenses]);

  const total = chartData.reduce((sum, c) => sum + c.value, 0);

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Where your money is going." />

      <form onSubmit={addExpense} className="panel p-4 flex flex-col md:flex-row gap-3 mb-8">
        <input
          type="number"
          step="0.01"
          className="field md:w-32"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select className="field md:w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="field flex-1"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button className="btn-primary">Log</button>
      </form>

      {expenses && expenses.length === 0 && (
        <EmptyState title="No expenses logged yet" detail="Add your first one above." />
      )}

      {expenses && expenses.length > 0 && (
        <div className="grid md:grid-cols-[1fr_1.3fr] gap-6 mb-8">
          <section className="panel p-6">
            <p className="font-mono text-xs text-ink-soft mb-2">Total logged</p>
            <p className="stat-number text-4xl mb-4">${total.toFixed(2)}</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 4, border: "1px solid #D9D6C8", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section>
            <p className="font-mono text-xs text-ink-soft mb-3">Recent</p>
            <ul className="panel divide-y divide-line max-h-72 overflow-y-auto">
              {expenses.map((e) => (
                <li key={e._id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p>{e.note || e.category}</p>
                    <p className="text-xs text-ink-soft font-mono">
                      {e.category} · {new Date(e.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">${e.amount.toFixed(2)}</span>
                    <button onClick={() => remove(e._id)} className="text-xs text-ink-soft hover:text-rose">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
