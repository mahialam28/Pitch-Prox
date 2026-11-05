"use client";

import React from "react";
import SupportForm from "./components/support-form";
import TicketList from "./components/ticket-list";
import RecentTickets from "./components/recent-tickets";
import NeedHelpCard from "./components/need-help-card";

export default function SupportTicketPage() {
  return (
    <div className="w-full min-w-0 flex flex-col gap-4 sm:gap-6">
      {/* Top Grid: Support Form (Left) & Ticket List (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch w-full min-w-0">
        <div className="xl:col-span-7 flex flex-col min-w-0">
          <SupportForm />
        </div>
        <div className="xl:col-span-5 flex flex-col min-w-0">
          <TicketList />
        </div>
      </div>

      {/* Bottom Grid: Recent Tickets (Left) & Need Help (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch w-full min-w-0">
        <div className="lg:col-span-8 xl:col-span-9 min-w-0">
          <RecentTickets />
        </div>
        <div className="lg:col-span-4 xl:col-span-3 min-w-0">
          <NeedHelpCard />
        </div>
      </div>
    </div>
  );
}
