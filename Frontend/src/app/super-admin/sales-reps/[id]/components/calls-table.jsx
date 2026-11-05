"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown, Phone } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const callsData = [
  {
    id: "CALL-101",
    dateTime: "May 31, 2025",
    time: "10:32 AM",
    prospect: "Jason Miller",
    company: "Summit Realty Group",
    prospectType: "TOP AGENT",
    prospectBadge: "bg-purple-50 text-purple-600 border-purple-200/80",
    purpose: "Product Demo",
    duration: "21m 14s",
    outcome: "Subscription Closed",
    outcomeBadge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    aiScore: 92,
    aiScoreType: "high", // high (green), medium (orange), none (gray)
    trustGain: "+32",
    promptAdh: "94%",
  },
  {
    id: "CALL-102",
    dateTime: "May 30, 2025",
    time: "4:32 PM",
    prospect: "Mark Reynolds",
    company: "BrightPath Realty",
    prospectType: "BROKERAGE OWNER",
    prospectBadge: "bg-orange-50 text-orange-600 border-orange-200/80",
    purpose: "Pricing Discussion",
    duration: "22m 05s",
    outcome: "Trial Started",
    outcomeBadge: "bg-indigo-50 text-indigo-600 border-indigo-200",
    aiScore: 76,
    aiScoreType: "medium",
    trustGain: "+14",
    promptAdh: "72%",
  },
  {
    id: "CALL-103",
    dateTime: "May 30, 2025",
    time: "2:18 PM",
    prospect: "Tyler Jackson",
    company: "Elevate Real Estate",
    prospectType: "EXPERIENCED AGENT",
    prospectBadge: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    purpose: "Live Demo",
    duration: "18m 12s",
    outcome: "Follow Up",
    outcomeBadge: "bg-amber-50 text-amber-600 border-amber-200",
    aiScore: 68,
    aiScoreType: "medium",
    trustGain: "+8",
    promptAdh: "65%",
  },
  {
    id: "CALL-104",
    dateTime: "May 30, 2025",
    time: "11:09 AM",
    prospect: "Brian Hall",
    company: "Next Level Homes",
    prospectType: "NEW AGENT",
    prospectBadge: "bg-green-50 text-green-600 border-green-200/80",
    purpose: "Intro Call",
    duration: "12m 36s",
    outcome: "No Answer",
    outcomeBadge: "bg-slate-100 text-slate-600 border-slate-200",
    aiScore: "—",
    aiScoreType: "none",
    trustGain: "0",
    promptAdh: "—",
  },
  {
    id: "CALL-105",
    dateTime: "May 29, 2025",
    time: "3:41 PM",
    prospect: "Amanda Clark",
    company: "Vision Realty Partners",
    prospectType: "TOP AGENT",
    prospectBadge: "bg-purple-50 text-purple-600 border-purple-200/80",
    purpose: "Objection Handling",
    duration: "24m 21s",
    outcome: "Subscription Closed",
    outcomeBadge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    aiScore: 90,
    aiScoreType: "high",
    trustGain: "+29",
    promptAdh: "93%",
  },
  {
    id: "CALL-106",
    dateTime: "May 29, 2025",
    time: "1:22 PM",
    prospect: "Chris Evans",
    company: "Horizon Real Estate",
    prospectType: "TEAM LEAD",
    prospectBadge: "bg-blue-50 text-blue-600 border-blue-200/80",
    purpose: "Demo Follow Up",
    duration: "15m 03s",
    outcome: "Demo Booked",
    outcomeBadge: "bg-blue-50 text-blue-600 border-blue-200",
    aiScore: 81,
    aiScoreType: "high",
    trustGain: "+16",
    promptAdh: "88%",
  },
  {
    id: "CALL-107",
    dateTime: "May 29, 2025",
    time: "10:07 AM",
    prospect: "Stephanie Moore",
    company: "Pinnacle Realty Group",
    prospectType: "BROKERAGE OWNER",
    prospectBadge: "bg-orange-50 text-orange-600 border-orange-200/80",
    purpose: "ROI Discussion",
    duration: "20m 44s",
    outcome: "Trial Started",
    outcomeBadge: "bg-indigo-50 text-indigo-600 border-indigo-200",
    aiScore: 72,
    aiScoreType: "medium",
    trustGain: "+11",
    promptAdh: "70%",
  },
  {
    id: "CALL-108",
    dateTime: "May 28, 2025",
    time: "5:16 PM",
    prospect: "Daniel Scott",
    company: "Urban Nest Realty",
    prospectType: "EXPERIENCED AGENT",
    prospectBadge: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    purpose: "Pricing Objection",
    duration: "17m 11s",
    outcome: "Follow Up",
    outcomeBadge: "bg-amber-50 text-amber-600 border-amber-200",
    aiScore: 65,
    aiScoreType: "medium",
    trustGain: "+6",
    promptAdh: "62%",
  },
  {
    id: "CALL-109",
    dateTime: "May 28, 2025",
    time: "2:49 PM",
    prospect: "Michelle Lee",
    company: "First Step Realty",
    prospectType: "NEW AGENT",
    prospectBadge: "bg-green-50 text-green-600 border-green-200/80",
    purpose: "Platform Overview",
    duration: "14m 27s",
    outcome: "Demo Booked",
    outcomeBadge: "bg-blue-50 text-blue-600 border-blue-200",
    aiScore: 79,
    aiScoreType: "high",
    trustGain: "+12",
    promptAdh: "83%",
  },
];

