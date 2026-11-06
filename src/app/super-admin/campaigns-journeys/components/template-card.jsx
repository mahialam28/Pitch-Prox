"use client";

import React from "react";
import Link from "next/link";
import { Navigation, Clock, Inbox, ShieldCheck } from "lucide-react";

export default function TemplateCard({ template }) {
  const getThemeConfig = (theme) => {
    switch (theme) {
      case "orange":
        return {
          previewBg: "bg-[#FFF9F2] border-[#FFE2C2]",
          brandColor: "text-orange-500",
          buttonBg: "bg-[#F97316] text-white hover:bg-orange-600",
          iconBorder: "border-orange-200",
          iconColor: "text-orange-500",
          Icon: Clock,
        };
      case "purple":
        return {
          previewBg: "bg-[#FAF5FF] border-[#E9D5FF]",
          brandColor: "text-purple-600",
          buttonBg: "bg-[#9333EA] text-white hover:bg-purple-700",
          iconBorder: "border-purple-200",
          iconColor: "text-purple-600",
          Icon: Inbox,
        };
      case "blue":
        return {
          previewBg: "bg-[#F0F9FF] border-[#BAE6FD]",
          brandColor: "text-blue-600",
          buttonBg: "bg-[#2563EB] text-white hover:bg-blue-700",
          iconBorder: "border-blue-200",
          iconColor: "text-blue-600",
          Icon: ShieldCheck,
        };
      case "teal":
      default:
        return {
          previewBg: "bg-[#EEFDFC] border-[#C6F5F2]",
          brandColor: "text-[#0EADAB]",
          buttonBg: "bg-[#0EADAB] text-white hover:bg-[#0c9694]",
          iconBorder: "border-emerald-200",
          iconColor: "text-[#0EADAB]",
          Icon: Navigation,
        };
    }
  };

  const themeConfig = getThemeConfig(template.theme);
  const IllustrationIcon = themeConfig.Icon;

  return (
    <Link
      href={`/super-admin/campaigns-journeys/templates/${template.id}`}
      className="bg-white rounded-2xl border border-light-gray shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Top Preview Banner */}
        <div
          className={`w-full rounded-xl border p-4 ${themeConfig.previewBg} flex items-center justify-between gap-3 min-h-[140px] relative overflow-hidden transition-all duration-200 group-hover:border-primary/30`}
        >
          {/* Left Email Content Snapshot */}
          <div className="flex flex-col gap-1.5 max-w-[65%] z-10">
            {/* Brand Dot + Name */}
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black ${themeConfig.brandColor}`}>
                ◆
              </span>
              <span className="text-[11px] font-bold text-dark-black/90 tracking-tight">
                PitchProX
              </span>
            </div>

            {/* Email Headline */}
            <h4 className="text-xs sm:text-[13px] font-bold text-dark-black/90 leading-tight">
              {template.headline || template.title}
            </h4>

            {/* Email Snippet */}
            <p className="text-[10px] sm:text-[11px] text-light-black line-clamp-2 leading-relaxed font-normal">
              {template.previewText}
            </p>

            {/* Mock CTA Button */}
            <div className="pt-1">
              <span
                className={`inline-flex items-center text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-2xs transition-colors pointer-events-none ${themeConfig.buttonBg}`}
              >
                {template.buttonLabel || "Get Started"}
              </span>
            </div>
          </div>

          {/* Right Circular Icon Badge */}
          <div className="shrink-0 z-10">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border ${themeConfig.iconBorder} ${themeConfig.iconColor} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200`}
            >
              <IllustrationIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Card Title */}
        <h3 className="text-sm font-bold text-dark-black/85 group-hover:text-primary transition-colors mt-3.5 tracking-tight">
          {template.title}
        </h3>

        {/* Category & Status Row */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-medium-black font-normal">
            {template.category}
          </span>
          {template.emailType && (
            <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-sky-50 text-sky-600 border border-sky-200">
              {template.emailType}
            </span>
          )}

          {template.status === "ACTIVE" ? (
            <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200">
              ACTIVE
            </span>
          ) : (
            <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-slate-100 text-slate-600 border border-slate-200">
              {template.status}
            </span>
          )}
          {template.triggerEventLabel && (
            <span className="inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide bg-purple-50 text-purple-600 border border-purple-200" title="Sent automatically on this event">
              On: {template.triggerEventLabel}
            </span>
          )}
        </div>
      </div>

      {/* Footer Metadata: Last Edited & Open Rate */}
      <div className="border-t border-light-gray/60 pt-3 mt-4 flex items-center justify-between text-xs">
        <span className="text-[11px] text-light-black font-normal">
          Last edited {template.lastEdited}
        </span>

        <div className="flex flex-col items-end">
          <span className="text-[9px] text-light-black uppercase font-semibold tracking-wider leading-none">
            Open rate
          </span>
          <span className="text-xs font-bold text-dark-black/85 font-secondary mt-0.5">
            {template.openRate}
          </span>
        </div>
      </div>
    </Link>
  );
}
