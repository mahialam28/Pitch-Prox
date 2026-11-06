"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 5;

// Live: paying accounts showing warning signs — cancelling, paused, unpaid, idle or with urgent tickets.
// The score adds up those signals (0–100).
export const RiskAccounts = ({ accounts = [] }) => {
  const atRiskAccountsData = accounts.map((row) => ({
    id: row.id,
    name: row.company,
    riskScore: row.risk,
    riskColor: row.risk >= 50 ? "text-red font-bold" : "text-amber-600 font-bold",
    riskSignal: row.reasons.join(" · "),
  }));
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
          <span
            title="Accounts currently showing one or more defined retention-risk signals: cancellation requested (+50), paused (+30), waiting over a week for the first payment (+25), never signed in after a week (+25), no sign-in for 14+ days (+1 per day, up to 30), open urgent/high support tickets (+15). The Risk Score adds these up (0–100); higher means more observed risk."
            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-light-gray text-[10px] font-bold text-medium-black cursor-help align-middle"
          >
            i
          </span>
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
            {!paginatedAccounts.length && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-light-black">No accounts at risk right now.</td>
              </tr>
            )}
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
                    <Link href={`/super-admin/users/${account.id}`} className="font-semibold text-dark-black/80 text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                      {account.name}
                    </Link>
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
