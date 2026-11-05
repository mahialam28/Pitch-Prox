"use client";

import React from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  FileEdit,
  ShieldCheck,
} from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const policyStats = [
  {
    id: "total_policies",
    label: "Total Policies",
    value: "28",
    trend: "↑ 2 this month",
    trendColor: "text-primary",
    icon: FileText,
    iconWrapperBg: "bg-[#E6F8F7]",
    iconColor: "text-[#0EADAB]",
  },
  {
    id: "approved_policies",
    label: "Approved Policies",
    value: "22",
    trend: "↑ 78% of total",
    trendColor: "text-primary",
    icon: CheckCircle2,
    iconWrapperBg: "bg-[#F3E8FF]",
    iconColor: "text-[#9333EA]",
  },
  {
    id: "under_review",
    label: "Under Review",
    value: "4",
    trend: "Requires attention",
    trendColor: "text-[#D97706]",
    icon: AlertTriangle,
    iconWrapperBg: "bg-[#FEF3C7]",
    iconColor: "text-[#D97706]",
  },
  {
    id: "draft_policies",
    label: "Draft Policies",
    value: "2",
    trend: "In progress",
    trendColor: "text-medium-black",
    icon: FileEdit,
    iconWrapperBg: "bg-[#E0F2FE]",
    iconColor: "text-[#0284C7]",
  },
  {
    id: "acknowledgment_rate",
    label: "Acknowledgment Rate",
    value: "93%",
    trend: "Employees up to date",
    trendColor: "text-[#16A34A]",
    icon: ShieldCheck,
    iconWrapperBg: "bg-[#DCFCE7]",
    iconColor: "text-[#16A34A]",
  },
];

export default function ComplianceHeader() {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Page Title & Subtitle ── */}
      <div className="w-full flex flex-col gap-1 min-w-0">
        <Title
          variant="small"
          className="!text-dark-black/80 font-bold text-2xl sm:text-3xl font-secondary"
        >
          Policy Documents
        </Title>
        <Text variant="small" className="text-light-black">
          Manage internal policies, procedures, and compliance documentation.
        </Text>
      </div>

      {/* ── 5 Metric Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 w-full">
        {policyStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white p-5 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-3.5 hover:border-primary/40 transition-all duration-200"
            >
              {/* Top Icon with colored background */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.iconWrapperBg} ${stat.iconColor}`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* Label & Numbers */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-light-black block">
                  {stat.label}
                </span>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-dark-black/85 tracking-tight font-secondary">
                    {stat.value}
                  </span>
                </div>

                <p className={`text-xs font-medium ${stat.trendColor}`}>
                  {stat.trend}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
