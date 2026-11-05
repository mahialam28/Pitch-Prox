"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

const infrastructureData = [
  {
    id: "avg-response-time",
    label: "Average AI Response Time",
    value: "412 ms",
    trend: "18 ms",
    trendType: "arrow",
    trendColor: "text-emerald-600",
    status: "Healthy",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "prompt-gen-cost",
    label: "Prompt Generation Cost",
    value: "$7,842.18",
    trend: "6.7%",
    trendType: "arrow",
    trendColor: "text-emerald-600",
    status: "Healthy",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "total-ai-requests",
    label: "Total AI Requests",
    value: "1,842,930",
    trend: "11.3%",
    trendType: "bullet",
    trendColor: "text-emerald-600",
    status: "Healthy",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "avg-tokens-call",
    label: "Average Tokens Per Call",
    value: "1,245",
    trend: "5.2%",
    trendType: "arrow",
    trendColor: "text-emerald-600",
    status: "Healthy",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "twilio-cost",
    label: "Twilio Cost",
    value: "$9,213.44",
    trend: "4.1%",
    trendType: "bullet",
    trendColor: "text-amber-600",
    status: "Elevated",
    statusStyle: "bg-amber-50 text-amber-600 border border-amber-100",
  },
  {
    id: "queue-latency",
    label: "Queue Latency",
    value: "320 ms",
    trend: "22 ms",
    trendType: "arrow",
    trendColor: "text-emerald-600",
    status: "Healthy",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
];

export const InfrastructureAndHealth = () => {
  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4">
      {/* Section Header */}
      <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
        AI Infrastructure & Health
      </h3>

      {/* 6-Column Responsive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {infrastructureData.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-2xl border border-light-gray p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
          >
            {/* Top Row: Label */}
            <span className="text-[10px] font-bold text-light-black uppercase tracking-wider leading-tight">
              {card.label}
            </span>

            {/* Middle: Value */}
            <div className="my-2.5">
              <h4 className="text-xl sm:text-2xl font-bold text-dark-black/80 tracking-tight">
                {card.value}
              </h4>
            </div>

            {/* Bottom Row: Trend & Status Badge */}
            <div className="flex flex-col gap-2 pt-1">
              <div className={`flex items-center gap-1 text-[11px] font-semibold ${card.trendColor}`}>
                {card.trendType === "arrow" ? (
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <span className="text-xs font-bold leading-none">•</span>
                )}
                <span>{card.trend}</span>
              </div>

              <div>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${card.statusStyle}`}
                >
                  {card.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfrastructureAndHealth;
