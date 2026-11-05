"use client";

import React from "react";
import Link from "next/link";
import { usePortal } from "@/components/shared/use-portal";

const salesReps = [
  {
    id: 1,
    name: "Robert Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    convMom: "82%",
    promptAdh: "78%",
    trustGain: "81%",
    lead: "28.4%",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Jessica Williams",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    convMom: "75%",
    promptAdh: "76%",
    trustGain: "74%",
    lead: "24.7%",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Brian Thompson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    convMom: "67%",
    promptAdh: "72%",
    trustGain: "69%",
    lead: "21.3%",
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Daniel Martinez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    convMom: "62%",
    promptAdh: "69%",
    trustGain: "66%",
    lead: "18.6%",
    status: "ACTIVE",
  },
  {
    id: 5,
    name: "Amanda Foster",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
    convMom: "54%",
    promptAdh: "63%",
    trustGain: "59%",
    lead: "16.8%",
    status: "INACTIVE",
  },
];

// reps: leaderboard from the dashboard API (call scores show "—" until calling is connected)
const TopSales = ({ reps } = {}) => {
  const portal = usePortal();
  const rows = reps ? reps.map((rep) => ({ ...rep, promptAdh: "—", trustGain: "—" })) : salesReps;
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Top Sales Rep
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider whitespace-nowrap">
              <th className="pb-3 text-left">SALES REP</th>
              <th className="pb-3 text-center px-2">CONVERSION MOMENTUM</th>
              <th className="pb-3 text-center px-2">PROMPT ADHERENCE</th>
              <th className="pb-3 text-center px-2">TRUST GAIN</th>
              <th className="pb-3 text-center px-2">LEAD (%)</th>
              <th className="pb-3 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {rows.map((rep) => (
              <tr key={rep.id} className="hover:bg-light-gray/30 transition-colors">
                {/* Sales Rep (Avatar + Name) */}
                <td className="py-3 text-left">
                  <div className="flex items-center gap-2.5">
                    {rep.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={rep.avatar} alt={rep.name} className="w-8 h-8 rounded-full object-cover border border-light-gray shrink-0" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {rep.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                      </span>
                    )}
                    {/* Super Admin: the name opens the rep's profile */}
                    {portal.base === "/super-admin" ? (
                      <Link href={`/super-admin/sales-reps/${rep.id}`} className="font-semibold text-dark-black/80 text-xs whitespace-nowrap hover:text-primary hover:underline">
                        {rep.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-dark-black/80 text-xs whitespace-nowrap">
                        {rep.name}
                      </span>
                    )}
                  </div>
                </td>

                {/* Conversion Momentum */}
                <td className="py-3 text-center font-bold text-primary font-secondary">
                  {rep.convMom}
                </td>

                {/* Prompt Adherence */}
                <td className="py-3 text-center font-bold text-[#A855F7] font-secondary">
                  {rep.promptAdh}
                </td>

                {/* Trust Gain */}
                <td className="py-3 text-center font-bold text-[#3B82F6] font-secondary">
                  {rep.trustGain}
                </td>

                {/* Lead (%) */}
                <td className="py-3 text-center font-bold text-dark-black/80 font-secondary">
                  {rep.lead}
                </td>

                {/* Status Badge */}
                <td className="py-3 text-right">
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      rep.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {rep.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopSales;
