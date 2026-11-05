"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SettingsDropdown = ({
  label,
  items = [],
  selected,
  onSelect,
  className = "",
  disabled = false,
  dropUp = false,
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

  const selectedItem = items.find((item) => item.value === selected);
  const hasSelection = selectedItem !== undefined;
  const displayText = hasSelection ? selectedItem.label : label;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-disabled={disabled}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 w-full px-4 py-2.5 text-sm rounded-xl border transition-all duration-200 ${
          disabled
            ? "bg-light-gray/40 border-light-gray text-light-black cursor-not-allowed"
            : isOpen
              ? "border-primary ring-2 ring-primary/20 cursor-pointer"
              : "border-light-gray cursor-pointer"
        } ${hasSelection && !disabled ? "text-dark-black" : "text-light-black"}`}
      >
        <span className="flex-1 text-left truncate">{displayText}</span>
        {disabled ? (
          <Lock className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex shrink-0"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        )}
      </button>

      {!disabled && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.95 }}
              animate={{ opacity: 1, y: dropUp ? -4 : 4, scale: 1 }}
              exit={{ opacity: 0, y: dropUp ? 8 : -8, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute z-50 ${
                dropUp ? "bottom-full mb-1" : "mt-1"
              } min-w-[220px] max-w-[360px] bg-white border border-light-gray rounded-xl shadow-lg overflow-hidden`}
              style={{ transformOrigin: dropUp ? "bottom" : "top" }}
            >
              <div className="py-1 max-h-80 overflow-y-auto">
                {items.map((item, index) => {
                  if (item.type === "header") {
                    return (
                      <div
                        key={`header-${index}`}
                        className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-light-black/70"
                      >
                        {item.label}
                      </div>
                    );
                  }

                  if (item.type === "divider") {
                    return (
                      <div
                        key={`divider-${index}`}
                        className="my-1.5 mx-4 border-t border-light-gray"
                      />
                    );
                  }

                  const isActive = selected === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        onSelect(item.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-left transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary/5 text-primary"
                          : "hover:bg-primary/5 hover:text-primary text-dark-black/70"
                      }`}
                    >
                      {item.icon && (
                        <span className="w-4 h-4 flex items-center justify-center shrink-0">
                          {item.icon}
                        </span>
                      )}
                      <span className="whitespace-nowrap truncate" title={item.label}>
                        {item.label}
                      </span>
                      {isActive && (
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
      )}
    </div>
  );
};

export default SettingsDropdown;
