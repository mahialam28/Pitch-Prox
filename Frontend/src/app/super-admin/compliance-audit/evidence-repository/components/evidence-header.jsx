"use client";

import React from "react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import { evidenceStats } from "../evidence-data";

export default function EvidenceHeader() {
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
