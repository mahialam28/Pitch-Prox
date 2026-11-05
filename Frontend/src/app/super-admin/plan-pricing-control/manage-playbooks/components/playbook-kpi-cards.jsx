"use client";

import React from "react";
import { BookOpen, DollarSign, Tag } from "lucide-react";

export const PlaybookKpiCards = () => {
  const kpis = [
    {
      id: "total-playbooks",
      title: "Total Playbooks",
      value: "128",
      subtext: "Active in Marketplace",
      icon: BookOpen,
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      id: "your-playbooks",
      title: "Your Playbooks",
      value: "23",
      subtext: "Created by your team",
      icon: BookOpen,
      iconBg: "bg-sky-50 text-sky-600",
    },
    {
      id: "total-revenue",
      title: "Total Revenue (30d)",
      value: "$5,432",
      subtext: "From playbook sales",
      icon: DollarSign,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "avg-price",
      title: "Avg. Price",
      value: "$49",
      subtext: "Per playbook",
      icon: Tag,
      iconBg: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 flex items-center gap-4"
          >
            {/* Icon Box */}
            <div
              className={`w-11 h-11 rounded-2xl ${kpi.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-medium-black truncate">
                {kpi.title}
              </span>
              <h3 className="text-2xl sm:text-[26px] font-bold text-dark-black/85 font-secondary tracking-tight leading-none mt-1">
                {kpi.value}
              </h3>
              <span className="text-[11px] text-light-black font-medium mt-1 truncate">
                {kpi.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlaybookKpiCards;
