"use client";

import React from "react";
import { FileText, Layers, BookOpen } from "lucide-react";

const ResourceSummaryCard = ({
  totalResources = 24,
  totalScripts = 8,
  totalTemplates = 6,
  totalGuides = 12,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-3.5">
      <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 font-secondary">
        Resource Summary
      </h3>

      <div className="grid grid-cols-3 gap-2.5">
        {/* Total Resources */}
        <div className="rounded-xl border border-light-gray bg-white p-3 space-y-1.5 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-dark-black/90 font-secondary leading-tight">
              {totalResources}
            </div>
            <div className="text-[10px] font-semibold text-medium-black leading-tight mt-0.5">
              Total Resources
            </div>
            <div className="text-[9px] text-light-black font-normal mt-0.5">
              {totalScripts} Scripts
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="rounded-xl border border-light-gray bg-white p-3 space-y-1.5 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-sky-50 text-sky-500 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-dark-black/90 font-secondary leading-tight">
              {totalTemplates}
            </div>
            <div className="text-[10px] font-semibold text-medium-black leading-tight mt-0.5">
              Templates
            </div>
            <div className="text-[9px] text-light-black font-normal mt-0.5">
              Email + More
            </div>
          </div>
        </div>

        {/* Guides */}
        <div className="rounded-xl border border-light-gray bg-white p-3 space-y-1.5 shadow-2xs">
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-bold text-dark-black/90 font-secondary leading-tight">
              {totalGuides}
            </div>
            <div className="text-[10px] font-semibold text-medium-black leading-tight mt-0.5">
              Guides
            </div>
            <div className="text-[9px] text-light-black font-normal mt-0.5">
              Training Materials
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceSummaryCard;
