"use client";

import React from "react";
import { Target, Users, MessageSquare } from "lucide-react";
import Text from "@/components/texts/text";

// "Herjavec Sales Method" → "HS"
const initialsOf = (name) => String(name || "P").trim().split(/\s+/).slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("") || "P";

const PlaybookPreviewCard = ({
  playbookName = "",
  creatorName = "PitchProX",
  description = "Real-world, no-nonsense tactics from Shark Tank's Robert Herjavec. Build trust, add value, and close bigger deals.",
  focusText = "Trust, Value, Closing",
  bestForText = "High-value deals, Negotiations",
  styleText = "Direct, Confident, Results-driven",
  avatarUrl = null,
  accessType = "premium",
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
          Playbook Preview
        </h3>
        <span className="text-xs text-light-black font-normal">
          (As User Will See)
        </span>
      </div>

      {/* Preview Inner Container */}
      <div className="rounded-2xl border border-light-gray bg-white p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Creator Info & Title */}
        <div className="flex items-start gap-3.5">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-light-gray">
            {avatarUrl ? (
              <img src={avatarUrl} alt={creatorName} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center bg-dark-black text-white text-xs font-bold">
                {initialsOf(playbookName || creatorName)}
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            {accessType === "premium" && (
              <span className="w-fit text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 mb-1">
                PREMIUM
              </span>
            )}
            <h4 className="text-sm font-bold text-dark-black/90 truncate font-secondary">
              {playbookName || "Untitled Playbook"}
            </h4>
            <span className="text-xs text-medium-black font-normal truncate mt-0.5">
              {creatorName}
            </span>
          </div>
        </div>

        {/* Description */}
        <Text
          variant="smaller"
          className="text-medium-black leading-relaxed text-xs font-normal line-clamp-3"
        >
          {description ||
            "Define real-world sales and prospecting methodology to empower your reps."}
        </Text>

        {/* 3 Stats Columns */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-light-gray">
          {/* Focus */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary tracking-wider uppercase">
              <Target className="w-3 h-3" />
              <span>FOCUS</span>
            </div>
            <p className="text-[11px] font-medium text-medium-black leading-tight">
              {focusText}
            </p>
          </div>

          {/* Best For */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary tracking-wider uppercase">
              <Users className="w-3 h-3" />
              <span>BEST FOR</span>
            </div>
            <p className="text-[11px] font-medium text-medium-black leading-tight">
              {bestForText}
            </p>
          </div>

          {/* Style */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary tracking-wider uppercase">
              <MessageSquare className="w-3 h-3" />
              <span>STYLE</span>
            </div>
            <p className="text-[11px] font-medium text-medium-black leading-tight">
              {styleText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaybookPreviewCard;
