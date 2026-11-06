"use client";

import React from "react";
import { CircleDollarSign, BarChart2, Download } from "lucide-react";

export default function QuickActions({
  onAdjustQuotas,
  onViewLeaderboard,
  onExportReport,
}) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/85 tracking-tight">
          Quick Actions
        </h3>
      </div>

      {/* 3 Action Buttons */}
      <div className="flex flex-col gap-2.5">
        {/* 1. Adjust Quotas (managers only) */}
        {onAdjustQuotas && <button
          type="button"
          onClick={onAdjustQuotas}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-light-gray hover:border-primary/50 hover:bg-light-gray/40 text-xs font-semibold text-dark-black/80 hover:text-primary transition-all duration-200 cursor-pointer text-left group"
        >
          <div className="w-5 h-5 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
            <CircleDollarSign className="w-4 h-4" />
          </div>
          <span className="truncate">Adjust Quotas</span>
        </button>}

        {/* 2. View Leaderboard */}
        <button
          type="button"
          onClick={onViewLeaderboard}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-light-gray hover:border-primary/50 hover:bg-light-gray/40 text-xs font-semibold text-dark-black/80 hover:text-primary transition-all duration-200 cursor-pointer text-left group"
        >
          <div className="w-5 h-5 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
            <BarChart2 className="w-4 h-4" />
          </div>
          <span className="truncate">View Leaderboard</span>
        </button>

        {/* 3. Export Team Performance Report */}
        <button
          type="button"
          onClick={onExportReport}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border border-light-gray hover:border-primary/50 hover:bg-light-gray/40 text-xs font-semibold text-dark-black/80 hover:text-primary transition-all duration-200 cursor-pointer text-left group"
        >
          <div className="w-5 h-5 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
            <Download className="w-4 h-4" />
          </div>
          <span className="truncate">Export Team Performance Report</span>
        </button>
      </div>
    </div>
  );
}
