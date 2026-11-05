"use client";

import React from "react";
import { XCircle, CalendarRange } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import {
  dateRangeOptions,
  displayIntervalOptions,
  leadTypeOptions,
  outcomeOptions,
} from "@/utils.js/lead-options";

const AnalyticsFilters = ({
  dateRange,
  onDateRangeChange,
  interval,
  onIntervalChange,
  leadType,
  onLeadTypeChange,
  outcome,
  onOutcomeChange,
}) => {
  const hasActiveFilters =
    dateRange !== "This Month" ||
    interval !== "Weekly" ||
    leadType !== "" ||
    outcome !== "";

  const clearFilters = () => {
    onDateRangeChange?.("This Month");
    onIntervalChange?.("Weekly");
    onLeadTypeChange?.("");
    onOutcomeChange?.("");
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-3 p-3 bg-white/60 border border-light-gray rounded-xl">
      <div className="flex items-center gap-1.5 shrink-0">
        <CalendarRange className="h-4 w-4 text-light-black" />
        <span className="text-xs font-bold text-light-black uppercase tracking-wider">
          Filters
        </span>
      </div>

      <Dropdown
        label="Date Range"
        items={dateRangeOptions}
        selected={dateRange}
        onSelect={onDateRangeChange}
        variant="default"
        className="w-full xl:w-[170px]"
      />

      <Dropdown
        label="Display Interval"
        items={displayIntervalOptions}
        selected={interval}
        onSelect={onIntervalChange}
        variant="default"
        className="w-full xl:w-[160px]"
      />

      <Dropdown
        label="All Lead Types"
        items={leadTypeOptions}
        selected={leadType}
        onSelect={onLeadTypeChange}
        variant="default"
        className="w-full xl:w-[190px]"
      />

      <Dropdown
        label="All Outcomes"
        items={outcomeOptions}
        selected={outcome}
        onSelect={onOutcomeChange}
        variant="default"
        className="w-full xl:w-[180px]"
      />

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-red-500 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
        >
          <XCircle className="h-4 w-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default AnalyticsFilters;
