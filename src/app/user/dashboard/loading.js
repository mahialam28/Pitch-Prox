import React from "react";

// ── Skeleton Block Helper ───────────────────────────────────────────────────

const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded-2xl bg-light-gray/70 ${className}`} />
);

// ── Loading Skeleton ────────────────────────────────────────────────────────

const DashboardLoading = () => {
  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* ═══ Performance Header Skeleton ═══ */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col gap-2 min-w-0">
          <SkeletonBlock className="h-6 w-32" />
          <SkeletonBlock className="h-4 w-72 sm:w-96" />
        </div>
        <SkeletonBlock className="h-[38px] w-[140px] rounded-xl" />
      </div>

      {/* ═══ Performance Stats Grid — 3 Cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        {/* Card 1: Conversion Momentum */}
        <div className="bg-white/60 p-4 sm:p-6 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-2xl" />
            <SkeletonBlock className="h-4 w-36" />
          </div>
          <SkeletonBlock className="h-9 w-20" />
          <SkeletonBlock className="h-3 w-48" />
          <SkeletonBlock className="h-3 w-full" />
        </div>

        {/* Card 2: Prompt Adherence */}
        <div className="bg-white/60 p-4 sm:p-6 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-2xl" />
            <SkeletonBlock className="h-4 w-32" />
          </div>
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-end gap-3">
            <SkeletonBlock className="h-9 w-16" />
            <SkeletonBlock className="h-6 w-24 rounded-full" />
          </div>
          <SkeletonBlock className="h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <SkeletonBlock className="h-3 w-8" />
            <SkeletonBlock className="h-3 w-8" />
          </div>
        </div>

        {/* Card 3: Trust Gain */}
        <div className="bg-white/60 p-4 sm:p-6 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-2xl" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
          <SkeletonBlock className="h-9 w-16" />
          <SkeletonBlock className="h-3 w-40" />
          <SkeletonBlock className="h-3 w-full" />
        </div>
      </div>

      {/* ═══ Trend + Pipeline Grid ═══ */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {/* Performance Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white/60 p-4 sm:p-6 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="h-4 w-4 rounded-full" />
            </div>
            <SkeletonBlock className="h-[34px] w-[170px] rounded-lg" />
          </div>
          {/* Chart area skeleton */}
          <div className="h-[220px] sm:h-[280px] w-full flex flex-col justify-between px-4">
            {/* Y-axis labels */}
            <div className="flex justify-between">
              <SkeletonBlock className="h-3 w-6" />
              <SkeletonBlock className="h-3 w-6" />
              <SkeletonBlock className="h-3 w-6" />
              <SkeletonBlock className="h-3 w-6" />
            </div>
            {/* Line chart visual — zigzag bars */}
            <div className="flex items-end justify-between gap-2 h-[180px] sm:h-[220px]">
              {[40, 55, 35, 75, 25, 45, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-[70%] rounded-full bg-primary/20 animate-pulse"
                    style={{ height: `${h}%` }}
                  />
                  <div
                    className="w-[70%] rounded-full bg-light-black/20 animate-pulse"
                    style={{ height: `${Math.max(h - 20, 10)}%` }}
                  />
                </div>
              ))}
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between mt-4">
              {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                <SkeletonBlock key={d} className="h-3 w-8" />
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mt-2">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-3 w-3 rounded-full" />
              <SkeletonBlock className="h-3 w-6" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-3 w-8" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
        </div>

        {/* Lead Pipeline (1 col) */}
        <div className="lg:col-span-1 bg-white/60 p-4 sm:p-6 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col gap-4">
          {/* Header skeleton */}
          <SkeletonBlock className="h-5 w-44 mb-1" />
          {/* Donut chart skeleton */}
          <div className="relative w-full h-[160px] sm:h-[180px] flex items-center justify-center">
            <SkeletonBlock className="h-[136px] w-[136px] rounded-full" />
          </div>
          {/* Pipeline items */}
          <div className="space-y-3 px-2">
            {["New", "Contacted", "In Conversation", "Follow Up", "Qualified"].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-2.5 w-2.5 rounded-full" />
                  <SkeletonBlock className="h-3.5 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="h-3.5 w-6" />
                  <SkeletonBlock className="h-3 w-8" />
                </div>
              </div>
            ))}
          </div>
          {/* Footer button */}
          <div className="w-full border-t border-light-gray/50 pt-3 mt-auto">
            <div className="flex items-center justify-between px-2">
              <SkeletonBlock className="h-3.5 w-24" />
              <SkeletonBlock className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Recent Calls Table Skeleton ═══ */}
      <div className="bg-white/60 rounded-2xl border border-light-gray/50 shadow-sm w-full">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 pb-4">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
            <SkeletonBlock className="h-5 w-28" />
          </div>
          <SkeletonBlock className="h-[34px] w-[110px] rounded-xl" />
        </div>

        {/* Column headers */}
        <div className="w-full overflow-hidden px-6 pb-2">
          <div className="flex gap-6 min-w-[1000px]">
            <SkeletonBlock className="h-3 w-[156px]" />
            <SkeletonBlock className="h-3 w-[196px]" />
            <SkeletonBlock className="h-3 w-[116px]" />
            <SkeletonBlock className="h-3 w-[76px]" />
            <SkeletonBlock className="h-3 w-[136px]" />
            <SkeletonBlock className="h-3 w-[96px]" />
            <SkeletonBlock className="h-3 w-[76px]" />
            <SkeletonBlock className="h-3 w-[106px]" />
          </div>
        </div>

        {/* Table rows */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px] divide-y divide-light-gray/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-6 px-6 py-4">
                <div className="flex flex-col gap-1.5 w-[156px] shrink-0">
                  <SkeletonBlock className="h-3.5 w-28" />
                  <SkeletonBlock className="h-2.5 w-16" />
                </div>
                <SkeletonBlock className="h-3.5 w-[196px] shrink-0" />
                <SkeletonBlock className="h-3.5 w-[116px] shrink-0" />
                <SkeletonBlock className="h-3.5 w-[76px] shrink-0" />
                <SkeletonBlock className="h-6 w-[136px] shrink-0 rounded-lg" />
                <SkeletonBlock className="h-3.5 w-[96px] shrink-0" />
                <SkeletonBlock className="h-3.5 w-[76px] shrink-0" />
                <SkeletonBlock className="h-[34px] w-[106px] shrink-0 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoading;
