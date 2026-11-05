"use client";

import React from "react";
import { FileText, TrendingUp, BarChart2, Clock } from "lucide-react";

export default function ReportsStats({ stats = {} }) {
  const {
    reportsUsed = 18,
    reportsTotal = 50,
    usedPercent = 36,
    highScoreCount = 11,
    highScorePercent = 61,
    averageScore = 82,
    scoreDiff = "+ 8 pts",
    lastReportDate = "May 16, 2025",
    lastReportAgo = "12m ago",
  } = stats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
      {/* 1. REPORTS USED */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[148px] gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-light-black/70 uppercase tracking-wider">
            REPORTS USED
          </span>
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight leading-none">
              {reportsUsed}
            </span>
            <span className="text-xs text-light-black font-normal">
              / {reportsTotal}
            </span>
          </div>
          <div className="w-full bg-light-gray/80 rounded-full h-1.5 overflow-hidden my-0.5">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-purple-600 leading-none">
            {usedPercent}% used
          </span>
        </div>
      </div>

      {/* 2. HIGH SCORE REPORTS */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[148px] gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-light-black/70 uppercase tracking-wider">
            HIGH SCORE REPORTS
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-auto">
          <span className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight leading-none">
            {highScoreCount}
          </span>
          <span className="text-xs text-light-black font-medium mt-1 leading-none">
            {highScorePercent}% of total
          </span>
        </div>
      </div>

      {/* 3. AVERAGE SCORE */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[148px] gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-light-black/70 uppercase tracking-wider">
            AVERAGE SCORE
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <BarChart2 className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-auto">
          <span className="text-2xl sm:text-3xl font-bold text-dark-black font-secondary tracking-tight leading-tight">
            {averageScore}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="inline-flex items-center justify-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 leading-normal">
              {scoreDiff}
            </span>
            <span className="text-[11px] text-light-black font-normal leading-normal">
              vs last 30 days
            </span>
          </div>
        </div>
      </div>

      {/* 4. LAST REPORT */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-4 sm:p-5 flex flex-col justify-between min-h-[148px] gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-light-black/70 uppercase tracking-wider">
            LAST REPORT
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-auto">
          <span className="text-base sm:text-lg font-bold text-dark-black tracking-tight leading-tight">
            {lastReportDate}
          </span>
          <span className="text-xs text-light-black font-medium mt-1 leading-none">
            {lastReportAgo}
          </span>
        </div>
      </div>
    </div>
  );
}
