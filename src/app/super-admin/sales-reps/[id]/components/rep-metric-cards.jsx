"use client";

import React from "react";

export default function RepMetricCards({ rep }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
      {/* 1. Status Card */}
      <div className="bg-white p-3 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-dark-black/85">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Status: {rep.status || "Active"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-light-black">
          <span className="w-1 h-1 rounded-full bg-light-black/50" />
          <span>Last Active: {rep.lastActive || "Today, 10:32 AM"}</span>
        </div>
      </div>

      {/* 2. Prompt Adherence */}
      <div className="bg-white p-3 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-1">
        <span className="text-[10.5px] text-light-black font-medium leading-tight">
          Prompt Adherence
        </span>
        <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
          <span className="text-lg font-bold text-dark-black/90 font-secondary">
            {rep.promptAdh || "92.1%"}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600">
            ↑ 4.3%
          </span>
        </div>
      </div>

      {/* 3. Avg. Call Duration */}
      <div className="bg-white p-3 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-1">
        <span className="text-[10.5px] text-light-black font-medium leading-tight">
          Avg. Call Duration
        </span>
        <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
          <span className="text-lg font-bold text-dark-black/90 font-secondary">
            {rep.avgCallDuration || "14m 32s"}
          </span>
          <span className="text-[10px] font-semibold text-rose-500">
            ↓ 1m 22s
          </span>
        </div>
      </div>

      {/* 4. Conversion Momentum */}
      <div className="bg-white p-3 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-1">
        <span className="text-[10.5px] text-light-black font-medium leading-tight">
          Conversion Momentum
        </span>
        <div className="flex items-baseline justify-between gap-1.5 mt-0.5">
          <span className="text-lg font-bold text-dark-black/90 font-secondary">
            {rep.convMomentum || "+18.6%"}
          </span>
          <span className="text-[10px] font-semibold text-emerald-600">
            ↑ 3.4%
          </span>
        </div>
      </div>

      {/* 5. Current Streak */}
      <div className="bg-white p-3 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-1">
        <span className="text-[10.5px] text-light-black font-medium leading-tight">
          Current Streak
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-lg font-bold text-dark-black/90 font-secondary">
            {rep.currentStreak || "7"}
          </span>
          <span className="text-[11px] text-light-black font-medium">days</span>
        </div>
      </div>

      {/* 6. Performance Tier */}
      <div className="bg-white p-3 rounded-xl border border-light-gray shadow-xs flex flex-col justify-between gap-1">
        <span className="text-[10.5px] text-light-black font-medium leading-tight">
          Performance Tier
        </span>
        <div className="flex items-center justify-between gap-1.5 mt-0.5">
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 text-[11px] font-bold">
            {rep.tier || "Elite"}
          </span>
          <span className="text-[10px] text-light-black font-medium">
            Top 15%
          </span>
        </div>
      </div>
    </div>
  );
}
