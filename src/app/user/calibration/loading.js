import React from "react";

// ── Skeleton Block Helper ───────────────────────────────────────────────────

const SkeletonBlock = ({ className = "" }) => (
  <div className={`animate-pulse rounded-2xl bg-light-gray/70 ${className}`} />
);

// ── Loading Skeleton ────────────────────────────────────────────────────────

const CalibrationLoading = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* ═══ Top Banner Skeleton (Calibration Alert) ═══ */}
      <div className="w-full bg-[#FFF9F2]/50 border border-[#FFD9B3]/50 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left — Icon + Text */}
          <div className="flex items-start gap-4 sm:items-center">
            <div className="h-12 w-12 shrink-0 rounded-full bg-orange-200/60 animate-pulse" />
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-4 w-56" />
              <SkeletonBlock className="h-3 w-72" />
            </div>
          </div>
          {/* Right — CTA Button */}
          <div className="flex items-center justify-end gap-4 border-t border-[#FFEAD4]/50 pt-3 sm:border-none sm:pt-0">
            <SkeletonBlock className="h-[42px] w-[154px] rounded-xl" />
          </div>
        </div>
      </div>

      {/* ═══ Calibration Header Skeleton (Title + Subtitle) ═══ */}
      <div className="flex flex-col gap-2 mb-6">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-4 w-96" />
      </div>

      {/* ═══ Main Workspace — Two Columns ═══ */}
      <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
        {/* ═══ Left Column ═══ */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          {/* Simulation Header skeleton */}
          <div className="bg-white/60 p-6 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-2">
              <SkeletonBlock className="h-4 w-44" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
            <SkeletonBlock className="h-[38px] w-[132px] rounded-xl" />
          </div>

          {/* Round Tracker skeleton */}
          <div className="bg-white/60 px-8 py-6 rounded-2xl border border-light-gray/50 shadow-sm flex items-center justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
              </div>
            ))}
          </div>

          {/* Audio Player skeleton */}
          <div className="bg-white/60 p-6 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <SkeletonBlock className="h-12 w-12 rounded-full" />
                <div className="flex flex-col gap-2">
                  <SkeletonBlock className="h-3.5 w-20" />
                  <SkeletonBlock className="h-3 w-64" />
                </div>
              </div>
              <SkeletonBlock className="h-8 w-[76px] rounded-lg" />
            </div>
            {/* Waveform skeleton */}
            <div className="flex items-center justify-center gap-[3px] h-12 pt-2 px-4">
              {Array.from({ length: 65 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-primary/30 animate-pulse"
                  style={{ height: `${[12, 24, 36, 16, 8, 44, 28, 20, 48, 14, 32, 40, 10][i % 13]}px` }}
                />
              ))}
            </div>
          </div>

          {/* Teleprompter skeleton */}
          <div className="flex flex-col gap-2">
            <SkeletonBlock className="h-3 w-28" />
            <div className="bg-dark-teal/60 p-6 rounded-2xl min-h-[120px] flex items-center justify-center">
              <SkeletonBlock className="h-4 w-3/4 rounded-lg bg-white/20" />
            </div>
          </div>

          {/* Recorder skeleton */}
          <div className="bg-white/60 border border-light-gray/50 rounded-2xl p-8 shadow-sm min-h-[260px] flex flex-col items-center justify-center gap-6">
            <SkeletonBlock className="h-3 w-40" />
            {/* Waveform + Mic skeleton */}
            <div className="flex items-center justify-center gap-4 w-full max-w-md">
              <div className="flex-1 flex items-center justify-end gap-[3px] h-10">
                {[16, 28, 12, 36, 20, 44, 14, 32, 8, 24, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-primary/30 animate-pulse"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <SkeletonBlock className="h-14 w-14 rounded-full" />
              <div className="flex-1 flex items-center justify-start gap-[3px] h-10">
                {[40, 24, 8, 32, 14, 44, 20, 36, 12, 28, 16].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-primary/30 animate-pulse"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Right Column (Side Panel) ═══ */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-6">
          {/* Session Status skeleton */}
          <div className="bg-white/60 p-5 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col gap-3">
            <SkeletonBlock className="h-3 w-24" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-light-gray/50">
                <SkeletonBlock className="h-4 w-4 rounded" />
                <SkeletonBlock className="h-3 w-44" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-light-gray/50">
                <SkeletonBlock className="h-4 w-4 rounded" />
                <SkeletonBlock className="h-3 w-36" />
              </div>
            </div>
          </div>

          {/* Round Timeline skeleton */}
          <div className="bg-white/60 p-5 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col gap-3">
            <SkeletonBlock className="h-3 w-28" />
            <div className="flex flex-col gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-4 py-3 rounded-xl bg-light-gray/50"
                >
                  <SkeletonBlock className="h-3 w-16" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Score Metrics skeleton */}
          <div className="bg-white/60 p-6 rounded-2xl border border-light-gray/50 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-2.5 w-28" />
            </div>
            <SkeletonBlock className="h-3 w-28" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["Word Choice", "Tone", "Pacing", "Pause", "Sentiment", "Energy"].map((p) => (
                <div
                  key={p}
                  className="flex justify-between items-center px-4 py-3 rounded-xl bg-light-gray/50"
                >
                  <SkeletonBlock className="h-3 w-20" />
                  <SkeletonBlock className="h-3 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationLoading;
