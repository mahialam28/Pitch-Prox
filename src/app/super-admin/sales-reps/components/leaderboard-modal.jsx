"use client";

import React, { useState } from "react";
import {
  X,
  Trophy,
  Download,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const timeframeData = {
  "This Month": {
    topReps: [
      {
        rank: 2,
        name: "Sarah Johnson",
        role: "Closer",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140",
        revenue: "$114,230",
        trend: "+4.2%",
        podiumLabel: "RUNNER UP",
        podiumBg: "bg-gradient-to-b from-slate-400 to-slate-500",
        borderColor: "border-slate-300",
        badgeBg: "bg-slate-400",
      },
      {
        rank: 1,
        name: "Ryan Anderson",
        role: "Senior Closer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160",
        revenue: "$142,580",
        trend: "+8.7%",
        podiumLabel: "TOP PERFORMER",
        podiumBg: "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600",
        borderColor: "border-primary",
        badgeBg: "bg-amber-400",
      },
      {
        rank: 3,
        name: "Michael Carter",
        role: "Closing Specialist",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
        revenue: "$98,450",
        trend: "+2.1%",
        podiumLabel: "ELITE TIER",
        podiumBg: "bg-gradient-to-b from-amber-700 to-amber-900",
        borderColor: "border-amber-700",
        badgeBg: "bg-amber-700",
      },
    ],
    roster: [
      {
        rank: "#04",
        name: "Emily Davis",
        role: "Closer",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        revenue: "$82,400",
        revTrend: "▲ 1.6%",
        revPositive: true,
        conversion: "22.1%",
        quotaPercent: "92%",
        quotaCount: "$82k / $90k",
        quotaFill: 92,
      },
      {
        rank: "#05",
        name: "David Martinez",
        role: "Closer",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        revenue: "$76,150",
        revTrend: "▼ 0.3%",
        revPositive: false,
        conversion: "18.9%",
        quotaPercent: "84%",
        quotaCount: "$76k / $90k",
        quotaFill: 84,
      },
      {
        rank: "#06",
        name: "Jonathan White",
        role: "Closing Specialist",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
        revenue: "$71,200",
        revTrend: "▲ 3.4%",
        revPositive: true,
        conversion: "20.4%",
        quotaPercent: "79%",
        quotaCount: "$71k / $90k",
        quotaFill: 79,
      },
      {
        rank: "#07",
        name: "Jessica Lee",
        role: "Sales Rep",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        revenue: "$64,800",
        revTrend: "▲ 0.8%",
        revPositive: true,
        conversion: "16.5%",
        quotaPercent: "72%",
        quotaCount: "$65k / $90k",
        quotaFill: 72,
      },
    ],
    avgRevenue: "$54,230",
    totalVolume: "$2,603,040",
  },
  "Quarterly": {
    topReps: [
      {
        rank: 2,
        name: "Sarah Johnson",
        role: "Closer",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140",
        revenue: "$342,180",
        trend: "+9.6%",
        podiumLabel: "RUNNER UP",
        podiumBg: "bg-gradient-to-b from-slate-400 to-slate-500",
        borderColor: "border-slate-300",
        badgeBg: "bg-slate-400",
      },
      {
        rank: 1,
        name: "Ryan Anderson",
        role: "Senior Closer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160",
        revenue: "$418,920",
        trend: "+12.4%",
        podiumLabel: "TOP PERFORMER",
        podiumBg: "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600",
        borderColor: "border-primary",
        badgeBg: "bg-amber-400",
      },
      {
        rank: 3,
        name: "Michael Carter",
        role: "Closing Specialist",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
        revenue: "$295,300",
        trend: "+5.8%",
        podiumLabel: "ELITE TIER",
        podiumBg: "bg-gradient-to-b from-amber-700 to-amber-900",
        borderColor: "border-amber-700",
        badgeBg: "bg-amber-700",
      },
    ],
    roster: [
      {
        rank: "#04",
        name: "Emily Davis",
        role: "Closer",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        revenue: "$248,500",
        revTrend: "▲ 4.2%",
        revPositive: true,
        conversion: "23.5%",
        quotaPercent: "95%",
        quotaCount: "$248k / $260k",
        quotaFill: 95,
      },
      {
        rank: "#05",
        name: "David Martinez",
        role: "Closer",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        revenue: "$226,800",
        revTrend: "▲ 1.8%",
        revPositive: true,
        conversion: "19.8%",
        quotaPercent: "88%",
        quotaCount: "$226k / $260k",
        quotaFill: 88,
      },
      {
        rank: "#06",
        name: "Jonathan White",
        role: "Closing Specialist",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
        revenue: "$214,900",
        revTrend: "▲ 5.1%",
        revPositive: true,
        conversion: "21.2%",
        quotaPercent: "83%",
        quotaCount: "$214k / $260k",
        quotaFill: 83,
      },
      {
        rank: "#07",
        name: "Jessica Lee",
        role: "Sales Rep",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        revenue: "$192,400",
        revTrend: "▲ 2.3%",
        revPositive: true,
        conversion: "17.4%",
        quotaPercent: "75%",
        quotaCount: "$192k / $260k",
        quotaFill: 75,
      },
    ],
    avgRevenue: "$162,400",
    totalVolume: "$7,795,200",
  },
  "YTD": {
    topReps: [
      {
        rank: 2,
        name: "Sarah Johnson",
        role: "Closer",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140",
        revenue: "$1,048,600",
        trend: "+14.5%",
        podiumLabel: "RUNNER UP",
        podiumBg: "bg-gradient-to-b from-slate-400 to-slate-500",
        borderColor: "border-slate-300",
        badgeBg: "bg-slate-400",
      },
      {
        rank: 1,
        name: "Ryan Anderson",
        role: "Senior Closer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160",
        revenue: "$1,280,450",
        trend: "+18.2%",
        podiumLabel: "TOP PERFORMER",
        podiumBg: "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600",
        borderColor: "border-primary",
        badgeBg: "bg-amber-400",
      },
      {
        rank: 3,
        name: "Michael Carter",
        role: "Closing Specialist",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140",
        revenue: "$892,100",
        trend: "+11.3%",
        podiumLabel: "ELITE TIER",
        podiumBg: "bg-gradient-to-b from-amber-700 to-amber-900",
        borderColor: "border-amber-700",
        badgeBg: "bg-amber-700",
      },
    ],
    roster: [
      {
        rank: "#04",
        name: "Emily Davis",
        role: "Closer",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        revenue: "$762,000",
        revTrend: "▲ 7.8%",
        revPositive: true,
        conversion: "24.1%",
        quotaPercent: "97%",
        quotaCount: "$762k / $780k",
        quotaFill: 97,
      },
      {
        rank: "#05",
        name: "David Martinez",
        role: "Closer",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
        revenue: "$694,500",
        revTrend: "▲ 3.9%",
        revPositive: true,
        conversion: "20.7%",
        quotaPercent: "89%",
        quotaCount: "$694k / $780k",
        quotaFill: 89,
      },
      {
        rank: "#06",
        name: "Jonathan White",
        role: "Closing Specialist",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
        revenue: "$658,200",
        revTrend: "▲ 6.4%",
        revPositive: true,
        conversion: "22.0%",
        quotaPercent: "85%",
        quotaCount: "$658k / $780k",
        quotaFill: 85,
      },
      {
        rank: "#07",
        name: "Jessica Lee",
        role: "Sales Rep",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        revenue: "$589,100",
        revTrend: "▲ 4.1%",
        revPositive: true,
        conversion: "18.1%",
        quotaPercent: "77%",
        quotaCount: "$589k / $780k",
        quotaFill: 77,
      },
    ],
    avgRevenue: "$488,500",
    totalVolume: "$23,448,000",
  },
};

export default function LeaderboardModal({ isOpen, onClose }) {
  const [timeframe, setTimeframe] = useState("This Month");
  const [activeTab, setActiveTab] = useState("Total Revenue");

  if (!isOpen) return null;

  const baseData = timeframeData[timeframe] || timeframeData["This Month"];
  // Rank everyone by the selected metric; the podium shows 1st, 2nd and 3rd for that metric
  const number = (value) => Number(String(value ?? "0").replace(/[^0-9.]/g, "")) || 0;
  const everyone = [...baseData.topReps, ...baseData.roster].map((rep) => {
    const revenue = number(rep.revenue);
    const conversion = rep.conversion ? number(rep.conversion) : Math.round((18 + ((revenue / 10000) % 14)) * 10) / 10;
    const quota = rep.quotaFill ?? Math.min(130, Math.round(revenue / 1100));
    const calls = Math.round(revenue / 260 + rep.name.length * 7);
    return { ...rep, metrics: { "Total Revenue": revenue, "Lead Conversion": conversion, "Calls Made": calls, "Quota Attainment": quota } };
  });
  const display = (rep) =>
    ({
      "Total Revenue": "$" + rep.metrics["Total Revenue"].toLocaleString("en-US"),
      "Lead Conversion": rep.metrics["Lead Conversion"] + "%",
      "Calls Made": rep.metrics["Calls Made"].toLocaleString("en-US"),
      "Quota Attainment": rep.metrics["Quota Attainment"] + "%",
    })[activeTab];
  const ranked = [...everyone].sort((a, b) => b.metrics[activeTab] - a.metrics[activeTab]);
  const ordinal = (n) => n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");
  // Podium colours stay by position (centre = 1st)
  const [firstStyle, secondStyle, thirdStyle] = [baseData.topReps[1], baseData.topReps[0], baseData.topReps[2]];
  const podium = (rep, style, position) => ({ ...rep, revenue: display(rep), podiumLabel: ordinal(position), podiumBg: style.podiumBg, borderColor: style.borderColor, badgeBg: style.badgeBg, rank: position });
  const topPerformer = podium(ranked[0], firstStyle, 1);
  const runnerUp = podium(ranked[1], secondStyle, 2);
  const eliteTier = podium(ranked[2], thirdStyle, 3);
  const currentData = { ...baseData, roster: ranked.slice(3).map((rep, index) => ({ ...rep, rank: ordinal(index + 4), metricValue: display(rep) })) };

  const handleDownloadReport = () => {
    toast.success("Downloading Full Sales Leaderboard Report...");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-light-gray shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 sm:px-8 pt-6 sm:pt-7 pb-4">
          <div>
            <h2 className="font-bold text-dark-black/90 text-xl sm:text-2xl font-secondary">
              Sales Leaderboard
            </h2>
            <p className="text-xs sm:text-sm text-light-black font-normal mt-0.5">
              Real-time performance rankings across the team
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Smooth Sliding Timeframe Segmented Control */}
            <div className="flex items-center bg-light-gray/70 p-1 rounded-2xl border border-light-gray relative">
              {["This Month", "Quarterly", "YTD"].map((t) => {
                const isActive = timeframe === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeframe(t)}
                    className={`relative px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer select-none z-10 ${
                      isActive
                        ? "text-dark-black font-bold"
                        : "text-medium-black hover:text-dark-black"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeLeaderboardTimeframePill"
                        className="absolute inset-0 bg-white rounded-xl shadow-xs border border-light-gray -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      />
                    )}
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="px-6 sm:px-8 py-2 overflow-y-auto space-y-6">
          {/* ── Podium Top 3 Performers Section ── */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-4 pb-2">
            {/* ── Rank 2: Runner Up ── */}
            <div className="flex flex-col items-center text-center">
              {/* Avatar + Badge */}
              <div className="relative">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 ${runnerUp.borderColor} shadow-sm bg-slate-100`}>
                  <img
                    src={runnerUp.avatar}
                    alt={runnerUp.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${runnerUp.badgeBg} border-2 border-white text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                  {runnerUp.rank}
                </div>
              </div>

              {/* Name & Revenue */}
              <h4 className="font-bold text-dark-black/85 text-xs sm:text-sm mt-2.5 leading-tight">
                {runnerUp.name}
              </h4>
              <AnimatePresence mode="wait">
                <motion.p
                  key={runnerUp.revenue}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="text-base sm:text-xl font-bold text-primary font-secondary mt-0.5"
                >
                  {runnerUp.revenue}
                </motion.p>
              </AnimatePresence>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{runnerUp.trend}</span>
              </div>

              {/* Podium Base Block */}
              <div className={`w-full mt-3 ${runnerUp.podiumBg} rounded-xl sm:rounded-2xl py-5 sm:py-6 px-2 flex items-center justify-center shadow-sm`}>
                <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                  {runnerUp.podiumLabel}
                </span>
              </div>
            </div>

            {/* ── Rank 1: Top Performer ── */}
            <div className="flex flex-col items-center text-center -mt-4">
              {/* Avatar + Trophy + Badge */}
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-primary shadow-md p-0.5 bg-white">
                  <img
                    src={topPerformer.avatar}
                    alt={topPerformer.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                {/* Floating Trophy Icon */}
                <div className="absolute -top-2 -right-1 text-primary">
                  <Trophy className="w-5 h-5 fill-primary text-primary" />
                </div>
                {/* Rank 1 Badge */}
                <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full ${topPerformer.badgeBg} border-2 border-white text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                  {topPerformer.rank}
                </div>
              </div>

              {/* Name & Revenue */}
              <h4 className="font-bold text-dark-black/85 text-sm sm:text-base mt-2.5 leading-tight">
                {topPerformer.name}
              </h4>
              <AnimatePresence mode="wait">
                <motion.p
                  key={topPerformer.revenue}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="text-xl sm:text-2xl font-bold text-primary font-secondary mt-0.5"
                >
                  {topPerformer.revenue}
                </motion.p>
              </AnimatePresence>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{topPerformer.trend}</span>
              </div>

              {/* Podium Base Block */}
              <div className={`w-full mt-3 ${topPerformer.podiumBg} rounded-xl sm:rounded-2xl py-7 sm:py-8 px-2 flex items-center justify-center shadow-md`}>
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                  {topPerformer.podiumLabel}
                </span>
              </div>
            </div>

            {/* ── Rank 3: Elite Tier ── */}
            <div className="flex flex-col items-center text-center">
              {/* Avatar + Badge */}
              <div className="relative">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 ${eliteTier.borderColor} shadow-sm bg-slate-100`}>
                  <img
                    src={eliteTier.avatar}
                    alt={eliteTier.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${eliteTier.badgeBg} border-2 border-white text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                  {eliteTier.rank}
                </div>
              </div>

              {/* Name & Revenue */}
              <h4 className="font-bold text-dark-black/85 text-xs sm:text-sm mt-2.5 leading-tight">
                {eliteTier.name}
              </h4>
              <AnimatePresence mode="wait">
                <motion.p
                  key={eliteTier.revenue}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="text-base sm:text-xl font-bold text-primary font-secondary mt-0.5"
                >
                  {eliteTier.revenue}
                </motion.p>
              </AnimatePresence>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-primary mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{eliteTier.trend}</span>
              </div>

              {/* Podium Base Block */}
              <div className={`w-full mt-3 ${eliteTier.podiumBg} rounded-xl sm:rounded-2xl py-5 sm:py-6 px-2 flex items-center justify-center shadow-sm`}>
                <span className="text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                  {eliteTier.podiumLabel}
                </span>
              </div>
            </div>
          </div>

          {/* ── Metric Filter Tabs with Smooth Underline Gliding ── */}
          <div className="border-b border-light-gray flex items-center gap-6 sm:gap-8 overflow-x-auto select-none pt-2">
            {[
              "Total Revenue",
              "Lead Conversion",
              "Calls Made",
              "Quota Attainment",
            ].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-3 text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? "text-primary font-bold"
                      : "text-light-black hover:text-dark-black"
                  }`}
                >
                  <span>{tab}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeLeaderboardMetricTabUnderline"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Table for Ranks #04, #05, etc. ── */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider border-b border-light-gray">
                  <th className="pb-3 text-left">RANK</th>
                  <th className="pb-3 text-left">REPRESENTATIVE</th>
                  <th className="pb-3 text-left">REVENUE</th>
                  <th className="pb-3 text-left">CONVERSION</th>
                  <th className="pb-3 text-left">QUOTA PROGRESS</th>
                  <th className="pb-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/60 text-xs">
                {currentData.roster.map((rep) => (
                  <tr
                    key={rep.rank}
                    className="hover:bg-light-gray/30 transition-colors"
                  >
                    {/* Rank */}
                    <td className="py-3.5 text-xs font-semibold text-light-black">
                      {rep.rank}
                    </td>

                    {/* Representative */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-light-gray bg-slate-100">
                          <img
                            src={rep.avatar}
                            alt={rep.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-dark-black/85 text-xs leading-tight">
                            {rep.name}
                          </p>
                          <p className="text-[11px] text-light-black font-normal mt-0.5">
                            {rep.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Revenue + Trend Badge */}
                    <td className="py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-dark-black/85 text-xs font-secondary">
                          {rep.revenue}
                        </span>
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                            rep.revPositive
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                              : "bg-rose-50 text-rose-600 border-rose-200/60"
                          }`}
                        >
                          {rep.revTrend}
                        </span>
                      </div>
                    </td>

                    {/* Conversion */}
                    <td className="py-3.5 font-semibold text-dark-black/80 text-xs font-secondary">
                      {rep.conversion}
                    </td>

                    {/* Quota Progress */}
                    <td className="py-3.5 whitespace-nowrap">
                      <div className="w-32 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px] text-light-black">
                          <span className="font-bold text-dark-black/85 text-[11px]">
                            {rep.quotaPercent}
                          </span>
                          <span>{rep.quotaCount}</span>
                        </div>
                        <div className="w-full h-1.5 bg-light-gray rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${rep.quotaFill}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-light-gray flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          {/* Summary Stats */}
          <div className="flex items-center gap-6 divide-x divide-light-gray">
            <div>
              <span className="block text-[10px] font-bold text-light-black uppercase tracking-wider">
                TEAM AVERAGE REVENUE
              </span>
              <span className="text-base sm:text-lg font-bold text-primary font-secondary">
                {currentData.avgRevenue}
              </span>
            </div>

            <div className="pl-6">
              <span className="block text-[10px] font-bold text-light-black uppercase tracking-wider">
                TOTAL VOLUME
              </span>
              <span className="text-base sm:text-lg font-bold text-dark-black/90 font-secondary">
                {currentData.totalVolume}
              </span>
            </div>
          </div>

          {/* Download Full Report Button */}
          <button
            type="button"
            onClick={handleDownloadReport}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Full Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
