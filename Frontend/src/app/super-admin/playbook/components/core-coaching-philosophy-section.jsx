"use client";

import React, { useState } from "react";
import { Info, RotateCcw, Plus, Check } from "lucide-react";
import AddCoachingPillarModal from "./add-coaching-pillar-modal";
import toast from "react-hot-toast";

export const DEFAULT_COACHING_PHILOSOPHY = {
  mission:
    "Help agents lead high-value conversations that create clarity, confidence, and better outcomes for the client.",
  successDefinition:
    "The client feels understood, the next step is clear, and the agent advances the conversation with value.",
  aiPriorities:
    "Build trust first, bring value early, and guide toward a meaningful next step.",
  clientBelief:
    "Every client is rational, has a reason, and wants the best possible outcome.",
  agentMindset:
    "Keep the agent confident, focused, and in control of the conversation.",
  pillars: [
    "Lead with Empathy",
    "Create Clarity",
    "Deliver Value",
    "Drive Progress",
    "Maintain Control",
    "Stay Confident",
    "Be Consultative",
    "Protect the Relationship",
  ],
  selectedPillars: [
    "Lead with Empathy",
    "Create Clarity",
    "Deliver Value",
    "Drive Progress",
    "Maintain Control",
    "Stay Confident",
    "Be Consultative",
    "Protect the Relationship",
  ],
};

const QUESTIONS = [
  {
    id: "mission",
    label: "What is the mission of this playbook?",
    placeholder: "Define the overarching mission and standard for conversations...",
    maxLength: 300,
  },
  {
    id: "successDefinition",
    label: "What does success look like in every call?",
    placeholder: "Define what a winning outcome looks like across calls...",
    maxLength: 300,
  },
  {
    id: "aiPriorities",
    label: "What must the AI always prioritize?",
    placeholder: "Define what the AI prompt engine must prioritize during live interactions...",
    maxLength: 300,
  },
  {
    id: "clientBelief",
    label: "What is this playbook's core belief about the client?",
    placeholder: "Define how reps should perceive the prospect's perspective...",
    maxLength: 300,
  },
  {
    id: "agentMindset",
    label: "How should the AI support the agent's mindset?",
    placeholder: "Define the psychological stance and confidence the AI instills in the rep...",
    maxLength: 300,
  },
];

const CoreCoachingPhilosophySection = ({
  data = {},
  onChange = () => {},
  onResetDefaults = () => {},
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const currentData = {
    ...DEFAULT_COACHING_PHILOSOPHY,
    ...data,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...currentData,
      [field]: val,
    });
  };

  const handleTogglePillar = (pillar) => {
    const prev = currentData.selectedPillars || [];
    const updated = prev.includes(pillar)
      ? prev.filter((p) => p !== pillar)
      : [...prev, pillar];
    handleFieldChange("selectedPillars", updated);
  };

  const handleAddPillar = (newPillar) => {
    const pillars = currentData.pillars || DEFAULT_COACHING_PHILOSOPHY.pillars;
    const selected = currentData.selectedPillars || DEFAULT_COACHING_PHILOSOPHY.selectedPillars;
    if (!pillars.includes(newPillar)) {
      onChange({
        ...currentData,
        pillars: [...pillars, newPillar],
        selectedPillars: [...selected, newPillar],
      });
    } else if (!selected.includes(newPillar)) {
      handleFieldChange("selectedPillars", [...selected, newPillar]);
    }
  };

  const handleReset = () => {
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_COACHING_PHILOSOPHY);
    }
    toast.success("Reset Core Coaching Philosophy to defaults!");
  };

  const allPillars = currentData.pillars || DEFAULT_COACHING_PHILOSOPHY.pillars;
  const selectedPillars = currentData.selectedPillars || DEFAULT_COACHING_PHILOSOPHY.selectedPillars;

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Core Coaching Philosophy
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Define the high-level philosophy and tactical guardrails that direct prompt tone and strategy.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Define the fundamental beliefs that guide every prompt this playbook generates.
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

      {/* 5 Form Questions with Textareas */}
      <div className="space-y-5">
        {QUESTIONS.map((q) => {
          const value = currentData[q.id] || "";
          const charCount = value.length;

          return (
            <div key={q.id} className="space-y-1.5">
              <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
                {q.label}
              </label>

              <div className="relative">
                <textarea
                  value={value}
                  onChange={(e) => {
                    if (e.target.value.length <= q.maxLength) {
                      handleFieldChange(q.id, e.target.value);
                    }
                  }}
                  rows={2}
                  maxLength={q.maxLength}
                  placeholder={q.placeholder}
                  className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
                />
                <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
                  {charCount}/{q.maxLength}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coaching Pillars Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
              Coaching Pillars
            </h3>
            <span className="text-[11px] text-medium-black font-normal">
              (Select all that apply)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs font-semibold text-primary hover:text-medium-teal flex items-center gap-1 cursor-pointer py-1 px-2.5 rounded-lg hover:bg-teal-50/60 transition-colors border border-transparent hover:border-primary/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {allPillars.map((pillar) => {
            const isSelected = selectedPillars.includes(pillar);
            return (
              <button
                key={pillar}
                type="button"
                onClick={() => handleTogglePillar(pillar)}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none text-center ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
                <span className="truncate">{pillar}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal for adding custom pillar */}
      <AddCoachingPillarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddPillar}
      />
    </div>
  );
};

export default CoreCoachingPhilosophySection;
