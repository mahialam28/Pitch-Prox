"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FilePlus, Save } from "lucide-react";
import toast from "react-hot-toast";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const AddNoteModal = ({ isOpen, onClose, leadName = "" }) => {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!note.trim()) {
      toast.error("Please enter a note before saving.");
      return;
    }
    toast.success("Call note saved successfully!");
    setNote("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-light-gray max-h-[90vh] overflow-y-auto my-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-light-gray">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FilePlus className="w-5 h-5" />
                </div>
                <div>
                  <Title variant="small" className="!text-dark-black/80 font-bold">
                    Add Call Note
                  </Title>
                  <Text variant="small" className="text-light-black text-xs">
                    {leadName ? `Notes for ${leadName}` : "Record key call observations"}
                  </Text>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-medium-black hover:text-dark-black hover:bg-light-gray/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-medium-black uppercase tracking-wider mb-2">
                  Call Notes & Observations
                </label>
                <textarea
                  rows={5}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Enter call notes, client objections, commitments, or reminders..."
                  className="w-full rounded-xl border border-light-gray p-3.5 text-sm text-dark-black placeholder:text-light-black focus:outline-hidden focus:border-primary transition-colors resize-none"
                  autoFocus
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray/50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddNoteModal;
