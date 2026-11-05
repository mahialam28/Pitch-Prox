"use client";

import { usePortal } from "@/components/shared/use-portal";
import React, { useState, useRef, useEffect } from "react";
import { Calendar, TrendingUp, MessageSquare, Smile, Plus } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const periodOptions = [
  { value: "This Week", label: "This Week" },
  { value: "This Month", label: "This Month" },
  { value: "Last Month", label: "Last Month" },
  { value: "Last 90 Days", label: "Last 90 Days" },
  { value: "This Year", label: "This Year" },
];

export const LeadsHeader = () => {
  const portal = usePortal();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(periodOptions[0].value);
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
            Leads
          </Title>
          <Text variant="small">
            Manage and track your leads in one place.
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`${portal.base}/leads/add`}
            className="flex items-center gap-1.5 px-4 py-2 sm:py-2.5 bg-primary hover:bg-medium-teal text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Lead</span>
          </Link>

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
            <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight">37%</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <span>^ 4.2x</span>
              <span className="text-light-black/60 font-medium">vs PitchProX Benchmark</span>
            </div>
          </div>

          <Text variant="small" className="leading-relaxed mt-auto text-dark-black/70">
            Weighted score of booked meetings, follow-ups, trials and subscriptions.
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
              <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight leading-none">82%</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold rounded-full w-fit">
                Optimal Zone
              </span>
            </div>
            <Text
              variant="small"
              className="max-w-full xs:max-w-[140px] sm:max-w-[180px] leading-snug text-dark-black/70 pb-1"
            >
              Great job! You&apos;re in the optimal adherence range.
            </Text>
          </div>

          <div className="space-y-1 pt-2">
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: "82%" }}
              />
            </div>
            <div className="relative flex justify-between text-[10px] text-light-black/60 font-semibold px-0.5">
              <span>80%</span>
              <span className="absolute left-[82%] -translate-x-1/2 -top-1 font-bold text-dark-black">
                ▼
              </span>
              <span>85%</span>
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
              <span className="text-3xl sm:text-4xl font-semibold text-dark-black/90 tracking-tight">+21</span>
              <span className="text-sm font-bold text-light-black/50">pts</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <span>^ 214% vs baseline</span>
            </div>
          </div>

          <Text variant="small" className="leading-relaxed mt-auto text-dark-black/70">
            Average trust increase across all calls.
          </Text>
        </motion.div>
      </div>
    </div>
  );
};

export default LeadsHeader;
