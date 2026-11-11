"use client";

import React, { useState, useRef, useEffect } from "react";
import { apiRequest } from "@/lib/client-api";
import { Calendar, TrendingUp, MessageSquare, Smile } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import { motion, AnimatePresence } from "framer-motion";

const periodOptions = [
  { value: "This Week", label: "This Week" },
  { value: "This Month", label: "This Month" },
  { value: "Last Month", label: "Last Month" },
  { value: "Last 90 Days", label: "Last 90 Days" },
  { value: "This Year", label: "This Year" },
];

// Start of each period (in the browser's time zone)
function periodStart(period, now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (period === "This Week") d.setDate(d.getDate() - d.getDay());
  else if (period === "This Month") d.setDate(1);
  else if (period === "Last Month") {
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
  } else if (period === "Last 90 Days") d.setDate(d.getDate() - 90);
  else if (period === "This Year") d.setMonth(0, 1);
  return d;
}
function periodEnd(period, now = new Date()) {
  if (period !== "Last Month") return null;
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return d;
}
const average = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

export const CallsHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(periodOptions[0].value);
  const [calls, setCalls] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/calls?limit=200")
      .then((result) => !cancelled && setCalls(result.results))
      .catch(() => !cancelled && setCalls([]));
    return () => {
      cancelled = true;
    };
  }, []);

  // The cards: real numbers from the calls in the chosen period
  const from = periodStart(selected);
  const until = periodEnd(selected);
  const inPeriod = (calls ?? []).filter((call) => call.status === "completed" && new Date(call.startedAt) >= from && (!until || new Date(call.startedAt) < until));
  const count = inPeriod.length;
  const booked = inPeriod.filter((call) => call.summary?.conversion?.status === "confirmed").length;
  const bookedPct = count ? Math.round((booked / count) * 100) : null;
  const adherence = average(inPeriod.map((call) => call.summary?.adherence_pct).filter((v) => typeof v === "number"));
  const adherencePct = adherence === null ? null : Math.round(adherence);
  const gains = inPeriod.map((call) => call.summary?.trust_gain?.value).filter((v) => typeof v === "number");
  const gain = average(gains);
  const practiceCount = inPeriod.filter((call) => call.mode === "practice").length;
  const basis = count ? `Across ${count} call${count === 1 ? "" : "s"}${practiceCount ? ` (${practiceCount} practice)` : ""}` : calls === null ? "Loading…" : "No calls in this period yet";
  const zone = adherencePct === null ? null : adherencePct >= 80 ? { label: "Strong", cls: "bg-emerald-50 text-emerald-600", text: "You're following the coaching closely." } : adherencePct >= 60 ? { label: "Good", cls: "bg-blue-50 text-blue-600", text: "You use most of the suggested lines." } : { label: "Room to grow", cls: "bg-amber-50 text-amber-700", text: "Try using more of the suggested lines." };
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

  const selectedItem = periodOptions.find((o) => o.value === selected);

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <Title variant="small" className="!text-dark-black/80">
            Calls
          </Title>
          <Text variant="small">
            Track and manage your outbound call activity
          </Text>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-light-gray rounded-xl text-xs font-semibold text-dark-black/80 hover:bg-light-gray shadow-sm transition-colors cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-light-black" />
            <span>{selectedItem?.label || "This Week"}</span>
            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="h-3.5 w-3.5 text-light-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 4, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-0 sm:right-0 sm:left-auto z-50 mt-1 min-w-[200px] bg-white border border-light-gray rounded-xl shadow-lg overflow-hidden"
                style={{ transformOrigin: "top" }}
              >
                <div className="py-1">
                  {periodOptions.map((option) => {
                    const isActive = selected === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelected(option.value);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
                          isActive
                            ? "bg-primary/5 text-primary"
                            : "text-dark-black/70 hover:bg-light-gray"
                        }`}
                      >
                        <span>{option.label}</span>
                        {isActive && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <Title variant="small" className=" !text-dark-black/80 font-bold leading-tight">
              Conversion Momentum
            </Title>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight">{bookedPct === null ? "—" : `${bookedPct}%`}</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <span>{count ? `${booked} of ${count} booked` : ""}</span>
              <span className="text-light-black/60 font-medium">{basis}</span>
            </div>
          </div>

          <Text variant="small" className="leading-relaxed mt-auto text-dark-black/70">
            Calls that ended with a confirmed walkthrough, showing or meeting.
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <Title variant="small" className=" !text-dark-black/80 font-bold leading-tight">
              Prompt Adherence
            </Title>
          </div>

          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-end gap-3 mt-1">
            <div className="flex flex-col gap-2">
              <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight leading-none">{adherencePct === null ? "—" : `${adherencePct}%`}</span>
              {zone && (
                <span className={`px-3 py-1 text-[11px] font-bold rounded-full w-fit ${zone.cls}`}>
                  {zone.label}
                </span>
              )}
            </div>
            <Text
              variant="small"
              className="max-w-full xs:max-w-[140px] sm:max-w-[180px] leading-snug text-dark-black/70 pb-1"
            >
              {zone ? zone.text : basis}
            </Text>
          </div>

          <div className="space-y-1 pt-2">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${adherencePct ?? 0}%` }}
              />
            </div>
            <div className="relative flex justify-between text-[10px] text-light-black/60 font-semibold px-0.5">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-50 text-teal-500 flex items-center justify-center flex-shrink-0">
              <Smile className="h-5 w-5" />
            </div>
            <Title variant="small" className=" !text-dark-black/80 font-bold leading-tight">
              Trust Gain
            </Title>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight">{gain === null ? "—" : `${gain >= 0 ? "+" : ""}${Math.round(gain)}`}</span>
              <span className="text-sm font-bold text-light-black/50">pts</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-light-black/70">
              <span>{gains.length ? `Across ${gains.length} call${gains.length === 1 ? "" : "s"}` : basis}</span>
            </div>
          </div>

          <Text variant="small" className="leading-relaxed mt-auto text-dark-black/70">
            Average change in trust from the start to the end of a call.
          </Text>
        </motion.div>
      </div>
    </div>
  );
};

export default CallsHeader;
