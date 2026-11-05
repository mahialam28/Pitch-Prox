"use client";

import React from "react";
import TicketHeader from "./components/ticket-header";
import TicketList from "./components/ticket-list";
import InternalSupportTicketSidebar from "@/components/sidebars/internal-support-ticket-sidebar";
import { useStaffTickets } from "./use-staff-tickets";

const formatMinutes = (minutes) => {
  if (minutes == null) return "—";
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

// Live support queue shared by the sales rep and admin portals.
// adminActions adds Reassign to the ticket drawer; headerProps let a portal tweak the header.
export default function SupportTicketsScreen({ adminActions = false, headerProps = {} }) {
  const tickets = useStaffTickets();
  const stats = tickets.stats;

  return (
    <div className="w-full flex flex-col gap-6">
      <TicketHeader
        openCount={stats?.open ?? 0}
        inProgressCount={stats?.inProgress ?? 0}
        urgentCount={stats?.urgent ?? 0}
        avgResponseTime={formatMinutes(stats?.avgFirstResponseMinutes)}
        {...headerProps}
      />
      {tickets.loading ? (
        <div className="bg-white rounded-2xl border border-light-gray p-10 text-center text-sm text-medium-black">Loading tickets…</div>
      ) : (
        <TicketList
          tickets={tickets.rows}
          onSelectTicket={tickets.open}
          currentAgentName={tickets.me?.name}
          agentNames={tickets.agents.map((agent) => agent.name)}
          counts={{ mine: stats?.mine, waiting: stats?.waiting }}
        />
      )}
      <InternalSupportTicketSidebar
        isOpen={tickets.isOpen}
        onClose={tickets.close}
        onNavigate={tickets.navigate}
        ticket={tickets.selected}
        adminActions={adminActions}
        actions={tickets.actions}
        agents={tickets.agents}
      />
    </div>
  );
}
