"use client";

import React from "react";
import { formatDate } from "@/lib/client-api";

// Sessions are live; the score comes from the AI once it's connected
export default function CalibrationScoreCard({ calibration, onViewDetails }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">Calibration</h3>
        <span className={`text-xs font-semibold ${calibration.sessions ? "text-emerald-600" : "text-amber-600"}`}>{calibration.sessions ? "Completed" : "Not started"}</span>
      </div>
      <div className="my-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-bold text-dark-black/90 font-secondary tracking-tight">{calibration.sessions}</span>
          <span className="text-xs font-semibold text-light-black">session{calibration.sessions === 1 ? "" : "s"} · {calibration.minutes} min</span>
        </div>
        <p className="text-[11px] text-light-black font-normal mt-2.5">
          {calibration.lastAt ? `Last calibration: ${formatDate(calibration.lastAt)}` : "No calibration sessions yet."} Scores appear once the AI is connected.
        </p>
      </div>
      <button
        type="button"
        onClick={onViewDetails}
        className="w-full mt-3 py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black/80 hover:text-dark-black transition-colors cursor-pointer text-center"
      >
        View Calibration Details
      </button>
    </div>
  );
}
