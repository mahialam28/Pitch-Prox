"use client";

import React from "react";
import { Check } from "lucide-react";

export default function Checkbox({
  checked = false,
  onChange,
  className = "",
  disabled = false,
  indeterminate = false,
  label,
  onClick,
}) {
  const handleClick = (e) => {
    if (disabled) return;
    e.stopPropagation();
    onClick?.(e);
    onChange?.(!checked);
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
      } ${className}`}
    >
      <div
        role="checkbox"
        aria-checked={checked}
        className={`w-4 h-4 rounded-[5px] flex items-center justify-center border transition-all duration-150 shrink-0 ${
          checked || indeterminate
            ? "bg-primary border-primary shadow-2xs"
            : "border-slate-300 bg-white hover:border-primary/60"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
        {!checked && indeterminate && (
          <div className="w-2 h-0.5 bg-white rounded-full" />
        )}
      </div>
      {label && (
        <span className="text-xs text-dark-black/85 font-medium truncate">
          {label}
        </span>
      )}
    </div>
  );
}
