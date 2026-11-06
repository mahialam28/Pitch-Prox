"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProfileAvatar } from "@/components/shared/avatar-editor";
import { dollars, downloadTeamCsv, loadLeaderboard, pct } from "../team-api";
import {
  X,
  Trophy,
  Download,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Podium colours by position (1st in the centre)
const PODIUM = {
  1: { podiumBg: "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600", borderColor: "border-primary", badgeBg: "bg-amber-400" },
  2: { podiumBg: "bg-gradient-to-b from-slate-400 to-slate-500", borderColor: "border-slate-300", badgeBg: "bg-slate-400" },
  3: { podiumBg: "bg-gradient-to-b from-amber-700 to-amber-900", borderColor: "border-amber-700", badgeBg: "bg-amber-700" },
};
const PERIODS = { "This Month": "month", Quarterly: "quarter", YTD: "year" };
const METRICS = {
  "Total Revenue": { value: (rep) => rep.revenueCents, show: (rep) => dollars(rep.revenueCents) },
  "Lead Conversion": { value: (rep) => rep.leadToSubscription ?? -1, show: (rep) => pct(rep.leadToSubscription) },
  "Accounts Closed": { value: (rep) => rep.closed, show: (rep) => String(rep.closed) },
  "Quota Attainment": { value: (rep) => rep.attainment ?? -1, show: (rep) => (rep.attainment == null ? "No quota" : `${rep.attainment}%`) },
};
const ordinal = (n) => n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th");
const revenueTrend = (rep) => {
  const diff = rep.revenueCents - rep.revenuePrevCents;
  if (!rep.revenuePrevCents) return { text: rep.revenueCents ? "New" : "—", positive: rep.revenueCents ? true : null };
  return { text: `${diff >= 0 ? "▲" : "▼"} ${Math.abs((diff / rep.revenuePrevCents) * 100).toFixed(1)}%`, positive: diff >= 0 };
};
const EMPTY_SPOT = { id: null, name: "—", jobTitle: "", revenueCents: 0, revenuePrevCents: 0, closed: 0, leadToSubscription: null, attainment: null };

// Mounted only while open; loads the ranking for the chosen period (lib/sales-team → leaderboard)
export default function LeaderboardModal({ isOpen, onClose }) {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState("This Month");
  const [activeTab, setActiveTab] = useState("Total Revenue");
  const [boards, setBoards] = useState({});

  const period = PERIODS[timeframe];
  useEffect(() => {
    let cancelled = false;
    loadLeaderboard(period)
      .then((data) => !cancelled && setBoards((current) => ({ ...current, [period]: data })))
      .catch((error) => !cancelled && toast.error(error.message));
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (!isOpen) return null;

  const board = boards[period];
  const metric = METRICS[activeTab];
  const ranked = [...(board?.reps ?? [])].sort((a, b) => metric.value(b) - metric.value(a) || b.revenueCents - a.revenueCents || a.name.localeCompare(b.name));
  const podium = (position) => {
    const entry = ranked[position - 1] ?? EMPTY_SPOT;
    const change = revenueTrend(entry);
    return { ...entry, ...PODIUM[position], rank: position, podiumLabel: ordinal(position), revenue: entry.id ? metric.show(entry) : "—", trend: entry.id ? change.text : "" };
  };
  const topPerformer = podium(1);
  const runnerUp = podium(2);
  const eliteTier = podium(3);
  const currentData = {
    roster: ranked.slice(3).map((entry, index) => {
      const change = revenueTrend(entry);
      return {
        ...entry,
        rank: ordinal(index + 4),
        revenue: dollars(entry.revenueCents),
        revTrend: change.text,
        revPositive: change.positive,
        conversion: pct(entry.leadToSubscription),
        quotaPercent: entry.attainment == null ? "No quota" : `${entry.attainment}%`,
        quotaCount: entry.quotaCents == null ? "" : `${dollars(entry.revenueCents)} / ${dollars(entry.quotaCents)}`,
        quotaFill: Math.min(100, entry.attainment ?? 0),
      };
    }),
    avgRevenue: dollars(board?.averageRevenueCents ?? 0),
    totalVolume: dollars(board?.totalRevenueCents ?? 0),
  };

  const handleDownloadReport = () => {
    if (!board) return;
    downloadTeamCsv(ranked.map((entry) => ({ ...entry, email: "", managerName: "", statusLabel: "", leads: "", accounts: "", lastActiveAt: "" })), board.label);
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
              {board ? `Booked revenue rankings · ${board.label}` : "Loading rankings…"}
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
                <ProfileAvatar name={runnerUp.name} className={`w-16 h-16 sm:w-20 sm:h-20 ${runnerUp.borderColor}`} />
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
                <ProfileAvatar name={topPerformer.name} className="w-20 h-20 sm:w-24 sm:h-24 !border-3 !border-primary shadow-md" />
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
                <ProfileAvatar name={eliteTier.name} className={`w-16 h-16 sm:w-20 sm:h-20 ${eliteTier.borderColor}`} />
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
              "Accounts Closed",
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
                {!currentData.roster.length && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-xs text-light-black">
                      {board ? (ranked.length ? "Everyone is on the podium." : "No sales reps yet.") : "Loading…"}
                    </td>
                  </tr>
                )}
                {currentData.roster.map((rep) => (
                  <tr
                    key={rep.id}
                    className="hover:bg-light-gray/30 transition-colors"
                  >
                    {/* Rank */}
                    <td className="py-3.5 text-xs font-semibold text-light-black">
                      {rep.rank}
                    </td>

                    {/* Representative */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar name={rep.name} className="w-8 h-8 !text-[11px] shrink-0" />
                        <div>
                          <p className="font-bold text-dark-black/85 text-xs leading-tight">
                            {rep.name}
                          </p>
                          <p className="text-[11px] text-light-black font-normal mt-0.5">
                            {rep.jobTitle}
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
                            rep.revPositive === null
                              ? "bg-light-gray text-medium-black border-light-gray"
                              : rep.revPositive
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
                        onClick={() => router.push(`/super-admin/sales-reps/${rep.id}`)}
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
            disabled={!board}
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
