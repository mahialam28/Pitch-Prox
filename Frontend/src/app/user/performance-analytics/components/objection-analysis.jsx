"use client";

import React from "react";
import { Info } from "lucide-react";
import Tooltip from "@/components/modals/tooltip";

const objectionsData = [
  { objection: "Price", frequency: "34%", resolution: "41%", status: "orange" },
  { objection: "Timing", frequency: "22%", resolution: "63%", status: "emerald" },
  { objection: "Commission", frequency: "19%", resolution: "58%", status: "emerald" },
  { objection: "Don't Want To Sell", frequency: "12%", resolution: "33%", status: "orange" },
  { objection: "Already Working With Agent", frequency: "8%", resolution: "44%", status: "orange" },
  { objection: "Other", frequency: "5%", resolution: "50%", status: "emerald" },
];

export const ObjectionAnalysis = () => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-light-gray shadow-sm w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1.5">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80">
            Objection Analysis
          </h2>
          <Tooltip
            title="Objection Analysis"
            text="Breaks down the objections encountered during your conversations, showing how frequently they occurred and how effectively they were handled. Understanding objection trends helps you prepare for future conversations with greater confidence."
          >
            <Info
              tabIndex={0}
              aria-label="More about Objection Analysis"
              className="w-4 h-4 text-medium-black/70 shrink-0 transition-colors duration-200 hover:text-primary outline-none"
            />
          </Tooltip>
        </div>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 text-[10px] font-bold text-light-black tracking-wider uppercase mb-3 px-1">
        <div className="col-span-6">Objection</div>
        <div className="col-span-3 text-center">Frequency</div>
        <div className="col-span-3 text-right">Resolution Rate</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-light-gray">
        {objectionsData.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 items-center py-3 text-xs sm:text-sm px-1"
          >
            {/* Objection Name */}
            <div className="col-span-6 font-semibold text-dark-black/70 leading-snug">
              {item.objection}
            </div>

            {/* Frequency */}
            <div className="col-span-3 text-center font-medium text-medium-black">
              {item.frequency}
            </div>

            {/* Resolution Rate + Indicator Bar */}
            <div className="col-span-3 flex items-center justify-end gap-2">
              <span
                className={`font-bold ${
                  item.status === "emerald" ? "text-emerald-500" : "text-orange-500"
                }`}
              >
                {item.resolution}
              </span>
              <div className="w-5 h-1 rounded-full bg-light-gray overflow-hidden shrink-0">
                <div
                  className={`h-full rounded-full ${
                    item.status === "emerald" ? "bg-emerald-500" : "bg-orange-500"
                  }`}
                  style={{ width: item.resolution }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObjectionAnalysis;