"use client";

import React, { useState } from "react";
import { Building, ChevronLeft, ChevronRight } from "lucide-react";

export const atRiskAccountsData = [
  {
    id: "risk-1",
    name: "Prime Realty Group",
    initials: "PR",
    riskScore: 92,
    riskColor: "text-red font-bold",
    riskSignal: "14 days inactive",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-2",
    name: "Elite Home Partners",
    initials: "EH",
    riskScore: 78,
    riskColor: "text-red font-bold",
    riskSignal: "Usage declining 45%",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-3",
    name: "Coastal Living Team",
    initials: "CL",
    riskScore: 65,
    riskColor: "text-amber-600 font-bold",
    riskSignal: "Low prompt adherence",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-4",
    name: "NextGen Realty",
    initials: "NR",
    riskScore: 58,
    riskColor: "text-amber-600 font-bold",
    riskSignal: "No calibration completed",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-5",
    name: "Sunset Properties",
    initials: "SP",
    riskScore: 52,
    riskColor: "text-amber-600 font-bold",
    riskSignal: "Support tickets open",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-6",
    name: "Apex Realty Partners",
    initials: "AR",
    riskScore: 88,
    riskColor: "text-red font-bold",
    riskSignal: "Failed payment 2x",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-7",
    name: "Horizon Real Estate",
    initials: "HR",
    riskScore: 74,
    riskColor: "text-red font-bold",
    riskSignal: "Seat utilization dropped 35%",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-8",
    name: "Sterling Asset Group",
    initials: "SA",
    riskScore: 61,
    riskColor: "text-amber-600 font-bold",
    riskSignal: "No team sync in 21 days",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-9",
    name: "BlueSky Property",
    initials: "BP",
    riskScore: 49,
    riskColor: "text-amber-600 font-bold",
    riskSignal: "Billing dispute pending",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-10",
    name: "Vanguard Estates",
    initials: "VE",
    riskScore: 89,
    riskColor: "text-red font-bold",
    riskSignal: "Key admin seat deactivated",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-11",
    name: "Pacifica Capital",
    initials: "PC",
    riskScore: 81,
    riskColor: "text-red font-bold",
    riskSignal: "Login failure spike",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-12",
    name: "Oakridge Realty",
    initials: "OR",
    riskScore: 67,
    riskColor: "text-amber-600 font-bold",
    riskSignal: "Integration disconnected",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-13",
    name: "Crestview Holdings",
    initials: "CH",
    riskScore: 56,
    riskColor: "text-amber-600 font-bold",
    riskSignal: "Low team engagement",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-14",
    name: "Harbor Light Properties",
    initials: "HL",
    riskScore: 73,
    riskColor: "text-red font-bold",
    riskSignal: "Export limit reached",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "risk-15",
    name: "Beacon Point Real Estate",
    initials: "BP",
    riskScore: 48,
    riskColor: "text-amber-600 font-bold",
    riskSignal: "Plan downgrade requested",
    avatarBg: "bg-slate-100 text-slate-600",
  },
];

const ITEMS_PER_PAGE = 5;

export const RiskAccounts = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = atRiskAccountsData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedAccounts = atRiskAccountsData.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 shrink-0">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          At-Risk Accounts
        </h3>
        <span className="text-xs font-semibold text-light-black">
          {totalItems} accounts
        </span>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto pr-1">
        <table className="w-full text-left border-collapse min-w-[480px]">
          <thead className="bg-white">
            <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
              <th className="pb-3 pt-1 pr-4 font-semibold bg-white">ACCOUNT</th>
              <th className="pb-3 pt-1 px-4 font-semibold text-center bg-white">RISK SCORE</th>
              <th className="pb-3 pt-1 pl-4 font-semibold text-right bg-white">PRIMARY RISK SIGNAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray/60 text-xs">
            {paginatedAccounts.map((account) => (
              <tr
                key={account.id}
                className="hover:bg-primary/5 transition-colors group"
              >
                {/* Account Name with Avatar icon */}
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-500 font-semibold text-[11px]">
                      <Building className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-dark-black/80 text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                      {account.name}
                    </span>
                  </div>
                </td>

                {/* Risk Score */}
                <td className="py-3 px-4 text-center">
                  <span className={`text-xs ${account.riskColor}`}>
                    {account.riskScore}
                  </span>
                </td>

                {/* Primary Risk Signal */}
                <td className="py-3 pl-4 text-right">
                  <span className="font-medium text-medium-black text-xs">
                    {account.riskSignal}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Table Pagination Bar ── */}
      <div className="pt-3 flex items-center justify-end gap-2 text-xs text-light-black mt-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setCurrentPage(pageNum)}
              className={`w-6 h-6 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                safePage === pageNum
                  ? "bg-primary text-white"
                  : "hover:bg-light-gray text-medium-black"
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiskAccounts;
