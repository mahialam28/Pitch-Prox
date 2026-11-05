"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BadgeSelect — a compact inline dropdown that renders the selected option
 * as a colored pill badge. Used for Lead Stage, Status and Outcome columns.
 *
 * options: [{ value, label, className, dotClass }]
 */
const BadgeSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  className = "",
  unselectedClassName = "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
          selected
            ? selected.className
            : unselectedClassName
        } ${isOpen ? "ring-2 ring-primary/25 ring-offset-1 ring-offset-white" : ""}`}
      >
        <span className="truncate max-w-[150px]">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 opacity-60 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-1.5 min-w-[190px] bg-white border border-light-gray rounded-xl shadow-lg overflow-hidden"
            style={{ transformOrigin: "top" }}
          >
            <div className="py-1 max-h-64 overflow-y-auto">
              {options.map((option) => {
                const isActive = value === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange?.(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary/5 text-primary"
                        : "text-dark-black/70 hover:bg-light-gray"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        option.dotClass || "bg-gray-300"
                      }`}
                    />
                    <span className="flex-1">{option.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
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

export default BadgeSelect;
