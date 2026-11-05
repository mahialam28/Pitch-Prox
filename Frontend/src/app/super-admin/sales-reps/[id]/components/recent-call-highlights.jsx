"use client";

import React from "react";
import { Star, ArrowRight } from "lucide-react";

const callsData = [
  {
    id: "call-1",
    date: "May 16, 2025",
    time: "10:32 AM",
    leadType: "Solo agent",
    outcome: "Subscription Secured",
    outcomeBadge: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    trustGain: "+32",
    trustPositive: true,
    promptAdh: "94%",
    duration: "13m 22s",
    score: 92,
  },
  {
    id: "call-2",
    date: "May 16, 2025",
    time: "9:48 AM",
    leadType: "Small Teams",
    outcome: "Follow-Up Set",
    outcomeBadge: "bg-blue-50 text-blue-600 border-blue-200/80",
    trustGain: "+24",
    trustPositive: true,
    promptAdh: "91%",
    duration: "11m 05s",
    score: 88,
  },
  {
    id: "call-3",
    date: "May 16, 2025",
    time: "9:48 AM",
    leadType: "Small Teams",
    outcome: "Follow-Up Set",
    outcomeBadge: "bg-blue-50 text-blue-600 border-blue-200/80",
    trustGain: "+24",
    trustPositive: true,
    promptAdh: "91%",
    duration: "11m 05s",
    score: 88,
  },
  {
    id: "call-4",
    date: "May 16, 2025",
    time: "9:15 AM",
    leadType: "Micro-Teams",
    outcome: "Not Interested",
    outcomeBadge: "bg-rose-50 text-rose-600 border-rose-200/80",
    trustGain: "-5",
    trustPositive: false,
    promptAdh: "76%",
    duration: "6m 41s",
    score: 42,
  },
  {
    id: "call-5",
    date: "May 16, 2025",
    time: "9:15 AM",
    leadType: "Micro-Teams",
    outcome: "Not Interested",
    outcomeBadge: "bg-rose-50 text-rose-600 border-rose-200/80",
    trustGain: "-5",
    trustPositive: false,
    promptAdh: "76%",
    duration: "6m 41s",
    score: 42,
  },
  {
    id: "call-6",
    date: "May 15, 2025",
    time: "4:32 PM",
    leadType: "Mid-Size Teams",
    outcome: "Subscription Secured",
    outcomeBadge: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    trustGain: "+28",
    trustPositive: true,
    promptAdh: "95%",
    duration: "14m 10s",
    score: 95,
  },
  {
    id: "call-7",
    date: "May 15, 2025",
    time: "4:32 PM",
    leadType: "Mid-Size Teams",
    outcome: "Subscription Secured",
    outcomeBadge: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    trustGain: "+28",
    trustPositive: true,
    promptAdh: "95%",
    duration: "14m 10s",
    score: 95,
  },
  {
    id: "call-8",
    date: "May 15, 2025",
    time: "3:08 PM",
    leadType: "Solo agent",
    outcome: "Follow-Up Set",
    outcomeBadge: "bg-blue-50 text-blue-600 border-blue-200/80",
    trustGain: "+18",
    trustPositive: true,
    promptAdh: "90%",
    duration: "10m 12s",
    score: 85,
  },
];

export default function RecentCallHighlights({ onViewAllCalls }) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/90 tracking-tight">
          Recent Call Highlights
        </h3>

        <button
          type="button"
          onClick={onViewAllCalls}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          <span>View All Calls</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider">
              <th className="pb-3 text-left">Date & Time</th>
              <th className="pb-3 text-left">Lead Type</th>
              <th className="pb-3 text-left">Outcome</th>
              <th className="pb-3 text-center">Trust Gain</th>
              <th className="pb-3 text-center">Prompt Adherence</th>
              <th className="pb-3 text-left">Duration</th>
              <th className="pb-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {callsData.map((call) => (
              <tr
                key={call.id}
                className="hover:bg-light-gray/30 transition-colors"
              >
                {/* Date & Time */}
                <td className="py-3 text-left whitespace-nowrap">
                  <span className="font-semibold text-dark-black/85">
                    {call.date}
                  </span>{" "}
                  <span className="text-light-black text-[11px]">
                    {call.time}
                  </span>
                </td>

                {/* Lead Type */}
                <td className="py-3 text-left whitespace-nowrap text-xs text-dark-black/80 font-medium">
                  {call.leadType}
                </td>

                {/* Outcome Badge */}
                <td className="py-3 text-left whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${call.outcomeBadge}`}
                  >
                    {call.outcome}
                  </span>
                </td>

                {/* Trust Gain */}
                <td className="py-3 text-center whitespace-nowrap">
                  <span
                    className={`font-bold font-secondary text-xs ${
                      call.trustPositive ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {call.trustGain}
                  </span>
                </td>

                {/* Prompt Adherence */}
                <td className="py-3 text-center whitespace-nowrap font-semibold text-dark-black/80 font-secondary text-xs">
                  {call.promptAdh}
                </td>

                {/* Duration */}
                <td className="py-3 text-left whitespace-nowrap text-xs text-light-black font-medium">
                  {call.duration}
                </td>

                {/* Score with Gold Star */}
                <td className="py-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1 font-bold text-dark-black/85 text-xs font-secondary">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{call.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
