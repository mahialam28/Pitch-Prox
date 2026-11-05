"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Edit3,
  FileText,
  Mic,
  MessageSquare,
  ShieldAlert,
  Folder,
  Cpu,
  Sliders,
  ChevronRight,
  CheckCircle2,
  Check,
  TrendingUp,
  Target,
  Zap,
  ChevronDown,
  Lock,
  ArrowLeft,
} from "lucide-react";
import PublishedSuccessModal from "./published-success-modal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Who can use the playbook once published
const VISIBILITY_OPTIONS = [
  "Private — creator only",
  "Team Only — internal staff team",
  "Organization — whole company / brokerage",
  "Marketplace / Published — approved PitchProX playbooks",
];

export default function ReviewPublishSection({
  formData = {},
  onChange = () => {},
  onJumpToStep = () => {},
  onBack = () => {},
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState(
    formData.visibility || VISIBILITY_OPTIONS[1]
  );
  const [visibilityDropdownOpen, setVisibilityDropdownOpen] = useState(false);

  const playbookName = formData.playbookName || "FSBO Playbook";
  const leadTypesCount = formData.leadTypes?.length || 16;
  const stagesCount = formData.stages?.length || 7;
  const objectionsCount = formData.objections?.length || 16;
  const resourcesCount = formData.resources?.length || 12;
  const scriptsCount = (formData.resources || []).filter(
    (r) =>
      r.type === "Script" ||
      r.type === "Call Openers" ||
      r.type === "Objection Script"
  ).length || 8;

  const handleSelectVisibility = (option) => {
    setSelectedVisibility(option);
    onChange("visibility", option);
    setVisibilityDropdownOpen(false);
  };

  const router = useRouter();
  // Publishing returns to the playbook library
  const handlePublishClick = () => {
    toast.success("Playbook published successfully!");
    router.push("/super-admin/playbook");
  };

  // Quality check (out of 100) from how complete the playbook is
  const checks = [
    { label: "Lead types selected", ok: leadTypesCount >= 3, tip: "Select at least 3 lead types this playbook is best for." },
    { label: "Conversation stages", ok: stagesCount >= 5, tip: "Add the key stages from opening to close (5 or more)." },
    { label: "Objection coverage", ok: objectionsCount >= 10, tip: "Cover at least 10 common objections." },
    { label: "Resources & scripts", ok: resourcesCount >= 5 && scriptsCount >= 3, tip: "Attach scripts and resources reps can use mid-call." },
    { label: "Description & author", ok: Boolean(formData.shortDescription?.trim()), tip: "Write a clear short description." },
  ];
  const qualityScore = Math.round(60 + (checks.filter((check) => check.ok).length / checks.length) * 40) - (objectionsCount < 16 ? 4 : 0);
  const recommendations = [
    ...checks.filter((check) => !check.ok).map((check) => check.tip),
    "Add a closing script for the most common lead type to raise prompt adherence.",
    "Review objection responses for tone consistency with the selected style.",
  ].slice(0, 4);

  return (
    <div className="space-y-6">
      {/* ── 1. Top Banner: Playbook Ready for Review ── */}
      <div className="bg-white rounded-2xl border border-light-gray p-4 sm:p-5 shadow-sm flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
          <BookOpen className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-dark-black font-secondary">
            Playbook Ready for Review
          </h3>
          <p className="text-xs text-medium-black mt-0.5 font-normal">
            You&apos;ve completed all steps. Review the summary below before publishing.
          </p>
        </div>
      </div>

      {/* ── 2. Main Content Grid (Left 8 cols, Right 4 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: Playbook Summary ── */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-light-gray/60">
              <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">
                Playbook Summary
              </h2>
              <button
                type="button"
                onClick={() => onJumpToStep(1)}
                className="px-3.5 py-1.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-medium-black hover:text-dark-black text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer select-none"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Playbook</span>
              </button>
            </div>

            {/* List of 7 Section Summaries */}
            <div className="space-y-1.5">
              {/* Row 1: Basic Info */}
              <div
                onClick={() => onJumpToStep(1)}
                className="p-3.5 sm:p-4 rounded-xl border border-transparent hover:border-light-gray hover:bg-light-gray/30 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary group-hover:text-primary transition-colors">
                      Basic Info
                    </h4>
                    <p className="text-[11px] text-medium-black font-normal truncate mt-0.5">
                      Playbook name, audience, and description.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-dark-black font-secondary">
                      {playbookName}
                    </div>
                    <div className="text-[11px] text-medium-black">
                      {leadTypesCount} Lead Type{leadTypesCount > 1 ? "s" : ""}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-black group-hover:text-medium-black group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Row 2: Style & Voice */}
              <div
                onClick={() => onJumpToStep(2)}
                className="p-3.5 sm:p-4 rounded-xl border border-transparent hover:border-light-gray hover:bg-light-gray/30 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                    <Mic className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary group-hover:text-primary transition-colors">
                      Style &amp; Voice
                    </h4>
                    <p className="text-[11px] text-medium-black font-normal truncate mt-0.5">
                      Tone, personality, and communication style.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-dark-black font-secondary">
                      Confident, Conversational
                    </div>
                    <div className="text-[11px] text-medium-black">
                      Professional
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-black group-hover:text-medium-black group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Row 3: Conversation Flow */}
              <div
                onClick={() => onJumpToStep(3)}
                className="p-3.5 sm:p-4 rounded-xl border border-transparent hover:border-light-gray hover:bg-light-gray/30 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary group-hover:text-primary transition-colors">
                      Conversation Flow
                    </h4>
                    <p className="text-[11px] text-medium-black font-normal truncate mt-0.5">
                      Call stages and key conversation goals.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-dark-black font-secondary">
                      {stagesCount} Stages
                    </div>
                    <div className="text-[11px] text-medium-black">
                      Goal-Oriented
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-black group-hover:text-medium-black group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Row 4: Objection Handling */}
              <div
                onClick={() => onJumpToStep(4)}
                className="p-3.5 sm:p-4 rounded-xl border border-transparent hover:border-light-gray hover:bg-light-gray/30 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary group-hover:text-primary transition-colors">
                      Objection Handling
                    </h4>
                    <p className="text-[11px] text-medium-black font-normal truncate mt-0.5">
                      Objection tree and response variations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-dark-black font-secondary">
                      {objectionsCount} Lead Types
                    </div>
                    <div className="text-[11px] text-medium-black">
                      20+ Variations Each
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-black group-hover:text-medium-black group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Row 5: Resources & Scripts */}
              <div
                onClick={() => onJumpToStep(5)}
                className="p-3.5 sm:p-4 rounded-xl border border-transparent hover:border-light-gray hover:bg-light-gray/30 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                    <Folder className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary group-hover:text-primary transition-colors">
                      Resources &amp; Scripts
                    </h4>
                    <p className="text-[11px] text-medium-black font-normal truncate mt-0.5">
                      Approved resources and scripts.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-dark-black font-secondary">
                      {resourcesCount} Resources
                    </div>
                    <div className="text-[11px] text-medium-black">
                      {scriptsCount} Scripts
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-black group-hover:text-medium-black group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Row 6: AI Prompt Framework */}
              <div
                onClick={() => onJumpToStep(6)}
                className="p-3.5 sm:p-4 rounded-xl border border-transparent hover:border-light-gray hover:bg-light-gray/30 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary border border-teal-100 flex items-center justify-center shrink-0">
                    <Cpu className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary group-hover:text-primary transition-colors">
                      AI Prompt Framework
                    </h4>
                    <p className="text-[11px] text-medium-black font-normal truncate mt-0.5">
                      Logic, rules, prompt length, and guardrails.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-dark-black font-secondary">
                      Configured
                    </div>
                    <div className="text-[11px] text-medium-black">
                      All Settings Applied
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-black group-hover:text-medium-black group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Row 7: Advanced Settings */}
              <div
                onClick={() => onJumpToStep(6)}
                className="p-3.5 sm:p-4 rounded-xl border border-transparent hover:border-light-gray hover:bg-light-gray/30 flex items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-[13px] font-bold text-dark-black font-secondary group-hover:text-primary transition-colors">
                      Advanced Settings
                    </h4>
                    <p className="text-[11px] text-medium-black font-normal truncate mt-0.5">
                      Fine-tuned behaviors and thresholds.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-dark-black font-secondary">
                      6 Settings
                    </div>
                    <div className="text-[11px] text-medium-black">
                      Optimized
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-light-black group-hover:text-medium-black group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quality Check & AI recommendations (under the summary) ── */}
        <div className="lg:col-span-8 lg:row-start-2">
          <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-light-gray/60">
              <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">Quality Check</h2>
              <span className="text-2xl font-bold text-primary font-secondary">{qualityScore}<span className="text-sm text-light-black font-semibold">/100</span></span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {checks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-xs font-medium text-dark-black/80">
                  <span className={`w-2 h-2 rounded-full ${check.ok ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {check.label}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-sm font-bold text-dark-black mb-2">AI Recommendations</h3>
              <ul className="space-y-1.5 text-xs text-medium-black list-disc pl-4">
                {recommendations.map((tip) => <li key={tip}>{tip}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Review Checklist, Impact Preview, Publish Card ── */}
        <div className="lg:col-span-4 lg:row-start-1 lg:row-span-2 lg:col-start-9 space-y-6">
          {/* Card 1: Review Checklist */}
          <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                <h3 className="text-xs sm:text-sm font-bold text-dark-black font-secondary">
                  Review Checklist
                </h3>
              </div>
              <span className="text-xs font-bold text-dark-black font-secondary">
                7/7
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-dark-black font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>All sections completed</span>
                </div>
                <span className="text-[11px] text-medium-black shrink-0">
                  Completed
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-dark-black font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Playbook preview tested</span>
                </div>
                <span className="text-[11px] text-medium-black shrink-0">
                  Completed
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-dark-black font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Logic and rules configured</span>
                </div>
                <span className="text-[11px] text-medium-black shrink-0">
                  Completed
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-dark-black font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Guardrails and safety set</span>
                </div>
                <span className="text-[11px] text-medium-black shrink-0">
                  Completed
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-dark-black font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Advanced settings reviewed</span>
                </div>
                <span className="text-[11px] text-medium-black shrink-0">
                  Completed
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Playbook Impact Preview */}
          <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-3.5">
            <h3 className="text-xs sm:text-sm font-bold text-dark-black font-secondary">
              Playbook Impact Preview
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-sm font-secondary">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+35%</span>
                </div>
                <div className="text-[10px] text-emerald-700/80 leading-tight">
                  Expected Trust Gain
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1">
                <div className="flex items-center justify-center gap-1 text-purple-700 font-bold text-sm font-secondary">
                  <Target className="w-3.5 h-3.5 text-purple-600" />
                  <span>+28%</span>
                </div>
                <div className="text-[10px] text-purple-700/80 leading-tight">
                  Objection Conversion
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 space-y-1">
                <div className="flex items-center justify-center gap-1 text-amber-700 font-bold text-sm font-secondary">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>+40%</span>
                </div>
                <div className="text-[10px] text-amber-700/80 leading-tight">
                  Prompt Effectiveness
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Publish Playbook Card */}
          <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary border border-teal-200/70 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                <span className="text-sm font-secondary">A</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-dark-black font-secondary">
                  Publish Playbook
                </h3>
                <p className="text-[11px] text-medium-black mt-0.5 truncate">
                  Make this playbook available to your team.
                </p>
              </div>
            </div>

            {/* Visibility Selector */}
            <div className="space-y-1.5 relative">
              <label className="block text-xs font-semibold text-dark-black">
                Visibility
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setVisibilityDropdownOpen(!visibilityDropdownOpen)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray hover:border-medium-black/30 bg-white text-xs font-medium text-dark-black flex items-center justify-between cursor-pointer shadow-2xs transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-medium-black font-normal">👥</span>
                    <span>{selectedVisibility}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-medium-black" />
                </button>

                {visibilityDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-lg z-20 py-1.5 space-y-0.5">
                    {VISIBILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectVisibility(opt)}
                        className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          selectedVisibility === opt
                            ? "bg-teal-50 text-primary font-semibold"
                            : "text-dark-black hover:bg-light-gray/50"
                        }`}
                      >
                        <span>{opt}</span>
                        {selectedVisibility === opt && (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handlePublishClick}
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-medium-teal text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer select-none"
            >
              <span className="text-[10px]">▲</span>
              <span>Publish Playbook</span>
            </button>

            {/* Footer note */}
            <div className="text-center text-[11px] text-medium-black flex items-center justify-center gap-1.5 pt-0.5">
              <Lock className="w-3 h-3 text-medium-black/70" />
              <span>You can always edit and republish later.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Published Success Modal ── */}
      <PublishedSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        formData={{
          ...formData,
          visibility: selectedVisibility,
        }}
        onPreview={() => {
          setModalOpen(false);
          toast.success("Opening live simulator preview...");
        }}
        onManageAccess={() => {
          toast.success("Opening access permissions...");
        }}
        onViewDetails={() => {
          toast.success("Viewing publication audit logs...");
        }}
      />
    </div>
  );
}
