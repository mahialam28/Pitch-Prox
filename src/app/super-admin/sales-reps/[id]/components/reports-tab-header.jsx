"use client";

import { internalLeadTypeOptions } from "@/utils.js/lead-options";

import React from "react";
import { Plus, X } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";

const dateRangeOptions = [
  { value: "Jun 1 – Jun 30, 2026", label: "Jun 1 – Jun 30, 2026" },
  { value: "May 1 – May 31, 2026", label: "May 1 – May 31, 2026" },
  { value: "Last 30 Days", label: "Last 30 Days" },
  { value: "This Quarter", label: "This Quarter" },
  { value: "All Time", label: "All Time" },
];

const reportTypeOptions = [
  { value: "All report types", label: "All report types" },
  { value: "Call Analysis", label: "Call Analysis" },
  { value: "Calibration", label: "Calibration" },
  { value: "Adherence", label: "Playbook Adherence" },
  { value: "Coaching", label: "Coaching Progress" },
];

// Sales rep calls are with real-estate agents and teams, so the internal lead types apply
const leadTypeOptions = [{ value: "All lead types", label: "All lead types" }, ...internalLeadTypeOptions];

const scoreOptions = [
  { value: "All scores", label: "All scores" },
  { value: "90+", label: "90+ (High Score)" },
  { value: "85+", label: "85+ Score" },
  { value: "80-84", label: "80 - 84 Score" },
  { value: "Below 80", label: "Below 80" },
];

export default function ReportsTabHeader({
  repName = "Ryan Anderson",
  dateRange,
  setDateRange,
  reportType,
  setReportType,
  leadType,
  setLeadType,
  scoreFilter,
  setScoreFilter,
  onResetFilters,
  onGenerateReport,
}) {
  const isFiltered =
    dateRange !== "Jun 1 – Jun 30, 2026" ||
    reportType !== "All report types" ||
    leadType !== "All lead types" ||
    scoreFilter !== "All scores";

  return (
    <div className="flex flex-col gap-4">
      {/* Title & Description */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary tracking-tight">
          Reports
        </h2>
        <p className="text-xs sm:text-sm text-light-black mt-0.5">
          View, filter, and manage reports generated for {repName}.
        </p>
      </div>

      {/* Filter Controls Row & Generate Report Button */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pt-1">
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Date Range Dropdown */}
          <div className="w-48">
            <Dropdown
              items={dateRangeOptions}
              selected={dateRange}
              onSelect={(val) => setDateRange(val)}
              variant="small"
              placement="bottom"
              className="w-full"
            />
          </div>

          {/* Report Type Dropdown */}
          <div className="w-44">
            <Dropdown
              items={reportTypeOptions}
              selected={reportType}
              onSelect={(val) => setReportType(val)}
              variant="small"
              placement="bottom"
              className="w-full"
            />
          </div>

          {/* Lead Type Dropdown */}
          <div className="w-40">
            <Dropdown
              items={leadTypeOptions}
              selected={leadType}
              onSelect={(val) => setLeadType(val)}
              variant="small"
              placement="bottom"
              className="w-full"
            />
          </div>

          {/* Scores Dropdown */}
          <div className="w-36">
            <Dropdown
              items={scoreOptions}
              selected={scoreFilter}
              onSelect={(val) => setScoreFilter(val)}
              variant="small"
              placement="bottom"
              className="w-full"
            />
          </div>

          {/* Clear Filters Button */}
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-light-black hover:text-dark-black transition-colors px-2 py-2 flex items-center gap-1 cursor-pointer select-none"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear filters</span>
          </button>
        </div>

        {/* Generate Report Button */}
        <div className="shrink-0 flex items-center self-start xl:self-auto">
          <button
            type="button"
            onClick={onGenerateReport}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <span>Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
