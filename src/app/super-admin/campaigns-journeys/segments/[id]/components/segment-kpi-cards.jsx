"use client";

import React from "react";
import { Users, Mail, CalendarCheck, TrendingUp } from "lucide-react";

export default function SegmentKpiCards({ kpis }) {
  // User metrics for the segment's current members
  const data = [
    { id: "users", label: "USERS", value: kpis?.users ?? "0", growth: kpis?.usersNote ?? "", icon: Users, iconBg: "bg-emerald-50 text-emerald-600" },
    { id: "paid", label: "PAYING USERS", value: kpis?.paid ?? "0", growth: kpis?.paidNote ?? "", icon: TrendingUp, iconBg: "bg-orange-50 text-orange-500" },
    { id: "trial", label: "ON A TRIAL", value: kpis?.trial ?? "0", growth: "", icon: CalendarCheck, iconBg: "bg-sky-50 text-sky-600" },
    { id: "usage", label: "AVG. CALL USAGE", value: kpis?.usage ?? "0%", growth: "", icon: Mail, iconBg: "bg-purple-50 text-purple-600" },
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

            {/* Bottom Row: note */}
            {item.growth && <div className="text-[11px] text-light-black">{item.growth}</div>}
          </div>
        );
      })}
    </div>
  );
}
