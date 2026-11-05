"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const periodOptions = [
  { value: "This Month", label: "This Month" },
  { value: "Last Month", label: "Last Month" },
  { value: "This Quarter", label: "This Quarter" },
  { value: "This Year", label: "This Year" },
];

export const breakdownData = [
  {
    id: "subscriptions",
    name: "Subscriptions",
    amount: "$565",
    percentage: "41%",
    value: 41,
    color: "#6366F1", // Indigo / Blue
  },
  {
    id: "upgrades",
    name: "Upgrades",
    amount: "$565",
    percentage: "41%",
    value: 20,
    color: "#10B981", // Emerald / Teal
  },
  {
    id: "reports",
    name: "Report Purchases",
    amount: "$565",
    percentage: "41%",
    value: 15,
    color: "#8B5CF6", // Purple
  },
  {
    id: "playbook",
    name: "Playbook Sales",
    amount: "$565",
    percentage: "41%",
    value: 12,
    color: "#F59E0B", // Orange / Amber
  },
  {
    id: "overages",
    name: "Call Overages",
    amount: "$565",
    percentage: "41%",
    value: 7,
    color: "#3B82F6", // Blue
  },
  {
    id: "enterprise",
    name: "Enterprise Accounts",
    amount: "$565",
    percentage: "41%",
    value: 5,
    color: "#06B6D4", // Cyan
  },
];

export const RevenueBreakdown = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col h-full">
      {/* Top Header */}
      <div className="shrink-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
            Revenue Breakdown
          </h3>

          {/* Time Filter Dropdown */}
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

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-medium text-medium-black mt-1">
          Total Revenue: <span className="font-semibold text-dark-black/80">$358,420</span>
        </p>
      </div>

      {/* Main Content: Donut Chart & Legend in the Middle (Responsive stacked on tight columns, side-by-side on wide screens) */}
      <div className="flex-1 flex flex-col sm:flex-row lg:flex-row xl:flex-col 2xl:flex-row items-center justify-center gap-5 sm:gap-6 xl:gap-4 2xl:gap-8 my-auto py-4 w-full">
        {/* Donut Chart with Centered Total */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={78}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                isAnimationActive={false}
              >
                {breakdownData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl sm:text-3xl font-extrabold text-dark-black/80 leading-none tracking-tight">
              156
            </span>
            <span className="text-[9px] font-bold text-medium-black uppercase tracking-wider mt-1">
              TOTAL REVENUE
            </span>
          </div>
        </div>

        {/* Legend List (Static without hover dimming) */}
        <div className="flex flex-col gap-2.5 w-full min-w-[200px] max-w-[280px]">
          {breakdownData.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs py-0.5"
            >
              {/* Category Name with Dot */}
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-medium-black font-medium truncate">
                  {item.name}
                </span>
              </div>

              {/* Amount & Percentage */}
              <span className="font-bold text-dark-black/80 whitespace-nowrap">
                {item.amount}({item.percentage})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueBreakdown;

