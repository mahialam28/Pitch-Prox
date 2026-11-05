"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

export default function SupportTicketsHeader() {
  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
      <div className="flex flex-col gap-1 min-w-0">
        <Title
          variant="small"
          className="!text-dark-black/80 font-bold text-2xl sm:text-3xl font-secondary"
        >
          Support Tickets
        </Title>
        <Text variant="small" className="text-light-black">
          Track, triage, and resolve incoming customer and rep support inquiries.
        </Text>
      </div>
      {/* Support team overview (queues, SLA health, workload) */}
      <Link
        href="/super-admin/support-dashboard"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black hover:border-primary hover:text-primary transition-colors self-start whitespace-nowrap"
      >
        <LayoutDashboard className="w-4 h-4" /> Support Dashboard
      </Link>
    </div>
  );
}
