import { query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { TICKET_SELECT, toTicket } from "@/lib/support-staff";
import { ROLES } from "@/utils.js/roles";

// ── Support Dashboard (Super Admin / Support) ──
// Everything comes from the ticket records: open queue and SLA (first reply by priority),
// volume, status mix, response and resolution times, team workload and recent activity.
// CSAT needs customer satisfaction surveys, which aren't built yet (null).

export const DASHBOARD_RANGES = { "7d": 7, "30d": 30 };
// Open tickets one agent can carry before the workload bar is full
export const AGENT_CAPACITY = 25;
const CLOSED = ["Resolved", "Closed"];
const DAY = 86400000;

const minutesBetween = (from, to) => (new Date(to) - new Date(from)) / 60000;
const average = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);
const change = (now, before) => (now == null || before == null || !before ? null : Math.round(((now - before) / before) * 1000) / 10);

// Tickets created in [from, to)
const inWindow = (tickets, from, to) => tickets.filter((ticket) => new Date(ticket.createdAt) >= from && new Date(ticket.createdAt) < to);

function performance(tickets) {
  const responses = tickets.filter((ticket) => ticket.firstResponseAt).map((ticket) => minutesBetween(ticket.createdAt, ticket.firstResponseAt));
  const resolutions = tickets.filter((ticket) => ticket.resolvedAt).map((ticket) => minutesBetween(ticket.createdAt, ticket.resolvedAt));
  const judged = tickets.filter((ticket) => ["Met", "Breached"].includes(ticket.sla.status));
  return {
    firstResponseMinutes: average(responses),
    resolutionMinutes: average(resolutions),
    slaMetRate: judged.length ? Math.round((judged.filter((ticket) => ticket.sla.status === "Met").length / judged.length) * 1000) / 10 : null,
    escalationRate: tickets.length ? Math.round((tickets.filter((ticket) => ticket.escalatedAt).length / tickets.length) * 1000) / 10 : null,
  };
}

