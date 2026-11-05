"use client";

import React from "react";

const topReps = [
  {
    rank: 1,
    name: "Ryan Anderson",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    leadPercent: "34.2%",
    trustGain: "+28.7",
  },
  {
    rank: 2,
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
    leadPercent: "29.8%",
    trustGain: "+22.4",
  },
  {
    rank: 3,
    name: "Michael Carter",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    leadPercent: "25.7%",
    trustGain: "+19.3",
  },
];

export default function TopPerformers() {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm sm:text-base font-bold text-dark-black/85 tracking-tight">
          Top Performers
        </h3>
      </div>

      {/* List */}
      <div className="space-y-3.5">
        {topReps.map((rep) => (
          <div
            key={rep.name}
            className="flex items-center justify-between gap-3 text-xs"
          >
            {/* Rank + Avatar + Name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs font-semibold text-light-black w-3 text-center shrink-0">
                {rep.rank}
              </span>
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-light-gray bg-slate-100">
                <img
                  src={rep.avatar}
                  alt={rep.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-dark-black/85 truncate text-xs">
                {rep.name}
              </span>
            </div>

            {/* Metrics */}
            <div className="text-right shrink-0">
              <p className="font-bold text-dark-black/85 text-xs font-secondary leading-tight">
                {rep.leadPercent}
              </p>
              <p className="text-[10px] font-medium text-emerald-600 font-secondary mt-0.5">
                {rep.trustGain}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
