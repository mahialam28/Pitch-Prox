"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
} from "recharts";
import { Info, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Tooltip from "@/components/modals/tooltip";

const trendData = [
  { day: "MON", convMom: 38, promptAdh: 25, trustGain: 63, quota: 12 },
  { day: "TUE", convMom: 58, promptAdh: 38, trustGain: 68, quota: 18 },
  { day: "WED", convMom: 63, promptAdh: 35, trustGain: 65, quota: 15 },
  { day: "THU", convMom: 52, promptAdh: 45, trustGain: 75, quota: 22 },
  { day: "FRI", convMom: 70, promptAdh: 40, trustGain: 73, quota: 20 },
  { day: "SAT", convMom: 82, promptAdh: 50, trustGain: 82, quota: 25 },
  { day: "SUN", convMom: 78, promptAdh: 48, trustGain: 80, quota: 22 },
];

const periodOptions = [
  { value: "This Week", label: "This Week" },
  { value: "This Month", label: "This Month" },
  { value: "Last Month", label: "Last Month" },
  { value: "This Year", label: "This Year" },
];

const metricLegends = [
  {
    name: "Conversion Momentum",
    color: "#0EADAB",
    tooltip:
      "Measures positive movement toward a sales conversion based on outcomes such as meetings, trials, follow-ups, and other meaningful next steps.",
  },
  {
    name: "Prompt Adherence",
    color: "#A855F7",
    tooltip:
      "Measures how closely your responses follow the strategic intent of PitchProX’s real-time prompts during conversations.",
  },
  {
    name: "Trust Gain",
    color: "#3B82F6",
    tooltip:
      "Measures how much prospect trust improves from the beginning of a conversation to the end, based on PitchProX’s trust analysis.",
  },
  {
    name: "Quota Progress",
    color: "#F97316",
    tooltip:
      "Shows your progress toward your assigned sales quota for the current measurement period.",
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#051824] text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[170px]">
        <span className="text-[11px] font-bold text-slate-300 block pb-1 border-b border-slate-700/60">
          {label} Performance
        </span>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-white">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const PerformanceTrend = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* ── Top Header with Title and Timeframe Dropdown ── */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-dark-black tracking-tight">
            Performance Trend (Users)
          </h3>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-light-gray rounded-xl text-xs font-semibold text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
          >
            <span>{selectedPeriod}</span>
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </motion.span>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-50 mt-1 min-w-[140px] bg-white border border-light-gray rounded-xl shadow-lg overflow-hidden py-1"
              >
                {periodOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-xs text-left font-medium transition-colors cursor-pointer ${
                      selectedPeriod === opt.value
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-dark-black hover:bg-light-gray"
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

      {/* ── Metric Legends Row ── */}
      <div className="flex items-center gap-4 sm:gap-6 flex-wrap text-xs font-medium text-medium-black mb-6">
        {metricLegends.map((metric) => (
          <div key={metric.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: metric.color }}
            />
            <span>{metric.name}</span>
            <Tooltip
              title={metric.name}
              text={metric.tooltip}
              position="top"
              align="center"
              className="p-0 -m-0 hover:bg-transparent"
            >
              <Info className="w-3.5 h-3.5 text-light-black/50 hover:text-primary transition-colors cursor-pointer" />
            </Tooltip>
          </div>
        ))}
      </div>

      {/* ── Multi-Line Chart ── */}
      <div className="w-full h-[280px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A5B1B5", fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A5B1B5", fontSize: 11, fontWeight: 600 }}
              ticks={[0, 20, 40, 60, 80, 100]}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <ChartTooltip content={<CustomTooltip />} />

            {/* Line 1: Conversion Momentum (Teal) */}
            <Line
              type="linear"
              name="Conversion Momentum"
              dataKey="convMom"
              stroke="#0EADAB"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#0EADAB", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#0EADAB", stroke: "#FFFFFF", strokeWidth: 2 }}
            />

            {/* Line 2: Prompt Adherence (Purple) */}
            <Line
              type="linear"
              name="Prompt Adherence"
              dataKey="promptAdh"
              stroke="#A855F7"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#A855F7", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#A855F7", stroke: "#FFFFFF", strokeWidth: 2 }}
            />

            {/* Line 3: Trust Gain (Blue) */}
            <Line
              type="linear"
              name="Trust Gain"
              dataKey="trustGain"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#3B82F6", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#3B82F6", stroke: "#FFFFFF", strokeWidth: 2 }}
            />

            {/* Line 4: Quota Progress (Orange) */}
            <Line
              type="linear"
              name="Quota Progress"
              dataKey="quota"
              stroke="#F97316"
              strokeWidth={2.5}
              dot={{ r: 3.5, fill: "#FFFFFF", stroke: "#F97316", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#F97316", stroke: "#FFFFFF", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceTrend;
