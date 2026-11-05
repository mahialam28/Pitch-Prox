"use client";

import React from "react";
import { Clock } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import NoCallData from "./no-call-data";

// The trend chart plots per-call scores (conversion momentum, adherence, trust
// gain) against the PitchProX benchmark. Until calls are recorded there is no
// series to draw, so the card shows an empty state instead of sample data.
const PerformanceTrend = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-light-gray shadow-sm w-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80">
            Performance Trend <span className="text-dark-black/50 font-medium">(This Week)</span>
          </h2>
          <Clock className="w-4 h-4 text-light-black shrink-0" />
        </div>

        <Dropdown
          label="Conversion Momentum"
          items={[
            { value: "Conversion Momentum", label: "Conversion Momentum" },
            { value: "Prompt Adherence", label: "Prompt Adherence" },
            { value: "Trust Gain", label: "Trust Gain" },
            { value: "Overall Score", label: "Overall Score" },
          ]}
          selected="Conversion Momentum"
          variant="default"
        />
      </div>

      <NoCallData
        message="Your weekly trend against the PitchProX benchmark appears once you start making calls."
        className="flex-1 min-h-[220px] sm:min-h-[280px]"
      />
    </div>
  );
};

export default PerformanceTrend;
