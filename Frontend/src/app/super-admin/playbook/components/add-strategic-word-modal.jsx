"use client";

import React, { useState } from "react";
import { X, Plus, CheckCircle2, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const AddStrategicWordModal = ({
  isOpen = false,
  onClose = () => {},
  onAdd = () => {},
  type = "encourage", // "encourage" | "avoid"
}) => {
  const [wordText, setWordText] = useState("");

  if (!isOpen) return null;

  const isAvoid = type === "avoid";
  const title = isAvoid ? "Add Word / Phrase to Avoid" : "Add Word / Phrase to Encourage";
  const subtitle = isAvoid
    ? "Define a weak, pushy, or counter-productive phrase the AI must never prompt."
    : "Define a high-value strategic term or framing phrase the AI should encourage.";
  const placeholder = isAvoid
    ? "e.g. honestly, trust me, discount"
    : "e.g. strategic advantage, equity growth";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (wordText.trim()) {
      onAdd(wordText.trim());
      toast.success(
        isAvoid
          ? `Added avoided phrase: "${wordText.trim()}"`
          : `Added encouraged phrase: "${wordText.trim()}"`
      );
      setWordText("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-2xl border border-light-gray shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-light-gray">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isAvoid
                    ? "bg-red-50 text-red-500"
                    : "bg-teal-50 text-primary"
                }`}
              >
                {isAvoid ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-black font-secondary">
                  {title}
                </h3>
                <p className="text-xs text-medium-black">{subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-light-black hover:text-dark-black p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-dark-black mb-1.5 font-secondary">
                {isAvoid ? "Phrase to avoid" : "Phrase to encourage"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={wordText}
                onChange={(e) => setWordText(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-light-gray">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!wordText.trim()}
                className={`px-4.5 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                  isAvoid
                    ? "bg-red-500 hover:bg-red-600 disabled:opacity-50"
                    : "bg-primary hover:bg-medium-teal disabled:opacity-50"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAvoid ? "Add Avoid Phrase" : "Add Phrase"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddStrategicWordModal;
