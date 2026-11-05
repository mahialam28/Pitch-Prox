"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  MessageSquare,
  Clock,
  User,
  HelpCircle,
  AlertCircle,
  Mail,
  Sparkles,
} from "lucide-react";
import { userLeadTypeOptions } from "@/utils.js/lead-options";

// Objection categories (an objection can belong to up to two)
export const OBJECTION_CATEGORIES = ["Risk", "Financial", "Relationship", "Logistics", "Identity / Emotional"].map((value) => ({ value, label: value }));
// Older sample categories map onto the new ones
const LEGACY_CATEGORY = { Pricing: "Financial", Timing: "Logistics", Competition: "Relationship", Privacy: "Risk", Disinterest: "Identity / Emotional", Information: "Logistics", Authority: "Relationship" };
const ALL_LEAD_TYPES = "All Lead Types";
const ANY_STAGE = "Any Stage";

export const OBJECTION_STAGES = [
  { value: "Opening", label: "Opening" },
  { value: "Discovery", label: "Discovery" },
  { value: "Value Prop", label: "Value Proposition" },
  { value: "Objections", label: "Handle Objections" },
  { value: "Close", label: "Close" },
  { value: "Follow Up", label: "Follow Up" },
];

export const OBJECTION_ICONS = [
  { id: "message-rose", icon: MessageSquare, color: "text-rose-500 bg-rose-50 border-rose-200" },
  { id: "clock-amber", icon: Clock, color: "text-amber-500 bg-amber-50 border-amber-200" },
  { id: "user-purple", icon: User, color: "text-purple-500 bg-purple-50 border-purple-200" },
  { id: "clock-cyan", icon: HelpCircle, color: "text-cyan-500 bg-cyan-50 border-cyan-200" },
  { id: "alert-emerald", icon: AlertCircle, color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
  { id: "mail-blue", icon: Mail, color: "text-blue-500 bg-blue-50 border-blue-200" },
];

const AddObjectionModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  editObjection = null,
  // The playbook's current stages (default + custom), so this list always matches the builder
  stages = null,
}) => {
  const stageNames = (stages?.length ? stages.map((stage) => stage.title) : OBJECTION_STAGES.map((stage) => stage.label));
  const isEditing = Boolean(editObjection);

  // The parent remounts this modal (key) per objection, so state starts from it
  const [title, setTitle] = useState(editObjection?.title || "");
  const [subtitle, setSubtitle] = useState(editObjection?.subtitle || "");
  const [categories, setCategories] = useState(() => {
    const list = editObjection?.categories ?? (editObjection?.category ? [editObjection.category] : ["Financial"]);
    return list.map((category) => LEGACY_CATEGORY[category] ?? category).slice(0, 2);
  });
  const [stagesSelected, setStagesSelected] = useState(() => {
    const list = editObjection?.stages ?? (editObjection?.stage ? [editObjection.stage] : [ANY_STAGE]);
    return list;
  });
  const [leadTypes, setLeadTypes] = useState(() => {
    const list = Array.isArray(editObjection?.leadTypes) ? editObjection.leadTypes : [ALL_LEAD_TYPES];
    const known = list.filter((type) => type === ALL_LEAD_TYPES || userLeadTypeOptions.some((option) => option.value === type));
    return known.length ? known : [ALL_LEAD_TYPES];
  });
  const [leadSearch, setLeadSearch] = useState("");
  const [responseStyle, setResponseStyle] = useState(editObjection?.responseStyle || "");
  const [goal, setGoal] = useState(editObjection?.goal || "");
  const [selectedIconIdx, setSelectedIconIdx] = useState(() => Math.max(0, OBJECTION_ICONS.findIndex((icon) => icon.id === editObjection?.iconType)));

  const toggleCategory = (value) =>
    setCategories((current) => (current.includes(value) ? (current.length > 1 ? current.filter((item) => item !== value) : current) : [...current, value].slice(-2)));
  const toggleStage = (value) =>
    setStagesSelected((current) => {
      if (value === ANY_STAGE) return [ANY_STAGE];
      const withoutAny = current.filter((item) => item !== ANY_STAGE);
      const next = withoutAny.includes(value) ? withoutAny.filter((item) => item !== value) : [...withoutAny, value];
      return next.length ? next : [ANY_STAGE];
    });
  const toggleLeadType = (value) =>
    setLeadTypes((current) => {
      if (value === ALL_LEAD_TYPES) return [ALL_LEAD_TYPES];
      const withoutAll = current.filter((item) => item !== ALL_LEAD_TYPES);
      const next = withoutAll.includes(value) ? withoutAll.filter((item) => item !== value) : [...withoutAll, value];
      return next.length ? next : [ALL_LEAD_TYPES];
    });
  const leadOptions = [ALL_LEAD_TYPES, ...userLeadTypeOptions.map((option) => option.value)].filter((type) => type.toLowerCase().includes(leadSearch.trim().toLowerCase()));

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const objectionData = {
      ...(editObjection ? { id: editObjection.id } : {}),
      title: title.trim(),
      subtitle: subtitle.trim() || `${categories[0]} Objection`,
      category: categories[0],
      categories,
      stage: stagesSelected[0],
      stages: stagesSelected,
      leadTypes,
      responseStyle: responseStyle.trim() || "Value & ROI Focus",
      goal: goal.trim() || "Address concern with clarity and pivot to value.",
      iconType: OBJECTION_ICONS[selectedIconIdx].id,
    };

    onSave(objectionData);
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
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
                  {isEditing ? "Edit Objection" : "Add New Objection"}
                </h3>
                <p className="text-[11px] text-light-black font-normal mt-0.5">
                  Define the prospect objection and AI response coaching parameters.
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
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                Objection Phrase / Question <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. I don't want to pay commission."
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
                autoFocus
              />
            </div>

            {/* Subtitle / Type */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                Objection Sub-Type
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Pricing Objection, Timing Objection"
                className="w-full px-3.5 py-2 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
              />
            </div>

            {/* Objection Category: up to two */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                Objection Category <span className="font-normal text-light-black">(choose up to 2)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {OBJECTION_CATEGORIES.map((option) => {
                  const active = categories.includes(option.value);
                  return (
                    <button key={option.value} type="button" aria-pressed={active} onClick={() => toggleCategory(option.value)} className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${active ? "bg-primary/10 border-primary text-primary" : "bg-white border-light-gray text-medium-black hover:border-primary/40"}`}>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Applicable Conversation Stages: from this playbook's stages, multi-select */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">Applicable Conversation Stages</label>
              <div className="flex flex-wrap gap-1.5">
                {[ANY_STAGE, ...stageNames].map((name) => {
                  const active = stagesSelected.includes(name);
                  return (
                    <button key={name} type="button" aria-pressed={active} onClick={() => toggleStage(name)} className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${active ? "bg-primary/10 border-primary text-primary" : "bg-white border-light-gray text-medium-black hover:border-primary/40"}`}>
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Applicable Lead Types: searchable multi-select from the PitchProX lead type library */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">Applicable Lead Types</label>
              <input
                type="search"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="Search lead types..."
                aria-label="Search lead types"
                className="w-full px-3.5 py-2 mb-2 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
              />
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {leadOptions.map((type) => {
                  const active = leadTypes.includes(type);
                  return (
                    <button key={type} type="button" aria-pressed={active} onClick={() => toggleLeadType(type)} className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${active ? "bg-primary/10 border-primary text-primary" : "bg-white border-light-gray text-medium-black hover:border-primary/40"}`}>
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Response Style & Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-medium-black mb-1.5">
                  Response Style
                </label>
                <input
                  type="text"
                  value={responseStyle}
                  onChange={(e) => setResponseStyle(e.target.value)}
                  placeholder="e.g. Value & ROI Focus"
                  className="w-full px-3.5 py-2 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-medium-black mb-1.5">
                  Goal / Outcome
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Overcome price concern and show value"
                  className="w-full px-3.5 py-2 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-2">
                Icon Representation
              </label>
              <div className="grid grid-cols-6 gap-2">
                {OBJECTION_ICONS.map((opt, idx) => {
                  const IconComp = opt.icon;
                  const isSelected = selectedIconIdx === idx;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedIconIdx(idx)}
                      className={`flex items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-2xs"
                          : "border-light-gray hover:border-light-black/30 bg-white"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${opt.color}`}>
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
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
                {isEditing ? "Save Changes" : "Add Objection"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddObjectionModal;
