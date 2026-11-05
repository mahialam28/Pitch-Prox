"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/utils.js/cn";

const Dropdown = ({
  label,
  items = [],
  selected,
  onSelect,
  variant = "default",
  className = "",
  buttonClassName = "",
  multiSelect = false,
  icon,
  placement = "bottom",
}) => {
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

  const variants = {
    default: "px-4 py-3 text-sm",
    small: "px-3.5 py-2 text-xs",
    sm: "px-3.5 py-2 text-xs",
    compact: "px-3.5 py-2 text-xs",
    filter: "px-3.5 py-2 text-xs",
    search: "px-3.5 py-2 text-xs",
    large: "px-4 py-3.5 text-base",
  };

  // For multi-select, selected is an array; for single, it's a value
  const isMultiSelected = (value) => {
    if (multiSelect) {
      return Array.isArray(selected) && selected.includes(value);
    }
    return selected === value;
  };

  const selectedItem = !multiSelect ? items.find((item) => item.value === selected) : null;
  const displayText = selectedItem ? selectedItem.label : label;

  const isTop = placement === "top";
  const isSmall =
    variant === "small" ||
    variant === "sm" ||
    variant === "compact" ||
    variant === "filter" ||
    variant === "search";

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 w-full rounded-xl border bg-white transition-all duration-200 cursor-pointer font-medium",
          variants[variant] || variants.default,
          isOpen
            ? "border-primary ring-2 ring-primary/20"
            : "border-light-gray",
          multiSelect && Array.isArray(selected) && selected.length > 0
            ? "text-dark-black font-semibold"
            : selected
              ? "text-dark-black"
              : "text-light-black",
          buttonClassName
        )}
      >
        {icon && (
          <span className="flex shrink-0 text-light-black">{icon}</span>
        )}
        <span className="flex-1 text-left truncate">{displayText}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex shrink-0"
        >
          <ChevronDown className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: isTop ? 8 : -8, scale: 0.95 }}
            animate={{ opacity: 1, y: isTop ? -4 : 4, scale: 1 }}
            exit={{ opacity: 0, y: isTop ? 8 : -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 min-w-full w-max max-w-[280px] bg-white border border-light-gray rounded-xl shadow-xl overflow-hidden ${
              isTop ? "bottom-full mb-1.5" : "top-full mt-1.5"
            }`}
            style={{ transformOrigin: isTop ? "bottom" : "top" }}
          >
            <div className="py-1 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300">
              {items.map((item) => {
                const isActive = isMultiSelected(item.value);
                return (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => {
                      onSelect(item.value);
                      if (!multiSelect) {
                        setIsOpen(false);
                      }
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary/5 text-primary"
                        : "hover:bg-primary/5 hover:text-primary text-dark-black/70"
                    }`}
                  >
                    {/* Checkbox for multi-select */}
                    {multiSelect && (
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border-2 shrink-0 transition-colors ${
                          isActive
                            ? "bg-primary border-primary"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isActive && (
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        )}
                      </div>
                    )}

                    {/* Icon (single-select) or nothing */}
                    {!multiSelect && item.icon && (
                      <span className="w-4 h-4 flex items-center justify-center">
                        {item.icon}
                      </span>
                    )}

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">{item.label}</span>
                      {item.desc && (
                        <span className="text-[10px] text-slate-400 truncate font-normal mt-0.5">
                          {item.desc}
                        </span>
                      )}
                    </div>

                    {/* Active indicator dot for single-select */}
                    {!multiSelect && isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0"
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
  );
};

export default Dropdown;
