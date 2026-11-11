"use client";

import React from "react";
import { FileText, Calendar, Filter, List } from "lucide-react";

export default function ExportSummary({ totalAssignments, dateRange, appliedFilters, fieldsCount = 0 }) {
  const summaryCards = [
    {
      id: "assignments",
      title: totalAssignments == null ? "Counting..." : `${totalAssignments} assignment${totalAssignments === 1 ? "" : "s"}`,
      subtext: "Matching the filters",
      icon: FileText,
      iconBg: "bg-[#E6F7F7]",
      iconColor: "text-[#0EADAB]",
    },
    {
      id: "daterange",
      title: dateRange,
      subtext: "Assigned between",
      icon: Calendar,
      iconBg: "bg-[#EFF8FF]",
      iconColor: "text-[#175CD3]",
    },
    {
      id: "filters",
      title: "Applied filters",
      subtext: appliedFilters,
      icon: Filter,
      iconBg: "bg-[#F4EBFF]",
      iconColor: "text-[#7F56D9]",
    },
    {
      id: "fields",
      title: `${fieldsCount} fields`,
      subtext: "Included in report",
      icon: List,
      iconBg: "bg-[#FFF4ED]",
      iconColor: "text-[#FF692E]",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
        Export Summary
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="p-4 rounded-xl border border-light-gray bg-white flex items-start gap-3.5"
            >
              <div
                className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 mt-0.5`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-[13px] font-bold text-dark-black truncate">
                  {card.title}
                </span>
                <span className="text-[11px] text-light-black mt-0.5 leading-snug">
                  {card.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
