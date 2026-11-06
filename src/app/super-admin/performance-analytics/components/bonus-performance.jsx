"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/client-api";

const PERIODS = [
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];
const ITEMS_PER_PAGE = 5;
const money = (cents) => `$${Math.round(cents / 100).toLocaleString("en-US")}`;
const initials = (name = "") => name.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
// Bonus eligibility from quota attainment; payout amounts need the client's bonus rules
const status = (rep) =>
  rep.attainment == null
    ? { label: "No quota", tone: "text-light-black" }
    : rep.attainment >= 100
      ? { label: "Eligible", tone: "text-emerald-600" }
      : rep.attainment >= 75
        ? { label: "On track", tone: "text-amber-600" }
        : { label: "Below", tone: "text-red" };

// Live: each rep's booked revenue against their quota (lib/sales-team → leaderboard)
export const BonusPerformance = ({ bonus }) => {
  const [period, setPeriod] = useState("month");
  const [boards, setBoards] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (period === "month") return undefined;
    let cancelled = false;
    apiRequest(`/api/v1/admin/sales-reps/leaderboard?period=${period}`)
      .then((data) => !cancelled && setBoards((current) => ({ ...current, [period]: data })))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [period]);

  const board = period === "month" ? bonus : boards[period];
  const reps = [...(board?.reps ?? [])].sort((a, b) => (b.attainment ?? -1) - (a.attainment ?? -1) || b.revenueCents - a.revenueCents);
  const totalPages = Math.max(1, Math.ceil(reps.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const visible = reps.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      <div className="flex flex-col min-w-0">
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">Rep Bonus Performance</h3>
          <select
            aria-label="Period"
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-white border border-light-gray rounded-xl text-xs font-semibold text-medium-black cursor-pointer"
          >
            {PERIODS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[520px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider">
                <th className="pb-3 pr-4">Sales Rep</th>
                <th className="pb-3 px-3 text-center">Quota</th>
                <th className="pb-3 px-3 text-center">Closed</th>
                <th className="pb-3 px-3 text-right">Booked Revenue</th>
                <th className="pb-3 pl-3 text-right">Bonus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {!visible.length && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-light-black">{board ? "No sales reps yet." : "Loading…"}</td>
                </tr>
              )}
              {visible.map((rep) => {
                const state = status(rep);
                return (
                  <tr key={rep.id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-3 pr-4">
                      <Link href={`/super-admin/sales-reps/${rep.id}`} className="flex items-center gap-3 group">
                        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 font-semibold text-xs border border-slate-200">{initials(rep.name)}</span>
                        <span className="font-semibold text-dark-black/85 group-hover:text-primary">{rep.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-center font-semibold text-dark-black/80">{rep.attainment == null ? "—" : `${rep.attainment}%`}</td>
                    <td className="py-3 px-3 text-center text-dark-black/80">{rep.closed}</td>
                    <td className="py-3 px-3 text-right text-dark-black/80">{money(rep.revenueCents)}</td>
                    <td className={`py-3 pl-3 text-right font-semibold whitespace-nowrap ${state.tone}`}>{state.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4 mt-3 border-t border-light-gray">
        <span className="text-[11px] text-light-black">{board?.label ?? ""} · bonus amounts follow once bonus rules are set</span>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setCurrentPage(page - 1)} className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 cursor-pointer">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-light-black px-1">{page} / {totalPages}</span>
          <button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setCurrentPage(page + 1)} className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BonusPerformance;
