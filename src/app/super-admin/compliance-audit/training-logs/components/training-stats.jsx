"use client";

import React from "react";
import { GraduationCap, Award, Clock, Hourglass } from "lucide-react";

export default function TrainingStats({ stats }) {
  const defaultStats = [
    {
      id: "total",
      label: "Total Assignments",
      value: "256",
      subtext: "All time",
      icon: GraduationCap,
      iconBg: "bg-[#E6F7F7]",
      iconColor: "text-[#0EADAB]",
    },
    {
      id: "completed",
      label: "Completed",
      value: "187",
      subtext: "73.0% completion rate",
      icon: Award,
      iconBg: "bg-[#ECECFE]",
      iconColor: "text-[#6366F1]",
    },
    {
      id: "pending",
      label: "In Progress",
      value: "52",
      subtext: "20.3% in progress",
      icon: Clock,
      iconBg: "bg-[#FEF3EB]",
      iconColor: "text-[#F97316]",
    },
    {
      id: "expiring",
      label: "Due Soon (Next 30 Days)",
      value: "14",
      subtext: "Require attention",
      icon: Hourglass,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#3B82F6]",
    },
  ];

  const statItems = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {statItems.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-light-gray p-5 shadow-xs flex items-center gap-4 transition-all duration-200 hover:shadow-sm"
          >
            {/* Circular Icon Container */}
            <div
              className={`w-12 h-12 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
            >
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Metric Info */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-medium-black font-medium">
                {item.label}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-dark-black tracking-tight font-secondary leading-tight mt-0.5">
                {item.value}
              </span>
              <span className="text-[11px] text-light-black font-normal mt-0.5 truncate">
                {item.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
