"use client";

import React from "react";
import {
  Users,
  ShieldCheck,
  UserPlus,
  UserMinus,
  TrendingUp,
} from "lucide-react";

export default function AccessStats({ stats, onStatClick }) {
  const defaultStats = [
    {
      id: "total",
      label: "TOTAL USERS",
      value: "142",
      subtext: "↑ 12 this month",
      isTrend: true,
      linkText: "View all users →",
      icon: Users,
      iconBg: "bg-[#E6F7F7]",
      iconColor: "text-[#0EADAB]",
    },
    {
      id: "active",
      label: "ACTIVE USERS",
      value: "128",
      subtext: "90.1% of total",
      linkText: "View active users →",
      icon: ShieldCheck,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      id: "onboarding",
      label: "ONBOARDING IN PROGRESS",
      value: "18",
      subtext: "12.7% of total",
      linkText: "View In Progress users →",
      icon: UserPlus,
      iconBg: "bg-[#FEF3EB]",
      iconColor: "text-[#F97316]",
    },
    {
      id: "offboarding",
      label: "OFF BOARDING PENDING",
      value: "18",
      subtext: "12.7% of total",
      linkText: "View Offboarding Pending users →",
      icon: UserMinus,
      iconBg: "bg-[#FEF3EB]",
      iconColor: "text-[#F97316]",
    },
  ];

  const statItems = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full">
      {statItems.map((item) => {
        const IconComponent = item.icon;

        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-sm group"
          >
            {/* Top Row: Icon & Label/Value */}
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
              >
                <IconComponent className="w-5 h-5 stroke-[2.2]" />
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-semibold text-light-black tracking-wider uppercase truncate">
                  {item.label}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-dark-black tracking-tight font-secondary leading-tight mt-0.5">
                  {item.value}
                </span>
                <span
                  className={`text-xs mt-0.5 font-medium ${
                    item.isTrend
                      ? "text-emerald-600 flex items-center gap-1"
                      : "text-light-black"
                  }`}
                >
                  {item.subtext}
                </span>
              </div>
            </div>

            {/* Bottom Link */}
            <div className="mt-4 pt-3 border-t border-light-gray/60">
              <button
                type="button"
                onClick={() => onStatClick && onStatClick(item.id)}
                className="text-xs font-semibold text-primary hover:text-[#0c9593] transition-colors cursor-pointer text-left"
              >
                {item.linkText}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
