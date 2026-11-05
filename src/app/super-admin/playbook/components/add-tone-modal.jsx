"use client";

import React, { useState } from "react";
import { X, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AddToneModal = ({ isOpen, onClose, onAdd }) => {
  const [toneName, setToneName] = useState("");
  const [toneEmoji, setToneEmoji] = useState("✨");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (toneName.trim()) {
      onAdd({
        id: toneName.toLowerCase().replace(/\s+/g, "-"),
        label: toneName.trim(),
        emoji: toneEmoji || "✨",
      });
      setToneName("");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-white rounded-2xl border border-light-gray shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-light-gray">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Smile className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
                Add Additional Tone
              </h3>
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
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-medium-black mb-1.5">
                  Emoji
                </label>
                <input
                  type="text"
                  value={toneEmoji}
                  onChange={(e) => setToneEmoji(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-light-gray text-center text-base focus:outline-none focus:border-primary"
                  maxLength={2}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-medium-black mb-1.5">
                  Tone Name
                </label>
                <input
                  type="text"
                  value={toneName}
                  onChange={(e) => setToneName(e.target.value)}
                  placeholder="e.g. Inspiring, Analytical"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!toneName.trim()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Add Tone
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddToneModal;
