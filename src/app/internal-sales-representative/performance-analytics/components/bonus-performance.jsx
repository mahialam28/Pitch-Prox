"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const periodOptions = [
  { value: "This Month", label: "This Month" },
  { value: "Last Month", label: "Last Month" },
  { value: "This Quarter", label: "This Quarter" },
  { value: "This Year", label: "This Year" },
];

export const repBonusData = [
  {
    id: "rep-1",
    name: "Ryan Anderson",
    initials: "RA",
    quota: "112%",
    retentionQuality: "85%",
    expansionRevenue: "$12,340",
    bonusEarned: "$1,850",
    bonusColor: "text-emerald-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-2",
    name: "Sarah Johnson",
    initials: "SJ",
    quota: "98%",
    retentionQuality: "88%",
    expansionRevenue: "$8,750",
    bonusEarned: "$1,250",
    bonusColor: "text-emerald-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-3",
    name: "Michael Carter",
    initials: "MC",
    quota: "90%",
    retentionQuality: "82%",
    expansionRevenue: "$6,980",
    bonusEarned: "$950",
    bonusColor: "text-emerald-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-4",
    name: "Lisa Bennett",
    initials: "LB",
    quota: "78%",
    retentionQuality: "76%",
    expansionRevenue: "$5,430",
    bonusEarned: "$450",
    bonusColor: "text-amber-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-5",
    name: "Mark Reynolds",
    initials: "MR",
    quota: "61%",
    retentionQuality: "64%",
    expansionRevenue: "$3,210",
    bonusEarned: "$0",
    bonusColor: "text-red",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-6",
    name: "Elena Rostova",
    initials: "ER",
    quota: "105%",
    retentionQuality: "91%",
    expansionRevenue: "$11,200",
    bonusEarned: "$1,600",
    bonusColor: "text-emerald-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-7",
    name: "David Kim",
    initials: "DK",
    quota: "94%",
    retentionQuality: "79%",
    expansionRevenue: "$7,820",
    bonusEarned: "$1,100",
    bonusColor: "text-emerald-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-8",
    name: "Jessica Taylor",
    initials: "JT",
    quota: "88%",
    retentionQuality: "84%",
    expansionRevenue: "$6,450",
    bonusEarned: "$850",
    bonusColor: "text-emerald-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-9",
    name: "Marcus Sterling",
    initials: "MS",
    quota: "72%",
    retentionQuality: "71%",
    expansionRevenue: "$4,890",
    bonusEarned: "$350",
    bonusColor: "text-amber-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-10",
    name: "Chloe Bennett",
    initials: "CB",
    quota: "118%",
    retentionQuality: "93%",
    expansionRevenue: "$14,100",
    bonusEarned: "$2,150",
    bonusColor: "text-emerald-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-11",
    name: "Jonathan Ward",
    initials: "JW",
    quota: "65%",
    retentionQuality: "68%",
    expansionRevenue: "$3,650",
    bonusEarned: "$0",
    bonusColor: "text-red",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-12",
    name: "Sophia Martinez",
    initials: "SM",
    quota: "101%",
    retentionQuality: "87%",
    expansionRevenue: "$9,400",
    bonusEarned: "$1,400",
    bonusColor: "text-emerald-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-13",
    name: "Daniel Foster",
    initials: "DF",
    quota: "83%",
    retentionQuality: "80%",
    expansionRevenue: "$5,900",
    bonusEarned: "$600",
    bonusColor: "text-amber-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-14",
    name: "Olivia Zhang",
    initials: "OZ",
    quota: "115%",
    retentionQuality: "89%",
    expansionRevenue: "$13,250",
    bonusEarned: "$1,950",
    bonusColor: "text-emerald-600",
    avatarBg: "bg-slate-100 text-slate-600",
  },
  {
    id: "rep-15",
    name: "Kevin Brooks",
    initials: "KB",
    quota: "58%",
    retentionQuality: "60%",
    expansionRevenue: "$2,800",
    bonusEarned: "$0",
    bonusColor: "text-red",
    avatarBg: "bg-slate-100 text-slate-600",
  },
];

const ITEMS_PER_PAGE = 5;

export const BonusPerformance = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalItems = repBonusData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedReps = repBonusData.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Top Section */}
      <div className="flex flex-col min-w-0">
        {/* Header with Title and Period Dropdown */}
        <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
            Rep Bonus Performance
          </h3>

          {/* Period Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-light-gray hover:bg-light-gray/40 rounded-xl text-xs font-semibold text-medium-black transition-colors cursor-pointer shadow-2xs"
            >
              <span>{selectedPeriod}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.15 }}
              >
                <ChevronDown className="w-3.5 h-3.5 text-light-black" />
              </motion.span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                >
                  {periodOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedPeriod(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                        selectedPeriod === opt.value
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-dark-black/70 hover:bg-light-gray"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Reps Table */}
        <div className="w-full overflow-x-auto pr-1">
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                <th className="pb-3 pt-1 pr-4 font-semibold bg-white">REP</th>
                <th className="pb-3 pt-1 px-3 font-semibold text-center bg-white">QUOTA %</th>
                <th className="pb-3 pt-1 px-3 font-semibold text-center bg-white">
                  <div>RETENTION QUALITY</div>
                  <div className="normal-case text-light-black/70 font-normal text-[10px] tracking-normal mt-0.5">
                    (90 days)
                  </div>
                </th>
                <th className="pb-3 pt-1 px-3 font-semibold text-right bg-white">EXPANSION REVENUE</th>
                <th className="pb-3 pt-1 pl-4 font-semibold text-right bg-white">BONUS EARNED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {paginatedReps.map((rep) => (
                <tr
                  key={rep.id}
                  className="hover:bg-primary/5 transition-colors group"
                >
                  {/* Rep Avatar & Name */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-600 font-semibold text-xs">
                        {rep.initials}
                      </div>
                      <span className="font-semibold text-dark-black/80 text-xs sm:text-sm truncate group-hover:text-primary transition-colors">
                        {rep.name}
                      </span>
                    </div>
                  </td>

                  {/* Quota % */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-semibold text-dark-black/80 text-xs">
                      {rep.quota}
                    </span>
                  </td>

                  {/* Retention Quality */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-medium text-medium-black text-xs">
                      {rep.retentionQuality}
                    </span>
                  </td>

                  {/* Expansion Revenue */}
                  <td className="py-3 px-3 text-right">
                    <span className="font-semibold text-dark-black/80 text-xs">
                      {rep.expansionRevenue}
                    </span>
                  </td>

                  {/* Bonus Earned */}
                  <td className="py-3 pl-4 text-right">
                    <span className={`font-bold text-xs sm:text-sm ${rep.bonusColor}`}>
                      {rep.bonusEarned}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

export default BonusPerformance;

