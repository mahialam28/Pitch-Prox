"use client";

import React from "react";

// Stacked radio cards from the dialog designs (title + description, teal when selected).
// options: [{ value, label, description }]
const RadioCards = ({ label, value, onChange, options, className = "space-y-3" }) => (
  <div role="radiogroup" aria-label={label} className={className}>
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(option.value)}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
            selected ? "border-primary bg-light-teal/60" : "border-gray-300 bg-white hover:bg-light-gray/60"
          }`}
        >
          <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selected ? "border-primary" : "border-gray-300"}`}>
            {selected && <span className="w-3.5 h-3.5 rounded-full bg-primary" />}
          </span>
          <span>
            <span className="block text-sm font-medium text-dark-black">{option.label}</span>
            {option.description && <span className="block text-xs text-medium-black">{option.description}</span>}
          </span>
        </button>
      );
    })}
  </div>
);

export default RadioCards;
