"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Check, ChevronUp, ChevronDown } from "lucide-react";

// Generate clean 30-minute standard business & daily intervals
const TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM",
];

const PRESETS = [
  { label: "Morning", time: "09:00 AM" },
  { label: "Noon", time: "12:00 PM" },
  { label: "Afternoon", time: "02:00 PM" },
  { label: "End of Day", time: "05:00 PM" },
];

export const TimePicker = ({
  value,
  onChange,
  placeholder = "Select time",
  className = "",
  label,
  placement = "bottom",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  // Parse time components
  const parseTime = (val) => {
    if (!val) return { hour: 9, minute: 0, period: "AM" };
    const clean = val.trim();
    const parts = clean.split(" ");
    let timeStr = parts[0] || "09:00";
    let period = parts[1] || "AM";

    const [h, m] = timeStr.split(":");
    let hour = parseInt(h || "9", 10);
    let minute = parseInt(m || "0", 10);

    if (!parts[1]) {
      if (hour >= 12) {
        period = "PM";
        if (hour > 12) hour -= 12;
      } else {
        period = "AM";
        if (hour === 0) hour = 12;
      }
    }

    return {
      hour: isNaN(hour) ? 9 : hour,
      minute: isNaN(minute) ? 0 : minute,
      period: period.toUpperCase() === "PM" ? "PM" : "AM",
    };
  };

  const current = parseTime(value);
  const [hour, setHour] = useState(current.hour);
  const [minute, setMinute] = useState(current.minute);
  const [period, setPeriod] = useState(current.period);

  useEffect(() => {
    if (value) {
      const p = parseTime(value);
      setHour(p.hour);
      setMinute(p.minute);
      setPeriod(p.period);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format custom output
  const formatTime = (h, m, p) => {
    const formattedH = String(h).padStart(2, "0");
    const formattedM = String(m).padStart(2, "0");
    return `${formattedH}:${formattedM} ${p}`;
  };

  const handleSelectSlot = (slot) => {
    onChange(slot);
    const parsed = parseTime(slot);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
    setIsOpen(false);
  };

  const handleAdjustHour = (delta) => {
    let nextH = hour + delta;
    if (nextH > 12) nextH = 1;
    if (nextH < 1) nextH = 12;
    setHour(nextH);
    onChange(formatTime(nextH, minute, period));
  };

  const handleAdjustMinute = (delta) => {
    let nextM = minute + delta;
    if (nextM >= 60) nextM = 0;
    if (nextM < 0) nextM = 45;
    setMinute(nextM);
    onChange(formatTime(hour, nextM, period));
  };

  const handleTogglePeriod = (p) => {
    setPeriod(p);
    onChange(formatTime(hour, minute, p));
  };

  const isTop = placement === "top";

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
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border bg-white text-xs transition-all duration-200 cursor-pointer shadow-2xs hover:border-primary/60 ${
          isOpen
            ? "border-primary ring-2 ring-primary/20 shadow-xs"
            : "border-light-gray"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <span
            className={`font-medium truncate ${
              value ? "text-dark-black/85 font-semibold" : "text-light-black"
            }`}
          >
            {value || placeholder}
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
      </button>

      {/* Modern Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isTop ? 8 : -8, scale: 0.96 }}
            animate={{ opacity: 1, y: isTop ? -4 : 4, scale: 1 }}
            exit={{ opacity: 0, y: isTop ? 8 : -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute left-0 z-50 w-full min-w-[280px] bg-white rounded-2xl border border-light-gray shadow-2xl p-3.5 overflow-hidden ${
              isTop ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
            style={{ transformOrigin: isTop ? "bottom" : "top" }}
          >
            {/* Custom Precision Stepper Header */}
            <div className="bg-light-gray/40 rounded-xl p-2.5 border border-light-gray/60 flex items-center justify-between gap-2 mb-3">
              {/* Hour Stepper */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-light-gray/80 shadow-2xs">
                <span className="text-xs font-bold text-dark-black/85 w-5 text-center">
                  {String(hour).padStart(2, "0")}
                </span>
                <div className="flex flex-col -space-y-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustHour(1)}
                    className="text-light-black hover:text-primary p-0.5"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustHour(-1)}
                    className="text-light-black hover:text-primary p-0.5"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <span className="text-xs font-bold text-medium-black">:</span>

              {/* Minute Stepper */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-light-gray/80 shadow-2xs">
                <span className="text-xs font-bold text-dark-black/85 w-5 text-center">
                  {String(minute).padStart(2, "0")}
                </span>
                <div className="flex flex-col -space-y-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustMinute(15)}
                    className="text-light-black hover:text-primary p-0.5"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustMinute(-15)}
                    className="text-light-black hover:text-primary p-0.5"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* AM / PM Toggle Pills */}
              <div className="flex items-center bg-light-gray p-0.5 rounded-lg border border-light-gray/80">
                {["AM", "PM"].map((p) => {
                  const isActive = period === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleTogglePeriod(p)}
                      className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-2xs"
                          : "text-medium-black hover:text-dark-black"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-4 gap-1 mb-2.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectSlot(preset.time)}
                  className="py-1 px-1.5 text-[10px] font-medium text-dark-black/75 bg-light-gray/50 hover:bg-primary/10 hover:text-primary rounded-lg border border-light-gray/40 transition-colors text-center truncate cursor-pointer"
                  title={preset.time}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Scrollable Time Slots List */}
            <div
              ref={listRef}
              className="max-h-40 overflow-y-auto space-y-1 pr-1 border-t border-light-gray/60 pt-2"
            >
              {TIME_SLOTS.map((slot) => {
                const isSelected = value === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleSelectSlot(slot)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 text-primary font-bold border border-primary/30"
                        : "text-dark-black/75 hover:bg-light-gray/60 hover:text-dark-black"
                    }`}
                  >
                    <span>{slot}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-primary stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimePicker;
