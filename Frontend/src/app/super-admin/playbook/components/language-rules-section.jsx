"use client";

import React, { useState } from "react";
import {
  Info,
  RotateCcw,
  Plus,
  Check,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import AddCoachingPillarModal from "./add-coaching-pillar-modal";
import AddPromptRuleModal from "./add-prompt-rule-modal";
import toast from "react-hot-toast";

export const DEFAULT_LANGUAGE_RULES = {
  languageType:
    "Clear, confident, and conversational. Speak like a top advisor — not a salesperson. Use simple words with high impact.",
  sentenceStructure:
    "Short to medium length. One idea per sentence. Use natural rhythm and pauses that feel like real conversation.",
  priorities: [
    "Clarity",
    "Simplicity",
    "Confidence",
    "Value-focused",
    "Client-centered",
    "Specificity",
    "Positive positioning",
    "Action-oriented",
  ],
  selectedPriorities: [
    "Clarity",
    "Simplicity",
    "Confidence",
    "Value-focused",
    "Client-centered",
    "Specificity",
    "Positive positioning",
    "Action-oriented",
  ],
  encouragedWords: [
    "For you",
    "Your situation",
    "What matters most",
    "The best move",
    "Net result",
    "Strategy",
    "Options",
    "Control",
    "Confidence",
    "Let's explore",
  ],
  selectedEncouragedWords: [
    "For you",
    "Your situation",
    "What matters most",
    "The best move",
    "Net result",
    "Strategy",
    "Options",
    "Control",
    "Confidence",
    "Let's explore",
  ],
  avoidWords: [
    "I think",
    "I feel",
    "Just",
    "Honestly",
    "Actually",
    "Basically",
    "No problem",
    "I'm just checking",
    "Salesy hype",
    "Overused filler words",
  ],
  specialInstructions: [
    {
      id: 1,
      text: "Mirror the client's energy and vocabulary without copying.",
    },
    {
      id: 2,
      text: "Avoid assumptions. Don't tell the client what they want — draw it out.",
    },
    {
      id: 3,
      text: "Never sound desperate, pushy, or overly enthusiastic.",
    },
    {
      id: 4,
      text: "Keep every prompt natural enough to say out loud without thinking.",
    },
  ],
};

const LanguageRulesSection = ({
  data = {},
  onChange = () => {},
  onResetDefaults = () => {},
}) => {
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [encourageModalOpen, setEncourageModalOpen] = useState(false);
  const [avoidModalOpen, setAvoidModalOpen] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState(null);

  const currentData = {
    ...DEFAULT_LANGUAGE_RULES,
    ...data,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...currentData,
      [field]: val,
    });
  };

  const handleTogglePriority = (item) => {
    const prev = currentData.selectedPriorities || [];
    const updated = prev.includes(item)
      ? prev.filter((i) => i !== item)
      : [...prev, item];
    handleFieldChange("selectedPriorities", updated);
  };

  const handleToggleEncouraged = (item) => {
    const prev = currentData.selectedEncouragedWords || [];
    const updated = prev.includes(item)
      ? prev.filter((i) => i !== item)
      : [...prev, item];
    handleFieldChange("selectedEncouragedWords", updated);
  };

  const handleAddPriority = (item) => {
    const priorities = currentData.priorities || [];
    const sel = currentData.selectedPriorities || [];
    handleFieldChange("priorities", [...priorities, item]);
    handleFieldChange("selectedPriorities", [...sel, item]);
  };

  const handleAddEncouraged = (item) => {
    const words = currentData.encouragedWords || [];
    const sel = currentData.selectedEncouragedWords || [];
    handleFieldChange("encouragedWords", [...words, item]);
    handleFieldChange("selectedEncouragedWords", [...sel, item]);
  };

  const handleAddAvoid = (item) => {
    const words = currentData.avoidWords || [];
    handleFieldChange("avoidWords", [...words, item]);
  };

  const handleReset = () => {
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_LANGUAGE_RULES);
    }
    toast.success("Reset Language Rules to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Language Rules
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Set the linguistic rules that shape how the AI writes every prompt.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Set the linguistic rules that shape how the AI writes every prompt.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Default</span>
        </button>
      </div>

      {/* ── 1. What type of language should the AI use? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What type of language should the AI use?
        </label>
        <div className="relative">
          <textarea
            value={currentData.languageType}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("languageType", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.languageType || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 2. How should the AI structure sentences? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should the AI structure sentences?
        </label>
        <div className="relative">
          <textarea
            value={currentData.sentenceStructure}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("sentenceStructure", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.sentenceStructure || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 3. What should the AI prioritize in word choice? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should the AI prioritize in word choice?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.priorities || []).map((p) => {
            const isSelected = (currentData.selectedPriorities || []).includes(p);

            return (
              <button
                key={p}
                type="button"
                onClick={() => handleTogglePriority(p)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                <span>{p}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setPriorityModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 4. Words and phrases to encourage ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          Words and phrases to encourage
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.encouragedWords || []).map((w) => {
            const isSelected = (
              currentData.selectedEncouragedWords || []
            ).includes(w);

            return (
              <button
                key={w}
                type="button"
                onClick={() => handleToggleEncouraged(w)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                <span>{w}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setEncourageModalOpen(true)}
            className="text-xs font-semibold text-primary hover:text-medium-teal flex items-center gap-1 cursor-pointer px-1 py-1"
          >
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 5. Words and phrases to avoid ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          Words and phrases to avoid
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.avoidWords || []).map((w, idx) => (
            <div
              key={idx}
              className="py-1.5 px-3 rounded-xl border border-red-200 bg-red-50/60 text-red-600 text-xs font-medium flex items-center gap-1.5 shadow-2xs"
            >
              <span>{w}</span>
              <div className="relative group cursor-pointer">
                <Info className="w-3 h-3 text-red-400 hover:text-red-600 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 hidden group-hover:block w-44 p-2 bg-dark-black text-white text-[10px] rounded-lg shadow-lg z-20 pointer-events-none">
                  Avoid using &ldquo;{w}&rdquo; in live prompt recommendations.
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setAvoidModalOpen(true)}
            className="text-xs font-semibold text-primary hover:text-medium-teal flex items-center gap-1 cursor-pointer px-1 py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 6. Special language instructions ── */}
      <div className="space-y-2.5 pt-1">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          Special language instructions
        </label>

        <div className="space-y-2">
          {(currentData.specialInstructions || []).map((inst) => (
            <div
              key={inst.id}
              className="p-3.5 rounded-xl border border-light-gray bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-medium-black/20 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-5 h-5 rounded-full bg-teal-50 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs sm:text-[13px] text-dark-black font-normal truncate">
                  {inst.text}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingInstruction(inst);
                  toast("Edit instruction");
                }}
                className="text-light-black hover:text-dark-black p-1 rounded-lg transition-colors cursor-pointer"
                title="Edit instruction"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddCoachingPillarModal
        isOpen={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        onAdd={handleAddPriority}
      />

      <AddCoachingPillarModal
        isOpen={encourageModalOpen}
        onClose={() => setEncourageModalOpen(false)}
        onAdd={handleAddEncouraged}
      />

      <AddPromptRuleModal
        isOpen={avoidModalOpen}
        onClose={() => setAvoidModalOpen(false)}
        onAdd={handleAddAvoid}
        type="avoid"
      />
    </div>
  );
};

export default LanguageRulesSection;
