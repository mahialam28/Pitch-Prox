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

// Cards from /api/v1/compliance/policies → stats
function policyStats(stats) {
  const value = (number) => (stats ? number.toLocaleString() : "—");
  const ack = stats?.acknowledgment;
  return [
    { id: "total_policies", label: "Total Policies", value: value(stats?.total ?? 0), trend: stats ? `${stats.addedThisMonth ? `↑ ${stats.addedThisMonth}` : "None"} added this month` : "", trendColor: "text-primary", icon: FileText, iconWrapperBg: "bg-[#E6F8F7]", iconColor: "text-[#0EADAB]" },
    { id: "approved_policies", label: "Approved Policies", value: value(stats?.approved ?? 0), trend: stats?.total ? `${Math.round((stats.approved / stats.total) * 100)}% of total` : "", trendColor: "text-primary", icon: CheckCircle2, iconWrapperBg: "bg-[#E6F8F7]", iconColor: "text-[#0EADAB]" },
    { id: "under_review", label: "Under Review", value: value(stats?.underReview ?? 0), trend: stats?.underReview ? "Requires attention" : "Nothing waiting", trendColor: stats?.underReview ? "text-[#D97706]" : "text-medium-black", icon: AlertTriangle, iconWrapperBg: "bg-[#FEF3C7]", iconColor: "text-[#D97706]" },
    { id: "draft_policies", label: "Draft Policies", value: value(stats?.drafts ?? 0), trend: stats?.drafts ? "In progress" : "No drafts", trendColor: "text-medium-black", icon: FileEdit, iconWrapperBg: "bg-[#F3F4F6]", iconColor: "text-medium-black" },
    { id: "ack_rate", label: "Acknowledgment Rate", value: ack?.rate == null ? "—" : `${ack.rate}%`, trend: ack ? (ack.overdue ? `${ack.overdue} overdue signature${ack.overdue === 1 ? "" : "s"}` : ack.pending ? `${ack.pending} waiting to sign` : "Employees up to date") : "", trendColor: ack?.overdue ? "text-red" : "text-[#16A34A]", icon: ShieldCheck, iconWrapperBg: "bg-[#DCFCE7]", iconColor: "text-[#16A34A]" },
  ];
}

export default function ComplianceHeader({ stats }) {
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
        {policyStats(stats).map((stat) => {
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
