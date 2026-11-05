"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, Sparkles } from "lucide-react";

const AddDnaPillarModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  editPillar = null,
}) => {
  const isEditing = Boolean(editPillar);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editPillar) {
      setTitle(editPillar.title || "");
      setDescription(editPillar.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [editPillar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSave({
      id: editPillar ? editPillar.id : Date.now(),
      title: title.trim(),
      description: description.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl border border-light-gray shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-light-gray flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark-black/90 font-secondary">
                  {isEditing ? "Edit DNA Principle" : "Add Core DNA Principle"}
                </h3>
                <p className="text-xs text-medium-black">
                  Define an unshakeable selling pillar for this playbook.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-light-gray hover:bg-light-gray/40 flex items-center justify-center text-medium-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-black/80">
                Principle Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Value Before Price"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/90"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-black/80">
                Strategic Guidance & Execution Rule <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Never anchor to numerical pricing before establishing the total cost of inaction and expected ROI."
                rows={3}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/90 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-gray">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-medium-black cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEditing ? "Save Principle" : "Add Principle"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddDnaPillarModal;
