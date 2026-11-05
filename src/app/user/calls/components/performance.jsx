"use client";

import React from "react";
import { Clock, HelpCircle, Zap, Star, BarChart2 } from "lucide-react";

export const PerformanceMetrics = () => {
  return (
    <div className="w-full font-sans text-[#1e293b]">
      {/* Section Header */}
      <h2 className="text-[18px] font-bold flex items-center gap-2 text-[#0f172a] mb-5 tracking-tight">
        <BarChart2 className="w-5 h-5 text-[#00a884]" />
        <span>2. Performance Metrics</span>
      </h2>

      {/* Top 4 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Card 1: Call Duration */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col items-center justify-between min-h-[140px]">
          <div className="w-full flex justify-center items-center gap-2 text-[11px] font-bold tracking-wider text-[#00a884] uppercase">
            <Clock className="w-4 h-4" />
            <span>CALL DURATION</span>
          </div>
          <div className="mt-2 text-center">
            <div className="text-[28px] font-black text-[#0f172a] leading-none tracking-tight">
              7m 11s
            </div>
            <div className="text-xs text-[#cbd5e1] font-mono mt-1">
              431 Seconds
            </div>
          </div>
          <div /> {/* Spacer to balance height flex */}
        </div>

        {/* Card 2: Prompt Utilization */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[140px]">
          <div className="w-full flex justify-center items-center gap-2 text-[11px] font-bold tracking-wider text-[#00a884] uppercase">
            <HelpCircle className="w-4 h-4" />
            <span>PROMPT UTILIZATION</span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4 text-[13px]">
            {/* Left Column Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
                  <span className="text-[#64748b]">Used as-is</span>
                </div>
                <span className="font-bold text-[#0f172a] font-mono">62%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6] shrink-0" />
                  <span className="text-[#64748b]">Modified</span>
                </div>
                <span className="font-bold text-[#0f172a] font-mono">28%</span>
              </div>
            </div>

            {/* Right Column Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#a855f7] shrink-0" />
                  <span className="text-[#64748b]">Off-script</span>
                </div>
                <span className="font-bold text-[#0f172a] font-mono">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Response Timing */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[140px] relative">
          <div className="w-full relative flex items-center justify-center">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-[#00a884] uppercase">
              <Zap className="w-4 h-4" />
              <span>RESPONSE TIMING</span>
            </div>
            <span className="absolute right-0 bg-[#dcfce7] text-[#15803d] text-xs font-bold px-3 py-1 rounded-full">
              Excellent
            </span>
          </div>

          <div className="mt-2 text-center">
            <div className="text-[28px] font-black text-[#0f172a] leading-none tracking-tight">
              1.9s
            </div>
            <div className="text-xs text-[#cbd5e1] font-mono mt-1">
              Average
            </div>
          </div>
        </div>

        {/* Card 4: Coaching Insights */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[140px]">
          <div className="w-full flex justify-center items-center gap-2 text-[11px] font-bold tracking-wider text-[#00a884] uppercase mb-2">
            <Star className="w-4 h-4" />
            <span>COACHING INSIGHTS</span>
          </div>
          <p className="text-[13px] text-[#64748b] leading-relaxed text-center">
            You used AI guidance effectively while maintaining a natural delivery. Your response timing was strong, allowing smooth flow without long pauses. Good balance between structure and personalization helped keep the conversation engaging and goal-driven.
          </p>
        </div>

      </div>
    </div>
  );
};