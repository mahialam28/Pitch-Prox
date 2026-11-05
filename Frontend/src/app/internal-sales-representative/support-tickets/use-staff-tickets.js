"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Live support tickets for staff (sales reps and the admin Support section):
// loads /api/v1/staff/tickets and shapes rows for TicketList and the ticket drawer.

const STATUS_DISPLAY = { "In progress": "In Progress", Waiting: "Wait for Client" };
const STATUS_STYLES = {
  Open: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  "In Progress": "bg-blue-50 text-blue-600 border border-blue-100",
  "Wait for Client": "bg-orange-50 text-orange-600 border border-orange-100",
  Resolved: "bg-slate-50 text-slate-600 border border-slate-200",
  Closed: "bg-light-gray text-light-black border border-light-black/20",
};
const PRIORITY_STYLES = {
  urgent: "bg-red-100 text-red-600 border border-red-200",
  high: "bg-red-50 text-red-500 border border-red-100",
  medium: "bg-orange-50 text-orange-500 border border-orange-100",
  low: "bg-slate-50 text-slate-500 border border-slate-200",
};
const SLA_STYLES = { "On Track": "text-emerald-600", Met: "text-emerald-600", "At Risk": "text-amber-600", Breached: "text-red-600" };

const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");
const dateTime = (value) => new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const shortDateTime = (value) => new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

// Row for TicketList (also the drawer's header fields)
export const toListTicket = (ticket) => {
  const status = STATUS_DISPLAY[ticket.status] ?? ticket.status;
  return {
    id: `#${ticket.reference}`,
    ticketId: ticket.id,
    subject: ticket.subject,
    category: ticket.categoryLabel,
    status,
    rawStatus: ticket.status,
    statusStyle: STATUS_STYLES[status],
    priority: ticket.priorityLabel,
    priorityStyle: PRIORITY_STYLES[ticket.priority],
    sla: ticket.sla.status,
    slaStyle: SLA_STYLES[ticket.sla.status],
    lastUpdate: shortDateTime(ticket.updatedAt),
    customer: {
      name: ticket.customer.name,
      company: ticket.customer.company,
      email: ticket.customer.email,
      avatar: initials(ticket.customer.name),
      plan: ticket.customer.plan ?? "—",
      accountId: ticket.customer.organizationId?.slice(-6).toUpperCase(),
      memberSince: ticket.customer.memberSince ? new Date(ticket.customer.memberSince).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    },
    assignedTo: ticket.assignedTo,
  };
};

// Full ticket for the drawer: conversation (with downloadable attachments) and internal notes
const toDrawerTicket = (ticket) => ({
  ...toListTicket(ticket),
  messages: ticket.messages.map((message) => ({
    id: message.id,
    sender: message.sender,
    role: message.role === "agent" ? "AGENT" : "CUSTOMER",
    avatar: initials(message.sender),
    time: dateTime(message.createdAt),
    text: message.body,
    attachment: message.attachment ? { ...message.attachment, url: `/api/v1/staff/tickets/${ticket.id}/messages/${message.id}/attachment` } : null,
  })),
  internalNotes: ticket.internalNotes.map((note) => ({ id: note.id, author: note.author, role: "AGENT", time: dateTime(note.createdAt), text: note.body })),
});

// openedByMe: only tickets this staff member opened for customers (Mail → Support Tickets)
export function useStaffTickets({ openedByMe = false } = {}) {
  const [data, setData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null); // drawer ticket
  const [isOpen, setIsOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await apiRequest(`/api/v1/staff/tickets${openedByMe ? "?opened=me" : ""}`));
    } catch (error) {
      showError("Tickets not loaded", error.message);
    }
  }, [openedByMe]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/staff/agents")
      .then((result) => !cancelled && setAgents(result.results))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const open = async (row) => {
    try {
      const { ticket } = await apiRequest(`/api/v1/staff/tickets/${row.ticketId}`);
      setSelected(toDrawerTicket(ticket));
      setIsOpen(true);
    } catch (error) {
      showError("Ticket not loaded", error.message);
    }
  };

  const rows = (data?.results ?? []).map(toListTicket);
  const navigate = (direction) => {
    if (!selected) return;
    const index = rows.findIndex((row) => row.ticketId === selected.ticketId);
    if (index >= 0) open(rows[(index + direction + rows.length) % rows.length]);
  };

  // Each action saves, then refreshes the drawer and the list
  const apply = async (request) => {
    const { ticket } = await request;
    setSelected(toDrawerTicket(ticket));
    load();
  };
  const id = selected?.ticketId;
  const actions = {
    reply: (text) => {
      const form = new FormData();
      form.append("body", text);
      return apply(apiRequest(`/api/v1/staff/tickets/${id}/messages`, { method: "POST", body: form }));
    },
    addNote: (text) => apply(apiRequest(`/api/v1/staff/tickets/${id}/notes`, { method: "POST", body: { body: text } })),
    update: (changes) => apply(apiRequest(`/api/v1/staff/tickets/${id}`, { method: "PATCH", body: changes })),
    escalate: (body) => apply(apiRequest(`/api/v1/staff/tickets/${id}/escalate`, { method: "POST", body })),
  };

  return {
    loading: !data,
    rows,
    me: data?.me,
    stats: data?.stats,
    agents,
    selected,
    isOpen,
    open,
    close: () => setIsOpen(false),
    reload: load,
    navigate,
    actions,
  };
}
