"use client";

import React from "react";
import { Clock, Calendar, Home, CheckCircle2 } from "lucide-react";

const performanceCards = [
  {
    id: 1,
    label: "BEST HOUR",
    title: "4 PM – 5 PM",
    value: "28%",
    subtext: "Conversion Rate",
    icon: Clock,
    barColor: "bg-sky-400",
  },
  {
    id: 2,
    label: "BEST DAY",
    title: "Tuesday",
    value: "22%",
    subtext: "Conversion Rate",
    icon: Calendar,
    barColor: "bg-indigo-400",
  },
  {
    id: 3,
    label: "BEST LEAD TYPE",
    title: "Expired Listings",
    value: "24%",
    subtext: "Conversion Rate",
    icon: Home,
    barColor: "bg-teal-400",
  },
  {
    id: 4,
    label: "BEST OUTCOME",
    title: "Appointment Set",
    value: "32%",
    subtext: "Of All Outcomes",
    icon: CheckCircle2,
    barColor: "bg-emerald-500",
  },
];

export const TopPerformance = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-light-gray shadow-sm w-full flex flex-col justify-between">
      {/* Header */}
      <h2 className="text-base sm:text-lg font-bold text-dark-black/80 mb-4">
        Top Performance Windows
      </h2>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {performanceCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="bg-light-gray/60 p-4 rounded-xl border border-light-gray flex flex-col justify-between min-h-[190px]"
            >
              {/* Badge Icon & Label */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white border border-light-gray flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-medium-black" />
                </div>
                <span className="text-[9px] font-bold tracking-wider text-light-black uppercase">
                  {card.label}
                </span>
              </div>

              {/* Title & Value */}
              <div className="my-2 space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-dark-black/80 leading-snug">
                  {card.title}
                </h3>
                <div className="text-2xl font-bold text-dark-black/90 tracking-tight">
                  {card.value}
                </div>
                <p className="text-[10px] text-light-black font-medium">
                  {card.subtext}
                </p>
              </div>

              {/* Decorative Bar Visualizer at Bottom */}
              <div className="flex items-end gap-1.5 pt-2">
                <div className="flex items-end gap-0.5">
                  <div className={`w-1 h-2 rounded-full ${card.barColor} opacity-50`} />
                  <div className={`w-1 h-4 rounded-full ${card.barColor} opacity-70`} />
                  <div className={`w-1 h-3 rounded-full ${card.barColor}`} />
                </div>
                <div className="flex items-end gap-0.5 ml-2">
                  <div className={`w-1 h-2 rounded-full ${card.barColor} opacity-50`} />
                  <div className={`w-1 h-5 rounded-full ${card.barColor}`} />
                  <div className={`w-1 h-3 rounded-full ${card.barColor} opacity-70`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopPerformance;