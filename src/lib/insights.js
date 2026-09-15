import Task from "@/models/Task";
import HabitLog from "@/models/HabitLog";
import Habit from "@/models/Habit";
import FocusSession from "@/models/FocusSession";
import Expense from "@/models/Expense";
import { subDays } from "date-fns";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Generates a set of plain-language insights for one user by looking for
 * patterns in their own historical data. Each detector is independent and
 * fails soft (returns nothing) if there isn't enough data yet, rather than
 * making up a claim from noise.
 */
export async function generateInsightsForUser(userId, { lookbackDays = 30 } = {}) {
  const since = subDays(new Date(), lookbackDays);
  const items = [];

  const [peakWindow, bestWeekday, habitConsistency, focusTrend, spendShift] = await Promise.all([
    peakCompletionWindow(userId, since),
    bestWeekdayForCompletion(userId, since),
    strongestAndWeakestHabit(userId, since),
    focusSessionTrend(userId, since),
    spendingShift(userId)
  ]);

  if (peakWindow) items.push(peakWindow);
  if (bestWeekday) items.push(bestWeekday);
  if (habitConsistency) items.push(...habitConsistency);
  if (focusTrend) items.push(focusTrend);
  if (spendShift) items.push(spendShift);

  return items;
}

// "You complete 80% of your tasks before 2 PM" — the flagship pattern.
async function peakCompletionWindow(userId, since) {
  const completed = await Task.find({
    user: userId,
    completed: true,
    completedAt: { $gte: since }
  })
    .select("completedAt")
    .lean();

  if (completed.length < 8) return null;

  const cutoffHour = 14;
  const beforeCutoff = completed.filter((t) => new Date(t.completedAt).getHours() < cutoffHour).length;
  const ratio = beforeCutoff / completed.length;

  if (ratio >= 0.65) {
    return {
      type: "peak-completion-window",
      headline: `You complete ${Math.round(ratio * 100)}% of your tasks before ${formatHour(cutoffHour)}`,
      detail: "Your mornings are your most productive window. Consider scheduling your hardest task first thing.",
      confidence: completed.length >= 20 ? "high" : "medium",
      metric: ratio
    };
  }
  if (ratio <= 0.35) {
    return {
      type: "peak-completion-window",
      headline: `You complete ${Math.round((1 - ratio) * 100)}% of your tasks after ${formatHour(cutoffHour)}`,
      detail: "You do your best work later in the day — try protecting your afternoons for deep work instead of meetings.",
      confidence: completed.length >= 20 ? "high" : "medium",
      metric: 1 - ratio
    };
  }
  return null;
}

// Which day of the week you finish the most tasks on.
async function bestWeekdayForCompletion(userId, since) {
  const completed = await Task.find({
    user: userId,
    completed: true,
    completedAt: { $gte: since }
  })
    .select("completedAt")
    .lean();

  if (completed.length < 10) return null;

  const counts = new Array(7).fill(0);
  completed.forEach((t) => counts[new Date(t.completedAt).getDay()]++);

  const max = Math.max(...counts);
  const total = completed.length;
  const dayIndex = counts.indexOf(max);
  const share = max / total;

  if (share < 1 / 7 + 0.08) return null; // not meaningfully above baseline

  return {
    type: "best-weekday",
    headline: `${DAY_NAMES[dayIndex]}s are your most productive day`,
    detail: `${Math.round(share * 100)}% of your completed tasks over the last ${Math.round(
      (Date.now() - since.getTime()) / 86400000
    )} days landed on a ${DAY_NAMES[dayIndex]}.`,
    confidence: total >= 20 ? "high" : "medium",
    metric: share
  };
}

