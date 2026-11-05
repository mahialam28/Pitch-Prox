"use client";

import React, { useState } from "react";
import { X, Plus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const AddStrategicPrincipleModal = ({
  isOpen = false,
  onClose = () => {},
  onAdd = () => {},
  category = "principle", // "principle" | "wording" | "feeling"
}) => {
  const [label, setLabel] = useState("");

  if (!isOpen) return null;

  const title =
    category === "wording"
      ? "Add Preferred Wording Style"
      : category === "feeling"
      ? "Add Prompt Feeling"
      : "Add Strategic Principle";

  const subtitle =
    category === "wording"
      ? "Define a wording structure or tone format for prompts."
      : category === "feeling"
      ? "Define how prompt cues should feel to the agent during calls."
      : "Define a psychological or strategic sales principle to apply.";

  const placeholder =
    category === "wording"
      ? "e.g. Socratic Questioning, High-Stakes Urgency"
      : category === "feeling"
      ? "e.g. Assertive, Visionary"
      : "e.g. Social Proof, Cost of Inaction";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (label.trim()) {
      onAdd(label.trim());
      toast.success(`Added ${label.trim()}`);
      setLabel("");
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
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
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
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
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
                disabled={!label.trim()}
                className="px-4.5 py-2 rounded-xl bg-primary hover:bg-medium-teal disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddStrategicPrincipleModal;
