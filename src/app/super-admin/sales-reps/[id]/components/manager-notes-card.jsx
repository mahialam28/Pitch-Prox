"use client";

import React from "react";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/client-api";

// Private notes: only Super Admin and Admin Manager see this card
export default function ManagerNotesCard({ notes = [], onAddNote }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      <div className="flex items-center gap-1.5 mb-3">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">Manager Notes</h3>
        <span className="text-xs text-light-black font-normal">(Private)</span>
      </div>

      {!notes.length && <p className="text-xs text-light-black mb-4">No manager notes yet.</p>}
      <div className="flex flex-col gap-3 mb-4">
        {notes.map((note) => (
          <div key={note.id} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 flex flex-col justify-between gap-3">
            <p className="text-xs text-dark-black/85 leading-relaxed font-normal whitespace-pre-line">&ldquo;{note.body}&rdquo;</p>
            <span className="text-[11px] text-light-black font-medium text-right self-end">
              — {note.authorName} ({formatDate(note.createdAt)})
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddNote}
        className="w-full py-2.5 rounded-xl border border-dashed border-light-gray hover:border-primary/50 hover:bg-light-gray/40 text-xs font-semibold text-dark-black/80 hover:text-primary transition-all cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Manager Note</span>
      </button>
    </div>
  );
}
