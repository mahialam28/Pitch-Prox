"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Text from "@/components/texts/text";
import InternalSupportTicketSidebar from "@/components/sidebars/internal-support-ticket-sidebar";
import { useStaffTickets } from "@/app/internal-sales-representative/support-tickets/use-staff-tickets";
import { usePortal } from "@/components/shared/use-portal";

// The latest tickets this staff member opened for customers
export const RecentTickets = () => {
  const tickets = useStaffTickets({ openedByMe: true });
  const portal = usePortal();

  return (
    <div className="h-full bg-white rounded-2xl border border-light-gray p-6 shadow-sm flex flex-col justify-between">
      <div>
        {/* Section Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Text variant="regular" className="font-bold text-dark-black">
            Recent support tickets
          </Text>
          <Link
            href={`${portal.base}/mail/tickets`}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-medium-teal transition-colors cursor-pointer"
          >
            <span>View all tickets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table Container */}
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="border-b border-light-gray text-[11px] font-semibold text-light-black uppercase tracking-wider">
                <th className="pb-3 font-semibold">TICKET ID</th>
                <th className="pb-3 font-semibold">SUBJECT</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold">PRIORITY</th>
                <th className="pb-3 font-semibold text-right">LAST UPDATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray text-xs">
              {!tickets.rows.length && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-light-black">
                    {tickets.loading ? "Loading tickets…" : "No tickets yet."}
                  </td>
                </tr>
              )}
              {tickets.rows.slice(0, 3).map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => tickets.open(ticket)}
                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  {/* Ticket ID */}
                  <td className="py-4 font-bold text-dark-black whitespace-nowrap">
                    {ticket.id}
                  </td>

                  {/* Subject */}
                  <td className="py-4 font-medium text-medium-black max-w-[220px] truncate">
                    {ticket.subject}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium ${ticket.statusStyle}`}
                    >
                      {ticket.status}
                    </span>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium ${ticket.priorityStyle}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>

                  {/* Last Update */}
                  <td className="py-4 text-right whitespace-nowrap text-light-black text-[11px]">
                    {ticket.lastUpdate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InternalSupportTicketSidebar
        isOpen={tickets.isOpen}
        onClose={tickets.close}
        onNavigate={tickets.navigate}
        ticket={tickets.selected}
        actions={tickets.actions}
        agents={tickets.agents}
      />
    </div>
  );
};

export default RecentTickets;
