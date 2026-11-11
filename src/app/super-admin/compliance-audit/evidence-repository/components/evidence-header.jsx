"use client";

import React from "react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

// stats: /api/v1/compliance/evidence → stats (archived evidence isn't counted)
export default function EvidenceHeader({ stats }) {
  const value = (number) => (stats ? number.toLocaleString() : "—");
  const evidenceStats = [
    { id: "total_evidence", label: "Total Evidence", value: value(stats?.total ?? 0), subtext: "Not counting archived", subtextColor: "text-light-black" },
    { id: "verified_evidence", label: "Verified Evidence", value: value(stats?.verified ?? 0), subtext: stats?.total ? `${Math.round((stats.verified / stats.total) * 100)}% verified · ${stats.underReview} under review` : "—", subtextColor: "text-primary" },
    { id: "needs_attention", label: "Needs Attention", value: value(stats?.needsAttention ?? 0), subtext: stats ? `${stats.expiringSoon} expiring in 30 days · ${stats.expired} expired` : "—", subtextColor: stats?.needsAttention ? "text-amber-600" : "text-light-black" },
  ];
  return (
    <div className="w-full flex flex-col gap-5">
      {/* ── Page Title & Subtitle ── */}
      <div className="w-full flex flex-col gap-1 min-w-0">
        <Title
          variant="small"
          className="!text-dark-black/80 font-bold text-2xl sm:text-3xl font-secondary"
        >
          Evidence Repository
        </Title>
        <Text variant="small" className="text-light-black">
          Centralized storage for all SOC 2 evidence and supporting documents.
        </Text>
      </div>

      {/* ── 3 Top KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full">
        {evidenceStats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white p-5 sm:p-6 rounded-2xl border border-light-gray shadow-xs flex flex-col justify-between gap-2.5 hover:border-primary/40 transition-all duration-200"
          >
            <span className="text-xs font-semibold text-light-black block">
              {stat.label}
            </span>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-dark-black/85 tracking-tight font-secondary">
                {stat.value}
              </span>
            </div>

            <p className={`text-xs font-medium ${stat.subtextColor}`}>
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
