"use client";

import React from "react";
import Link from "next/link";
import { Triangle, Send, FileText, Users, BarChart3 } from "lucide-react";

export default function QuickActionsSection() {
  return (
    <div className="w-full flex flex-col gap-3">
      {/* Title & Subtitle */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Quick Actions
        </h3>
        <p className="text-xs text-light-black">
          Shortcuts to quickly create and manage your email campaigns and journeys.
        </p>
      </div>

      {/* 2x2 Grid + Full Width Row */}
      <div className="flex flex-col gap-3 mt-1">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. Create Journey */}
          <Link href="/super-admin/campaigns-journeys/journeys/create" className="bg-white p-4 rounded-2xl border border-light-gray shadow-xs hover:border-primary/40 transition-all duration-200 flex items-center gap-3 text-left group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Triangle className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                Create Journey
              </span>
              <span className="text-[11px] text-light-black font-normal mt-0.5">
                Build automated journey
              </span>
            </div>
          </Link>

          {/* 2. Create Campaign */}
          <Link href="/super-admin/campaigns-journeys?tab=create-campaign" className="bg-white p-4 rounded-2xl border border-light-gray shadow-xs hover:border-primary/40 transition-all duration-200 flex items-center gap-3 text-left group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Send className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                Create Campaign
              </span>
              <span className="text-[11px] text-light-black font-normal mt-0.5">
                Send a broadcast email
              </span>
            </div>
          </Link>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 3. New Template */}
          <Link href="/super-admin/campaigns-journeys/templates/new-template" className="bg-white p-4 rounded-2xl border border-light-gray shadow-xs hover:border-primary/40 transition-all duration-200 flex items-center gap-3 text-left group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <FileText className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                New Template
              </span>
              <span className="text-[11px] text-light-black font-normal mt-0.5">
                Create email template
              </span>
            </div>
          </Link>

          {/* 4. Create Segment */}
          <Link href="/super-admin/campaigns-journeys?tab=segments" className="bg-white p-4 rounded-2xl border border-light-gray shadow-xs hover:border-primary/40 transition-all duration-200 flex items-center gap-3 text-left group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Users className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                Create Segment
              </span>
              <span className="text-[11px] text-light-black font-normal mt-0.5">
                Build audience segment
              </span>
            </div>
          </Link>
        </div>

        {/* Row 3 (Full width) */}
        <div>
          {/* 5. View Analytics */}
          <Link href="/super-admin/campaigns-journeys?tab=analytics" className="w-full bg-white p-4 rounded-2xl border border-light-gray shadow-xs hover:border-primary/40 transition-all duration-200 flex items-center gap-3 text-left group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <BarChart3 className="h-4 w-4 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                View Analytics
              </span>
              <span className="text-[11px] text-light-black font-normal mt-0.5">
                See detailed reports
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
