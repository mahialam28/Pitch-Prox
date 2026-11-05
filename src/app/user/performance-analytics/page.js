"use client";

import React, { useState } from "react";
import AnalyticsHeader from "./components/analytics-header";
import AnalyticsFilters from "./components/analytics-filters";
import PerformanceTrend from "./components/performance-trend";
import ConversationIntelligence from "./components/conversation-intelligence";
import InsightsGrid from "./components/insights-grid";
import ObjectionAnalysis from "./components/objection-analysis";
import AIGuidance from "./components/ai-guidance";
import TrustProgression from "./components/trust-progression";
import TopPerformance from "./components/top-performance";
import CallOutcome from "./components/call-outcome";

export default function PerformanceAnalyticsPage() {
  // ── Global analytics filter state (consistent labels across all widgets) ──
  const [dateRange, setDateRange] = useState("This Month");
  const [interval, setInterval] = useState("Weekly");
  const [leadType, setLeadType] = useState("");
  const [outcome, setOutcome] = useState("");

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Analytics Top Header */}
      <AnalyticsHeader />

      {/* Consistent Filters Bar */}
      <AnalyticsFilters
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        interval={interval}
        onIntervalChange={setInterval}
        leadType={leadType}
        onLeadTypeChange={setLeadType}
        outcome={outcome}
        onOutcomeChange={setOutcome}
      />

      {/* Main Charts & Conversation Intelligence Row */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <div className="lg:col-span-2 flex w-full">
          <PerformanceTrend
            dateRange={dateRange}
            interval={interval}
            onIntervalChange={setInterval}
          />
        </div>

        <div className="lg:col-span-1 flex w-full">
          <ConversationIntelligence />
        </div>
      </div>

      <InsightsGrid />

      {/* Deep Dive Metrics Row */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <div className="flex w-full">
          <ObjectionAnalysis />
        </div>
        <div className="flex w-full">
          <TrustProgression dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
        <div className="flex w-full">
          <AIGuidance />
        </div>
      </div>
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        <div className="lg:col-span-5 flex w-full">
          <CallOutcome />
        </div>
        <div className="lg:col-span-7 flex w-full">
          <TopPerformance />
        </div>
      </div>
    </div>
  );
}
