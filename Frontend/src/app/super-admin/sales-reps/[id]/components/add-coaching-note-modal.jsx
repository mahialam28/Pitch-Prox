"use client";

import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const noteTypeOptions = [
  { value: "Opportunity", label: "Opportunity" },
  { value: "Strength", label: "Strength" },
  { value: "Action Item", label: "Action Item" },
  { value: "General Feedback", label: "General Feedback" },
];

const coachOptions = [
  { value: "Sarah Johnson", label: "Sarah Johnson" },
  { value: "Michael Carter", label: "Michael Carter" },
  { value: "Daniel Martine", label: "Daniel Martine" },
  { value: "Emily Smith", label: "Emily Smith" },
];

const priorityOptions = [
  { value: "High", label: "High Priority" },
  { value: "Medium", label: "Medium Priority" },
  { value: "Low", label: "Low Priority" },
];

export default function AddCoachingNoteModal({ isOpen, onClose, repName, onAdd }) {
  const [noteType, setNoteType] = useState("Opportunity");
  const [coach, setCoach] = useState("Sarah Johnson");
  const [title, setTitle] = useState("");
  const [insight, setInsight] = useState("");
  const [relatedCall, setRelatedCall] = useState("Subscription Closed");
  const [dueDate, setDueDate] = useState("Jun 15");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a coaching insight title");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const newNote = {
        id: `CN-${Date.now()}`,
        date: "May 31, 2026",
        time: "11:45 AM",
        type: noteType,
        relatedCall: relatedCall,
        title: title,
        insight: insight || "Follow standard playbook objection guidelines.",
        coach: coach,
        due: dueDate || "Jun 15",
        priority: priority,
      };

      if (onAdd) onAdd(newNote);
      toast.success("Coaching note added successfully!");
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-light-gray shadow-2xl max-w-lg w-full my-auto overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-light-gray">
          <div>
            <h2 className="text-lg font-bold text-dark-black/90 font-secondary tracking-tight">
              Add Coaching Note
            </h2>
            <p className="text-xs text-light-black mt-0.5">
              Record actionable feedback and coaching recommendations for {repName}.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 sm:p-8 space-y-4 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin]">
            {/* Note Type & Coach */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">Note Type</label>
                <Dropdown
                  items={noteTypeOptions}
                  selected={noteType}
                  onSelect={(val) => setNoteType(val)}
                  variant="default"
                  placement="bottom"
                  className="w-full"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">Coach</label>
                <Dropdown
                  items={coachOptions}
                  selected={coach}
                  onSelect={(val) => setCoach(val)}
                  variant="default"
                  placement="bottom"
                  className="w-full"
                />
              </div>
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-black/80">Coaching Title / Focus Area</label>
              <input
                type="text"
                required
                placeholder="e.g. Stronger objection handling needed"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white placeholder:text-light-black/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {/* Actionable Feedback Insight */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-dark-black/80">Actionable Feedback / Detail</label>
              <textarea
                rows={3}
                placeholder="e.g. Anchor value and establish urgency before presenting pricing numbers."
                value={insight}
                onChange={(e) => setInsight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white placeholder:text-light-black/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Related Call & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">Related Call Outcome</label>
                <input
                  type="text"
                  value={relatedCall}
                  onChange={(e) => setRelatedCall(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">Target Due Date</label>
                <input
                  type="text"
                  value={dueDate}
                  placeholder="e.g. Jun 15"
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 py-4 border-t border-light-gray flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-dark-black/70 hover:text-dark-black hover:bg-light-gray/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Coaching Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
