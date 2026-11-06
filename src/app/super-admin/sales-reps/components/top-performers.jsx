"use client";

import React from "react";

import { ProfileAvatar } from "@/components/shared/avatar-editor";
import { dollars, pct } from "../team-api";

// Ranked by booked revenue this month, then accounts closed
export default function TopPerformers({ reps = [] }) {
  const topReps = reps.map((rep, index) => ({ ...rep, rank: index + 1 }));
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/85 tracking-tight">
          Top Performers
        </h3>
      </div>

      {/* List */}
      {!topReps.length && <p className="text-xs text-light-black">No accounts closed yet this month.</p>}
      <div className="space-y-3.5">
        {topReps.map((rep) => (
          <div
            key={rep.id}
            className="flex items-center justify-between gap-3 text-xs"
          >
            {/* Rank + Avatar + Name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-semibold text-light-black w-3 text-center shrink-0">
                {rep.rank}
              </span>
              <ProfileAvatar name={rep.name} className="w-8 h-8 !text-[11px] shrink-0" />
              <span className="font-semibold text-dark-black/85 truncate text-xs">
                {rep.name}
              </span>
            </div>

            {/* Metrics */}
            <div className="text-right shrink-0">
              <p className="font-bold text-dark-black/85 text-xs font-secondary leading-tight">
                {dollars(rep.revenueCents)}
              </p>
              <p className="text-[10px] font-medium text-emerald-600 font-secondary mt-0.5">
                {rep.closed} closed · {pct(rep.leadToSubscription)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
