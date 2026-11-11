"use client";

import React from "react";
import { FileText, FileCode, Video, Layers } from "lucide-react";

// stats: { total, PDF, Doc, Video } from /api/v1/compliance/training/materials
export default function LibraryStats({ stats }) {
  const value = (key) => (stats ? String(stats[key] ?? 0) : "—");
  const defaultStats = [
    {
      id: "total",
      label: "Total Materials",
      value: value("total"),
      subtext: "All formats",
      icon: Layers,
      iconBg: "bg-[#E6F7F7]",
      iconColor: "text-[#0EADAB]",
    },
    {
      id: "pdf",
      label: "PDF",
      value: value("PDF"),
      subtext: "PDF files",
      icon: FileText,
      iconBg: "bg-[#FEE4E2]",
      iconColor: "text-[#D92D20]",
    },
    {
      id: "docs",
      label: "Doc",
      value: value("Doc"),
      subtext: "Word documents",
      icon: FileCode,
      iconBg: "bg-[#EFF8FF]",
      iconColor: "text-[#175CD3]",
    },
    {
      id: "videos",
      label: "Video",
      value: value("Video"),
      subtext: "Uploaded videos and links",
      icon: Video,
      iconBg: "bg-[#EEF2FF]",
      iconColor: "text-[#4F46E5]",
    },
  ];

  const items = defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-light-gray p-5 shadow-xs flex items-center gap-4 transition-all hover:shadow-sm"
          >
            <div
              className={`w-12 h-12 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-medium-black font-medium truncate">
                {item.label}
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-dark-black tracking-tight font-secondary leading-tight mt-0.5">
                {item.value}
              </span>
              <span className="text-[11px] text-light-black font-normal mt-0.5 truncate">
                {item.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
