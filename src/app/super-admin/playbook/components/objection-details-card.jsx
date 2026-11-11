"use client";

import { normalizeObjection } from "@/lib/playbook-compile";

import React from "react";
import { Play } from "lucide-react";

const ObjectionDetailsCard = ({
  selectedObjection = {
    title: "I don't want to pay commission.",
    subtitle: "Pricing Objection",
    category: "Financial",
    subtype: "Affordability",
    stage: "Value Proposition",
    leadTypes: ["FSBO", "Expired", "Pre-Expired", "+2"],
    responseStyle: "Value & ROI Focus",
    goal: "Overcome price concern and show value",
    note: "Confident, respectful, value-driven",
  },
}) => {
  const leadTypesString = Array.isArray(selectedObjection.leadTypes)
    ? selectedObjection.leadTypes.join(", ")
    : selectedObjection.leadTypes || "All Lead Types";

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-1 border-b border-light-gray/60">
        <h3 className="text-xs font-bold text-dark-black/80 uppercase tracking-wider font-secondary">
          Objection Details
        </h3>
        {/* Preview AI Response Button (non-interactive as requested) */}
        <button
          type="button"
          className="px-3 py-1.5 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Preview AI Response</span>
        </button>
      </div>

      {/* Main Objection Header */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block">
          Objection
        </span>
        <h4 className="text-sm sm:text-base font-bold text-dark-black/90 font-secondary leading-snug">
          {selectedObjection.title}
        </h4>
        <p className="text-xs text-light-black font-normal">
          {selectedObjection.subtitle || `${selectedObjection.subtype ?? selectedObjection.category} Objection`}
        </p>
      </div>

      {/* 3-Column Attributes Grid */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-light-gray/60 text-xs">
        <div>
          <span className="text-[10px] font-semibold text-light-black block mb-0.5">
            Category
          </span>
          <span className="font-bold text-dark-black/90">
            {normalizeObjection(selectedObjection).rootCategory ?? selectedObjection.category}{normalizeObjection(selectedObjection).subtype ? ` · ${normalizeObjection(selectedObjection).subtype}` : ""}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-light-black block mb-0.5">
            Stage
          </span>
          <span className="font-bold text-dark-black/90">
            {selectedObjection.stage}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-light-black block mb-0.5">
            Lead Types
          </span>
          <span className="font-bold text-dark-black/90 truncate block">
            {leadTypesString}
          </span>
        </div>
      </div>

      {/* Response Style & Goal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-light-gray/60 text-xs">
        <div>
          <span className="text-[10px] font-semibold text-light-black block mb-0.5">
            Response Style
          </span>
          <span className="font-bold text-dark-black/90">
            {selectedObjection.responseStyle || "Value & ROI Focus"}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-light-black block mb-0.5">
            Goal
          </span>
          <span className="font-bold text-dark-black/90 leading-tight block">
            {selectedObjection.goal}
          </span>
          <span className="text-[10px] text-light-black italic font-normal mt-0.5 block">
            {selectedObjection.note || "Confident, respectful, value-driven"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ObjectionDetailsCard;
