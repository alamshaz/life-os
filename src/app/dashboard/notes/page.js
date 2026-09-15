"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";

export default function NotesPage() {
  const [notes, setNotes] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function load() {
    setNotes(await apiGet("/api/notes"));
  }

  useEffect(() => {
    load();
  }, []);

  async function addNote(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await apiPost("/api/notes", { title, body });
    setTitle("");
    setBody("");
    load();
  }

  async function togglePin(note) {
    await apiPatch(`/api/notes/${note._id}`, { pinned: !note.pinned });
    load();
  }

  async function remove(id) {
    await apiDelete(`/api/notes/${id}`);
    load();
  }

  return (
    <div>
      <PageHeader title="Notes" subtitle="Anything worth keeping." />

      <form onSubmit={addNote} className="panel p-4 mb-8 space-y-3">
        <input
          className="field"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="field h-24 resize-none"
          placeholder="Write something…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button className="btn-primary">Save note</button>
      </form>

      {notes && notes.length === 0 && (
        <EmptyState title="No notes yet" detail="Your first one is just above." />
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {notes?.map((note) => (
          <div key={note._id} className="panel p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium">{note.title}</p>
              <button
                onClick={() => togglePin(note)}
                className={`text-xs shrink-0 ${note.pinned ? "text-ember" : "text-ink-soft"}`}
              >
                {note.pinned ? "Pinned" : "Pin"}
              </button>
            </div>
            <p className="text-sm text-ink-soft whitespace-pre-wrap mb-3">{note.body}</p>
            <button onClick={() => remove(note._id)} className="text-xs text-ink-soft hover:text-rose">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
