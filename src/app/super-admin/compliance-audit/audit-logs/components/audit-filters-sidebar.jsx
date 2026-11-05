"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar, RotateCcw } from "lucide-react";
import DatePicker from "@/components/modals/date-picker";
import {
  categoryFilterOptions,
  actionFilterOptions,
  entityFilterOptions,
  userFilterOptions,
} from "../audit-logs-data";

export default function AuditFiltersSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedAction,
  setSelectedAction,
  selectedEntity = "All Entities",
  setSelectedEntity = () => {},
  selectedUser,
  setSelectedUser,
  ipSearch,
  setIpSearch,
  dateRange,
  setDateRange,
  onResetFilters,
  onApplyFilters,
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'category' | 'action' | 'user'
  const sidebarRef = useRef(null);

  // Click outside to close open dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div
      ref={sidebarRef}
      className="bg-white rounded-2xl border border-light-gray/80 p-5 shadow-xs flex flex-col gap-4 w-full"
    >
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-light-gray/70">
        <h3 className="text-sm font-bold text-dark-black/90 font-secondary">
          Filters
        </h3>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs font-semibold text-primary hover:text-[#0c9593] transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>Reset</span>
        </button>
      </div>

      {/* Field 1: Date Range */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-dark-black/75 block">
          Date Range
        </label>
        <DatePicker
          value={dateRange}
          onChange={(val) => setDateRange(val)}
          placeholder="May 13, 2024 - May 19, 2024"
          placement="bottom"
        />
      </div>

      {/* Field 2: Category */}
      <div className="space-y-1.5 relative">
        <label className="text-xs font-semibold text-dark-black/75 block">
          Category
        </label>
        <button
          type="button"
          onClick={() => toggleDropdown("category")}
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs font-medium text-dark-black/85 bg-white flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
        >
          <span className="truncate text-medium-black font-medium">{selectedCategory}</span>
          <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0 ml-2" />
        </button>

        {openDropdown === "category" && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto">
            {categoryFilterOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelectedCategory(opt);
                  setOpenDropdown(null);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                  selectedCategory === opt
                    ? "text-primary font-semibold bg-primary/5"
                    : "text-medium-black hover:bg-light-gray/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Field 3: Action */}
      <div className="space-y-1.5 relative">
        <label className="text-xs font-semibold text-dark-black/75 block">
          Action
        </label>
        <button
          type="button"
          onClick={() => toggleDropdown("action")}
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs font-medium text-dark-black/85 bg-white flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
        >
          <span className="truncate text-medium-black font-medium">{selectedAction}</span>
          <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0 ml-2" />
        </button>

        {openDropdown === "action" && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto">
            {actionFilterOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelectedAction(opt);
                  setOpenDropdown(null);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                  selectedAction === opt
                    ? "text-primary font-semibold bg-primary/5"
                    : "text-medium-black hover:bg-light-gray/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Field 4: Entity */}
      <div className="space-y-1.5 relative">
        <label className="text-xs font-semibold text-dark-black/75 block">
          Entity
        </label>
        <button
          type="button"
          onClick={() => toggleDropdown("entity")}
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs font-medium text-dark-black/85 bg-white flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
        >
          <span className="truncate text-medium-black font-medium">{selectedEntity}</span>
          <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0 ml-2" />
        </button>

        {openDropdown === "entity" && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto">
            {entityFilterOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelectedEntity(opt);
                  setOpenDropdown(null);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                  selectedEntity === opt
                    ? "text-primary font-semibold bg-primary/5"
                    : "text-medium-black hover:bg-light-gray/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Field 5: User */}
      <div className="space-y-1.5 relative">
        <label className="text-xs font-semibold text-dark-black/75 block">
          User
        </label>
        <button
          type="button"
          onClick={() => toggleDropdown("user")}
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs font-medium text-dark-black/85 bg-white flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
        >
          <span className="truncate text-medium-black font-medium">{selectedUser}</span>
          <ChevronDown className="w-3.5 h-3.5 text-light-black shrink-0 ml-2" />
        </button>

        {openDropdown === "user" && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-30 max-h-48 overflow-y-auto">
            {userFilterOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelectedUser(opt);
                  setOpenDropdown(null);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                  selectedUser === opt
                    ? "text-primary font-semibold bg-primary/5"
                    : "text-medium-black hover:bg-light-gray/50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Field 6: IP Address */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-dark-black/75 block">
          IP Address
        </label>
        <input
          type="text"
          value={ipSearch}
          onChange={(e) => setIpSearch(e.target.value)}
          placeholder="Search IP address..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs text-medium-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal shadow-2xs"
        />
      </div>

      {/* Action Button: Apply Filters */}
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
