"use client";

import React from "react";
import { FileText, Eye, FileEdit, TrendingUp } from "lucide-react";

export default function TemplatesStats({
  totalTemplates = 24,
  activeTemplates = 12,
  drafts = 7,
  avgOpenRate = "46.8%",
}) {
  const stats = [
    {
      id: "total-templates",
      label: "TOTAL TEMPLATES",
      value: totalTemplates,
      icon: FileText,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "active-templates",
      label: "ACTIVE TEMPLATES",
      value: activeTemplates,
      icon: Eye,
      iconBg: "bg-sky-50 text-sky-600",
    },
    {
      id: "drafts",
      label: "DRAFTS",
      value: drafts,
      icon: FileEdit,
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      id: "avg-open-rate",
      label: "AVG. OPEN RATE",
      value: avgOpenRate,
      icon: TrendingUp,
      iconBg: "bg-orange-50 text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white p-5 rounded-2xl border border-light-gray shadow-xs flex items-center gap-4 transition-all duration-200 hover:border-slate-300"
          >
            {/* Left: Icon Box */}
            <div
              className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
            >
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Right: Label & Value */}
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider">
                {stat.label}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-dark-black/85 tracking-tight font-secondary mt-0.5">
                {stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
