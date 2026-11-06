"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileEdit,
  ChevronDown,
  Paperclip,
  History,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 32, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

const NOTE_TYPES = [
  "Lead Insight",
  "Call Coaching",
  "Lead Update",
  "Communication",
  "System Note",
];

export const AddNoteModal = ({
  isOpen = false,
  onClose = () => {},
  initialData = null, // if editing existing note
  onSave = () => {},
}) => {
  // The parent remounts this modal (key) for each note, so state starts from initialData
  const [noteType, setNoteType] = useState(initialData?.type || "Lead Insight");
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [isPinned, setIsPinned] = useState(Boolean(initialData?.isPinned));
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Body scroll lock
  const lockScroll = useCallback(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, []);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => unlockScroll();
    } else {
      unlockScroll();
    }
  }, [isOpen, lockScroll, unlockScroll]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a note title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter note content");
      return;
    }

    setIsSubmitting(true);
    Promise.resolve(onSave({ id: initialData?.id, type: noteType, title: title.trim(), content: content.trim(), isPinned }))
      .then(() => onClose())
      .catch(() => {
        /* reported by the caller; keep the modal open */
      })
      .finally(() => setIsSubmitting(false));
  };

  const isEditing = Boolean(initialData?.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="add-note-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            key="add-note-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[520px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray overflow-hidden z-10 my-auto flex flex-col"
          >
            {/* ── Modal Header: Icon, Title, Subtitle, Close ── */}
            <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4 border-b border-light-gray/60">
              <div className="flex items-start gap-3.5">
                {/* Icon box */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                  <FileEdit className="w-5 h-5 stroke-[2.2]" />
                </div>

                <div className="space-y-0.5">
                  <h2 className="text-base sm:text-lg font-bold text-dark-black tracking-tight font-secondary">
                    {isEditing ? "Edit Note" : "Add Note"}
                  </h2>
                  <p className="text-xs text-light-black">
                    {isEditing
                      ? "Update internal note details for this user."
                      : "Create a new internal note for this user."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-light-black hover:text-dark-black hover:bg-light-gray/60 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Form Body ── */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {/* 1. Note Type Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark-black flex items-center gap-1">
                  <span>Note Type</span>
                  <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black hover:bg-light-gray/20 transition-colors text-left cursor-pointer"
                  >
                    <span>{noteType}</span>
                    <ChevronDown className="w-4 h-4 text-light-black shrink-0" />
                  </button>

                  <AnimatePresence>
                    {isTypeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 top-full mt-1 w-full bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                      >
                        {NOTE_TYPES.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              setNoteType(type);
                              setIsTypeDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                              noteType === type
                                ? "bg-primary/10 text-primary font-bold"
                                : "text-dark-black hover:bg-light-gray"
                            }`}
                          >
                            <span>{type}</span>
                            {noteType === type && (
                              <Check className="w-3.5 h-3.5 text-primary" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* 2. Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark-black flex items-center gap-1">
                  <span>Title</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* 3. Note Content Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark-black flex items-center gap-1">
                  <span>Note Content</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter note content..."
                    className="w-full p-3 pb-6 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black/60 outline-none focus:border-primary transition-colors resize-none leading-relaxed"
                  />
                  <span className="absolute right-3 bottom-2 text-[10px] font-semibold text-light-black pointer-events-none">
                    {content.length}/2000
                  </span>
                </div>
              </div>

              {/* 4. Pin Note Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-light-gray bg-light-gray/20">
                <div className="flex items-center gap-2.5">
                  <Paperclip className="w-4 h-4 text-light-black shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-dark-black">Pin Note</p>
                    <p className="text-[11px] text-light-black mt-0.5">
                      Pinned notes will appear at the top
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={isPinned}
                  onClick={() => setIsPinned(!isPinned)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPinned ? "bg-primary" : "bg-light-gray"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                      isPinned ? "translate-x-4.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* 5. Notice Callout Banner */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
                <History className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  This note will be visible to all users who have access to this
                  account.
                </p>
              </div>

              {/* ── Modal Footer ── */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-light-gray/60">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-semibold text-dark-black hover:bg-light-gray/40 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-medium-teal active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{isEditing ? "Update Note" : "Add Note"}</span>
                  )}
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
