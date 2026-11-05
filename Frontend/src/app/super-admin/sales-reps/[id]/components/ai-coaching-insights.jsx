"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function AiCoachingInsights() {
  const insights = [
    "Your highest conversion rate occurs when Trust Gain is above +20.",
    "You skip the confirmation prompt 18% more during objection handling.",
    "Great pacing! Your calls are 12% slower than team average, leading to higher trust.",
    "Continue strong usage of value stacking before presenting offers.",
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">
            AI Coaching Insights
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
          New
        </span>
      </div>

      {/* Bullet Insights */}
      <div className="space-y-3 mb-5">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
            <p className="text-dark-black/80 font-normal leading-relaxed text-xs">
              {insight}
            </p>
          </div>
        ))}
      </div>

      {/* Footer Action Button */}
      <button
        type="button"
        onClick={() => toast.success("Opening Full AI Coaching Report...")}
        className="w-full py-2.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black/80 hover:text-dark-black transition-colors cursor-pointer text-center"
      >
        View Full Coaching Report
      </button>
    </div>
  );
}
