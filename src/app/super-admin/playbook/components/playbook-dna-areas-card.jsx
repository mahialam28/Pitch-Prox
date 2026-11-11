"use client";

import React from "react";
import {
  Sparkles,
  Mic,
  Scale,
  Shield,
  MessageSquare,
  Search,
  Flag,
  RefreshCw,
  Languages,
  Ban,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

export const DNA_AREAS = [
  {
    id: "core-coaching-philosophy",
    label: "Core Coaching Philosophy",
    icon: Sparkles,
  },
  {
    id: "prompt-voice",
    label: "Prompt Voice",
    icon: Mic,
  },
  {
    id: "strategic-framing",
    label: "Strategic Framing",
    icon: Scale,
  },
  {
    id: "trust-building-style",
    label: "Trust-Building Style",
    icon: Shield,
  },
  {
    id: "objection-tone",
    label: "Objection Tone",
    icon: MessageSquare,
  },
  {
    id: "discovery-style",
    label: "Discovery Style",
    icon: Search,
  },
  {
    id: "closing-style",
    label: "Closing Style",
    icon: Flag,
  },
  {
    id: "follow-up-style",
    label: "Follow-Up Style",
    icon: RefreshCw,
  },
  {
    id: "language-rules",
    label: "Language Rules",
    icon: Languages,
  },
  {
    id: "do-dont-boundaries",
    label: "Do / Don't Boundaries",
    icon: Ban,
  },
];

const PlaybookDnaAreasCard = ({
  selectedArea = "core-coaching-philosophy",
  onSelectArea = () => {},
  onResetDefaults = () => {},
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-dark-black font-secondary">
          Playbook DNA Areas
        </h2>
        <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
          Define the personality and DNA that makes this playbook unique.
        </p>
      </div>

      {/* DNA Areas Navigation List */}
      <div className="space-y-1.5">
        {DNA_AREAS.map((area) => {
          const Icon = area.icon;
          const isActive = selectedArea === area.id;

          return (
            <button
              key={area.id}
              type="button"
              onClick={() => onSelectArea(area.id)}
              className={`w-full group px-3.5 py-3 rounded-xl border flex items-center justify-between transition-all duration-150 cursor-pointer text-left select-none ${
                isActive
                  ? "bg-teal-50/70 border-primary/40 text-primary shadow-2xs font-semibold"
                  : "bg-white hover:bg-light-gray/40 border-transparent hover:border-light-gray text-medium-black hover:text-dark-black"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-primary stroke-[2.2]"
                      : "text-medium-black group-hover:text-dark-black"
                  }`}
                />
                <span
                  className={`text-xs sm:text-[13px] leading-snug min-w-0 break-words font-secondary ${
                    isActive
                      ? "font-semibold text-primary"
                      : "font-medium text-medium-black group-hover:text-dark-black"
                  }`}
                >
                  {area.label}
                </span>
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive
                    ? "text-primary translate-x-0.5"
                    : "text-light-black group-hover:text-medium-black group-hover:translate-x-0.5"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Bottom Reset Button */}
      <div className="pt-2 border-t border-light-gray">
        <button
          type="button"
          onClick={onResetDefaults}
          className="w-full py-2.5 px-4 rounded-xl border border-primary/40 hover:bg-teal-50/60 bg-white text-primary font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Playbook Defaults</span>
        </button>
      </div>
    </div>
  );
};

export default PlaybookDnaAreasCard;
