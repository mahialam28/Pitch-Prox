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
} from "lucide-react";
import Text from "@/components/texts/text";

// ── Preset Icon Options (each icon has a fixed color) ──────────────────────

const ICON_OPTIONS = [
  { icon: Hand, name: "Opening", color: "text-emerald-500 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  { icon: Search, name: "Discovery", color: "text-blue-500 bg-blue-50 border-blue-200", dot: "bg-blue-500" },
  { icon: Gem, name: "Value Prop", color: "text-purple-500 bg-purple-50 border-purple-200", dot: "bg-purple-500" },
  { icon: ShieldAlert, name: "Objections", color: "text-amber-500 bg-[#fff8f0] border-amber-200", dot: "bg-amber-500" },
  { icon: Target, name: "Close", color: "text-teal-500 bg-[#e6f7f5] border-teal-200", dot: "bg-teal-500" },
  { icon: PhoneCall, name: "Follow Up", color: "text-pink-500 bg-pink-50 border-pink-200", dot: "bg-pink-500" },
];

// ── Find matching icon index ───────────────────────────────────────────────

const findIconIndex = (iconComponent) => {
  const idx = ICON_OPTIONS.findIndex((opt) => opt.icon === iconComponent);
  return idx >= 0 ? idx : 0;
};

// ── Generate badge goal ────────────────────────────────────────────────────

const generateBadgeGoal = (goalText) => {
  if (!goalText?.trim()) return "Goal: Define";
  const words = goalText.trim().split(/\s+/);
  const short = words.length > 2 ? words.slice(0, 2).join(" ") : goalText.trim();
  return `Goal: ${short.charAt(0).toUpperCase() + short.slice(1)}`;
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

// ── Form (remounted on each open so state starts fresh from props) ──────────

const PhaseForm = ({ onClose, onSave, editPhase, isEditing }) => {
  const [title, setTitle] = useState(editPhase?.title || "");
  const [description, setDescription] = useState(editPhase?.description || "");
  const [goal, setGoal] = useState(editPhase?.goal || "");
  const [selectedIdx, setSelectedIdx] = useState(() => findIconIndex(editPhase?.icon));

  // ── Keyboard handling ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

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
  }, [lockScroll, unlockScroll]);

  // ── Handle Save ──────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!title.trim()) return;

    const selected = ICON_OPTIONS[selectedIdx];
    onSave({
      ...(editPhase ? { id: editPhase.id } : {}),
      title: title.trim(),
      description: description.trim() || "Add details about this conversation step.",
      goal: goal.trim() || "Define the main objective for this step.",
      badgeGoal: generateBadgeGoal(goal),
      icon: selected.icon,
      color: selected.color,
    });
    onClose();
  };

  const isValid = title.trim().length > 0;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="phase-modal-backdrop"
        className="fixed inset-0 z-999 bg-dark-black/50 h-screen"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        key="phase-modal"
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
                  {isEditing ? "Edit Phase" : "Add New Phase"}
                </Text>
                <Text variant="smaller" className="text-light-black mt-1">
                  {isEditing
                    ? "Update the phase details and icon."
                    : "Define a new conversation phase and choose an icon to represent it."}
                </Text>
              </div>

              {/* Phase Title */}
              <div className="space-y-1.5 mb-5">
                <label className="text-xs font-semibold text-medium-black uppercase tracking-wider">
                  Phase Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Introduction, Discovery, Closing..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 mb-5">
                <label className="text-xs font-semibold text-medium-black uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happens in this phase..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
                />
              </div>

              {/* Goal */}
              <div className="space-y-1.5 mb-6">
                <label className="text-xs font-semibold text-medium-black uppercase tracking-wider">
                  Goal
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Build rapport, Uncover needs, Close deal..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
                {goal && (
                  <Text variant="extraSmall" className="!text-primary !font-medium mt-1">
                    Badge: {generateBadgeGoal(goal)}
                  </Text>
                )}
              </div>

              {/* Icon Picker */}
              <div className="space-y-3 mb-6">
                <label className="text-xs font-semibold text-medium-black uppercase tracking-wider">
                  Choose Icon
                </label>

                {/* Icon grid — 6 preset-colored icons */}
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
                  {isEditing ? "Save Changes" : "Save Phase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ── Component ───────────────────────────────────────────────────────────────

const AddPhaseModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  editPhase = null,
}) => {
  const isEditing = editPhase !== null;
  // Key the form by open target so it remounts (fresh state) on every open,
  // instead of syncing state inside an effect.
  const formKey = isEditing ? `edit-${editPhase.id}` : "new";

  return (
    <AnimatePresence>
      {isOpen && (
        <PhaseForm
          key={formKey}
          onClose={onClose}
          onSave={onSave}
          editPhase={editPhase}
          isEditing={isEditing}
        />
      )}
    </AnimatePresence>
  );
};

export default AddPhaseModal;
