"use client";

import React from "react";
import { Wrench, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function UnderMaintenance({
  title = "Page Under Development",
  description = "This module is currently being configured. Routing is active and features will be available shortly.",
  icon: Icon = Wrench,
  badgeText = "Under Maintenance",
  backHref = "/super-admin/dashboard",
  backLabel,
}) {
  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray p-8 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center">
      {/* Icon with glowing ring */}
      <div className="relative mb-5">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-light-teal/50 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
          <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Status Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        {badgeText}
      </span>

      {/* Title & Subtitle */}
      <h2 className="text-xl sm:text-2xl font-bold font-secondary text-dark-black tracking-tight mb-2">
        {title}
      </h2>
      <p className="text-xs sm:text-sm text-medium-black font-primary max-w-lg leading-relaxed mb-6">
        {description}
      </p>

      {/* Quick Navigation link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-semibold transition-colors duration-200 shadow-sm"
      >
        <span>{backLabel ?? "Back to Dashboard"}</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
