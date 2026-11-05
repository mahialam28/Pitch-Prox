"use client";

import React, { useState } from "react";
import { X, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AddTagModal = ({ isOpen, onClose, onAdd }) => {
  const [tagName, setTagName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tagName.trim()) {
      onAdd(tagName.trim());
      setTagName("");
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
                <Tag className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-dark-black font-secondary">
                Add Internal Tag
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
            <div>
              <label className="block text-xs font-bold text-dark-black mb-1.5">
                Tag Name
              </label>
              <input
                type="text"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="e.g. Enterprise Tier"
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black"
                autoFocus
              />
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
                disabled={!tagName.trim()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Add Tag
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddTagModal;
