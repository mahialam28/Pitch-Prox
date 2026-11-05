"use client";

import React from "react";
import { Navigation, Tag, Clock } from "lucide-react";

export default function CampaignUsageTable({ campaigns = [] }) {
  const getIcon = (type) => {
    switch (type) {
      case "tag":
        return {
          Icon: Tag,
          bg: "bg-purple-50 text-purple-600",
        };
      case "clock":
        return {
          Icon: Clock,
          bg: "bg-slate-100 text-slate-600",
        };
      case "navigation":
      default:
        return {
          Icon: Navigation,
          bg: "bg-emerald-50 text-emerald-600",
        };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
            ACTIVE
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-sky-50 text-sky-600 border border-sky-200 whitespace-nowrap">
            SCHEDULED
          </span>
        );
      case "COMPLETED":
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            COMPLETED
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">
            Campaign Usage
          </h3>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full [-ms-overflow-style:none] [scrollbar-width:thin]">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider whitespace-nowrap">
                <th className="pb-3 text-left">CAMPAIGN</th>
                <th className="pb-3 text-left px-3">STATUS</th>
                <th className="pb-3 text-center px-2">SENT</th>
                <th className="pb-3 text-center px-2">OPEN RATE</th>
                <th className="pb-3 text-right">CONVERSION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray/60 text-xs">
              {campaigns.length > 0 ? (
                campaigns.map((camp) => {
                  const iconConfig = getIcon(camp.iconType);
                  const IconComponent = iconConfig.Icon;

                  return (
                    <tr
                      key={camp.id}
                      className="hover:bg-light-gray/25 transition-colors"
                    >
                      {/* Campaign Name + Icon */}
                      <td className="py-3.5 text-left">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg ${iconConfig.bg} flex items-center justify-center shrink-0 shadow-2xs`}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-dark-black/90 text-xs whitespace-nowrap">
                            {camp.name}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-left whitespace-nowrap">
                        {getStatusBadge(camp.status)}
                      </td>

                      {/* Sent */}
                      <td className="py-3.5 px-2 text-center font-bold text-dark-black/85 font-secondary text-xs whitespace-nowrap">
                        {camp.sent}
                      </td>

                      {/* Open Rate */}
                      <td className="py-3.5 px-2 text-center font-semibold text-dark-black/80 text-xs whitespace-nowrap">
                        {camp.openRate}
                      </td>

                      {/* Conversion */}
                      <td className="py-3.5 text-right font-bold text-dark-black/85 font-secondary text-xs whitespace-nowrap">
                        {camp.conversion}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-6 text-center text-xs text-light-black italic"
                  >
                    No active campaigns currently targeting this segment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
