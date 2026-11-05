"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  CircleDollarSign,
  TrendingUp,
  Users,
  FlaskConical,
  TrendingDown,
} from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const kpiCards = [
  {
    id: "mrr",
    title: "Monthly Recurring Revenue (MRR)",
    value: "$358,420",
    trend: {
      value: "12.4%",
      isPositive: true,
      direction: "down", // in image it shows green downward arrow ▾ 12.4%
      subtext: "vs Apr 1 - Apr 30: $318,820",
    },
    icon: CircleDollarSign,
    iconBg: "bg-emerald-50 text-emerald-600",
    lineColor: "#10B981",
    gradientId: "grad-mrr",
    pathD: "M 0 34 Q 30 38 60 35 T 130 24 T 200 12 L 200 48 L 0 48 Z",
    strokeD: "M 0 34 Q 30 38 60 35 T 130 24 T 200 12",
  },
  {
    id: "growth",
    title: "Net Account Growth",
    value: "+14.2%",
    trend: {
      value: "2.1% pts",
      isPositive: true,
      direction: "down",
      subtext: "vs Apr 1 - Apr 30",
    },
    icon: TrendingUp,
    iconBg: "bg-indigo-50 text-indigo-600",
    lineColor: "#6366F1",
    gradientId: "grad-growth",
    pathD: "M 0 34 Q 35 32 70 36 T 140 22 T 200 10 L 200 48 L 0 48 Z",
    strokeD: "M 0 34 Q 35 32 70 36 T 140 22 T 200 10",
  },
  {
    id: "subscribers",
    title: "Active Subscribers",
    value: "2,846",
    trend: {
      value: "8.7%",
      isPositive: true,
      direction: "down",
      subtext: "vs Apr 1 - Apr 30",
    },
    icon: Users,
    iconBg: "bg-sky-50 text-sky-600",
    lineColor: "#3B82F6",
    gradientId: "grad-subs",
    pathD: "M 0 34 Q 30 32 65 36 T 135 22 T 200 10 L 200 48 L 0 48 Z",
    strokeD: "M 0 34 Q 30 32 65 36 T 135 22 T 200 10",
  },
  {
    id: "trial-conv",
    title: "Free Trial Conversion",
    value: "18.7%",
    trend: {
      value: "2.3% pts",
      isPositive: true,
      direction: "down",
      subtext: "vs Apr 1 - Apr 30",
    },
    icon: FlaskConical,
    iconBg: "bg-purple-50 text-purple-600",
    lineColor: "#A855F7",
    gradientId: "grad-trial",
    pathD: "M 0 30 Q 30 28 60 38 T 130 24 T 200 10 L 200 48 L 0 48 Z",
    strokeD: "M 0 30 Q 30 28 60 38 T 130 24 T 200 10",
  },
  {
    id: "churn",
    title: "Churn Rate",
    value: "2.8%",
    trend: {
      value: "0.6% pts",
      isPositive: false,
      direction: "up", // red ▴ 0.6% pts
      subtext: "vs Apr 1 - Apr 30",
    },
    icon: TrendingDown,
    iconBg: "bg-red-50 text-red",
    lineColor: "#FF4842",
    gradientId: "grad-churn",
    pathD: "M 0 30 Q 35 26 70 36 T 140 24 T 200 10 L 200 48 L 0 48 Z",
    strokeD: "M 0 30 Q 35 26 70 36 T 140 24 T 200 10",
  },
];

export const AnalyticsHeader = () => {
  return (
    <div className="w-full flex flex-col gap-5 sm:gap-6">
      {/* Page Title & Subtitle */}
      <div className="w-full flex flex-col gap-1 min-w-0">
        <Title variant="small" className="!text-dark-black/80 font-bold tracking-tight">
          Performance
        </Title>
        <Text variant="small" className="text-medium-black font-normal">
          Financial, operational, and growth intelligence center
        </Text>
      </div>

      {/* 5 KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative group"
            >
              {/* Card Content with Inner Padding */}
              <div className="p-4 sm:p-5 pb-0 sm:pb-0">
                {/* Header: Icon & Label */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider leading-tight">
                    {card.title}
                  </span>
                </div>

                {/* Card Value */}
                <div className="mt-3">
                  <h3 className="text-2xl sm:text-[26px] font-bold text-dark-black/85 tracking-tight leading-none">
                    {card.value}
                  </h3>
                </div>

                {/* Card Trend & Date */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
                  <span
                    className={`font-semibold flex items-center gap-0.5 text-[11px] ${
                      card.trend.isPositive ? "text-emerald-600" : "text-red"
                    }`}
                  >
                    <span>{card.trend.direction === "down" ? "▾" : "▴"}</span>
                    <span>{card.trend.value}</span>
                  </span>
                  <span className="text-[10px] text-light-black font-medium truncate">
                    {card.trend.subtext}
                  </span>
                </div>
              </div>

              {/* Full-width Sparkline Chart Area Flush to Card Borders */}
              <div className="w-full h-12 sm:h-14 mt-2 relative overflow-hidden block">
                <svg
                  viewBox="0 0 200 48"
                  className="w-full h-full block"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id={card.gradientId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={card.lineColor}
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor={card.lineColor}
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Filled Area */}
                  <path
                    d={card.pathD}
                    fill={`url(#${card.gradientId})`}
                  />

                  {/* Smooth Stroke Line */}
                  <path
                    d={card.strokeD}
                    fill="none"
                    stroke={card.lineColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalyticsHeader;
