"use client";

import React, { useState } from "react";
import { Calendar, Filter, ChevronDown } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";

const dateRangeOptions = [
  { value: "May 1 - May 31, 2025", label: "May 1 - May 31, 2025" },
  { value: "April 1 - April 30, 2025", label: "April 1 - April 30, 2025" },
  { value: "Last 30 Days", label: "Last 30 Days" },
  { value: "This Quarter", label: "This Quarter" },
];

const prospectTypeOptions = [
  { value: "All Prospect Types", label: "All Prospect Types" },
  { value: "Top Agent", label: "Top Agent" },
  { value: "Brokerage Owner", label: "Brokerage Owner" },
  { value: "Experienced Agent", label: "Experienced Agent" },
  { value: "New Agent", label: "New Agent" },
  { value: "Team Lead", label: "Team Lead" },
];

const outcomeOptions = [
  { value: "All Outcomes", label: "All Outcomes" },
  { value: "Subscription Closed", label: "Subscription Closed" },
  { value: "Trial Started", label: "Trial Started" },
  { value: "Follow Up", label: "Follow Up" },
  { value: "Demo Booked", label: "Demo Booked" },
  { value: "No Answer", label: "No Answer" },
];

const purposeOptions = [
  { value: "All Purposes", label: "All Purposes" },
  { value: "Product Demo", label: "Product Demo" },
  { value: "Pricing Discussion", label: "Pricing Discussion" },
  { value: "Live Demo", label: "Live Demo" },
  { value: "Intro Call", label: "Intro Call" },
  { value: "Objection Handling", label: "Objection Handling" },
  { value: "Demo Follow Up", label: "Demo Follow Up" },
  { value: "ROI Discussion", label: "ROI Discussion" },
  { value: "Platform Overview", label: "Platform Overview" },
];

export default function CallsTabHeader({
  repName = "Ryan Anderson",
  prospectType,
  setProspectType,
  outcome,
  setOutcome,
  purpose,
  setPurpose,
  onResetFilters,
}) {
  const [dateRange, setDateRange] = useState("May 1 - May 31, 2025");

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-light-gray shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-dark-black/90 font-secondary tracking-tight">
          Calls
        </h2>
        <p className="text-xs sm:text-sm text-light-black mt-0.5">
          Detailed view of all calls made by {repName}.
        </p>
      </div>

      {/* Filter Controls Row */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Date Range Dropdown with Calendar Icon */}
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

        {/* Prospect Type Dropdown */}
        <div className="w-40">
          <Dropdown
            items={prospectTypeOptions}
            selected={prospectType || "All Prospect Types"}
            onSelect={(val) => setProspectType(val)}
            variant="small"
            placement="bottom"
            className="w-full"
          />
        </div>

        {/* Outcome Dropdown */}
        <div className="w-36">
          <Dropdown
            items={outcomeOptions}
            selected={outcome || "All Outcomes"}
            onSelect={(val) => setOutcome(val)}
            variant="small"
            placement="bottom"
            className="w-full"
          />
        </div>

        {/* Purpose Dropdown */}
        <div className="w-36">
          <Dropdown
            items={purposeOptions}
            selected={purpose || "All Purposes"}
            onSelect={(val) => setPurpose(val)}
            variant="small"
            placement="bottom"
            className="w-full"
          />
        </div>

        {/* Filters Action Button */}
        <button
          type="button"
          onClick={onResetFilters}
          className="px-3 py-2 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Filter className="w-3.5 h-3.5 text-light-black" />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );
}
