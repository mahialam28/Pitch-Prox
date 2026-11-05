"use client";

import React from "react";
import {
  SlidersHorizontal,
  Zap,
  Eye,
  TrendingUp,
  Clock,
  Database,
} from "lucide-react";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";

const TIMING_OPTIONS = [
  { value: "Fast", label: "Fast" },
  { value: "Balanced", label: "Balanced" },
  { value: "Deliberate", label: "Deliberate" },
  { value: "Conservative", label: "Conservative" },
];

const EMOTION_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Adaptive", label: "Adaptive" },
];

const OBJECTION_CONFIDENCE_OPTIONS = [
  { value: "50%", label: "50%" },
  { value: "60%", label: "60%" },
  { value: "70%", label: "70%" },
  { value: "80%", label: "80%" },
  { value: "90%", label: "90%" },
];

const TRUST_ALERT_OPTIONS = [
  { value: "20 / 100", label: "20 / 100" },
  { value: "30 / 100", label: "30 / 100" },
  { value: "40 / 100", label: "40 / 100" },
  { value: "50 / 100", label: "50 / 100" },
];

const COOLDOWN_OPTIONS = [
  { value: "3 seconds", label: "3 seconds" },
  { value: "5 seconds", label: "5 seconds" },
  { value: "10 seconds", label: "10 seconds" },
  { value: "15 seconds", label: "15 seconds" },
  { value: "30 seconds", label: "30 seconds" },
];

const AiAdvancedSettingsCard = ({
  formData = {},
  onChange = () => {},
}) => {
  const timingSensitivity = formData.timingSensitivity || "Balanced";
  const emotionSensitivity = formData.emotionSensitivity || "Medium";
  const objectionConfidence = formData.objectionConfidence || "70%";
  const trustAlertThreshold = formData.trustAlertThreshold || "30 / 100";
  const promptCooldown = formData.promptCooldown || "5 seconds";
  const enableLearningMode = formData.enableLearningMode !== undefined ? formData.enableLearningMode : true;

  const handleUpdate = (field, val) => {
    onChange({
      ...formData,
      [field]: val,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-dark-black/80 font-secondary">
          Advanced Settings
        </h2>
        <p className="text-xs text-medium-black mt-0.5 font-normal">
          Fine-tune advanced behaviors to optimize prompt delivery and coaching accuracy.
        </p>
      </div>

      {/* Settings List */}
      <div className="space-y-3.5">
        {/* 1. Prompt Timing Sensitivity */}
        <div className="rounded-xl border border-light-gray p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:border-light-black/30 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary">
                Prompt Timing Sensitivity
              </h4>
              <p className="text-[11px] text-light-black font-normal mt-0.5">
                Control how quickly AI responds after detecting cues.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <SettingsDropdown
              label="Select Timing"
              items={TIMING_OPTIONS}
              selected={timingSensitivity}
              onSelect={(val) => handleUpdate("timingSensitivity", val)}
              className="w-full"
            />
          </div>
        </div>

        {/* 2. Emotion Sensitivity */}
        <div className="rounded-xl border border-light-gray p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:border-light-black/30 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary">
                Emotion Sensitivity
              </h4>
              <p className="text-[11px] text-light-black font-normal mt-0.5">
                Adjust how strongly AI reacts to emotional changes.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <SettingsDropdown
              label="Select Sensitivity"
              items={EMOTION_OPTIONS}
              selected={emotionSensitivity}
              onSelect={(val) => handleUpdate("emotionSensitivity", val)}
              className="w-full"
            />
          </div>
        </div>

        {/* 3. Objection Confidence Threshold */}
        <div className="rounded-xl border border-light-gray p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:border-light-black/30 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary">
                Objection Confidence Threshold
              </h4>
              <p className="text-[11px] text-light-black font-normal mt-0.5">
                Set the confidence level required to trigger objection flow.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <SettingsDropdown
              label="Select Threshold"
              items={OBJECTION_CONFIDENCE_OPTIONS}
              selected={objectionConfidence}
              onSelect={(val) => handleUpdate("objectionConfidence", val)}
              className="w-full"
            />
          </div>
        </div>

        {/* 4. Trust Alert Threshold */}
        <div className="rounded-xl border border-light-gray p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:border-light-black/30 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary">
                Trust Alert Threshold
              </h4>
              <p className="text-[11px] text-light-black font-normal mt-0.5">
                Get notified when trust score drops below this level.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <SettingsDropdown
              label="Select Alert Level"
              items={TRUST_ALERT_OPTIONS}
              selected={trustAlertThreshold}
              onSelect={(val) => handleUpdate("trustAlertThreshold", val)}
              className="w-full"
            />
          </div>
        </div>

        {/* 5. Prompt Cooldown */}
        <div className="rounded-xl border border-light-gray p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:border-light-black/30 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary">
                Prompt Cooldown
              </h4>
              <p className="text-[11px] text-light-black font-normal mt-0.5">
                Minimum time between AI prompts.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-44 shrink-0">
            <SettingsDropdown
              label="Select Cooldown"
              items={COOLDOWN_OPTIONS}
              selected={promptCooldown}
              onSelect={(val) => handleUpdate("promptCooldown", val)}
              className="w-full"
            />
          </div>
        </div>

        {/* 6. Enable Learning Mode */}
        <div className="rounded-xl border border-light-gray p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white hover:border-light-black/30 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 font-secondary">
                Enable Learning Mode
              </h4>
              <p className="text-[11px] text-light-black font-normal mt-0.5">
                Allow AI to learn from new objections and responses.
              </p>
            </div>
          </div>

          {/* Switch toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={enableLearningMode}
            onClick={() => handleUpdate("enableLearningMode", !enableLearningMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enableLearningMode ? "bg-primary" : "bg-light-gray border-light-gray"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                enableLearningMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAdvancedSettingsCard;
