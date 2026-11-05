"use client";

import React from "react";
import {
  FileText,
  Pencil,
  Mic,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Eye,
  User,
  Bookmark,
  Building2,
  Users,
  Award,
  Check,
} from "lucide-react";
import Text from "@/components/texts/text";

// What makes a playbook complete enough for the AI to coach well
const completenessChecks = (formData, phases, objections) => [
  Boolean(formData.playbookName?.trim()),
  Boolean(formData.shortDescription?.trim()),
  (formData.leadType || []).length > 0,
  Boolean(formData.experienceLevel),
  Boolean(formData.voiceDescription?.trim()),
  Boolean(formData.corePhilosophy?.trim() || formData.corePrinciples?.trim()),
  Boolean(formData.selectedGoal),
  Boolean(formData.communicationStyle),
  phases.length >= 3,
  objections.length >= 3,
];

const StepFive = ({ formData, phases = [], objections = [], frameworkSteps = [], status, saving, onBack, onComplete, onGoToStep }) => {
  const leadTypes = formData.leadType || [];
  const checks = completenessChecks(formData, phases, objections);
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const scoreLabel = score >= 85 ? "Excellent" : score >= 60 ? "Good" : "Needs more detail";
  const name = formData.playbookName?.trim() || "Untitled playbook";
  const initials = name.split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
  const actionLabel = status === "published" ? "Save Changes" : "Create Playbook";

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header & Meta Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <Text variant="regular" className="font-bold">
                    Playbook Summary
                  </Text>
                  <Text variant="smaller" className="mt-0.5">
                    Here&apos;s a summary of your custom playbook.
                  </Text>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onGoToStep && onGoToStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-primary text-primary rounded-xl font-semibold text-xs hover:bg-primary/5 transition cursor-pointer shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit All Sections
              </button>
            </div>

            {/* Playbook Meta Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div>
                <Text variant="extraSmall" className="!font-bold !text-light-black tracking-wider uppercase flex items-center gap-1">
                  <Bookmark className="w-3 h-3" /> PLAYBOOK NAME
                </Text>
                <Text variant="small" className="!font-bold !text-dark-black mt-1">
                  {name}
                </Text>
                <span className="inline-block mt-1 px-2 py-0.5 bg-light-gray text-medium-black text-[10px] font-semibold rounded-md">
                  Custom
                </span>
              </div>

              <div>
                <Text variant="extraSmall" className="!font-bold !text-light-black tracking-wider uppercase flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> INDUSTRY / NICHE
                </Text>
                <Text variant="small" className="!font-bold !text-dark-black mt-1">
                  {formData.industry || "Not set"}
                </Text>
              </div>

              <div>
                <Text variant="extraSmall" className="!font-bold !text-light-black tracking-wider uppercase flex items-center gap-1">
                  <Users className="w-3 h-3" /> BEST FOR LEAD TYPES
                </Text>
                <Text variant="small" className="!font-bold !text-dark-black mt-1 leading-snug">
                  {leadTypes.slice(0, 3).join(", ") || "Not set"}
                </Text>
                {leadTypes.length > 3 && (
                  <Text variant="extraSmall" className="!font-bold !text-primary">+{leadTypes.length - 3} more</Text>
                )}
              </div>

              <div>
                <Text variant="extraSmall" className="!font-bold !text-light-black tracking-wider uppercase flex items-center gap-1">
                  <Award className="w-3 h-3" /> EXPERIENCE LEVEL
                </Text>
                <Text variant="small" className="!font-bold !text-dark-black mt-1">
                  {formData.experienceLevel || "Not set"}
                </Text>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-light-gray items-center gap-1.5">
              <Text variant="smaller" className="!font-medium text-light-black flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                CREATED BY: <span className="!font-bold !text-dark-black">You</span>
              </Text>
            </div>
          </div>

          {/* Basic Information Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-light-gray shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-light-gray text-medium-black rounded-xl shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <Text variant="small" className="!font-bold !text-dark-black">
                  Basic Information
                </Text>
                <Text variant="smaller" className="text-light-black mt-0.5">
                  Name, description, industry, lead types, experience level
                </Text>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep && onGoToStep(1)}
              className="p-1.5 text-light-black hover:text-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Your Style Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-light-gray shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-light-gray text-medium-black rounded-xl shrink-0">
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <Text variant="small" className="!font-bold !text-dark-black">Your Style</Text>
                <Text variant="smaller" className="text-medium-black mt-0.5 font-medium">
                  Tone: <span className="!font-semibold !text-dark-black">{formData.tone || "Confident"}</span> &bull; Style: <span className="!font-semibold !text-dark-black">{formData.communicationStyle || "Not set"}</span> &bull; Language: <span className="!font-semibold !text-dark-black">{formData.formality || "Not set"}</span>
                </Text>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep && onGoToStep(2)}
              className="p-1.5 text-light-black hover:text-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Conversation Flow Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-light-gray shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-light-gray text-medium-black rounded-xl shrink-0">
                <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <Text variant="small" className="!font-bold !text-dark-black">
                  Conversation Flow
                </Text>
                <Text variant="smaller" className="text-light-black mt-0.5">
                  {phases.length
                    ? `${phases.length} stage${phases.length === 1 ? "" : "s"} defined, from ${phases[0].title} to ${phases[phases.length - 1].title}`
                    : "No stages defined yet"}
                </Text>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep && onGoToStep(3)}
              className="p-1.5 text-light-black hover:text-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Objection Handling Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-light-gray shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-light-gray text-medium-black rounded-xl shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <Text variant="small" className="!font-bold !text-dark-black">
                  Objection Handling
                </Text>
                <Text variant="smaller" className="text-medium-black mt-0.5 font-medium">
                  {objections.length} objection{objections.length === 1 ? "" : "s"} added &bull; Framework: <span className="!font-semibold !text-dark-black">{frameworkSteps.map((step) => step.label).join(" → ") || "Not set"}</span>
                </Text>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep && onGoToStep(4)}
              className="p-1.5 text-light-black hover:text-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quality Check Score Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-light-gray shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <Text variant="regular" className="font-bold !text-dark-black text-sm sm:text-base">
                  Quality Check
                </Text>
                <Text variant="smaller" className="text-light-black mt-0.5">
                  {score >= 85
                    ? "Great job! Your playbook is complete and ready to use."
                    : "Fill in the remaining sections so the AI has more to work with."}
                </Text>
              </div>
            </div>

            <div className="text-right w-full sm:w-auto">
              <div className="text-2xl sm:text-3xl font-black text-green leading-none">
                {score} <span className="text-xs sm:text-sm text-light-black font-medium">/100</span>
              </div>
              <Text variant="extraSmall" className="!font-bold !text-light-black tracking-wider uppercase block mt-0.5 sm:mt-1">
                COMPLETENESS SCORE
              </Text>
              <Text variant="smaller" className="!font-bold !text-green block mt-0.5">
                {scoreLabel}
              </Text>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN */}
        <div className="space-y-6">
          {/* Playbook Preview Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <Text variant="regular" className="font-bold !text-primary">
                Playbook Preview
              </Text>
            </div>
            <Text variant="small" className="text-light-black">
              This is how your playbook will appear.
            </Text>

            {/* Inner Card */}
            <div className="p-4 rounded-xl bg-light-gray/60 border border-light-gray flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-light-gray text-medium-black font-bold text-sm flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Text variant="smaller" className="!font-bold !text-dark-black">
                    {name}
                  </Text>
                  <span className="px-1.5 py-0.5 bg-light-gray text-medium-black font-bold text-[10px] rounded uppercase">
                    {status === "published" ? "PUBLISHED" : "DRAFT"}
                  </span>
                </div>
                <Text variant="smaller" className="text-light-black">{formData.shortDescription || "Custom Playbook"}</Text>
              </div>
            </div>

            {/* Preview Stage List */}
            <div className="space-y-2.5 pt-1">
              {phases.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.id ?? index}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${stage.color || "text-emerald-500 bg-emerald-50"}`}>
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <Text variant="extraSmall" className="!font-medium text-light-black">{index + 1}</Text>
                      <Text variant="smaller" className="!font-semibold !text-dark-black">
                        {stage.title}
                      </Text>
                    </div>
                    <Text variant="extraSmall" className="!font-medium text-medium-black px-2 py-0.5 bg-light-gray rounded-md">
                      {stage.badgeGoal || stage.goal}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What Happens Next Card */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <Text variant="regular" className="font-bold">
                  What Happens Next?
                </Text>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                "Your playbook will be active immediately after creation.",
                "You can switch or edit your playbook anytime.",
                "PitchProX will tailor prompts to your style in real time.",
              ].map((text, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <Text variant="small" className="text-medium-black font-medium leading-relaxed">
                    {text}
                  </Text>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Callout Box */}
          <div className="p-5 bg-light-teal/40 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <Text variant="small" className="!font-bold !text-dark-black flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary stroke-[3]" /> Ready to Power Your Calls!
              </Text>
              <Text variant="smaller" className="text-medium-black">
                Create your playbook and start closing more deals.
              </Text>
            </div>

            <button
              type="button"
              onClick={onComplete}
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-medium-teal text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              {saving ? "Saving…" : actionLabel} <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Navigation Bar ── */}
      <div className="w-full flex items-center justify-between gap-4 pt-4 border-t border-light-gray">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-light-gray rounded-xl text-sm font-semibold text-dark-black/80 hover:bg-light-gray transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-medium-black" />
              Back
            </button>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={onComplete}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white font-semibold text-sm shadow-sm transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {saving ? "Saving…" : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepFive;