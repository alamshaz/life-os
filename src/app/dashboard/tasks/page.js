"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

const PRIORITY_STYLE = {
  high: "text-rose",
  medium: "text-ember",
  low: "text-ink-soft"
};

export default function TasksPage() {
  const [tasks, setTasks] = useState(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  async function load() {
    setTasks(await apiGet("/api/tasks"));
  }

  useEffect(() => {
    load();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await apiPost("/api/tasks", { title, priority, dueDate: dueDate || undefined });
    setTitle("");
    setDueDate("");
    load();
  }

  async function toggleComplete(task) {
    await apiPatch(`/api/tasks/${task._id}`, { completed: !task.completed });
    load();
  }

  async function remove(id) {
    await apiDelete(`/api/tasks/${id}`);
    load();
  }

  const pending = tasks?.filter((t) => !t.completed) || [];
  const completed = tasks?.filter((t) => t.completed) || [];

  return (
    <div>
      <PageHeader title="Tasks" subtitle="What you're getting done today." />

      <form onSubmit={addTask} className="panel p-4 flex flex-col md:flex-row gap-3 mb-8">
        <input
          className="field flex-1"
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select className="field md:w-36" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          className="field md:w-44"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button className="btn-primary md:w-auto">Add</button>
      </form>

      {tasks && tasks.length === 0 && (
        <EmptyState title="Nothing on the list yet" detail="Add your first task above to get started." />
      )}

      {pending.length > 0 && (
        <ul className="panel divide-y divide-line mb-8">
          {pending.map((task) => (
            <TaskRow key={task._id} task={task} onToggle={toggleComplete} onDelete={remove} />
          ))}
        </ul>
      )}

      {completed.length > 0 && (
        <>
          <p className="text-xs text-ink-soft font-mono mb-2">Completed</p>
          <ul className="panel divide-y divide-line opacity-70">
            {completed.map((task) => (
              <TaskRow key={task._id} task={task} onToggle={toggleComplete} onDelete={remove} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={() => onToggle(task)}
        className={`w-5 h-5 shrink-0 rounded-full border ${
          task.completed ? "bg-teal border-teal" : "border-ink-soft"
        }`}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? "line-through text-ink-soft" : ""}`}>{task.title}</p>
        {task.dueDate && (
          <p className="text-xs text-ink-soft">Due {new Date(task.dueDate).toLocaleDateString()}</p>
        )}
      </div>
      <span className={`text-xs font-mono ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span>
      <button onClick={() => onDelete(task._id)} className="text-xs text-ink-soft hover:text-rose">
        Delete
      </button>
    </li>
  );
}
