"use client";

import React, { useState } from "react";
import { X, Plus, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const AddPromptToneModal = ({
  isOpen = false,
  onClose = () => {},
  onAdd = () => {},
}) => {
  const [toneLabel, setToneLabel] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (toneLabel.trim()) {
      onAdd(toneLabel.trim());
      toast.success(`Added tone: "${toneLabel.trim()}"`);
      setToneLabel("");
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
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-black font-secondary">
                  Add Tone Dimension
                </h3>
                <p className="text-xs text-medium-black">
                  Define an emotional or stylistic tone for live prompts.
                </p>
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
                Tone Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={toneLabel}
                onChange={(e) => setToneLabel(e.target.value)}
                placeholder="e.g. Inspiring, Analytical, Bold"
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
                disabled={!toneLabel.trim()}
                className="px-4.5 py-2 rounded-xl bg-primary hover:bg-medium-teal disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tone</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddPromptToneModal;
