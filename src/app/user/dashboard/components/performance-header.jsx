"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
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

const PerformanceHeader = ({ userName = "" }) => {
  const firstName = userName.trim().split(/\s+/)[0];
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
    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-col gap-1 min-w-0">
        <Title
          variant="small"
          className="!text-dark-black/80"
        >
          Dashboard
        </Title>
        <Text
          variant="small"
        >
          {firstName ? `Welcome back, ${firstName}! ` : "Welcome back! "}Here&apos;s your performance overview.
        </Text>
      </div>

      {/* Timeframe Dropdown — same button design */}
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
  );
};

export default PerformanceHeader;
