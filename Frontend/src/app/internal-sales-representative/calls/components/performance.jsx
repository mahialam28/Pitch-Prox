"use client";

import React from "react";
import { Clock, HelpCircle, Zap, Star, BarChart2 } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

export const PerformanceMetrics = () => {
  return (
    <div className="w-full font-sans text-dark-black">
      {/* Section Header */}
      <Title variant="small" className="!text-dark-black font-bold flex items-center gap-2 mb-5 tracking-tight">
        <BarChart2 className="w-5 h-5 text-primary" />
        <span>2. Performance Metrics</span>
      </Title>

      {/* Top 4 Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Call Duration */}
        <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col items-center justify-between min-h-[140px]">
          <div className="w-full flex justify-center items-center gap-2 text-[11px] font-bold tracking-wider text-primary uppercase">
            <Clock className="w-4 h-4" />
            <span>CALL DURATION</span>
          </div>
          <div className="mt-2 text-center">
            <div className="text-[28px] font-black text-dark-black leading-none tracking-tight">
              7m 11s
            </div>
            <div className="text-xs text-light-black font-mono mt-1">
              431 Seconds
            </div>
          </div>
          <div />
        </div>

        {/* Card 2: Prompt Utilization */}
        <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="w-full flex justify-center items-center gap-2 text-[11px] font-bold tracking-wider text-primary uppercase">
            <HelpCircle className="w-4 h-4" />
            <span>PROMPT UTILIZATION</span>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mt-4 text-[13px]">
            {/* Left Column Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-medium-black">Used as-is</span>
                </div>
                <span className="font-bold text-dark-black font-mono">62%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-medium-black">Modified</span>
                </div>
                <span className="font-bold text-dark-black font-mono">28%</span>
              </div>
            </div>

            {/* Right Column Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-medium-black">Off-script</span>
                </div>
                <span className="font-bold text-dark-black font-mono">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Response Timing */}
        <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between min-h-[140px] relative">
          <div className="w-full relative flex items-center justify-center">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-primary uppercase">
              <Zap className="w-4 h-4" />
              <span>RESPONSE TIMING</span>
            </div>
            <span className="absolute right-0 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
              Excellent
            </span>
          </div>

          <div className="mt-2 text-center">
            <div className="text-[28px] font-black text-dark-black leading-none tracking-tight">
              1.9s
            </div>
            <div className="text-xs text-light-black font-mono mt-1">
              Average
            </div>
          </div>
        </div>

        {/* Card 4: Coaching Insights */}
        <div className="bg-white p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between min-h-[140px]">
          <div className="w-full flex justify-center items-center gap-2 text-[11px] font-bold tracking-wider text-primary uppercase mb-2">
            <Star className="w-4 h-4" />
            <span>COACHING INSIGHTS</span>
          </div>
          <Text variant="small" className="text-medium-black leading-relaxed text-center">
            You used AI guidance effectively while maintaining a natural delivery. Your response timing was strong, allowing smooth flow without long pauses. Good balance between structure and personalization helped keep the conversation engaging and goal-driven.
          </Text>
        </div>
      </div>
    </div>
  );
};