const pageSizeOptions = [
  { value: "10 / page", label: "10 / page" },
  { value: "20 / page", label: "20 / page" },
  { value: "50 / page", label: "50 / page" },
];

export default function CallsTable({ prospectType, outcome, purpose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("10 / page");
  const [sortAsc, setSortAsc] = useState(false);

  const filteredCalls = callsData.filter((call) => {
    if (
      prospectType &&
      prospectType !== "All Prospect Types" &&
      !call.prospectType.toLowerCase().includes(prospectType.toLowerCase())
    ) {
      return false;
    }
    if (
      outcome &&
      outcome !== "All Outcomes" &&
      !call.outcome.toLowerCase().includes(outcome.toLowerCase())
    ) {
      return false;
    }
    if (
      purpose &&
      purpose !== "All Purposes" &&
      !call.purpose.toLowerCase().includes(purpose.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      {/* Table Content */}
      <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse min-w-[960px]">
          <thead>
            <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider select-none">
              <th
                onClick={() => setSortAsc(!sortAsc)}
                className="pb-3 text-left cursor-pointer hover:text-dark-black/80 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>DATE / TIME</span>
                  <ArrowUpDown className="w-3 h-3 text-light-black" />
                </div>
              </th>
              <th className="pb-3 text-left">PROSPECT / COMPANY</th>
              <th className="pb-3 text-left">PROSPECT TYPE</th>
              <th className="pb-3 text-left">PURPOSE</th>
              <th className="pb-3 text-left">DURATION</th>
              <th className="pb-3 text-left">OUTCOME</th>
              <th className="pb-3 text-center">AI SCORE</th>
              <th className="pb-3 text-center">TRUST GAIN</th>
              <th className="pb-3 text-right">PROMPT ADHERENCE</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-light-gray/60 text-xs">
            {filteredCalls.map((call) => (
              <tr
                key={call.id}
                onClick={() =>
                  toast.success(`Opening call details for ${call.prospect}`)
                }
                className="hover:bg-light-gray/40 transition-colors group cursor-pointer"
              >
                {/* Date & Time */}
                <td className="py-3.5 text-left whitespace-nowrap">
                  <div>
                    <p className="font-semibold text-dark-black/85 text-xs">
                      {call.dateTime}
                    </p>
                    <p className="text-[11px] text-light-black mt-0.5">
                      {call.time}
                    </p>
                  </div>
                </td>

                {/* Prospect & Company */}
                <td className="py-3.5 text-left whitespace-nowrap">
                  <div>
                    <p className="font-semibold text-dark-black/85 text-xs group-hover:text-primary transition-colors">
                      {call.prospect}
                    </p>
                    <p className="text-[11px] text-light-black mt-0.5">
                      {call.company}
                    </p>
                  </div>
                </td>

                {/* Prospect Type Badge */}
                <td className="py-3.5 text-left whitespace-nowrap">
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-md border tracking-wider ${call.prospectBadge}`}
                  >
                    {call.prospectType}
                  </span>
                </td>

                {/* Purpose */}
                <td className="py-3.5 text-left whitespace-nowrap text-xs text-dark-black/75 font-normal">
                  {call.purpose}
                </td>

                {/* Duration */}
                <td className="py-3.5 text-left whitespace-nowrap text-xs text-light-black font-normal">
                  {call.duration}
                </td>

                {/* Outcome Pill */}
                <td className="py-3.5 text-left whitespace-nowrap">
                  <span
                    className={`inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${call.outcomeBadge}`}
                  >
                    {call.outcome}
                  </span>
                </td>

                {/* AI Score */}
                <td className="py-3.5 text-center whitespace-nowrap">
                  {call.aiScoreType === "high" ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-emerald-500 text-emerald-600 font-bold text-xs bg-emerald-50/50">
                      {call.aiScore}
                    </span>
                  ) : call.aiScoreType === "medium" ? (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-orange-400 text-orange-600 font-bold text-xs bg-orange-50/50">
                      {call.aiScore}
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-200 text-light-black text-xs">
                      —
                    </span>
                  )}
                </td>

                {/* Trust Gain */}
                <td className="py-3.5 text-center whitespace-nowrap">
                  <span
                    className={`font-semibold text-xs ${
                      call.trustGain.startsWith("+")
                        ? "text-dark-black/85"
                        : "text-light-black"
                    }`}
                  >
                    {call.trustGain}
                  </span>
                </td>

                {/* Prompt Adherence */}
                <td className="py-3.5 text-right whitespace-nowrap text-xs text-dark-black/80 font-normal">
                  {call.promptAdh}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-2 border-t border-light-gray select-none">
        <span className="text-xs text-light-black font-normal">
          Showing 1 to {filteredCalls.length} of 186 calls
        </span>

        <div className="flex items-center gap-3">
          {/* Page Number Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-xl border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[1, 2, 3, 4, 5].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary text-white shadow-xs"
                    : "text-dark-black/75 hover:bg-light-gray"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <span className="text-xs text-light-black px-1 font-semibold">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(19)}
              className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 19
                  ? "bg-primary text-white shadow-xs"
                  : "text-dark-black/75 hover:bg-light-gray"
              }`}
            >
              19
            </button>

            <button
              type="button"
              disabled={currentPage === 19}
              onClick={() => setCurrentPage((p) => Math.min(19, p + 1))}
              className="w-8 h-8 rounded-xl border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Page Size Dropdown */}
          <div className="w-28">
            <Dropdown
              items={pageSizeOptions}
              selected={pageSize}
              onSelect={(val) => setPageSize(val)}
              variant="small"
              placement="top"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
