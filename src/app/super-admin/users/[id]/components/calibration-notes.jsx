"use client";

import React, { useState } from "react";
import { Edit3, Check, X } from "lucide-react";
import toast from "react-hot-toast";

export default function CalibrationNotes({
  initialNote = "Great improvement in tone and pacing from last calibration. Focus on creating stronger urgency and asking for the commitment more directly.",
  initialAuthor = "Added by Daniel Miller on Apr 22, 2025, 10:35 AM",
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(initialNote);
  const [tempNote, setTempNote] = useState(initialNote);

  const handleSave = (e) => {
    e.preventDefault();
    if (!tempNote.trim()) {
      toast.error("Calibration note cannot be empty.");
      return;
    }
    setNote(tempNote);
    setIsEditing(false);
    toast.success("Calibration notes updated successfully!");
  };

  const handleCancel = () => {
    setTempNote(note);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-dark-black/85">
          Calibration Notes
        </h3>
        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setTempNote(note);
              setIsEditing(true);
            }}
            className="px-3 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-light-black" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Body */}
      {isEditing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <textarea
            rows={3}
            value={tempNote}
            onChange={(e) => setTempNote(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs text-dark-black bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary resize-none leading-relaxed"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-light-black hover:bg-light-gray transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Save Notes
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs sm:text-sm text-medium-black leading-relaxed font-normal">
            {note}
          </p>
          <span className="text-[11px] text-light-black font-normal mt-1">
            {initialAuthor}
          </span>
        </div>
      )}
    </div>
  );
}
