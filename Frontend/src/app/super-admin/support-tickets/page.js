"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import SupportTicketsScreen from "@/app/internal-sales-representative/support-tickets/support-tickets-screen";

// Live customer support queue with the admin drawer actions (Reassign, Escalate)
export default function SupportTicketsPage() {
  return (
    <SupportTicketsScreen
      adminActions
      headerProps={{
        addTicketHref: null,
        actions: (
          <Link
            href="/super-admin/support-dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-light-gray bg-white text-xs sm:text-sm font-semibold text-dark-black hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
          >
            <LayoutDashboard className="w-4 h-4" /> Support Dashboard
          </Link>
        ),
      }}
    />
  );
}
