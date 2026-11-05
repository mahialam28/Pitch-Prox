"use client";

import React from "react";
import { Play, Pause, Edit3, AlertCircle } from "lucide-react";

const HEALTH_ITEMS = [
  {
    id: "running",
    label: "Running",
    count: 9,
    percentage: 75,
    barColor: "bg-[#0EADAB]",
    icon: Play,
    iconColor: "text-emerald-600 bg-emerald-50",
  },
  {
    id: "paused",
    label: "Paused",
    count: 2,
    percentage: 25,
    barColor: "bg-orange-500",
    icon: Pause,
    iconColor: "text-orange-500 bg-orange-50",
  },
  {
    id: "draft",
    label: "Draft",
    count: 1,
    percentage: 12,
    barColor: "bg-blue-600",
    icon: Edit3,
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "issues",
    label: "Issues",
    count: 3,
    percentage: 30,
    barColor: "bg-red",
    icon: AlertCircle,
    iconColor: "text-red bg-red/10",
  },
];

export default function JourneyHealthSection() {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Journey Health
        </h3>
      </div>

      {/* Status List */}
      <div className="space-y-4">
        {HEALTH_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="flex items-center gap-3 text-xs">
              {/* Status Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${item.iconColor}`}
              >
                <IconComponent className="w-3 h-3" />
              </div>

              {/* Status Label */}
              <span className="w-16 font-medium text-dark-black/80 text-xs">
                {item.label}
              </span>

              {/* Status Count */}
              <span className="w-6 font-bold text-dark-black/80 font-secondary text-xs">
                {item.count}
              </span>

              {/* Horizontal Progress Bar */}
              <div className="flex-1 bg-light-gray rounded-full h-2 overflow-hidden ml-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
