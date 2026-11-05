"use client";

import React from "react";
import { Phone, FileText, Info } from "lucide-react";
import toast from "react-hot-toast";
import Tooltip from "@/components/modals/tooltip";

const CurrentUsage = ({
  callsUsed = 142,
  callsMax = 500,
  reportsUsed = 18,
  reportsMax = 50,
  onManageLimits = () => {},
}) => {
  const callsPct = Math.round((callsUsed / callsMax) * 100);
  const reportsPct = Math.round((reportsUsed / reportsMax) * 100);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* ── Header: Title, Subtitle, Info Icon ── */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <h3 className="text-base font-bold text-dark-black/85 tracking-tight whitespace-nowrap">
            Current Usage
          </h3>
          <span className="text-xs text-light-black font-normal">
            (This Cycle)
          </span>
          <Tooltip
            title="This Cycle"
            text="Shows how much of your plan’s included usage you’ve used during the current billing period."
            position="top"
            align="center"
            className="p-0 -m-0 hover:bg-transparent"
          >
            <Info className="w-3.5 h-3.5 text-light-black/50 hover:text-primary transition-colors cursor-pointer" />
          </Tooltip>
        </div>
      </div>

      {/* ── Usage Progress Bars ── */}
      <div className="space-y-4 mb-5">
        {/* Calls Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-light-black font-medium">
              <Phone className="w-3.5 h-3.5 text-blue-500" />
              <span>Calls</span>
            </div>
            <div className="text-xs">
              <span className="font-bold text-dark-black/85 font-secondary">
                {callsUsed}
              </span>
              <span className="text-light-black font-normal"> / {callsMax}</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-light-gray rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${callsPct}%` }}
            />
          </div>

          <div className="text-right">
            <span className="text-[10px] text-light-black font-medium">
              {callsPct}% used
            </span>
          </div>
        </div>

        {/* Reports Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-light-black font-medium">
              <FileText className="w-3.5 h-3.5 text-purple-500" />
              <span>Reports</span>
            </div>
            <div className="text-xs">
              <span className="font-bold text-dark-black/85 font-secondary">
                {reportsUsed}
              </span>
              <span className="text-light-black font-normal"> / {reportsMax}</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-light-gray rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${reportsPct}%` }}
            />
          </div>

          <div className="text-right">
            <span className="text-[10px] text-light-black font-medium">
              {reportsPct}% used
            </span>
          </div>
        </div>
      </div>

      {/* ── Action Button: Manage Limits ── */}
      <button
        type="button"
        onClick={onManageLimits}
        className="w-full py-2 px-3 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors cursor-pointer text-center shadow-2xs"
      >
        Manage Limits
      </button>
    </div>
  );
};

export default CurrentUsage;
