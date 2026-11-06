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

const priorityOptions = [
  { value: "High", label: "High Priority" },
  { value: "Medium", label: "Medium Priority" },
  { value: "Low", label: "Low Priority" },
];

export default function AddCoachingNoteModal({ isOpen, onClose, repName, onAdd }) {
  const [noteType, setNoteType] = useState("Opportunity");
  const [title, setTitle] = useState("");
  const [insight, setInsight] = useState("");
  const [relatedCall, setRelatedCall] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // The signed-in manager is recorded as the coach
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !insight.trim()) {
      toast.error("Add a title and the feedback detail");
      return;
    }
    setSubmitting(true);
    try {
      await onAdd?.({ type: noteType, title: title.trim(), body: insight.trim(), relatedTo: relatedCall.trim() || null, dueDate: dueDate || null, priority });
      toast.success("Coaching note added");
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
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
                <label className="text-xs font-semibold text-dark-black/80">Priority</label>
                <Dropdown
                  items={priorityOptions}
                  selected={priority}
                  onSelect={(val) => setPriority(val)}
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
                maxLength={160}
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
                required
                maxLength={5000}
                placeholder="e.g. Anchor value and establish urgency before presenting pricing numbers."
                value={insight}
                onChange={(e) => setInsight(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white placeholder:text-light-black/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            {/* Related Call & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">Related Call / Account</label>
                <input
                  type="text"
                  maxLength={160}
                  placeholder="Optional"
                  value={relatedCall}
                  onChange={(e) => setRelatedCall(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">Target Due Date</label>
                <input
                  type="date"
                  value={dueDate}
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
