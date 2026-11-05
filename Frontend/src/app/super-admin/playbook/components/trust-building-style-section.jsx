"use client";

import React, { useState } from "react";
import {
  Info,
  RotateCcw,
  Plus,
  Check,
  X,
  GripVertical,
  User,
  MoreVertical,
} from "lucide-react";
import AddPromptRuleModal from "./add-prompt-rule-modal";
import AddCoachingPillarModal from "./add-coaching-pillar-modal";
import toast from "react-hot-toast";

export const DEFAULT_TRUST_BUILDING_STYLE = {
  whatBuildsTrust:
    "Transparency, expertise, empathy, and positioning as a trusted advisor — not a salesperson.",
  howEstablishCredibility:
    "Reference experience, local knowledge, strategy, and results. Show you understand their specific situation.",
  howShowEmpathy:
    "Acknowledge their position, validate concerns, and show genuine understanding before offering insight.",
  avoidTrustDestroyers: [
    "Making it about you",
    "Overpromising",
    "Sounding pushy",
    "Generic statements",
    "Discounting their concerns",
    "Talking too much",
  ],
  trustSignals: [
    "Local expertise",
    "Market knowledge",
    "Proven process",
    "Results focus",
    "Honesty & transparency",
    "Client-first mindset",
    "Calm confidence",
  ],
  selectedSignals: [
    "Local expertise",
    "Market knowledge",
    "Proven process",
    "Results focus",
    "Honesty & transparency",
    "Client-first mindset",
    "Calm confidence",
  ],
  trustPrinciples: [
    { id: 1, text: "Serve first, sell second." },
    { id: 2, text: "Earn trust before asking for anything." },
    { id: 3, text: "Give value early and often." },
    { id: 4, text: "Make the client feel informed, not sold." },
  ],
};

