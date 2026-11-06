"use client";

import React, { useState } from "react";
import { Edit3, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdjustReportScoreModal({
  isOpen = false,
  onClose = () => {},
  report = null,
  onSave = () => {},
}) {
  // The parent remounts this modal (key) for each report, so it starts from that report's score
  const [newScore, setNewScore] = useState(report?.score ?? 85);
  const [reason, setReason] = useState("");

  if (!isOpen || !report) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(newScore, reason);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-light-gray flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-50 text-primary border border-teal-100">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark-black">
                  Adjust Report Score
                </h3>
                <p className="text-xs text-light-black">
                  Override AI score for {report.id}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                New Score (0 - 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm font-bold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                Adjustment Reason (Optional)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this score was manually adjusted..."
                className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-light-black hover:bg-light-gray transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
