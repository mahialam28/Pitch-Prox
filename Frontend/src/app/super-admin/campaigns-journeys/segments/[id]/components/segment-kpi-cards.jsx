"use client";

import React from "react";
import { Users, Mail, CalendarCheck, TrendingUp, ArrowUp } from "lucide-react";

export default function SegmentKpiCards({ kpis }) {
  const data = [
    {
      id: "total-leads",
      label: "TOTAL LEADS",
      value: kpis?.totalLeads || "842",
      growth: kpis?.totalLeadsGrowth || "+14.2%",
      icon: Users,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "contacted",
      label: "CONTACTED",
      value: kpis?.contacted || "618",
      growth: kpis?.contactedGrowth || "+18.6%",
      icon: Mail,
      iconBg: "bg-purple-50 text-purple-600",
    },
    {
      id: "appointments-set",
      label: "APPOINTMENTS SET",
      value: kpis?.appointmentsSet || "286",
      growth: kpis?.appointmentsGrowth || "+22.1%",
      icon: CalendarCheck,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "conversion-rate",
      label: "CONVERSION RATE",
      value: kpis?.conversionRate || "34.2%",
      growth: kpis?.conversionGrowth || "+6.8%",
      icon: TrendingUp,
      iconBg: "bg-orange-50 text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {data.map((item) => {
        const IconComponent = item.icon;

        return (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-3 transition-all duration-200 hover:border-slate-300"
          >
            {/* Top Row: Label and Icon */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider">
                  {item.label}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-dark-black/85 tracking-tight font-secondary mt-1">
                  {item.value}
                </span>
              </div>

              <div
                className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
              >
                <IconComponent className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            {/* Bottom Row: Growth indicator */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <ArrowUp className="w-3 h-3 stroke-[2.5]" />
              <span>{item.growth}</span>
              <span className="text-light-black font-normal ml-0.5">
                vs last 30 days
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
