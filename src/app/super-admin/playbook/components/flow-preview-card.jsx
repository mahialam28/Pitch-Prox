"use client";

import React from "react";
import {
  Eye,
  Smile,
  Search,
  Gem,
  ShieldCheck,
  Target,
  PhoneCall,
} from "lucide-react";

// "Herjavec Sales Method" → "HS"
const initialsOf = (name) => String(name || "P").trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "P";

const ICON_MAP = {
  opening: Smile,
  discovery: Search,
  "value-prop": Gem,
  "value proposition": Gem,
  objections: ShieldCheck,
  "handle objections": ShieldCheck,
  close: Target,
  "follow-up": PhoneCall,
  "follow up": PhoneCall,
};

const COLOR_MAP = {
  opening: "text-emerald-500 bg-emerald-50",
  discovery: "text-blue-500 bg-blue-50",
  "value-prop": "text-purple-500 bg-purple-50",
  "value proposition": "text-purple-500 bg-purple-50",
  objections: "text-amber-500 bg-amber-50",
  "handle objections": "text-amber-500 bg-amber-50",
  close: "text-teal-500 bg-teal-50",
  "follow-up": "text-rose-500 bg-rose-50",
  "follow up": "text-rose-500 bg-rose-50",
};

const FlowPreviewCard = ({
  cardTitle = "Flow Preview",
  showEyeIcon = true,
  playbookName = "",
  creatorName = "PitchProX",
  avatarUrl = null,
  accessType = "premium",
  tones = ["Confident", "Direct", "Consultative", "Professional", "High Energy", "Low Humor"],
  stages = [],
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        {showEyeIcon && (
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Eye className="w-3.5 h-3.5" />
          </div>
        )}
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
            {cardTitle} <span className="text-[11px] font-normal text-light-black">(As User Will See)</span>
          </h3>
        </div>
      </div>

      {/* Creator Profile & Badges Card */}
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
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {tones.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-light-gray/70 text-medium-black text-[10px] font-medium rounded-md border border-light-gray/80"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Conversation Flow Stages Timeline */}
        <div className="pt-2 border-t border-light-gray space-y-2.5">
          <div className="flex items-center justify-between">
            <h5 className="text-[11px] font-bold text-dark-black/80 font-secondary">
              Conversation Flow ({stages.length} Stages)
            </h5>
          </div>

          <div className="relative pl-3 space-y-2.5">
            {/* Vertical Dotted Line */}
            {stages.length > 1 && (
              <div className="absolute left-[19px] top-3 bottom-3 w-[1px] border-l border-dashed border-light-black/30" />
            )}

            {stages.map((stage, idx) => {
              const normalizedKey = stage.iconId || stage.title?.toLowerCase().trim() || "opening";
              const IconComp = ICON_MAP[normalizedKey] || stage.icon || Smile;
              const colorClass = stage.color || COLOR_MAP[normalizedKey] || "text-teal-500 bg-teal-50";

              // Generate short badge goal
              const shortGoal = stage.badgeGoal || (stage.goal ? `Goal: ${stage.goal.split(" ")[0]}` : "Goal: Complete");

              return (
                <div key={stage.id || idx} className="relative flex items-center justify-between gap-2 z-10">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                      <IconComp className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-medium-black">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-dark-black/90 truncate">
                      {stage.title}
                    </span>
                  </div>

                  <span className="text-[10px] font-medium text-light-black shrink-0 px-2 py-0.5 bg-light-gray/50 rounded-md">
                    {shortGoal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowPreviewCard;
