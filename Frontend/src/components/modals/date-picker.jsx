"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  className = "",
  label,
  placement = "bottom",
  variant = "default", // 'default' | 'filter' | 'small'
  size = "md", // 'sm' | 'md' | 'lg'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial selected date or default to current date
  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const selectedDateObj = value ? parseDate(value) : null;

  // Calendar navigation state (year and month view)
  const [currentMonth, setCurrentMonth] = useState(
    selectedDateObj ? selectedDateObj.getMonth() : new Date().getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    selectedDateObj ? selectedDateObj.getFullYear() : new Date().getFullYear()
  );

  // Sync calendar view when value changes
  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date display: e.g. "May 15, 2024"
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const d = parseDate(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Convert Date object to YYYY-MM-DD string
  const toDateString = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Navigate months
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Select day
  const handleSelectDay = (day) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const dateStr = toDateString(newDate);
    onChange(dateStr);
    setIsOpen(false);
  };

  // Quick preset shortcuts
  const handleSetQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = toDateString(d);
    onChange(dateStr);
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
    setIsOpen(false);
  };

  // Generate calendar days grid
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const isSelected = (day) => {
    if (!selectedDateObj) return false;
    return (
      selectedDateObj.getDate() === day &&
      selectedDateObj.getMonth() === currentMonth &&
      selectedDateObj.getFullYear() === currentYear
    );
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isTop = placement === "top";

  // Dynamic Trigger Button Classes based on variant & size
  const getTriggerClasses = () => {
    if (variant === "filter") {
      return `w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border bg-white text-xs font-semibold text-medium-black transition-all duration-200 cursor-pointer shadow-2xs hover:bg-light-gray/40 ${
        isOpen
          ? "border-primary ring-2 ring-primary/20 bg-primary/5 text-primary shadow-xs"
          : "border-light-gray hover:border-primary/60"
      }`;
    }

    if (variant === "small" || size === "sm") {
      return `w-full flex items-center justify-between px-3 py-1.5 rounded-xl border bg-white text-xs transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/60 ${
        isOpen
          ? "border-primary ring-2 ring-primary/20 shadow-xs"
          : "border-light-gray"
      }`;
    }

    // Default / Medium
    return `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-white text-xs transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/60 ${
      isOpen
        ? "border-primary ring-2 ring-primary/20 shadow-xs"
        : "border-light-gray"
    }`;
  };

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
          {label}
        </label>
      )}

      {/* Input Trigger Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={getTriggerClasses()}
      >
        {variant === "filter" ? (
          <>
            <span
              className={`font-semibold truncate ${
                value ? "text-dark-black" : "text-medium-black"
              }`}
            >
              {value ? formatDisplayDate(value) : placeholder}
            </span>
            <CalendarIcon className="w-3.5 h-3.5 text-light-black shrink-0" />
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`${
                  size === "sm" ? "w-5 h-5 rounded-md" : "w-7 h-7 rounded-lg"
                } bg-primary/10 text-primary flex items-center justify-center shrink-0`}
              >
                <CalendarIcon
                  className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"}
                />
              </div>
              <span
                className={`font-medium truncate ${
                  value ? "text-dark-black/80 font-semibold" : "text-light-black"
                }`}
              >
                {value ? formatDisplayDate(value) : placeholder}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-light-black">
              {value && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange("");
                  }}
                  className="p-1 rounded-md hover:bg-light-gray hover:text-dark-black transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          </>
        )}
      </button>

      {/* Custom Theme Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isTop ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: isTop ? -4 : 4, scale: 1 }}
            exit={{ opacity: 0, y: isTop ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute left-0 z-50 w-full min-w-[280px] bg-white rounded-2xl border border-light-gray shadow-xl p-3.5 overflow-hidden ${
              isTop ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
            style={{ transformOrigin: isTop ? "bottom" : "top" }}
          >
            {/* Header: Month / Year Navigation */}
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-light-gray/70">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg border border-light-gray/80 flex items-center justify-center text-medium-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-dark-black/80">
                  {MONTH_NAMES[currentMonth]}
                </span>
                <span className="text-xs font-medium text-medium-black">
                  {currentYear}
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg border border-light-gray/80 flex items-center justify-center text-medium-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Preset Shortcuts */}
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => handleSetQuickDate(0)}
                className="px-2 py-1 text-[11px] font-medium bg-light-gray hover:bg-primary/10 hover:text-primary rounded-lg text-medium-black transition-colors cursor-pointer text-center"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDate(1)}
                className="px-2 py-1 text-[11px] font-medium bg-light-gray hover:bg-primary/10 hover:text-primary rounded-lg text-medium-black transition-colors cursor-pointer text-center"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDate(7)}
                className="px-2 py-1 text-[11px] font-medium bg-light-gray hover:bg-primary/10 hover:text-primary rounded-lg text-medium-black transition-colors cursor-pointer text-center"
              >
                In 1 week
              </button>
            </div>

            {/* Day Names Grid Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_NAMES.map((day) => (
                <span
                  key={day}
                  className="text-[10px] font-semibold text-light-black"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Previous Month Trail Days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => {
                const dayNum = prevMonthDays - firstDayIndex + i + 1;
                return (
                  <span
                    key={`prev-${i}`}
                    className="w-7 h-7 flex items-center justify-center text-[11px] text-light-black/40 select-none"
                  >
                    {dayNum}
                  </span>
                );
              })}

              {/* Current Month Active Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const sel = isSelected(day);
                const tod = isToday(day);

                return (
                  <button
                    key={`curr-${day}`}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all duration-150 cursor-pointer relative ${
                      sel
                        ? "bg-primary text-white font-bold shadow-xs scale-105"
                        : tod
                        ? "border border-primary text-primary font-semibold hover:bg-primary/10"
                        : "text-dark-black/90 hover:bg-light-gray"
                    }`}
                  >
                    {day}
                    {tod && !sel && (
                      <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Popover Footer: Clear and Close */}
            <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-light-gray/70 text-xs">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="text-[11px] font-medium text-light-black hover:text-red transition-colors cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-primary hover:bg-medium-teal text-white rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
