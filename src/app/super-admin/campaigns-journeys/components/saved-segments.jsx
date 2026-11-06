"use client";

import React from "react";
import Link from "next/link";
import { Flame, AlertCircle, Clock, Users, Zap, ListChecks } from "lucide-react";
import { segmentUpdatedLabel } from "../user-segments";

export default function SavedSegments({ segments = [] }) {
  const getIcon = (type, color) => {
    switch (type) {
      case "flame":
        return {
          Icon: Flame,
          bg: "bg-orange-50 text-orange-500",
        };
      case "alert":
        return {
          Icon: AlertCircle,
          bg: "bg-sky-50 text-sky-600",
        };
      case "clock":
        return {
          Icon: Clock,
          bg: "bg-purple-50 text-purple-600",
        };
      case "user":
      default:
        return {
          Icon: Users,
          bg: "bg-slate-100 text-slate-600",
        };
    }
  };

  return (
    <div className="w-full flex flex-col gap-3.5">
      <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight">
        Saved Segments
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {segments.map((seg) => {
          const iconConfig = getIcon(seg.type === "Static" ? "user" : seg.system ? "alert" : "flame");
          const IconComponent = iconConfig.Icon;

          return (
            <Link
              key={seg.id}
              href={`/super-admin/campaigns-journeys/segments/${seg.id}`}
              className="bg-white rounded-2xl border border-light-gray p-4 sm:p-4.5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group cursor-pointer"
            >
              {/* Top Row: Icon + Name/Count + Used Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl ${iconConfig.bg} flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    <IconComponent className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs sm:text-[13px] text-dark-black/85 group-hover:text-primary transition-colors truncate">
                      {seg.name}
                    </span>
                    <span className="text-[11px] text-light-black font-semibold mt-0.5">
                      {seg.memberCount}{" "}
                      <span className="font-normal">users</span>
                    </span>
                  </div>
                </div>

                {seg.usedInCampaign && (
                  <span className="inline-flex items-center text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap shrink-0">
                    USED IN CAMPAIGN
                  </span>
                )}
              </div>

              {/* Bottom Row: type (Dynamic / Static) and when it changed */}
              <div className="pt-2 border-t border-light-gray/60 flex items-center justify-between text-[11px] text-light-black">
                <span className={`inline-flex items-center gap-1 font-semibold ${seg.type === "Static" ? "text-slate-600" : "text-primary"}`}>
                  {seg.type === "Static" ? <ListChecks className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                  {seg.type ?? "Dynamic"}{seg.system ? " · System" : ""}
                </span>
                <span>{segmentUpdatedLabel(seg)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
