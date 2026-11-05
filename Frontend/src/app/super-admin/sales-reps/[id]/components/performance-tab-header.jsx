"use client";

import React, { useState } from "react";
import { FileDown, Calendar, ArrowRightLeft } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const timeRangeOptions = [
  { value: "Last 7 days", label: "Last 7 days" },
  { value: "Last 30 days", label: "Last 30 days" },
  { value: "Last 90 days", label: "Last 90 days" },
  { value: "This Month", label: "This Month" },
  { value: "This Year", label: "This Year" },
];

const compareOptions = [
  { value: "Compare: Previous period", label: "Compare: Previous period" },
  { value: "Compare: Same period last year", label: "Compare: Same period last year" },
  { value: "No comparison", label: "No comparison" },
];

export default function PerformanceTabHeader({ repName = "Ryan Anderson" }) {
  const [timeRange, setTimeRange] = useState("Last 30 days");
  const [compare, setCompare] = useState("Compare: Previous period");

  const handleExport = () => {
    toast.success(`Exporting performance report for ${repName}...`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-light-gray shadow-xs flex flex-col gap-3.5">
      {/* Header Title & Subtitle */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-dark-black/90 font-secondary tracking-tight">
          Performance
        </h2>
        <p className="text-xs sm:text-sm text-light-black mt-0.5">
          Review {repName}&apos;s sales activity, call quality, and progress against targets.
        </p>
      </div>

      {/* Filter Controls Row & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center flex-wrap gap-2">
          {/* Time Range Dropdown */}
          <div className="w-34">
            <Dropdown
              items={timeRangeOptions}
              selected={timeRange}
              onSelect={(val) => setTimeRange(val)}
              variant="small"
              placement="bottom"
              className="w-full"
            />
          </div>

          {/* Compare Dropdown */}
          <div className="w-52">
            <Dropdown
              items={compareOptions}
              selected={compare}
              onSelect={(val) => setCompare(val)}
              variant="small"
              placement="bottom"
              className="w-full"
            />
          </div>
        </div>

        {/* Export Performance Button */}
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>Export Performance</span>
        </button>
      </div>
    </div>
  );
}
