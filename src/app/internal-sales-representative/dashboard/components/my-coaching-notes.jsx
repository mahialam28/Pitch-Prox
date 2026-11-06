"use client";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Circle, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";

const TYPE_COLORS = {
  Strength: "bg-indigo-50 text-indigo-600",
  Opportunity: "bg-purple-50 text-purple-600",
  "Action Item": "bg-amber-50 text-amber-700",
  "General Feedback": "bg-slate-100 text-slate-600",
};
const shortDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });

// The rep's own coaching notes from their managers (Sales Reps → profile → Coaching Notes).
// Open items first; the rep ticks them off here.
export default function MyCoachingNotes() {
  const [data, setData] = useState(null);
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(() => apiRequest("/api/v1/me/coaching-notes").then(setData).catch(() => setData({ notes: [], open: 0 })), []);
  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (note) => {
    try {
      await apiRequest(`/api/v1/me/coaching-notes/${note.id}`, { method: "PATCH", body: { completed: !note.completedAt } });
      toast.success(note.completedAt ? "Reopened" : "Nice work! Marked complete.");
      load();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const notes = (data?.notes ?? []).filter((note) => showDone || !note.completedAt);
  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-dark-black/90">My Coaching Notes</h3>
            <p className="text-[11px] text-light-black">{data ? `${data.open} open` : "Loading…"} · feedback from your manager</p>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-medium-black cursor-pointer select-none">
          <input type="checkbox" checked={showDone} onChange={(event) => setShowDone(event.target.checked)} className="accent-primary" />
          Show completed
        </label>
      </div>

      {data && !notes.length && <p className="text-xs text-light-black">{data.notes.length ? "All caught up." : "No coaching notes yet."}</p>}
      <ul className="divide-y divide-light-gray/70">
        {notes.map((note) => (
          <li key={note.id} className="py-3 flex items-start gap-3">
            <button
              type="button"
              onClick={() => toggle(note)}
              aria-label={note.completedAt ? `Reopen ${note.title}` : `Mark ${note.title} complete`}
              className={`mt-0.5 shrink-0 cursor-pointer ${note.completedAt ? "text-emerald-500" : "text-light-black hover:text-primary"}`}
            >
              {note.completedAt ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[note.type] ?? TYPE_COLORS["General Feedback"]}`}>{note.type}</span>
                <span className={`text-sm font-semibold ${note.completedAt ? "text-light-black line-through" : "text-dark-black"}`}>{note.title}</span>
              </div>
              <p className="text-xs text-medium-black mt-1 leading-relaxed whitespace-pre-line">{note.body}</p>
              <p className="text-[11px] text-light-black mt-1">
                {note.authorName}
                {note.priority ? ` · ${note.priority} priority` : ""}
                {note.dueDate && !note.completedAt ? ` · due ${shortDate(note.dueDate)}` : ""}
                {note.relatedTo ? ` · ${note.relatedTo}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