const TrustBuildingStyleSection = ({
  data = {},
  onChange = () => {},
  onResetDefaults = () => {},
}) => {
  const [avoidModalOpen, setAvoidModalOpen] = useState(false);
  const [signalModalOpen, setSignalModalOpen] = useState(false);
  const [principleModalOpen, setPrincipleModalOpen] = useState(false);

  const currentData = {
    ...DEFAULT_TRUST_BUILDING_STYLE,
    ...data,
  };

  const handleFieldChange = (field, val) => {
    onChange({
      ...currentData,
      [field]: val,
    });
  };

  const handleToggleSignal = (sig) => {
    const prev = currentData.selectedSignals || [];
    const updated = prev.includes(sig)
      ? prev.filter((s) => s !== sig)
      : [...prev, sig];
    handleFieldChange("selectedSignals", updated);
  };

  const handleAddAvoid = (text) => {
    handleFieldChange("avoidTrustDestroyers", [
      ...(currentData.avoidTrustDestroyers || []),
      text,
    ]);
  };

  const handleAddSignal = (text) => {
    const sigs = currentData.trustSignals || [];
    const sel = currentData.selectedSignals || [];
    handleFieldChange("trustSignals", [...sigs, text]);
    handleFieldChange("selectedSignals", [...sel, text]);
  };

  const handleAddPrinciple = (text) => {
    const principles = currentData.trustPrinciples || [];
    handleFieldChange("trustPrinciples", [
      ...principles,
      { id: Date.now(), text },
    ]);
  };

  const handleReset = () => {
    if (onResetDefaults) {
      onResetDefaults();
    } else {
      onChange(DEFAULT_TRUST_BUILDING_STYLE);
    }
    toast.success("Reset Trust-Building Style to defaults!");
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-6">
      {/* ── Section Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
              Trust-Building Style
            </h2>
            <div className="relative group cursor-pointer">
              <Info className="w-4 h-4 text-medium-black/70 hover:text-dark-black transition-colors" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2.5 bg-dark-black text-white text-[11px] rounded-xl shadow-lg z-20 font-normal leading-relaxed pointer-events-none">
                Define how the AI builds trust, credibility, and connection in every prompt.
              </div>
            </div>
          </div>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            Define how the AI builds trust, credibility, and connection in every prompt.
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

      {/* ── 1. What builds trust in this playbook? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What builds trust in this playbook?
        </label>
        <div className="relative">
          <textarea
            value={currentData.whatBuildsTrust}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("whatBuildsTrust", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.whatBuildsTrust || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 2. How should AI establish credibility? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should AI establish credibility?
        </label>
        <div className="relative">
          <textarea
            value={currentData.howEstablishCredibility}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("howEstablishCredibility", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.howEstablishCredibility || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 3. How should AI show empathy? ── */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          How should AI show empathy?
        </label>
        <div className="relative">
          <textarea
            value={currentData.howShowEmpathy}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                handleFieldChange("howShowEmpathy", e.target.value);
              }
            }}
            rows={2}
            maxLength={300}
            className="w-full px-3.5 py-2.5 pb-6 rounded-xl border border-light-gray bg-white text-xs sm:text-[13px] text-dark-black focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-2 text-[10px] sm:text-[11px] font-medium text-medium-black/70 pointer-events-none">
            {(currentData.howShowEmpathy || "").length}/300
          </div>
        </div>
      </div>

      {/* ── 4. What should AI avoid that destroys trust? ── */}
      <div className="space-y-2.5">
        <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
          What should AI avoid that destroys trust?
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.avoidTrustDestroyers || []).map((item, idx) => (
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

      {/* ── 5. Trust Signals to Weave Into Prompts ── */}
      <div className="space-y-2.5">
        <div className="flex items-baseline gap-1.5">
          <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Trust Signals to Weave Into Prompts
          </label>
          <span className="text-[11px] text-medium-black font-normal">
            (select all that apply)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(currentData.trustSignals || []).map((sig) => {
            const isSelected = (currentData.selectedSignals || []).includes(sig);

            return (
              <button
                key={sig}
                type="button"
                onClick={() => handleToggleSignal(sig)}
                className={`py-1.5 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? "bg-teal-50/70 border-primary/40 text-primary font-semibold"
                    : "bg-white hover:bg-light-gray/40 border-light-gray text-medium-black hover:text-dark-black"
                }`}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-primary stroke-[2.5] shrink-0" />
                )}
                <span>{sig}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSignalModalOpen(true)}
            className="py-1.5 px-2.5 rounded-xl border border-light-gray hover:border-primary/40 text-xs font-semibold text-primary hover:bg-teal-50/60 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
        </div>
      </div>

      {/* ── 6. Trust Principles (Card List) ── */}
      <div className="space-y-3 pt-1">
        <div className="flex items-baseline gap-1.5">
          <label className="block text-xs sm:text-[13px] font-bold text-dark-black font-secondary">
            Trust Principles
          </label>
          <span className="text-[11px] text-medium-black font-normal">
            (These guide the AI in every conversation)
          </span>
        </div>

        <div className="space-y-2.5">
          {(currentData.trustPrinciples || []).map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-xl border border-light-gray bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-medium-black/20 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <GripVertical className="w-4 h-4 text-light-black cursor-grab shrink-0" />
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-primary flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs sm:text-[13px] text-dark-black font-medium truncate">
                  {p.text}
                </span>
              </div>

              <button
                type="button"
                className="text-light-black hover:text-dark-black p-1 rounded-lg transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPrincipleModalOpen(true)}
          className="w-full py-2.5 px-4 rounded-xl border border-light-gray hover:border-primary/40 hover:bg-teal-50/50 bg-white text-xs font-semibold text-primary flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add More</span>
        </button>
      </div>

      {/* Modals */}
      <AddPromptRuleModal
        isOpen={avoidModalOpen}
        onClose={() => setAvoidModalOpen(false)}
        onAdd={handleAddAvoid}
        type="avoid"
      />

      <AddCoachingPillarModal
        isOpen={signalModalOpen}
        onClose={() => setSignalModalOpen(false)}
        onAdd={handleAddSignal}
      />

      <AddCoachingPillarModal
        isOpen={principleModalOpen}
        onClose={() => setPrincipleModalOpen(false)}
        onAdd={handleAddPrinciple}
      />
    </div>
  );
};

export default TrustBuildingStyleSection;
