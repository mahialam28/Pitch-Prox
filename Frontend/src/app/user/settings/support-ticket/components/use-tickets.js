"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, formatDate, formatDateTime } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { TICKET_PRIORITIES } from "@/utils.js/support";

// Fired after a ticket is created or replied to, so every list on the page reloads
export const TICKETS_CHANGED = "pitchprox:tickets-changed";

const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  "In progress": "bg-sky-50 text-sky-600 border border-sky-100",
  // Support replied and is waiting on the customer
  Waiting: "bg-amber-50 text-amber-700 border border-amber-100",
  Resolved: "bg-green/10 text-green border border-green/20",
  Closed: "bg-light-gray text-light-black border border-light-black/20",
};
const PRIORITY_STYLES = {
  low: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  medium: "bg-sky-50 text-sky-600 border border-sky-100",
  high: "bg-red/10 text-red border border-red/20",
  urgent: "bg-red/10 text-red border border-red/20",
};
const initials = (name = "") => name.split(/\s+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase();

// API ticket → the fields the existing tables and drawer read
export function toTicketView(ticket) {
  const label = TICKET_PRIORITIES.find((item) => item.value === ticket.priority)?.label ?? ticket.priority;
  const created = new Date(ticket.createdAt);
  return {
    ...ticket,
    ticketId: ticket.id,
    id: `#TKT-${ticket.number}`,
    statusStyle: STATUS_STYLES[ticket.status] ?? STATUS_STYLES.Open,
    priority: `${label} Priority`,
    priorityStyle: PRIORITY_STYLES[ticket.priority] ?? PRIORITY_STYLES.medium,
    date: formatDate(created),
    time: created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    lastUpdate: formatDateTime(ticket.updatedAt),
    ...(ticket.customer && {
      customer: {
        ...ticket.customer,
        avatar: initials(ticket.customer.name),
        accountId: ticket.customer.organizationId?.slice(-6).toUpperCase(),
        memberSince: formatDate(ticket.customer.memberSince),
      },
      agent: { name: "PitchProX Support" },
    }),
    ...(ticket.messages && {
      messages: ticket.messages.map((message) => ({
        id: message.id,
        sender: message.role === "agent" ? `${message.sender} (Support)` : message.sender,
        role: message.role === "agent" ? "AGENT" : "CUSTOMER",
        avatar: initials(message.sender),
        time: formatDateTime(message.createdAt),
        text: message.body,
        attachment: message.attachment && {
          ...message.attachment,
          url: `/api/v1/support/tickets/${ticket.id}/messages/${message.id}/attachment`,
        },
      })),
    }),
  };
}

// The signed-in company's tickets, newest activity first
export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(() => {
    return apiRequest("/api/v1/support/tickets")
      .then((data) => setTickets(data.results.map(toTicketView)))
      .catch((error) => showError("Tickets not loaded", error.message))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(TICKETS_CHANGED, load);
    return () => window.removeEventListener(TICKETS_CHANGED, load);
  }, [load]);

  return { tickets, loaded };
}

// Details drawer: opens a ticket with its full conversation, steps through `list`, sends replies
export function useTicketDrawer(list) {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = async (ticket) => {
    setSelectedTicket(ticket);
    setIsOpen(true);
    try {
      const data = await apiRequest(`/api/v1/support/tickets/${ticket.ticketId}`);
      setSelectedTicket(toTicketView(data.ticket));
    } catch (error) {
      showError("Ticket not loaded", error.message);
    }
  };

  const navigate = (direction) => {
    const index = list.findIndex((ticket) => ticket.ticketId === selectedTicket?.ticketId);
    if (index < 0 || !list.length) return;
    open(list[(index + direction + list.length) % list.length]);
  };

  const reply = async (text) => {
    const form = new FormData();
    form.append("body", text);
    const data = await apiRequest(`/api/v1/support/tickets/${selectedTicket.ticketId}/messages`, { method: "POST", body: form });
    setSelectedTicket(toTicketView(data.ticket));
    window.dispatchEvent(new Event(TICKETS_CHANGED));
  };

  return { selectedTicket, isOpen, open, close: () => setIsOpen(false), navigate, reply };
}
