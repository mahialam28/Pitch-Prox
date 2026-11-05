"use client";

import React from "react";
import { Users, Timer, CreditCard, Target, Activity, ArrowUpRight } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const statsData = [
  {
    id: "active_users",
    label: "Active Users",
    value: "1,248",
    trend: "↗ 12.4%",
    isPositive: true,
    subtext: "vs last 30 days",
    icon: Users,
    iconColor: "text-emerald-600 bg-emerald-50",
  },
  {
    id: "trial_accounts",
    label: "Trial Accounts",
    value: "186",
    trend: "↗ 8.7%",
    isPositive: true,
    subtext: "vs last 30 days",
    icon: Timer,
    iconColor: "text-purple-600 bg-purple-50",
  },
  {
    id: "past_due",
    label: "Past Due Accounts",
    value: "23",
    trend: "↗ 4.3%",
    isPositive: false, // Past due increase is warning
    subtext: "vs last 30 days",
    icon: CreditCard,
    iconColor: "text-orange-500 bg-orange-50",
  },
  {
    id: "calibration",
    label: "Calibration Completion",
    value: "78.6%",
    trend: "↗ 6.1%",
    isPositive: true,
    subtext: "vs last 30 days",
    icon: Target,
    iconColor: "text-blue-600 bg-blue-50",
  },
  {
    id: "account_health",
    label: "Avg. Account Health",
    value: "86",
    maxVal: "/ 100",
    trend: "↗ 5.2%",
    isPositive: true,
    subtext: "vs last 30 days",
    icon: Activity,
    iconColor: "text-amber-500 bg-amber-50",
  },
];

const UserHeader = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col gap-1 min-w-0">
        <Title
          variant="small"
          className="!text-dark-black/80 font-bold text-2xl sm:text-3xl font-secondary"
        >
          Users
        </Title>
        <Text variant="small" className="text-light-black">
          Manage and monitor all customer accounts on the PitchProX platform.
        </Text>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 w-full">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className="bg-white p-5 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-4 hover:border-primary/40 transition-colors"
            >
              {/* Top Icon */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Label & Numbers */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-light-black block">
                  {stat.label}
                </span>

                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-bold text-dark-black/85 tracking-tight font-secondary">
                    {stat.value}
                  </span>
                  {stat.maxVal && (
                    <span className="text-xs font-semibold text-light-black">
                      {stat.maxVal}
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold flex items-center gap-0.5 ${
                      stat.isPositive ? "text-emerald-600" : "text-red"
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>

                <p className="text-[11px] text-light-black font-normal mt-0.5">
                  {stat.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserHeader;
