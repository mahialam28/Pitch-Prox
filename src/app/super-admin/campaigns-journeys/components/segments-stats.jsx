"use client";

import React from "react";
import { GitBranch, Users, Megaphone, BarChart3 } from "lucide-react";

export default function SegmentsStats({ segments = [], userCount = 0 }) {
  const segmentedUsers = new Set(segments.flatMap((segment) => segment.memberIds ?? [])).size;
  const stats = {
    totalSegments: segments.length,
    totalSegmentedUsers: `${segmentedUsers} of ${userCount}`,
    activeCampaigns: segments.filter((segment) => segment.usedInCampaign).length,
    avgSegmentSize: segments.length ? Math.round(segments.reduce((sum, segment) => sum + (segment.memberCount ?? 0), 0) / segments.length) : 0,
  };
  const items = [
    {
      id: "total-segments",
      label: "TOTAL SEGMENTS",
      value: stats.totalSegments,
      icon: GitBranch,
      iconBg: "bg-emerald-50 text-emerald-600",
    },
    {
      id: "total-leads",
      label: "USERS IN A SEGMENT",
      value: stats.totalSegmentedUsers,
      icon: Users,
      iconBg: "bg-sky-50 text-sky-600",
    },
    {
      id: "active-campaigns",
      label: "SEGMENTS IN CAMPAIGNS",
      value: stats.activeCampaigns,
      icon: Megaphone,
      iconBg: "bg-orange-50 text-orange-500",
    },
    {
      id: "avg-size",
      label: "AVG. SEGMENT SIZE",
      value: stats.avgSegmentSize,
      icon: BarChart3,
      iconBg: "bg-teal-50 text-teal-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {items.map((item) => {
        const IconComponent = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-light-gray shadow-xs flex items-center gap-4 transition-all duration-200 hover:border-slate-300"
          >
            {/* Icon Box */}
            <div
              className={`w-11 h-11 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
            >
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Label & Value */}
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider">
                {item.label}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-dark-black/85 tracking-tight font-secondary mt-0.5">
                {item.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
