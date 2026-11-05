"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Hand,
  Search,
  Gem,
  ShieldAlert,
  Target,
  PhoneCall,
  MessageSquare,
} from "lucide-react";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";

// ── Preset Icon Options ─────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { icon: MessageSquare, name: "Message", color: "text-emerald-500 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { icon: Hand, name: "Objection", color: "text-rose-500 bg-rose-50 border-rose-200", dot: "bg-rose-500" },
  { icon: Search, name: "Discovery", color: "text-blue-500 bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  { icon: ShieldAlert, name: "Shield", color: "text-amber-500 bg-[#fff8f0] border-amber-200", dot: "bg-amber-500" },
  { icon: Target, name: "Close", color: "text-teal-500 bg-[#e6f7f5] border-teal-200", dot: "bg-teal-500" },
  { icon: PhoneCall, name: "Call", color: "text-purple-500 bg-purple-50 border-purple-200", dot: "bg-purple-500" },
];

// Canonical objection categories — shared with the Step 4 category filter.
export const CATEGORY_OPTIONS = [
  "Financial",
  "Relationship",
  "Risk",
  "Logistic",
];

const findIconIndex = (iconComponent) => {
  const idx = ICON_OPTIONS.findIndex((opt) => opt.icon === iconComponent);
  return idx >= 0 ? idx : 0;
};

// ── Animation Variants ──────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ── Component ───────────────────────────────────────────────────────────────

const AddObjectionModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  editObjection = null,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [responseStyle, setResponseStyle] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const isEditing = editObjection !== null;

  // ── Initialize / reset ────────────────────────────────────────────────────
  // Re-sync the form whenever the modal opens or switches target. Done as a
  // render-phase state adjustment (the documented pattern) rather than in an
  // effect, per the React Compiler rule enforced by this project's lint setup.
  const [formKey, setFormKey] = useState("");
  const nextFormKey = `${isOpen}-${editObjection ? editObjection.id : "new"}`;
  if (nextFormKey !== formKey) {
    setFormKey(nextFormKey);
    if (isOpen) {
      if (editObjection) {
        setTitle(editObjection.title || "");
        setCategory(editObjection.category || CATEGORY_OPTIONS[0]);
        setResponseStyle(editObjection.responseStyle || "");
        setSelectedIdx(findIconIndex(editObjection.icon));
      } else {
        setTitle("");
        setCategory(CATEGORY_OPTIONS[0]);
        setResponseStyle("");
        setSelectedIdx(0);
      }
    }
  }

  // ── Keyboard handling ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // ── Scroll lock ──────────────────────────────────────────────────────────
  const lockScroll = useCallback(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
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
      const handleResize = () => {
        const w = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${w}px`;
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        unlockScroll();
      };
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [isOpen, lockScroll, unlockScroll]);

  // ── Handle Save ──────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!title.trim()) return;

    const selected = ICON_OPTIONS[selectedIdx];
    onSave({
      ...(editObjection ? { id: editObjection.id } : {}),
      title: title.trim(),
      category,
      icon: selected.icon,
      iconColor: selected.color,
      responseStyle: responseStyle.trim() || "Focus Value & ROI",
      styleBadgeColor: "bg-emerald-50 text-emerald-700",
      lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      leadTypes: ["All Lead Types"],
      extraLeadTypesCount: 0,
    });
    onClose();
  };

  const isValid = title.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="objection-modal-backdrop"
            className="fixed inset-0 z-999 bg-dark-black/50 h-screen"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="objection-modal"
            className="fixed inset-0 z-[999] flex items-center justify-center p-5 sm:p-6 pointer-events-none"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl pointer-events-auto flex flex-col max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 sm:right-6 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-light-black hover:text-dark-black hover:bg-white transition-colors z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden pt-14 sm:pt-16 pb-6">
                <div className="px-6 sm:px-8">
                  {/* Header */}
                  <div className="mb-6">
                    <Text variant="regular" className="!font-bold !text-dark-black">
                      {isEditing ? "Edit Objection" : "Add New Objection"}
                    </Text>
                    <Text variant="smaller" className="text-light-black mt-1">
                      {isEditing
                        ? "Update the objection details and response style."
                        : "Add a common objection and how you want PitchProX to respond."}
                    </Text>
                  </div>

                  {/* Objection Title */}
                  <div className="space-y-1.5 mb-5">
                    <label className="text-xs font-semibold text-medium-black uppercase tracking-wider">
                      Objection <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. I don't want to pay commission."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                      autoFocus
                    />
                  </div>

                  {/* Category — themed dropdown, same design as the page filters */}
                  <div className="space-y-1.5 mb-5">
                    <label className="text-xs font-semibold text-medium-black uppercase tracking-wider">
                      Category
                    </label>
                    <SettingsDropdown
                      label="Select category"
                      items={CATEGORY_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                      selected={category}
                      onSelect={setCategory}
                      className="w-full"
                    />
                  </div>

                  {/* Response Style */}
                  <div className="space-y-1.5 mb-6">
                    <label className="text-xs font-semibold text-medium-black uppercase tracking-wider">
                      Response Style
                    </label>
                    <input
                      type="text"
                      value={responseStyle}
                      onChange={(e) => setResponseStyle(e.target.value)}
                      placeholder="e.g. Focus Value & ROI"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    />
                  </div>

                  {/* Icon Picker */}
                  <div className="space-y-3 mb-6">
                    <label className="text-xs font-semibold text-medium-black uppercase tracking-wider">
                      Choose Icon
                    </label>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      {ICON_OPTIONS.map((opt, idx) => {
                        const Icon = opt.icon;
                        const isSelected = selectedIdx === idx;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => setSelectedIdx(idx)}
                            className={`flex items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-light-gray hover:border-medium-black/30 hover:shadow-sm"
                            }`}
                            title={opt.name}
                          >
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isSelected
                                  ? opt.color.split(" ").slice(0, 2).join(" ")
                                  : "bg-light-gray text-medium-black"
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-light-gray">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2 rounded-xl border-2 border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!isValid}
                      className={`px-5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
                        isValid
                          ? "bg-primary hover:bg-medium-teal text-white shadow-sm hover:shadow-md"
                          : "bg-light-gray text-medium-black opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {isEditing ? "Save Changes" : "Save Objection"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddObjectionModal;
