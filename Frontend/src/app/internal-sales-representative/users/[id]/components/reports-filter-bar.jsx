"use client";

import React from "react";
import { X } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";

const DATE_RANGE_OPTIONS = [
  { value: "may1-may16", label: "May 1, 2025 - May 16, 2025" },
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "last-30-days", label: "Last 30 Days" },
  { value: "this-cycle", label: "This Billing Cycle" },
  { value: "all-time", label: "All Time" },
];

const REPORT_TYPE_OPTIONS = [
  { value: "all", label: "All Report Types" },
  { value: "Call Analysis", label: "Call Analysis" },
  { value: "Calibration", label: "Calibration" },
  { value: "Adherence", label: "Playbook Adherence" },
  { value: "Performance", label: "Performance Summary" },
];

const LEAD_TYPE_OPTIONS = [
  { value: "all", label: "All Lead Types" },
  { value: "Expired Listing", label: "Expired Listing" },
  { value: "FSBO", label: "FSBO" },
  { value: "Pre-Expired", label: "Pre-Expired" },
  { value: "Absentee Owner", label: "Absentee Owner" },
  { value: "Circle Prospecting", label: "Circle Prospecting" },
  { value: "Pre-Foreclosure", label: "Pre-Foreclosure" },
];

const SCORE_FILTER_OPTIONS = [
  { value: "all", label: "All Scores" },
  { value: "high", label: "High Score (90+)" },
  { value: "good", label: "Good Score (80-89)" },
  { value: "review", label: "Needs Review (<80)" },
];

export default function ReportsFilterBar({
  dateRange = "may1-may16",
  onDateRangeChange = () => {},
  reportType = "all",
  onReportTypeChange = () => {},
  leadType = "all",
  onLeadTypeChange = () => {},
  scoreFilter = "all",
  onScoreFilterChange = () => {},
  onClearFilters = () => {},
  className = "",
}) {
  return (
    <div className={`p-3.5 sm:p-4 border-b border-light-gray/70 flex flex-wrap items-center gap-3 w-full ${className}`}>
      {/* Date Range Selector */}
      <div className="flex-1 min-w-[180px] sm:min-w-[210px]">
        <Dropdown
          items={DATE_RANGE_OPTIONS}
          selected={dateRange}
          onSelect={onDateRangeChange}
          variant="small"
          className="w-full"
          buttonClassName="h-9 text-xs font-semibold"
        />
      </div>

      {/* Report Type Dropdown */}
      <div className="w-full sm:w-auto min-w-[140px]">
        <Dropdown
          items={REPORT_TYPE_OPTIONS}
          selected={reportType}
          onSelect={onReportTypeChange}
          variant="small"
          className="w-full"
          buttonClassName="h-9 text-xs font-semibold"
        />
      </div>

      {/* Lead Type Dropdown */}
      <div className="w-full sm:w-auto min-w-[140px]">
        <Dropdown
          items={LEAD_TYPE_OPTIONS}
          selected={leadType}
          onSelect={onLeadTypeChange}
          variant="small"
          className="w-full"
          buttonClassName="h-9 text-xs font-semibold"
        />
      </div>

      {/* Score Filter Dropdown */}
      <div className="w-full sm:w-auto min-w-[130px]">
        <Dropdown
          items={SCORE_FILTER_OPTIONS}
          selected={scoreFilter}
          onSelect={onScoreFilterChange}
          variant="small"
          className="w-full"
          buttonClassName="h-9 text-xs font-semibold"
        />
      </div>

      {/* Clear Filters Button */}
      <button
        type="button"
        onClick={onClearFilters}
        className="px-3.5 py-2 rounded-xl border border-light-gray bg-light-gray/40 hover:bg-light-gray text-xs font-semibold text-light-black hover:text-dark-black transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
      >
        <X className="w-3.5 h-3.5" />
        <span>Clear Filters</span>
      </button>
    </div>
  );
}
