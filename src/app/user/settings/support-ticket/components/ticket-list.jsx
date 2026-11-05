"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Text from "@/components/texts/text";
import Dropdown from "@/components/shared/dropdown/dropdown";
import SupportTicketSidebar from "@/components/sidebars/support-ticket-sidebar";
import { useTicketDrawer, useTickets } from "./use-tickets";

const filterOptions = [
  { value: "all", label: "All Status" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In progress" },
  { value: "waiting", label: "Awaiting your reply" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PER_PAGE = 5;

const TicketList = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { tickets: ticketsData, loaded } = useTickets();
  const drawer = useTicketDrawer(ticketsData);

  const handleFilterSelect = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const filteredTickets =
    filterStatus === "all"
      ? ticketsData
      : ticketsData.filter(
          (ticket) =>
            ticket.status.toLowerCase().replaceAll(" ", "-") === filterStatus
        );

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const pageTickets = filteredTickets.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  );

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Table Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <Text variant="regular" className="font-bold text-dark-black">
            Your tickets
          </Text>
          <Dropdown
            label="All Status"
            items={filterOptions}
            selected={filterStatus}
            onSelect={handleFilterSelect}
            className="w-44 shrink-0"
          />
        </div>

        {/* Tickets Table */}
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[620px]">
            <thead>
              <tr className="border-b border-light-gray text-[11px] font-bold text-light-black uppercase tracking-wider">
                <th className="pb-3 font-semibold w-[80px]">TICKET ID</th>
                <th className="pb-3 font-semibold">SUBJECT</th>
                <th className="pb-3 font-semibold text-center w-[110px]">STATUS</th>
                <th className="pb-3 font-semibold text-right pr-6 w-[130px]">LAST UPDATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray text-xs">
              {loaded && pageTickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-light-black">
                    {ticketsData.length ? "No tickets with this status." : "You haven't opened any tickets yet."}
                  </td>
                </tr>
              )}
              {pageTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => drawer.open(ticket)}
                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  {/* Ticket ID */}
                  <td className="py-4 font-bold text-dark-black whitespace-nowrap truncate">
                    {ticket.id}
                  </td>

                  {/* Subject */}
                  <td className="py-4 font-medium text-medium-black max-w-[200px] leading-snug truncate">
                    {ticket.subject}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium ${ticket.statusStyle}`}
                    >
                      {ticket.status}
                    </span>
                  </td>

                  {/* Last Update Date & Chevron */}
                  <td className="py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <div className="text-[11px] text-light-black">
                        <div>{ticket.date}</div>
                        <div>{ticket.time}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-light-black group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-light-gray text-xs text-light-black mt-4">
        <span>
          Showing{" "}
          {filteredTickets.length === 0
            ? 0
            : (safePage - 1) * PER_PAGE + 1}{" "}
          to {Math.min(safePage * PER_PAGE, filteredTickets.length)} of{" "}
          {filteredTickets.length} tickets
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40"
            disabled={safePage === 1}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentPage(i + 1)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${
                safePage === i + 1
                  ? "bg-primary text-white"
                  : "border border-light-gray text-medium-black hover:bg-light-gray"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40"
            disabled={safePage === totalPages}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ticket Details Sidebar (opens from right) */}
      <SupportTicketSidebar
        isOpen={drawer.isOpen}
        onClose={drawer.close}
        onNavigate={drawer.navigate}
        onReply={drawer.reply}
        showAiReply={false}
        ticket={drawer.selectedTicket}
      />
    </div>
  );
};

export default TicketList;
