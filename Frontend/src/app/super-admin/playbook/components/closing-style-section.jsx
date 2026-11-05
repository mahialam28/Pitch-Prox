"use client";

import React, { useState } from "react";
import {
  Info,
  RotateCcw,
  Plus,
  Check,
  X,
  Flag,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import AddPromptRuleModal from "./add-prompt-rule-modal";
import AddCoachingPillarModal from "./add-coaching-pillar-modal";
import toast from "react-hot-toast";

export const DEFAULT_CLOSING_STYLE = {
  philosophy:
    "Focus on mutual commitment, logical next steps, and clear decision criteria — never pushy ultimatums or fake urgency.",
  guidance:
    "Offer low-friction agreements, summarize value delivered, and lock in specific commitments with locked calendar dates.",
  techniques: [
    "Assumptive Next Step",
    "Value Summary Close",
    "Option-Balance Close",
    "Logical Consequence Close",
    "Mutual Agreement Bridge",
  ],
  selectedTechniques: [
    "Assumptive Next Step",
    "Value Summary Close",
    "Option-Balance Close",
    "Logical Consequence Close",
    "Mutual Agreement Bridge",
  ],
  avoidList: [
    "High-pressure ultimatums",
    "Fake artificial deadlines",
    "Leaving next step open-ended",
    "Desperate concessions",
  ],
  cadence: [
    {
      step: 1,
      title: "Confirm Alignment",
      description: "Ensure all core needs and value metrics are acknowledged.",
    },
    {
      step: 2,
      title: "Present Clear Options",
      description: "Give binary, high-clarity choices for the next move.",
    },
    {
      step: 3,
      title: "Lock In Details",
      description: "Establish calendar date, time, and stakeholder participants.",
    },
    {
      step: 4,
      title: "Verify Commitment",
      description: "Confirm readiness and eliminate lingering hesitations.",
    },
  ],
};

const ClosingStyleSection = ({
  data = {},
  onChange = () => {},
  onResetDefaults = () => {},
}) => {
  const [techModalOpen, setTechModalOpen] = useState(false);
  const [avoidModalOpen, setAvoidModalOpen] = useState(false);

  const currentData = {
    ...DEFAULT_CLOSING_STYLE,
    ...data,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...currentData,
      [field]: val,
    });
  };

  const handleToggleTechnique = (t) => {
    const prev = currentData.selectedTechniques || [];
    const updated = prev.includes(t)
      ? prev.filter((item) => item !== t)
      : [...prev, t];
    handleFieldChange("selectedTechniques", updated);
  };

  const handleAddTechnique = (t) => {
    const techs = currentData.techniques || [];
    const sel = currentData.selectedTechniques || [];
    handleFieldChange("techniques", [...techs, t]);
    handleFieldChange("selectedTechniques", [...sel, t]);
  };

  const handleAddAvoid = (text) => {
    handleFieldChange("avoidList", [...(currentData.avoidList || []), text]);
  };

  const handleReset = () => {
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_CLOSING_STYLE);
    }
    toast.success("Reset Closing Style to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Closing Style
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Define the closing philosophy, commitment structures, and deal finalization prompts.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Define how the AI should guide the agent to lock in commitments and close deals.
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

      {/* ── 1. What is the closing philosophy of this playbook? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What is the closing philosophy of this playbook?
        </label>
        <div className="relative">
          <textarea
            value={currentData.philosophy}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("philosophy", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.philosophy || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 2. How should the AI prompt closing moments? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should the AI prompt closing moments?
        </label>
        <div className="relative">
          <textarea
            value={currentData.guidance}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("guidance", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.guidance || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 3. Closing techniques to prioritize ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          Closing techniques to prioritize
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.techniques || []).map((tech) => {
            const isSelected = (currentData.selectedTechniques || []).includes(tech);

            return (
              <button
                key={tech}
                type="button"
                onClick={() => handleToggleTechnique(tech)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {tech}
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setTechModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 4. What to avoid in closing ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What to avoid in closing
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.avoidList || []).map((item, idx) => (
            <div
              key={idx}
              className="py-1.5 px-3 rounded-xl border border-red-200 bg-red-50/60 text-red-600 text-xs font-medium flex items-center gap-1.5 shadow-2xs"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{item}</span>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setAvoidModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 5. Closing Progression Structure ── */}
      <div className="space-y-3 pt-1">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          Closing Progression Structure
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(currentData.cadence || DEFAULT_CLOSING_STYLE.cadence).map((c) => (
            <div
              key={c.step}
              className="p-3.5 rounded-xl border border-light-gray bg-white space-y-1.5 shadow-2xs"
            >
              <div className="w-5 h-5 rounded-full bg-light-gray flex items-center justify-center text-[11px] font-bold text-medium-black">
                {c.step}
              </div>
              <h4 className="text-xs font-bold text-dark-black font-secondary">
                {c.title}
              </h4>
              <p className="text-[11px] text-medium-black leading-snug">
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddCoachingPillarModal
        isOpen={techModalOpen}
        onClose={() => setTechModalOpen(false)}
        onAdd={handleAddTechnique}
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

export default ClosingStyleSection;
