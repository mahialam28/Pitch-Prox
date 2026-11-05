"use client";

import React from "react";
import {
  FileText,
  User,
  CreditCard,
  Shield,
  Settings,
  TrendingUp,
  ClipboardCheck,
  Database,
} from "lucide-react";

export default function AuditStats({ stats }) {
  const defaultStats = [
    {
      id: "total",
      // Total = the six categories added together
      label: "Total Events",
      value: "1,248",
      trend: "18% from last 7 days",
      icon: FileText,
      iconBg: "bg-[#E6F7F7]",
      iconColor: "text-[#0EADAB]",
    },
    {
      id: "user_mgmt",
      label: "User Management",
      value: "290",
      trend: "12% from last 7 days",
      icon: User,
      iconBg: "bg-[#F3E8FF]",
      iconColor: "text-[#9333EA]",
    },
    {
      id: "billing",
      label: "Billing & Payments",
      value: "260",
      trend: "22% from last 7 days",
      icon: CreditCard,
      iconBg: "bg-[#FEF3EB]",
      iconColor: "text-[#F97316]",
    },
    {
      id: "security",
      label: "Security Events",
      value: "186",
      trend: "35% from last 7 days",
      icon: Shield,
      iconBg: "bg-[#ECFDF5]",
      iconColor: "text-[#10B981]",
    },
    {
      id: "system",
      label: "System Changes",
      value: "410",
      trend: "9% from last 7 days",
      icon: Settings,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      id: "compliance",
      label: "Compliance Events",
      value: "58",
      trend: "4% from last 7 days",
      icon: ClipboardCheck,
      iconBg: "bg-[#FEF9C3]",
      iconColor: "text-[#CA8A04]",
    },
    {
      id: "data_changes",
      label: "Data Changes",
      value: "44",
      trend: "6% from last 7 days",
      icon: Database,
      iconBg: "bg-[#FCE7F3]",
      iconColor: "text-[#DB2777]",
    },
  ];

  const statItems = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 sm:gap-5 w-full">
      {statItems.map((item) => {
        const IconComponent = item.icon;

        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-sm group"
          >
            {/* Top Row: Label & Icon */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium text-medium-black">
                {item.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200`}
              >
                <IconComponent className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
            </div>

            {/* Metric Value & Trend */}
            <div className="mt-3 space-y-2">
              <span className="text-2xl sm:text-3xl font-bold text-dark-black tracking-tight font-secondary leading-none block">
                {item.value}
              </span>

              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>↑ {item.trend}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
