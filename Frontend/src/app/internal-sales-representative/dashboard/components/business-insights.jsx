"use client";

import React from "react";

const insightsData = [
  {
    id: "mrr",
    label: "Monthly Recurring Revenue (MRR)",
    value: "$128,540",
    change: "↑ 8.6%",
    isPositive: true,
    subtext: "vs Last Month",
  },
  {
    id: "churn",
    label: "Churn Rate",
    value: "2.4%",
    change: "↑ 0.4%",
    isPositive: false,
    subtext: "vs Last Month",
  },
  {
    id: "net_growth",
    label: "Net Account Growth",
    value: "348",
    extraBadge: "+ 14",
    isPositive: true,
    subtext: "vs Last Month",
  },
  {
    id: "active_paying",
    label: "Active Paying Accounts",
    value: "+28",
    extraBadge: "↑ 12.5%",
    isPositive: true,
    subtext: "vs Last Month",
  },
  {
    id: "trial_to_paid",
    label: "Trial to Paid Conversion",
    value: "24.6%",
    change: "↑ 5.1%",
    isPositive: true,
    subtext: "vs Last Month",
  },
  {
    id: "arpu",
    label: "Average Revenue Per User (ARPU)",
    value: "$369",
    change: "↑ 6.2%",
    isPositive: true,
    subtext: "vs Last Month",
  },
  {
    id: "report_revenue",
    label: "Report Revenue",
    value: "$18,764",
    change: "↑ 9.3%",
    isPositive: true,
    subtext: "vs Last Month",
  },
  {
    id: "overage_revenue",
    label: "Overage Revenue",
    value: "$6,243",
    change: "↑ 4.8%",
    isPositive: true,
    subtext: "vs Last Month",
  },
];

// insights: live cards from /api/v1/sales/dashboard (same shape as the sample list)
const BusinessInsights = ({ insights } = {}) => {
  const items = insights ?? insightsData;
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Business Insights
        </h3>
      </div>

      {/* 4x2 Grid of Insight Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-light-gray rounded-xl p-3.5 sm:p-4 bg-white flex flex-col justify-between gap-2.5 shadow-2xs hover:border-primary/40 transition-colors"
          >
            {/* Metric Label */}
            <span className="text-[11px] font-bold text-light-black uppercase tracking-wider leading-snug min-h-[32px] flex items-start">
              {item.label}
            </span>

            {/* Value & Inline Change */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-lg sm:text-xl font-bold text-dark-black/85 tracking-tight font-secondary">
                {item.value}
              </span>
              {item.extraBadge && (
                <span className="text-xs font-semibold text-emerald-600">
                  {item.extraBadge}
                </span>
              )}
            </div>

            {/* Sub-stat / Trend vs Last Month */}
            <div className="flex items-center gap-1.5 text-[11px]">
              {item.change && (
                <span
                  className={
                    item.isPositive ? "text-emerald-600 font-semibold" : "text-red font-semibold"
                  }
                >
                  {item.change}
                </span>
              )}
              <span className="text-light-black font-normal">{item.subtext}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessInsights;
