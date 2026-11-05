"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";

const CALIBRATION_HISTORY_DATA = [
  { id: "cal-1", date: "Apr 22, 2025", score: 92, status: "Excellent", scoreColor: "text-emerald-600" },
  { id: "cal-2", date: "Jan 22, 2025", score: 86, status: "Good", scoreColor: "text-emerald-600" },
  { id: "cal-3", date: "Oct 22, 2024", score: 78, status: "Needs Work", scoreColor: "text-amber-600" },
  { id: "cal-4", date: "Jul 22, 2024", score: 72, status: "Needs Work", scoreColor: "text-orange-600" },
];

export default function CalibrationHistory({
  onSelectHistory = () => {},
}) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-light-gray/70">
        <h3 className="text-base font-bold text-dark-black/85">
          Calibration History
        </h3>
        <button
          type="button"
          onClick={() => {
            setShowAll(!showAll);
            toast.success(showAll ? "Showing recent history." : "Showing all calibration records.");
          }}
          className="text-xs font-semibold text-teal-600 hover:underline cursor-pointer"
        >
          {showAll ? "View Less" : "View All"}
        </button>
      </div>

      {/* History Items */}
      <div className="divide-y divide-light-gray/60 text-xs">
        {CALIBRATION_HISTORY_DATA.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectHistory(item)}
            className="py-2.5 flex items-center justify-between gap-2 hover:bg-light-gray/20 px-1 rounded-lg transition-colors cursor-pointer"
          >
            <span className="font-medium text-dark-black/85">
              {item.date}
            </span>
            <div className="flex items-center gap-1 font-secondary">
              <span className={`font-bold text-sm ${item.scoreColor}`}>
                {item.score}
              </span>
              <span className="text-[11px] text-light-black font-normal">
                /100
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
