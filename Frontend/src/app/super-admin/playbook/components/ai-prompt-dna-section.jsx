"use client";

import React, { useState } from "react";
import {
  Award,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Zap,
  Target,
  Sliders,
} from "lucide-react";
import AddDnaPillarModal from "./add-dna-pillar-modal";

const CORE_IDENTITIES = [
  {
    id: "high-authority-closer",
    title: "High-Authority Closer",
    subtitle: "Herjavec Methodology",
    description: "Direct, confident, value-anchored. Projects unshakeable authority and certainty.",
  },
  {
    id: "diagnostic-consultant",
    title: "Diagnostic Consultant",
    subtitle: "SPIN / Consultative",
    description: "Deep inquiry, strategic question frameworks, problem-first discovery.",
  },
  {
    id: "relational-advisor",
    title: "Relational Trusted Advisor",
    subtitle: "Relationship-First",
    description: "High empathy, warm rapport building, long-term trust and transparency.",
  },
  {
    id: "challenger-disruptor",
    title: "Challenger Disruptor",
    subtitle: "Challenger Sales",
    description: "Teaches new insights, tailors for resonance, takes control of the deal.",
  },
];

const PROSPECT_MODIFIERS = [
  { mood: "Skeptical / Guarded", action: "Instantly switch to heavy social proof and low-pressure validation." },
  { mood: "Rushed / Impatient", action: "Compress prompts into 5-word bottom-line summaries with zero fluff." },
  { mood: "Analytical / Data-Driven", action: "Inject quantitative ROI metrics, timelines, and verified case data." },
  { mood: "Dominant / High-Ego", action: "Frame solutions as prospect's idea; ask high-level strategic questions." },
];

const AiPromptDnaSection = ({
  formData = {},
  onChange = () => {},
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState(null);

  const coreIdentity = formData.coreIdentity || "high-authority-closer";
  const dnaDirectness = formData.dnaDirectness !== undefined ? formData.dnaDirectness : 85;
  const dnaEmpathy = formData.dnaEmpathy !== undefined ? formData.dnaEmpathy : 70;
  const dnaUrgency = formData.dnaUrgency !== undefined ? formData.dnaUrgency : 90;
  const dnaAuthority = formData.dnaAuthority !== undefined ? formData.dnaAuthority : 95;

  const dnaPillars = formData.dnaPillars || [
    {
      id: 1,
      title: "Value Before Price",
      description: "Never anchor to numbers before establishing total value and ROI.",
    },
    {
      id: 2,
      title: "Diagnose Root Urgency",
      description: "Uncover why they are acting today vs waiting 6 months.",
    },
    {
      id: 3,
      title: "Relentless Follow-Through",
      description: "Every conversation must conclude with a locked-in next step.",
    },
  ];

  const handleSavePillar = (pillar) => {
    if (editingPillar) {
      const updated = dnaPillars.map((p) => (p.id === pillar.id ? pillar : p));
      onChange("dnaPillars", updated);
    } else {
      onChange("dnaPillars", [...dnaPillars, pillar]);
    }
  };

  const handleDeletePillar = (id) => {
    onChange("dnaPillars", dnaPillars.filter((p) => p.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-7">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
          Playbook Prompt DNA
        </h2>
        <p className="text-xs text-medium-black mt-0.5 font-normal">
          Incorporate the core voice, psychological posture, and strategic personality layer into every generated prompt.
        </p>
      </div>

      {/* 1. Core Strategic Identity Archetype */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary uppercase tracking-wider">
            Strategic Identity Archetype
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {CORE_IDENTITIES.map((identity) => {
            const isSelected = coreIdentity === identity.id;
            return (
              <div
                key={identity.id}
                onClick={() => onChange("coreIdentity", identity.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none space-y-1.5 flex flex-col justify-between ${
                  isSelected
                    ? "border-primary bg-teal-50/40 ring-2 ring-primary/20"
                    : "border-light-gray bg-white hover:border-light-black/30"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-dark-black/90 font-secondary">
                      {identity.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full bg-white border border-teal-200">
                      {identity.subtitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-light-black font-normal mt-1 leading-relaxed">
                    {identity.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Personality Dimensions Sliders */}
      <div className="space-y-4 pt-2 border-t border-light-gray">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary uppercase tracking-wider">
            Personality Dimension Weights
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Authority */}
          <div className="p-3.5 rounded-xl border border-light-gray bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-dark-black/80">Commercial Authority</label>
              <span className="font-bold text-primary">{dnaAuthority}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={dnaAuthority}
              onChange={(e) => onChange("dnaAuthority", parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer h-1.5 bg-light-gray rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-light-black">
              <span>Cooperative</span>
              <span>Commanding Authority</span>
            </div>
          </div>

          {/* Urgency */}
          <div className="p-3.5 rounded-xl border border-light-gray bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-dark-black/80">Urgency & Conviction</label>
              <span className="font-bold text-primary">{dnaUrgency}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={dnaUrgency}
              onChange={(e) => onChange("dnaUrgency", parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer h-1.5 bg-light-gray rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-light-black">
              <span>Patient & Relaxed</span>
              <span>High Deal Urgency</span>
            </div>
          </div>

          {/* Directness */}
          <div className="p-3.5 rounded-xl border border-light-gray bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-dark-black/80">Directness & Candor</label>
              <span className="font-bold text-primary">{dnaDirectness}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={dnaDirectness}
              onChange={(e) => onChange("dnaDirectness", parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer h-1.5 bg-light-gray rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-light-black">
              <span>Gentle & Indirect</span>
              <span>No-Nonsense Direct</span>
            </div>
          </div>

          {/* Empathy */}
          <div className="p-3.5 rounded-xl border border-light-gray bg-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-dark-black/80">Empathy & Active Listening</label>
              <span className="font-bold text-primary">{dnaEmpathy}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={dnaEmpathy}
              onChange={(e) => onChange("dnaEmpathy", parseInt(e.target.value))}
              className="w-full accent-primary cursor-pointer h-1.5 bg-light-gray rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-light-black">
              <span>Task Focused</span>
              <span>Deeply Validating</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Core DNA Pillars */}
      <div className="space-y-3.5 pt-2 border-t border-light-gray">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h3 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary uppercase tracking-wider">
              Core DNA Pillars & Selling Tenets
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingPillar(null);
              setModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Pillar</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {dnaPillars.map((pillar, idx) => (
            <div
              key={pillar.id}
              className="p-3.5 rounded-xl border border-light-gray hover:border-light-black/30 bg-white flex items-start justify-between gap-3 transition-all"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-dark-black/90 font-secondary">
                    {pillar.title}
                  </h4>
                  <p className="text-[11px] text-light-black mt-0.5 leading-relaxed font-normal">
                    {pillar.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPillar(pillar);
                    setModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-medium-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
                  title="Edit Pillar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePillar(pillar.id)}
                  className="p-1.5 rounded-lg text-medium-black hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Pillar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Dynamic Voice Modifiers */}
      <div className="space-y-3 pt-2 border-t border-light-gray">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary uppercase tracking-wider">
            Real-Time Prospect Mood Adaptations
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROSPECT_MODIFIERS.map((m, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-light-gray bg-light-gray/20 space-y-1"
            >
              <span className="text-xs font-bold text-dark-black/90 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-primary" />
                <span>When: {m.mood}</span>
              </span>
              <p className="text-[11px] text-medium-black leading-snug">
                {m.action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Pillar Modal */}
      <AddDnaPillarModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePillar}
        editPillar={editingPillar}
      />
    </div>
  );
};

export default AiPromptDnaSection;
