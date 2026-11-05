"use client";

import React, { useCallback } from "react";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";

const communicationStyles = [
  { value: "consultative", label: "Consultative" },
  { value: "direct", label: "Direct" },
  { value: "analytical", label: "Analytical" },
  { value: "expressive", label: "Expressive" },
  { value: "decisive", label: "Decisive" },
  { value: "advisory", label: "Advisory" },
  { value: "insight-led", label: "Insight-Led" },
  { value: "question-led", label: "Question-Led" },
];

const sentenceStyles = [
  { value: "short-conversational", label: "Short & Conversational" },
  { value: "concise-punchy", label: "Concise & Punchy" },
  { value: "balanced-natural", label: "Balanced & Natural" },
  { value: "detailed-structured", label: "Detailed & Structured" },
  { value: "story-driven", label: "Story-Driven" },
];

const formalityOptions = [
  { value: "casual", label: "Casual" },
  { value: "conversational", label: "Conversational" },
  { value: "professional", label: "Professional" },
  { value: "executive", label: "Executive" },
];

const CommunicationStyleControls = ({
  communicationStyle = "consultative",
  sentenceStyle = "short-conversational",
  formality = "professional",
  energyLevel = 95,
  useOfHumor = 25,
  onChange = () => {},
}) => {
  const rangeFill = useCallback((val, min = 0, max = 100) => {
    const pct = ((val - min) / (max - min)) * 100;
    return `linear-gradient(to right, #0EADAB 0%, #0EADAB ${pct}%, #E5E7EB ${pct}%, #E5E7EB 100%)`;
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-start">
      {/* LEFT COLUMN: Style Dropdowns */}
      <div className="space-y-4">
        {/* Primary Communication Style */}
        <div>
          <label className="block text-xs font-medium text-medium-black mb-1.5">
            Primary Communication Style
          </label>
          <SettingsDropdown
            label="Select Style"
            items={communicationStyles}
            selected={communicationStyle}
            onSelect={(val) => onChange("communicationStyle", val)}
            className="w-full"
          />
          <p className="text-[11px] text-light-black font-normal mt-1">
            How the AI should guide conversations.
          </p>
        </div>

        {/* Sentence Style */}
        <div>
          <label className="block text-xs font-medium text-medium-black mb-1.5">
            Sentence Style
          </label>
          <SettingsDropdown
            label="Select Sentence Style"
            items={sentenceStyles}
            selected={sentenceStyle}
            onSelect={(val) => onChange("sentenceStyle", val)}
            className="w-full"
          />
          <p className="text-[11px] text-light-black font-normal mt-1">
            How the AI prompts should be structured.
          </p>
        </div>

        {/* Formality */}
        <div>
          <label className="block text-xs font-medium text-medium-black mb-1.5">
            Formality
          </label>
          <SettingsDropdown
            label="Select Formality"
            items={formalityOptions}
            selected={formality}
            onSelect={(val) => onChange("formality", val)}
            className="w-full"
          />
          <p className="text-[11px] text-light-black font-normal mt-1">
            Level of formality in language.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Sliders */}
      <div className="space-y-6 pt-1">
        {/* Energy Level Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-medium-black">
              Energy Level
            </label>
            <span className="text-xs font-semibold text-primary">
              {energyLevel}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={energyLevel}
            onChange={(e) => onChange("energyLevel", Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-xs [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-xs [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
            style={{ background: rangeFill(energyLevel) }}
          />

          <div className="flex justify-between text-[10px] font-normal text-light-black">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
          <p className="text-[11px] text-light-black font-normal mt-0.5">
            How energetic and assertive prompts should feel.
          </p>
        </div>

        {/* Use of Humor Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-medium-black">
              Use of Humor
            </label>
            <span className="text-xs font-semibold text-primary">
              {useOfHumor}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={useOfHumor}
            onChange={(e) => onChange("useOfHumor", Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-xs [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-xs [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
            style={{ background: rangeFill(useOfHumor) }}
          />

          <div className="flex justify-between text-[10px] font-normal text-light-black">
            <span>None</span>
            <span>Light</span>
            <span>Moderate</span>
          </div>
          <p className="text-[11px] text-light-black font-normal mt-0.5">
            How much humor the AI can use.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunicationStyleControls;
