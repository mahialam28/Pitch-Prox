"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CalendarFilter = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [preset, setPreset] = useState("This Week");
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

  const presets = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "this-week" },
    { label: "This Month", value: "this-month" },
    { label: "Last Month", value: "last-month" },
    { label: "Last 90 Days", value: "last-90" },
    { label: "This Year", value: "this-year" },
  ];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: clickedDate, end: null });
      setPreset("");
    } else {
      if (clickedDate < selectedRange.start) {
        setSelectedRange({ start: clickedDate, end: null });
      } else {
        setSelectedRange({ start: selectedRange.start, end: clickedDate });
        if (onChange) onChange({ start: selectedRange.start, end: clickedDate });
      }
    }
  };

  const handlePreset = (value) => {
    setPreset(value);
    setIsOpen(false);
    if (onChange) onChange({ preset: value });
  };

  const isInRange = (day) => {
    if (!selectedRange.start) return false;
    const date = new Date(currentYear, currentMonth, day);
    if (selectedRange.start && selectedRange.end) {
      return date >= selectedRange.start && date <= selectedRange.end;
    }
    return date.getTime() === selectedRange.start.getTime();
  };

  const isSelected = (day) => {
    if (!selectedRange.start) return false;
    const date = new Date(currentYear, currentMonth, day);
    if (selectedRange.end) {
      return date >= selectedRange.start && date <= selectedRange.end;
    }
    return date.getTime() === selectedRange.start.getTime();
  };

  const formatDisplay = () => {
    if (preset) return preset;
    if (selectedRange.start && selectedRange.end) {
      const startStr = selectedRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const endStr = selectedRange.end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${startStr} - ${endStr}`;
    }
    if (selectedRange.start) {
      return selectedRange.start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return "Date Range";
  };

  const clearFilter = () => {
    setSelectedRange({ start: null, end: null });
    setPreset("");
    setIsOpen(false);
    if (onChange) onChange({ preset: "all" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-light-gray rounded-xl text-xs font-semibold text-dark-black/70 hover:bg-light-gray transition-colors cursor-pointer"
      >
        <CalendarDays className="h-4 w-4 text-light-black" />
        <span>{formatDisplay()}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-light-black" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-1 bg-white border border-light-gray rounded-xl shadow-lg overflow-hidden"
            style={{ transformOrigin: "top right", minWidth: "320px" }}
          >
            {/* Presets row */}
            <div className="flex gap-1 p-3 pb-2 border-b border-light-gray/60 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => handlePreset(p.value)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                    preset === p.value
                      ? "bg-primary/10 text-primary"
                      : "text-dark-black/60 hover:bg-light-gray"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="p-4">
              {/* Month header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-lg hover:bg-light-gray transition-colors cursor-pointer text-dark-black/60"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-bold text-dark-black/80">
                  {months[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded-lg hover:bg-light-gray transition-colors cursor-pointer text-dark-black/60"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-bold text-light-black uppercase tracking-wider py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Date grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth(currentMonth, currentYear) }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth(currentMonth, currentYear) }).map((_, i) => {
                  const day = i + 1;
                  const selected = isSelected(day);
                  const inRange = isInRange(day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateClick(day)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        selected
                          ? "bg-primary text-white"
                          : inRange
                          ? "bg-primary/10 text-primary"
                          : "text-dark-black/70 hover:bg-light-gray"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-light-gray/60">
                <button
                  onClick={clearFilter}
                  className="text-[11px] font-semibold text-medium-black hover:text-dark-black transition-colors cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 text-[11px] font-semibold bg-primary text-white rounded-lg hover:bg-medium-teal transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarFilter;
