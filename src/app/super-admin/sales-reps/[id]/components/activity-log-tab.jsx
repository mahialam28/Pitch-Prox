"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";

const dateRangeOptions = [
  { value: "All Time", label: "Date Range" },
  { value: "May 1 - May 31, 2025", label: "May 1 - May 31, 2025" },
  { value: "Last 30 Days", label: "Last 30 Days" },
  { value: "This Quarter", label: "This Quarter" },
];

const activityTypeOptions = [
  { value: "All Activity Types", label: "All Activity Types" },
  { value: "Reports", label: "Report Views & Exports" },
  { value: "Calls", label: "Call Logging & Audio" },
  { value: "Account", label: "Profile & Settings" },
  { value: "Billing", label: "Quota & Adjustments" },
];

const performedByOptions = [
  { value: "All Performed By", label: "All Performed By" },
  { value: "Ryan Anderson", label: "Ryan Anderson (Self)" },
  { value: "Sarah Johnson", label: "Sarah Johnson (Manager)" },
  { value: "System", label: "System / Admin" },
];

const pageSizeOptions = [
  { value: "10 / page", label: "10 / page" },
  { value: "20 / page", label: "20 / page" },
  { value: "50 / page", label: "50 / page" },
];

const activitiesData = [
  {
    id: "ACT-101",
    date: "May 31, 2025",
    time: "10:32 AM",
    activity: "Viewed Call Analysis Report",
    category: "Reports",
    categoryColor: "bg-blue-50 text-blue-600 border border-blue-200",
    details: "Viewed detailed AI call analysis report",
    performedBy: "Ryan Anderson",
    role: "(Self)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    ipAddress: "103.24.56.78",
  },
  {
    id: "ACT-102",
    date: "May 31, 2025",
    time: "10:32 AM",
    activity: "Logged Call Outcome",
    category: "Calls",
    categoryColor: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    details: 'Outcome updated to "Trial Started"',
    performedBy: "Ryan Anderson",
    role: "(Self)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    ipAddress: "103.24.56.78",
  },
  {
    id: "ACT-103",
    date: "May 31, 2025",
    time: "10:32 AM",
    activity: "Downloaded Call Recording",
    category: "Calls",
    categoryColor: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    details: "Downloaded MP3 recording (18m 12s)",
    performedBy: "Ryan Anderson",
    role: "(Self)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    ipAddress: "103.24.56.78",
  },
  {
    id: "ACT-104",
    date: "May 31, 2025",
    time: "10:32 AM",
    activity: "Profile Information Updated",
    category: "Account",
    categoryColor: "bg-slate-100 text-slate-600 border border-slate-200",
    details: "Updated phone number",
    performedBy: "Ryan Anderson",
    role: "(Self)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    ipAddress: "103.24.56.78",
  },
  {
    id: "ACT-105",
    date: "May 31, 2025",
    time: "10:32 AM",
    activity: "Quota Adjusted",
    category: "Billing",
    categoryColor: "bg-amber-50 text-amber-600 border border-amber-200",
    details: "Monthly quota increased from $50,000 to $60,000",
    performedBy: "Sarah Johnson",
    role: "(Manager)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    ipAddress: "104.18.27.91",
  },
];

