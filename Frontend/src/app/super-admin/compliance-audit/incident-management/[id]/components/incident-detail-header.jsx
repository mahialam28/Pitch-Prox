"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export default function IncidentDetailHeader({
  incident,
  onSubmitInvestigation,
  isSubmitting,
}) {
  const renderStatusBadge = (status) => {
    if (status === "Investigating") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E8FF] text-[#9333EA]">
          Investigating
        </span>
      );
    }
    if (status === "Closed") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0284C7]">
          Closed
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#10B981]">
        {status}
      </span>
    );
  };

  const renderSeverityBadge = (severity) => {
    if (severity === "Critical") {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FEE2E2] text-[#EF4444] border border-[#FECACA] inline-flex items-center gap-1">
          Critical
        </span>
      );
    }
    if (severity === "High") {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FEF3EB] text-[#F97316] border border-[#FFEDD5] inline-flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 fill-[#F97316]" /> High
        </span>
      );
    }
    if (severity === "Medium") {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FEF9C3] text-[#CA8A04] border border-[#FEF08A] inline-flex items-center gap-1">
          Medium
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] inline-flex items-center gap-1">
        Low
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Back Link */}
      <div>
        <Link
          href="/super-admin/compliance-audit/incident-management"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Back</span>
        </Link>
      </div>

      {/* Breadcrumb, Header & Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Breadcrumb, Title & Metadata */}
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-light-black font-medium">
            <Link
              href="/super-admin/compliance-audit/incident-management"
              className="hover:text-dark-black transition-colors"
            >
              Incident Management
            </Link>
            <span>/</span>
            <span className="text-medium-black font-semibold">{incident.id}</span>
          </div>

          {/* Title and Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-black/90 font-secondary tracking-tight">
              {incident.title}
            </h1>
            {renderStatusBadge(incident.status)}
            {renderSeverityBadge(incident.severity)}
          </div>

          {/* Subtitle with ID & Category */}
          <div className="flex items-center gap-2 text-xs text-medium-black font-normal">
            <span>{incident.id}</span>
            <span>•</span>
            <span>{incident.category}</span>
          </div>
        </div>

        {/* Right Side: Submit Investigation Button */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmitInvestigation}
            className="w-full md:w-auto px-5 py-2.5 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{isSubmitting ? "Submitting..." : "Submit Investigation"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
