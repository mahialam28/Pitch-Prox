"use client";

import React from "react";
import toast from "react-hot-toast";

export default function CalibrationScoreCard({ rep }) {
  const score = rep.calibrationScore || 94;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">
          Calibration Score
        </h3>
        <span className="text-xs font-semibold text-emerald-600">
          Excellent
        </span>
      </div>

      {/* Score Big Display */}
      <div className="my-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-bold text-dark-black/90 font-secondary tracking-tight">
            {score}
          </span>
          <span className="text-xs font-semibold text-light-black">/ 100</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-light-gray rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Last Calibration Date */}
        <p className="text-[11px] text-light-black font-normal mt-2.5">
          Last Calibration: May 14, 2025
        </p>
      </div>

      {/* Footer Action Button */}
      <button
        type="button"
        onClick={() => toast.success("Opening Calibration Assessment details...")}
        className="w-full mt-3 py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black/80 hover:text-dark-black transition-colors cursor-pointer text-center"
      >
        View Calibration Details
      </button>
    </div>
  );
}
