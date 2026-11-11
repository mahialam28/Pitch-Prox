"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Smile,
  Search,
  Gem,
  ShieldCheck,
  Target,
  PhoneCall,
  Sparkles,
  GitBranch,
} from "lucide-react";

export const STAGE_ICONS = [
  {
    id: "opening",
    name: "Opening",
    icon: Smile,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    dot: "bg-emerald-500",
  },
  {
    id: "discovery",
    name: "Discovery",
    icon: Search,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    id: "value-prop",
    name: "Value Prop",
    icon: Gem,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    dot: "bg-purple-500",
  },
  {
    id: "objections",
    name: "Objections",
    icon: ShieldCheck,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    dot: "bg-amber-500",
  },
  {
    id: "close",
    name: "Close",
    icon: Target,
    color: "text-teal-600 bg-teal-50 border-teal-200",
    dot: "bg-teal-500",
  },
  {
    id: "follow-up",
    name: "Follow Up",
    icon: PhoneCall,
    color: "text-rose-600 bg-rose-50 border-rose-200",
    dot: "bg-rose-500",
  },
];

const AddStageModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  editStage = null,
}) => {
  const isEditing = Boolean(editStage);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [selectedIconIdx, setSelectedIconIdx] = useState(0);

  // Reset the form whenever the modal opens (or switches item) — synced during render, not in an effect
  const [syncedFor, setSyncedFor] = useState(null);
  const syncKey = isOpen ? editStage ?? "new" : null;
  if (syncedFor !== syncKey) {
    setSyncedFor(syncKey);
    if (editStage) {
      setTitle(editStage.title || "");
      setDescription(editStage.description || "");
      setGoal(editStage.goal || "");
      const foundIdx = STAGE_ICONS.findIndex(
        (opt) => opt.id === editStage.iconId || opt.name.toLowerCase() === editStage.title?.toLowerCase()
      );
      setSelectedIconIdx(foundIdx >= 0 ? foundIdx : 0);
    } else {
      setTitle("");
      setDescription("");
      setGoal("");
      setSelectedIconIdx(0);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosen = STAGE_ICONS[selectedIconIdx];
    const stageData = {
      ...(editStage ? { id: editStage.id } : {}),
      title: title.trim(),
      description: description.trim() || "Guide the conversation effectively.",
      goal: goal.trim() || "Achieve stage objective and advance the call.",
      badgeGoal: goal.trim()
        ? `Goal: ${goal.trim().split(" ").slice(0, 2).join(" ")}`
        : "Goal: Complete",
      iconId: chosen.id,
      color: chosen.color,
    };

    onSave(stageData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white rounded-2xl border border-light-gray shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
                  {isEditing ? "Edit Stage" : "Add Stage"}
                </h3>
                <p className="text-[11px] text-light-black font-normal mt-0.5">
                  {isEditing
                    ? "Modify stage description and AI guidance goals."
                    : "Define a new stage for the AI call coaching framework."}
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
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Stage Title */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                Stage Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Discovery, Handling Objections, Closing"
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                Description / Action Summary
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Ask the right questions to uncover their situation and needs."
                className="w-full px-3.5 py-2 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black resize-none"
              />
            </div>

            {/* Goal */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                Stage Goal & Outcome
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Understand their challenges, goals, and timeline."
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
              />
            </div>

            {/* Icon & Theme Selection */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-2">
                Stage Icon & Color
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {STAGE_ICONS.map((opt, idx) => {
                  const IconComp = opt.icon;
                  const isSelected = selectedIconIdx === idx;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedIconIdx(idx)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-2xs"
                          : "border-light-gray hover:border-light-black/30 bg-white"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${
                          isSelected
                            ? opt.color.split(" ").slice(0, 2).join(" ")
                            : "bg-light-gray text-medium-black"
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-medium text-medium-black truncate w-full text-center">
                        {opt.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-gray">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                {isEditing ? "Save Changes" : "Add Stage"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddStageModal;
