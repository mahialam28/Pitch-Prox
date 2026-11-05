"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Dropdown from "@/components/shared/dropdown/dropdown";
import SupportTicketSidebar from "@/components/sidebars/support-ticket-sidebar";
import { useTicketDrawer, useTickets } from "../components/use-tickets";

const filterOptions = [
  { value: "all", label: "All Status" },
  { value: "Open", label: "Open" },
  { value: "In progress", label: "In progress" },
  { value: "Waiting", label: "Awaiting your reply" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
];

const PER_PAGE = 6;

export default function TicketsPage() {
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { tickets: allTickets, loaded } = useTickets();

  const filteredTickets =
    filterStatus === "all"
      ? allTickets
      : allTickets.filter((t) => t.status === filterStatus);

  const drawer = useTicketDrawer(filteredTickets);

  const totalPages = Math.ceil(filteredTickets.length / PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(totalPages, 1));
  const pageTickets = filteredTickets.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  );

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* ── Header ── */}
      <div className="w-full flex flex-col gap-3">
        <Link
          href="/user/settings/support-ticket"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Support Ticket
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <Title variant="small" className="!text-dark-black/80 font-bold">
              Support Tickets
            </Title>
            <Text variant="small" className="text-medium-black">
              Track and manage all your support requests in one place.
            </Text>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Dropdown
              label="All Status"
              items={filterOptions}
              selected={filterStatus}
              onSelect={(val) => {
                setFilterStatus(val);
                setCurrentPage(1);
              }}
              className="w-44 shrink-0"
            />
            <Link
              href="/user/settings/support-ticket"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all duration-200 shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New ticket
            </Link>
          </div>
        </div>
      </div>

      {/* ── Tickets Table ── */}
      <div className="bg-white rounded-2xl border border-light-gray shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-light-gray text-[11px] font-bold text-light-black uppercase tracking-wider">
                <th className="py-4 pl-6 pr-4 font-semibold">Ticket ID</th>
                <th className="py-4 px-4 font-semibold">Subject</th>
                <th className="py-4 px-4 font-semibold">Status</th>
                <th className="py-4 px-4 font-semibold">Priority</th>
                <th className="py-4 pr-6 pl-4 font-semibold text-right">
                  Last Update
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray text-xs">
              {loaded && pageTickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-light-black">
                    {allTickets.length ? "No tickets with this status." : "You haven't opened any tickets yet."}
                  </td>
                </tr>
              )}
              {pageTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => drawer.open(ticket)}
                  className="hover:bg-light-gray/60 transition-colors group cursor-pointer"
                >
                  <td className="py-4 pl-6 pr-4 font-bold text-dark-black whitespace-nowrap">
                    {ticket.id}
                  </td>
                  <td className="py-4 px-4 font-medium text-medium-black max-w-[240px] truncate">
                    {ticket.subject}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium ${ticket.statusStyle}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium ${ticket.priorityStyle}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-4 pr-6 pl-4 text-right whitespace-nowrap text-light-black text-[11px]">
                    {ticket.lastUpdate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-light-gray text-xs text-light-black">
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
              disabled={safePage === 1}
              className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
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
              disabled={safePage === totalPages || totalPages === 0}
              className="p-1 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

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
}
