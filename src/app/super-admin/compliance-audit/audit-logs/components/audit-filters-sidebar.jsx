"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import DatePicker from "@/components/modals/date-picker";
import { categoryFilterOptions } from "../audit-logs-data";

// One dropdown field; options are [{ value, label }], "" = all
function SelectField({ id, label, value, allLabel, options, open, onToggle, onSelect }) {
  const current = options.find((option) => option.value === value)?.label ?? allLabel;
  return (
    <div className="space-y-1.5 relative">
      <label htmlFor={id} className="text-xs font-semibold text-dark-black/75 block">{label}</label>
      <button
        id={id}
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs font-medium text-dark-black/85 bg-white flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
      >
        <span className="truncate text-medium-black font-medium">{current}</span>
        <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0 ml-2" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30 max-h-56 overflow-y-auto">
          {[{ value: "", label: allLabel }, ...options].map((option) => (
            <button
              key={option.value || "all"}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                value === option.value ? "text-primary font-semibold bg-primary/5" : "text-medium-black hover:bg-light-gray/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// options: { actions, entities, users, ips } from the API (only values present in the log)
export default function AuditFiltersSidebar({ options, selectedCategory, setSelectedCategory, filters, setFilter, onResetFilters, onApplyFilters }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const field = (key, label, allLabel, list) => (
    <SelectField
      id={`audit-filter-${key}`}
      label={label}
      value={filters[key]}
      allLabel={allLabel}
      options={list}
      open={openDropdown === key}
      onToggle={() => setOpenDropdown((current) => (current === key ? null : key))}
      onSelect={(value) => {
        setFilter(key, value);
        setOpenDropdown(null);
      }}
    />
  );

  const categories = categoryFilterOptions.slice(1).map((label) => ({ value: label, label }));

  return (
    <div ref={sidebarRef} className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between pb-2 border-b border-light-gray/70">
        <h3 className="text-sm font-bold text-dark-black/90 font-secondary">Filters</h3>
        <button type="button" onClick={onResetFilters} className="text-xs font-semibold text-primary hover:text-[#0c9593] transition-colors cursor-pointer">
          Reset
        </button>
      </div>

      {/* Date Range */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-dark-black/75 block">Date Range</span>
        <div className="grid grid-cols-2 gap-2">
          <DatePicker value={filters.from} onChange={(value) => setFilter("from", value)} placeholder="From" placement="bottom" />
          <DatePicker value={filters.to} onChange={(value) => setFilter("to", value)} placeholder="To" placement="bottom" />
        </div>
      </div>

      {/* Category: the same filter as the tabs, so it applies straight away */}
      <SelectField
        id="audit-filter-category"
        label="Category"
        value={selectedCategory === "All Categories" ? "" : selectedCategory}
        allLabel="All Categories"
        options={categories}
        open={openDropdown === "category"}
        onToggle={() => setOpenDropdown((current) => (current === "category" ? null : "category"))}
        onSelect={(value) => {
          setSelectedCategory(value || "All Categories");
          setOpenDropdown(null);
        }}
      />

      {field("action", "Action", "All Actions", options?.actions ?? [])}
      {field("entity", "Entity", "All Entities", options?.entities ?? [])}
      {field("user", "User", "All Users", (options?.users ?? []).map((name) => ({ value: name, label: name })))}

      <div className="space-y-1.5">
        <label htmlFor="audit-filter-ip" className="text-xs font-semibold text-dark-black/75 block">IP Address</label>
        <input
          id="audit-filter-ip"
          type="text"
          value={filters.ip}
          onChange={(event) => setFilter("ip", event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && onApplyFilters()}
          placeholder="Search IP address..."
          list="audit-filter-ip-list"
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs text-medium-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal shadow-2xs"
        />
        <datalist id="audit-filter-ip-list">
          {(options?.ips ?? []).map((ip) => <option key={ip} value={ip} />)}
        </datalist>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onApplyFilters}
          className="w-full py-2.5 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center cursor-pointer"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
