"use client";

import React, { useState } from "react";
import { Eye, RotateCcw } from "lucide-react";
import Text from "@/components/texts/text";

// "Herjavec Sales Method" → "HS"
const initialsOf = (name) => String(name || "P").trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "P";

const samplePrompts = [
  "Hey there, I've got you.\n\nI'll keep it direct, confident, and focused on what matters most to them.\n\nLet's build real trust and get to what will move this conversation forward.",
  "Great setup! Notice they hesitated on pricing. Keep your tone calm and authoritative.\n\nAsk: 'What specific outcome would make this an absolute no-brainer for your team this quarter?'",
  "They're interested in the valuation methodology. Anchor on authority and value.\n\nHighlight our track record before presenting the acquisition timeline.",
];

const LiveStylePreviewCard = ({
  playbookName = "",
  creatorName = "PitchProX",
  avatarUrl = null,
  accessType = "premium",
  tones = ["Confident", "Direct", "Consultative", "Professional", "High Energy", "Low Humor"],
}) => {
  const [promptIndex, setPromptIndex] = useState(0);

  const handleRegenerate = () => {
    setPromptIndex((prev) => (prev + 1) % samplePrompts.length);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
          <Eye className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
            Live Style Preview
          </h3>
          <p className="text-[11px] text-light-black font-normal mt-0.5">
            See how the AI will sound using this style.
          </p>
        </div>
      </div>

      {/* Creator Profile & Badges */}
      <div className="rounded-2xl border border-light-gray bg-white p-4 space-y-3.5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-light-gray">
            {avatarUrl ? (
              <img src={avatarUrl} alt={creatorName} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center bg-dark-black text-white text-xs font-bold">
                {initialsOf(playbookName || creatorName)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            {accessType === "premium" && (
              <span className="text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800">
                PREMIUM
              </span>
            )}
            <h4 className="text-xs font-bold text-dark-black/90 truncate font-secondary mt-0.5">
              {playbookName}
            </h4>
            <span className="text-[11px] text-medium-black font-normal truncate block">
              By {creatorName}
            </span>
          </div>
        </div>

        {/* Tone Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tones.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-light-gray text-medium-black text-[10px] font-medium rounded-md border border-light-gray"
            >
              {t}
            </span>
          ))}
        </div>

        {/* AI Prompt Preview Box */}
        <div className="p-3.5 rounded-xl bg-light-gray/40 border border-light-gray space-y-2.5">
          <span className="text-[10px] font-bold text-dark-black/70 tracking-wider uppercase block">
            AI Prompt Preview
          </span>
          <p className="text-xs text-dark-black/80 font-normal leading-relaxed whitespace-pre-line font-secondary">
            {samplePrompts[promptIndex]}
          </p>

          <button
            type="button"
            onClick={handleRegenerate}
            className="w-full py-2 rounded-lg border border-light-gray hover:border-primary/40 bg-white hover:bg-light-gray/20 text-dark-black/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs mt-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-medium-black" />
            <span>Regenerate Preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveStylePreviewCard;
