"use client";

import React, { useState } from "react";
import { X, MessageSquarePlus } from "lucide-react";
import toast from "react-hot-toast";

export default function AddManagerNoteModal({ isOpen, onClose, repName, onAdd }) {
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) {
      toast.error("Please enter a note before saving");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Private manager note saved successfully!");
      if (onAdd) onAdd(noteText);
      setNoteText("");
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-light-gray shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-light-gray">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-dark-black/90 text-lg font-secondary">
                Add Manager Note
              </h3>
              <p className="text-xs text-light-black">
                Private feedback & coaching note for {repName || "Ryan Anderson"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
              Coaching & Observations Note
            </label>
            <textarea
              rows={4}
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Excellent objection turnaround during morning calls. Continue to prioritize high-intent pre-expired leads."
              className="w-full p-3.5 rounded-xl border border-light-gray text-xs text-dark-black/85 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-light-gray">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-dark-black/70 hover:text-dark-black transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