export async function supportDashboard({ range = "7d" } = {}) {
  const days = DASHBOARD_RANGES[range];
  if (!days) throw new ApiError("Range must be 7d or 30d.");
  const now = new Date();
  const start = new Date(now.getTime() - days * DAY);
  const previousStart = new Date(start.getTime() - days * DAY);

  // Every open ticket, plus everything created or resolved in the last two windows
  const rows = await query(
    `${TICKET_SELECT} WHERE support_tickets.status NOT IN ('Resolved', 'Closed') OR support_tickets.created_at >= ? OR support_tickets.resolved_at >= ?
     ORDER BY support_tickets.created_at DESC LIMIT 5000`,
    [previousStart, previousStart]
  );
  const tickets = rows.map((row) => ({ ...toTicket(row), firstResponseAt: row.firstResponseAt, resolvedAt: row.resolvedAt }));
  const open = tickets.filter((ticket) => !CLOSED.includes(ticket.status));
  const current = inWindow(tickets, start, now);
  const previous = inWindow(tickets, previousStart, start);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const urgent = open.filter((ticket) => ticket.priority === "urgent");
  const atRisk = open.filter((ticket) => ticket.sla.status === "At Risk");
  const perfNow = performance(current);
  const perfBefore = performance(previous);

  // Volume: per day (7 days) or per week (30 days)
  const buckets = range === "7d"
    ? Array.from({ length: 7 }, (_, index) => {
        const from = new Date(today.getTime() - (6 - index) * DAY);
        return { label: from.toLocaleDateString("en-US", { weekday: "short" }), from, to: new Date(from.getTime() + DAY) };
      })
    : Array.from({ length: 5 }, (_, index) => {
        const to = new Date(now.getTime() - (4 - index) * 7 * DAY);
        const from = new Date(Math.max(start.getTime(), to.getTime() - 7 * DAY));
        return { label: from.toLocaleDateString("en-US", { month: "short", day: "numeric" }), from, to };
      }).filter((bucket) => bucket.to > bucket.from);
  const volume = buckets.map((bucket) => ({
    label: bucket.label,
    created: tickets.filter((ticket) => new Date(ticket.createdAt) >= bucket.from && new Date(ticket.createdAt) < bucket.to).length,
    resolved: tickets.filter((ticket) => ticket.resolvedAt && new Date(ticket.resolvedAt) >= bucket.from && new Date(ticket.resolvedAt) < bucket.to).length,
  }));

  // Status mix of the tickets created in the window
  const statusCounts = ["Open", "In progress", "Waiting", "Resolved", "Closed"].map((status) => ({ status, count: current.filter((ticket) => ticket.status === status).length }));

  // Queue: breached and at-risk first, then by priority and age
  const PRIORITY_RANK = { urgent: 0, high: 1, medium: 2, low: 3 };
  const SLA_RANK = { Breached: 0, "At Risk": 1, "On Track": 2, Met: 3 };
  const queue = [...open]
    .sort((a, b) => SLA_RANK[a.sla.status] - SLA_RANK[b.sla.status] || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 8)
    .map(({ firstResponseAt, resolvedAt, ...ticket }) => ticket);

  // Workload: support staff and Super Admins, plus anyone else holding open tickets
  const agents = await query(
    `SELECT users.id, users.name, users.role,
      (SELECT COUNT(*) FROM support_tickets WHERE support_tickets.assigned_to = users.id AND support_tickets.status NOT IN ('Resolved', 'Closed')) AS openTickets,
      (SELECT MAX(COALESCE(sessions.last_seen_at, sessions.created_at)) FROM sessions WHERE sessions.user_id = users.id AND sessions.expires_at > NOW() AND sessions.impersonation_id IS NULL) AS lastSeenAt
     FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id
     WHERE staff_profiles.status = 'active' AND (users.role IN (?, ?) OR EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.assigned_to = users.id AND support_tickets.status NOT IN ('Resolved', 'Closed')))
     ORDER BY openTickets DESC, users.name`,
    [ROLES.SUPPORT, ROLES.SUPER_ADMIN]
  );
  const workload = agents.map((agent) => {
    const minutesAgo = agent.lastSeenAt ? minutesBetween(agent.lastSeenAt, now) : null;
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      openTickets: Number(agent.openTickets),
      capacity: Math.min(100, Math.round((Number(agent.openTickets) / AGENT_CAPACITY) * 100)),
      // Online: active in the app in the last 15 minutes; Away: signed in today
      presence: minutesAgo != null && minutesAgo <= 15 ? "Online" : minutesAgo != null && minutesAgo <= 12 * 60 ? "Away" : "Offline",
    };
  });

  // Recent activity: replies, internal notes and logged ticket changes
  const activity = await query(
    `(SELECT 'reply' AS kind, users.name AS actor, support_tickets.number, support_messages.created_at AS createdAt, NULL AS summary
       FROM support_messages JOIN support_tickets ON support_tickets.id = support_messages.ticket_id JOIN users ON users.id = support_messages.author_id
       WHERE support_messages.author_role = 'agent' ORDER BY support_messages.created_at DESC LIMIT 8)
     UNION ALL
     (SELECT 'note', users.name, support_tickets.number, support_internal_notes.created_at, NULL
       FROM support_internal_notes JOIN support_tickets ON support_tickets.id = support_internal_notes.ticket_id JOIN users ON users.id = support_internal_notes.author_id
       ORDER BY support_internal_notes.created_at DESC LIMIT 8)
     UNION ALL
     (SELECT CASE action WHEN 'support.ticket_escalated' THEN 'escalated' WHEN 'support.ticket_opened' THEN 'opened' ELSE 'updated' END, actor_name, NULL, created_at, summary
       FROM audit_logs WHERE action IN ('support.ticket_updated', 'support.ticket_escalated', 'support.ticket_opened') ORDER BY created_at DESC LIMIT 8)
     ORDER BY createdAt DESC LIMIT 8`
  );

  const dayAgo = new Date(now.getTime() - DAY);
  return {
    range,
    kpis: {
      open: open.length,
      createdToday: tickets.filter((ticket) => new Date(ticket.createdAt) >= today).length,
      urgent: urgent.length,
      urgentUnassigned: urgent.filter((ticket) => !ticket.assignedTo).length,
      slaAtRisk: atRisk.length,
      dueWithinHour: atRisk.filter((ticket) => ticket.sla.minutesLeft != null && ticket.sla.minutesLeft <= 60).length,
      firstResponseMinutes: perfNow.firstResponseMinutes == null ? null : Math.round(perfNow.firstResponseMinutes),
      firstResponseChange: change(perfNow.firstResponseMinutes, perfBefore.firstResponseMinutes),
      csat: null,
    },
    volume,
    status: { total: current.length, counts: statusCounts },
    queue,
    workload,
    capacityPerAgent: AGENT_CAPACITY,
    performance: {
      firstResponseMinutes: perfNow.firstResponseMinutes == null ? null : Math.round(perfNow.firstResponseMinutes),
      firstResponseChange: change(perfNow.firstResponseMinutes, perfBefore.firstResponseMinutes),
      resolutionMinutes: perfNow.resolutionMinutes == null ? null : Math.round(perfNow.resolutionMinutes),
      resolutionChange: change(perfNow.resolutionMinutes, perfBefore.resolutionMinutes),
      slaMetRate: perfNow.slaMetRate,
      slaMetChange: perfNow.slaMetRate == null || perfBefore.slaMetRate == null ? null : Math.round((perfNow.slaMetRate - perfBefore.slaMetRate) * 10) / 10,
      escalationRate: perfNow.escalationRate,
      escalationChange: perfNow.escalationRate == null || perfBefore.escalationRate == null ? null : Math.round((perfNow.escalationRate - perfBefore.escalationRate) * 10) / 10,
    },
    activity: activity.map((row, index) => ({ id: `${row.kind}-${index}-${new Date(row.createdAt).getTime()}`, ...row })),
    attention: {
      urgentUnassigned: urgent.filter((ticket) => !ticket.assignedTo).length,
      slaAtRisk: atRisk.length,
      breachedLastDay: tickets.filter((ticket) => ticket.sla.status === "Breached" && new Date(ticket.sla.dueAt) >= dayAgo).length,
      highWaiting: open.filter((ticket) => ["urgent", "high"].includes(ticket.priority) && ticket.status === "Waiting").length,
    },
  };
}

// CSV of the tickets created in the range (Export Report)
export async function supportReportCsv({ range = "7d" } = {}) {
  const days = DASHBOARD_RANGES[range];
  if (!days) throw new ApiError("Range must be 7d or 30d.");
  const rows = await query(`${TICKET_SELECT} WHERE support_tickets.created_at >= ? ORDER BY support_tickets.created_at DESC LIMIT 10000`, [new Date(Date.now() - days * DAY)]);
  const header = ["Ticket", "Subject", "Company", "Customer", "Category", "Priority", "Status", "Assigned to", "Created", "First response", "Resolved", "SLA"];
  const lines = rows.map((row) => {
    const ticket = toTicket(row);
    return [ticket.reference, ticket.subject, ticket.customer.company, ticket.customer.name, ticket.categoryLabel, ticket.priorityLabel, ticket.status, ticket.assignedTo?.name ?? "", new Date(row.createdAt).toISOString(), row.firstResponseAt ? new Date(row.firstResponseAt).toISOString() : "", row.resolvedAt ? new Date(row.resolvedAt).toISOString() : "", ticket.sla.status];
  });
  return [header, ...lines].map((line) => line.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
}
