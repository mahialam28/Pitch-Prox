"use client";

import React, { useState, useRef } from "react";
import SupportForm from "./support-form";
import TicketList from "./ticket-list";
import RecentTickets from "./recent-tickets";
import NeedHelpCard from "./need-help-card";

export const SupportTicketsTab = () => {
  // Bumped after a ticket is created so both ticket lists reload
  const [refreshKey, setRefreshKey] = useState(0);
  const formRef = useRef(null);

  const handleTicketCreated = () => setRefreshKey((key) => key + 1);

  const handleScrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
      const subjectInput = formRef.current.querySelector('input[type="text"]');
      if (subjectInput) subjectInput.focus();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      {/* Top Grid: Create Support Ticket Form (Left) & Your Tickets List (Right) */}
      <div ref={formRef} className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch w-full min-w-0">
        {/* Left Column: Create Support Ticket Form */}
        <div className="xl:col-span-7 flex flex-col min-w-0">
          <SupportForm onTicketCreated={handleTicketCreated} />
        </div>

        {/* Right Column: Your Tickets List */}
        <div className="xl:col-span-5 flex flex-col min-w-0">
          <TicketList key={`list-${refreshKey}`} />
        </div>
      </div>

      {/* Bottom Grid: Recent Support Tickets & Need Help Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Left: Recent Support Tickets Table */}
        <div className="xl:col-span-8 flex flex-col min-w-0">
          <RecentTickets key={`recent-${refreshKey}`} />
        </div>

        {/* Right: Need Help Card */}
        <div className="xl:col-span-4 flex flex-col min-w-0">
          <NeedHelpCard onCreateTicket={handleScrollToForm} />
        </div>
      </div>
    </div>
  );
};

export default SupportTicketsTab;
