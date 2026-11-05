"use client";

import React from "react";
import PerformanceTabHeader from "./performance-tab-header";
import PerformanceStats from "./performance-stats";
import PerformanceTrendChart from "./performance-trend-chart";
import ScoreBreakdownCard from "./score-breakdown-card";
import PerformanceByCategory from "./performance-by-category";
import MonthlyGoalsCard from "./monthly-goals-card";

export default function PerformanceTab({ rep }) {
  const repName = rep?.name || "Ryan Anderson";

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* 1. Header with Filters & Export */}
      <PerformanceTabHeader repName={repName} />

      {/* 2. Primary 4 KPI Stats Cards */}
      <PerformanceStats />

      {/* 3. Middle Section: Performance Trend Chart (8 cols) + Score Breakdown (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="w-full lg:col-span-8">
          <PerformanceTrendChart />
        </div>
        <div className="w-full lg:col-span-4">
          <ScoreBreakdownCard overallScore={92} rank="#1 of 12 reps" />
        </div>
      </div>

      {/* 4. Bottom Section: Performance by Category (8 cols) + Monthly Goals (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="w-full lg:col-span-8">
          <PerformanceByCategory totalCalls={248} />
        </div>
        <div className="w-full lg:col-span-4">
          <MonthlyGoalsCard month="June 2026" />
        </div>
      </div>
    </div>
  );
}
