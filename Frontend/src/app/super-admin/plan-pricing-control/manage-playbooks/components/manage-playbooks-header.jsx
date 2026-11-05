"use client";

import React from "react";
import { BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const ManagePlaybooksHeader = () => {
  return (
    <div className="flex flex-col gap-3">
      {/* Back Link */}
      <div>
        <Link
          href="/super-admin/plan-pricing-control"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-medium-black hover:text-dark-black/90 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Plans & Pricing</span>
        </Link>
      </div>

      {/* Title & Description */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0 shadow-2xs">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark-black/85 font-secondary tracking-tight">
            Manage Playbooks
          </h1>
          <p className="text-xs sm:text-sm text-medium-black mt-0.5">
            View, manage, and configure playbook access and pricing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManagePlaybooksHeader;