export default function ActivityLogTab({ rep }) {
  const repName = rep?.name || "Ryan Anderson";

  const [dateRange, setDateRange] = useState("All Time");
  const [activityType, setActivityType] = useState("All Activity Types");
  const [performedBy, setPerformedBy] = useState("All Performed By");
  const [pageSize, setPageSize] = useState("10 / page");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredActivities = activitiesData.filter((item) => {
    if (activityType !== "All Activity Types" && item.category !== activityType) {
      return false;
    }
    if (
      performedBy !== "All Performed By" &&
      !item.performedBy.toLowerCase().includes(performedBy.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-light-gray shadow-xs flex flex-col justify-between overflow-hidden animate-in fade-in duration-200">
      {/* 1. Header & Top Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary tracking-tight">
            Activity Log
          </h2>
          <p className="text-xs sm:text-sm text-light-black mt-0.5">
            Track all actions and changes made in {repName}&apos;s account.
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="w-36">
            <Dropdown
              items={dateRangeOptions}
              selected={dateRange}
              onSelect={(val) => setDateRange(val)}
              variant="small"
              placement="bottom"
              className="w-full"
            />
          </div>

          <div className="w-44">
            <Dropdown
              items={activityTypeOptions}
              selected={activityType}
              onSelect={(val) => setActivityType(val)}
              variant="small"
              placement="bottom"
              className="w-full"
            />
          </div>

          <div className="w-44">
            <Dropdown
              items={performedByOptions}
              selected={performedBy}
              onSelect={(val) => setPerformedBy(val)}
              variant="small"
              placement="bottom"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 2. Activity Log Table */}
      <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-light-gray text-[10.5px] font-bold text-light-black uppercase tracking-wider select-none">
              <th className="pb-3 text-left">DATE / TIME</th>
              <th className="pb-3 text-left">ACTIVITY</th>
              <th className="pb-3 text-left">CATEGORY</th>
              <th className="pb-3 text-left">DETAILS</th>
              <th className="pb-3 text-left">PERFORMED BY</th>
              <th className="pb-3 text-right">IP ADDRESS</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-light-gray/60 text-xs">
            {filteredActivities.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-light-gray/40 transition-colors"
              >
                {/* Date / Time */}
                <td className="py-3.5 text-left whitespace-nowrap">
                  <div>
                    <p className="font-semibold text-dark-black/85 text-xs">
                      {item.date}
                    </p>
                    <p className="text-[11px] text-light-black mt-0.5">
                      {item.time}
                    </p>
                  </div>
                </td>

                {/* Activity */}
                <td className="py-3.5 text-left whitespace-nowrap">
                  <span className="font-bold text-dark-black/90 text-xs">
                    {item.activity}
                  </span>
                </td>

                {/* Category Pill */}
                <td className="py-3.5 text-left whitespace-nowrap">
                  <span
                    className={`inline-flex items-center text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${item.categoryColor}`}
                  >
                    {item.category}
                  </span>
                </td>

                {/* Details */}
                <td className="py-3.5 text-left text-light-black text-xs">
                  {item.details}
                </td>

                {/* Performed By (Avatar + Name + Role) */}
                <td className="py-3.5 text-left whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.avatar}
                      alt={item.performedBy}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-dark-black/90 text-xs">
                        {item.performedBy}
                      </span>
                      <span className="text-[11px] text-light-black">
                        {item.role}
                      </span>
                    </div>
                  </div>
                </td>

                {/* IP Address */}
                <td className="py-3.5 text-right whitespace-nowrap text-light-black text-xs font-mono">
                  {item.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-light-gray select-none">
        <span className="text-xs text-light-black">
          Showing 1 to 10 of 142 activities
        </span>

        <div className="flex items-center gap-3">
          {/* Pagination Numbers */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {[1, 2, 3, 4, 5].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? "bg-primary text-white shadow-xs"
                    : "border border-light-gray text-dark-black/75 hover:bg-light-gray"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <span className="text-xs text-light-black px-1">...</span>

            <button
              type="button"
              onClick={() => setCurrentPage(15)}
              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                currentPage === 15
                  ? "bg-primary text-white shadow-xs"
                  : "border border-light-gray text-dark-black/75 hover:bg-light-gray"
              }`}
            >
              15
            </button>

            <button
              type="button"
              disabled={currentPage === 15}
              onClick={() => setCurrentPage((p) => Math.min(15, p + 1))}
              className="w-7 h-7 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Size Dropdown */}
          <div className="w-28">
            <Dropdown
              items={pageSizeOptions}
              selected={pageSize}
              onSelect={(val) => setPageSize(val)}
              variant="small"
              placement="top"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
