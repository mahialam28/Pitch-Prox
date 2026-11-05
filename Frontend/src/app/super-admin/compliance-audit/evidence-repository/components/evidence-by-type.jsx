"use client";

import React from "react";
import { FileText, FileSpreadsheet } from "lucide-react";
import { evidenceByTypeData } from "../evidence-data";

export default function EvidenceByType() {
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 w-full space-y-5">
      <h3 className="text-sm sm:text-base font-bold text-dark-black/85 font-secondary">
        Evidence by Type
      </h3>

      <div className="space-y-4">
        {evidenceByTypeData.map((item) => (
          <div key={item.type} className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center ${item.bgIcon}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-dark-black/80">
                  {item.type}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-dark-black/80 font-secondary">
                  {item.count}
                </span>
                <span className="text-light-black text-xs font-normal">
                  ({item.percentage})
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#E5E7EB]/50 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                style={{ width: `${item.fillPercent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
