"use client";

import React from "react";
import { FileText } from "lucide-react";

const STYLES = { PDF: ["bg-[#EF4444]", "bg-red-50 text-red-500"], XLSX: ["bg-[#22C55E]", "bg-emerald-50 text-emerald-500"], XLS: ["bg-[#22C55E]", "bg-emerald-50 text-emerald-500"], CSV: ["bg-[#22C55E]", "bg-emerald-50 text-emerald-500"], DOCX: ["bg-[#3B82F6]", "bg-blue-50 text-blue-500"], DOC: ["bg-[#3B82F6]", "bg-blue-50 text-blue-500"], PNG: ["bg-[#A855F7]", "bg-purple-50 text-purple-500"], JPG: ["bg-[#A855F7]", "bg-purple-50 text-purple-500"], JPEG: ["bg-[#A855F7]", "bg-purple-50 text-purple-500"] };

// byType: [{ type, count }] (archived left out)
export default function EvidenceByType({ byType }) {
  const total = (byType ?? []).reduce((sum, item) => sum + item.count, 0);
  const evidenceByTypeData = (byType ?? []).map((item) => {
    const percent = total ? Math.round((item.count / total) * 100) : 0;
    const [barColor, bgIcon] = STYLES[item.type] ?? ["bg-gray-400", "bg-gray-100 text-gray-500"];
    return { ...item, percentage: `${percent}%`, fillPercent: percent, barColor, bgIcon };
  });
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 w-full space-y-5">
      <h3 className="text-sm sm:text-base font-bold text-dark-black/85 font-secondary">
        Evidence by Type
      </h3>

      <div className="space-y-4">
        {byType && evidenceByTypeData.length === 0 && <p className="text-xs text-light-black">No evidence yet.</p>}
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
