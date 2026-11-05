"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function TrainingAcknowledgment() {
  const router = useRouter();

  // Circular gauge calculations (SVG donut)
  const percentage = 93;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleViewTrainingLogs = () => {
    router.push("/super-admin/compliance-audit/training-logs");
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between w-full gap-5">
      {/* Header */}
      <h3 className="text-base font-bold text-dark-black/85 font-secondary">
        Training Acknowledgment
      </h3>

      {/* Donut Chart & Legend Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Circular Donut Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-light-gray"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-primary transition-all duration-1000 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Inner Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-bold text-dark-black/85 font-secondary tracking-tight">
              93%
            </span>
            <span className="text-[9px] font-semibold text-light-black tracking-wider uppercase">
              UP TO DATE
            </span>
          </div>
        </div>

        {/* Legend / Metrics List */}
        <div className="flex-1 space-y-2.5 text-xs">
          {/* Completed */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0EADAB]" />
              <span className="text-medium-black font-medium">Completed</span>
            </div>
            <span className="font-bold text-dark-black/85 font-secondary">
              187
            </span>
          </div>

          {/* Pending */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
              <span className="text-medium-black font-medium">Pending</span>
            </div>
            <span className="font-bold text-dark-black/85 font-secondary">
              12
            </span>
          </div>

          {/* Overdue */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span className="text-medium-black font-medium">Overdue</span>
            </div>
            <span className="font-bold text-dark-black/85 font-secondary">
              3
            </span>
          </div>
        </div>
      </div>

      {/* View Training Logs Action Button */}
      <button
        type="button"
        onClick={handleViewTrainingLogs}
        className="w-full border border-light-gray hover:bg-light-gray/40 hover:border-dark-gray/30 text-dark-black/80 font-semibold py-2.5 rounded-xl text-xs sm:text-sm text-center transition-all cursor-pointer"
      >
        View Training Logs
      </button>
    </div>
  );
}