// Which habit you're most/least consistent with.
async function strongestAndWeakestHabit(userId, since) {
  const habits = await Habit.find({ user: userId, archived: false }).lean();
  if (habits.length < 2) return null;

  const sinceStr = since.toISOString().slice(0, 10);
  const logs = await HabitLog.find({ user: userId, date: { $gte: sinceStr } }).lean();

  const daysTracked = Math.max(1, Math.round((Date.now() - since.getTime()) / 86400000));

  const rates = habits.map((h) => {
    const count = logs.filter((l) => String(l.habit) === String(h._id)).length;
    return { habit: h, rate: count / daysTracked };
  });

  rates.sort((a, b) => b.rate - a.rate);
  const strongest = rates[0];
  const weakest = rates[rates.length - 1];

  const results = [];
  if (strongest.rate >= 0.6) {
    results.push({
      type: "strong-habit",
      headline: `"${strongest.habit.name}" is your most consistent habit`,
      detail: `You've logged it ${Math.round(strongest.rate * 100)}% of days in the last ${daysTracked} days.`,
      confidence: "medium",
      metric: strongest.rate
    });
  }
  if (weakest.rate <= 0.25 && weakest.habit._id !== strongest.habit._id) {
    results.push({
      type: "weak-habit",
      headline: `"${weakest.habit.name}" is slipping`,
      detail: `Only logged on ${Math.round(weakest.rate * 100)}% of days recently. Consider lowering the target or pairing it with a habit that's already sticking.`,
      confidence: "medium",
      metric: weakest.rate
    });
  }
  return results;
}

// Are focus sessions getting longer/shorter or more/less frequent recently?
async function focusSessionTrend(userId, since) {
  const sessions = await FocusSession.find({ user: userId, startedAt: { $gte: since } })
    .select("startedAt durationMinutes")
    .lean();

  if (sessions.length < 6) return null;

  const midpoint = new Date((Date.now() + since.getTime()) / 2);
  const firstHalf = sessions.filter((s) => new Date(s.startedAt) < midpoint);
  const secondHalf = sessions.filter((s) => new Date(s.startedAt) >= midpoint);
  if (firstHalf.length < 2 || secondHalf.length < 2) return null;

  const avg = (arr) => arr.reduce((sum, s) => sum + s.durationMinutes, 0) / arr.length;
  const a1 = avg(firstHalf);
  const a2 = avg(secondHalf);
  const change = (a2 - a1) / a1;

  if (Math.abs(change) < 0.15) return null;

  return {
    type: "focus-trend",
    headline:
      change > 0
        ? `Your focus sessions are getting longer`
        : `Your focus sessions are getting shorter`,
    detail: `Average length moved from ${Math.round(a1)} to ${Math.round(a2)} minutes over the period.`,
    confidence: sessions.length >= 15 ? "high" : "low",
    metric: change
  };
}

// Category with the biggest week-over-week spending change.
async function spendingShift(userId) {
  const now = new Date();
  const thisWeekStart = subDays(now, 7).toISOString().slice(0, 10);
  const lastWeekStart = subDays(now, 14).toISOString().slice(0, 10);

  const [thisWeek, lastWeek] = await Promise.all([
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: thisWeekStart } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: lastWeekStart, $lt: thisWeekStart } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ])
  ]);

  if (thisWeek.length === 0 || lastWeek.length === 0) return null;

  const lastMap = Object.fromEntries(lastWeek.map((c) => [c._id, c.total]));
  let biggest = null;
  for (const c of thisWeek) {
    const prior = lastMap[c._id] || 0;
    if (prior < 5) continue; // ignore categories with negligible prior spend
    const change = (c.total - prior) / prior;
    if (!biggest || Math.abs(change) > Math.abs(biggest.change)) {
      biggest = { category: c._id, change, total: c.total, prior };
    }
  }

  if (!biggest || Math.abs(biggest.change) < 0.25) return null;

  return {
    type: "spending-shift",
    headline:
      biggest.change > 0
        ? `Spending on ${biggest.category} is up ${Math.round(biggest.change * 100)}% this week`
        : `Spending on ${biggest.category} is down ${Math.round(Math.abs(biggest.change) * 100)}% this week`,
    detail: `$${biggest.prior.toFixed(2)} last week vs $${biggest.total.toFixed(2)} this week.`,
    confidence: "medium",
    metric: biggest.change
  };
}

function formatHour(hour24) {
  const h = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const suffix = hour24 < 12 ? "AM" : "PM";
  return `${h}:00 ${suffix}`;
}
