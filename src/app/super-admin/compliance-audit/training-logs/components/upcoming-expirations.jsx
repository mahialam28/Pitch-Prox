"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

// upcoming: Trainings due in the next 30 days ({ trainingId, title, dueDate, employees })
export default function UpcomingExpirations({ upcoming, onViewAll, children }) {
  const expirations = (upcoming ?? []).slice(0, 5).map((item) => {
    const days = item.daysLeft;
    return {
      id: `${item.trainingId}-${item.dueDate}`,
      title: item.title,
      dueDate: `Due ${new Date(`${item.dueDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      employeeCount: item.employees,
      daysLeft: days === 0 ? "Today" : `${days} day${days === 1 ? "" : "s"}`,
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-bold text-dark-black font-secondary tracking-tight">
          Upcoming Due Dates
        </h3>
        <button
          type="button"
          onClick={onViewAll}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {children}

      {/* List */}
      <div className="flex flex-col divide-y divide-light-gray/60">
        {upcoming && expirations.length === 0 && <p className="text-xs text-light-black py-2">Nothing is due in the next 30 days.</p>}
        {expirations.map((item) => (
          <div
            key={item.id}
            className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3"
          >
            <div className="flex flex-col min-w-0">
              <h4 className="text-xs sm:text-[13px] font-semibold text-dark-black/90 truncate leading-snug">
                {item.title}
              </h4>
              <p className="text-[11px] text-light-black mt-0.5">
                {item.dueDate} • {item.employeeCount} employee{item.employeeCount === 1 ? "" : "s"}
              </p>
            </div>

            {/* Days Left Badge */}
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFF4ED] text-[#FF692E] border border-[#FFD6AE]/60">
              {item.daysLeft}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
