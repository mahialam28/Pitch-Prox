import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { getSubscription } from "@/lib/billing";
import { formatBytes, saveUpload } from "@/lib/storage";
import { requireCurrentUser } from "@/lib/auth";
import { ROLES, canAccessSection } from "@/utils.js/roles";
import { TICKET_ATTACHMENT_MAX_BYTES, TICKET_ATTACHMENT_TYPES, TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_SLA_HOURS, TICKET_STATUSES } from "@/utils.js/support";

// ── Support tickets: the PitchProX staff side ──
// Sales reps (Support Tickets page) and admin roles with the "support" section
// (Super Admin, Support) work every customer ticket: reply, add internal notes,
// assign/reassign, change priority/status, escalate.

export async function requireSupportAgent() {
  const user = await requireCurrentUser();
  if (user.role !== ROLES.SALES_REP && !canAccessSection(user.role, "support")) throw new Error("FORBIDDEN");
  return user;
}

const AGENT_ROLES = [ROLES.SALES_REP, ROLES.SUPPORT, ROLES.SUPER_ADMIN];
const label = (options, value) => options.find((option) => option.value === value)?.label ?? value;
const text = (value, name, max) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) throw new ApiError(`${name} is required.`);
  if (trimmed.length > max) throw new ApiError(`${name} must be ${max} characters or fewer.`);
  return trimmed;
};

// SLA for the first reply: met, on track, at risk (last 25% of the window) or breached
export function slaFor(ticket, now = new Date()) {
  const hours = TICKET_SLA_HOURS[ticket.priority] ?? 24;
  const due = new Date(new Date(ticket.createdAt).getTime() + hours * 3600000);
  if (ticket.firstResponseAt) return { status: new Date(ticket.firstResponseAt) <= due ? "Met" : "Breached", dueAt: due.toISOString() };
  if (["Resolved", "Closed"].includes(ticket.status)) return { status: "Met", dueAt: due.toISOString() };
  const left = due - now;
  if (left <= 0) return { status: "Breached", dueAt: due.toISOString() };
  return { status: left <= hours * 3600000 * 0.25 ? "At Risk" : "On Track", dueAt: due.toISOString(), minutesLeft: Math.round(left / 60000) };
}

const TICKET_SELECT = `SELECT support_tickets.id, support_tickets.number, support_tickets.subject, support_tickets.category, support_tickets.priority,
  support_tickets.status, support_tickets.created_at AS createdAt, support_tickets.updated_at AS updatedAt,
  support_tickets.first_response_at AS firstResponseAt, support_tickets.escalated_at AS escalatedAt, support_tickets.resolved_at AS resolvedAt,
  support_tickets.organization_id AS organizationId, organizations.name AS company, organizations.created_at AS memberSince,
  creators.name AS customerName, creators.email AS customerEmail,
  agents.id AS agentId, agents.name AS agentName, agents.email AS agentEmail, agents.role AS agentRole
  FROM support_tickets
  JOIN organizations ON organizations.id = support_tickets.organization_id
  JOIN users AS creators ON creators.id = support_tickets.created_by
  LEFT JOIN users AS agents ON agents.id = support_tickets.assigned_to`;

const toTicket = (row) => ({
  id: row.id,
  number: row.number,
  reference: `TKT-${row.number}`,
  subject: row.subject,
  category: row.category,
  categoryLabel: label(TICKET_CATEGORIES, row.category),
  priority: row.priority,
  priorityLabel: label(TICKET_PRIORITIES, row.priority),
  status: row.status,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  escalatedAt: row.escalatedAt,
  sla: slaFor(row),
  customer: { name: row.customerName, email: row.customerEmail, company: row.company, organizationId: row.organizationId, memberSince: row.memberSince },
  assignedTo: row.agentId ? { id: row.agentId, name: row.agentName, email: row.agentEmail } : null,
});

// Every ticket (newest activity first), plus the counts for the page's tabs and cards.
// openedByMe: only tickets this staff member opened for customers (Mail → Support Tickets)
export async function listStaffTickets(user, { openedByMe = false } = {}) {
  const rows = await query(
    `${TICKET_SELECT} ${openedByMe ? "WHERE support_tickets.opened_by = ?" : ""} ORDER BY support_tickets.updated_at DESC LIMIT 1000`,
    openedByMe ? [user.id] : []
  );
  const tickets = rows.map(toTicket);
  const open = tickets.filter((ticket) => !["Resolved", "Closed"].includes(ticket.status));
  const replied = tickets.filter((ticket) => ticket.sla.status === "Met" || ticket.sla.status === "Breached");
  const responseMinutes = rows
    .filter((row) => row.firstResponseAt)
    .map((row) => (new Date(row.firstResponseAt) - new Date(row.createdAt)) / 60000);
  return {
    results: tickets,
    me: { id: user.id, name: user.name },
    stats: {
      open: tickets.filter((ticket) => ticket.status === "Open").length,
      inProgress: tickets.filter((ticket) => ticket.status === "In progress").length,
      urgent: open.filter((ticket) => ticket.priority === "urgent" || ticket.priority === "high").length,
      mine: open.filter((ticket) => ticket.assignedTo?.id === user.id).length,
      waiting: tickets.filter((ticket) => ticket.status === "Waiting").length,
      avgFirstResponseMinutes: responseMinutes.length ? Math.round(responseMinutes.reduce((sum, value) => sum + value, 0) / responseMinutes.length) : null,
      slaMetRate: replied.length ? Math.round((replied.filter((ticket) => ticket.sla.status === "Met").length / replied.length) * 100) : null,
    },
  };
}

// A rep (or support/admin) opens a ticket for one of their customers. The customer's owner is
// the ticket's customer, so it shows in their Support page; the description is posted as an agent message
// (so it counts as the first response for the SLA).
export async function openTicketForCustomer(user, form) {
  if (user.role === ROLES.AUDITOR) throw new Error("FORBIDDEN");
  const organizationId = form.get("organizationId");
  const [account] = await query(
    `SELECT organizations.id, organizations.name, owners.id AS ownerId, customer_accounts.account_rep_id AS repId
     FROM organizations JOIN users AS owners ON owners.organization_id = organizations.id AND owners.role = 'customer_admin'
     LEFT JOIN customer_accounts ON customer_accounts.organization_id = organizations.id
     WHERE organizations.id = ? LIMIT 1`,
    [typeof organizationId === "string" ? organizationId : ""]
  );
  if (!account || (user.role === ROLES.SALES_REP && account.repId !== user.id)) throw new ApiError("Choose one of your customers.");
  const category = form.get("category");
  const priority = form.get("priority");
  if (!TICKET_CATEGORIES.some((item) => item.value === category)) throw new ApiError("Choose a valid category.");
  if (!TICKET_PRIORITIES.some((item) => item.value === priority)) throw new ApiError("Choose a valid priority.");
  const subject = text(form.get("subject"), "Subject", 255);
  const description = text(form.get("description"), "Description", 5000);
  const file = form.get("file");
  const attachment = file && typeof file !== "string" && file.size ? await saveUpload(account.id, file, { maxBytes: TICKET_ATTACHMENT_MAX_BYTES, allowed: TICKET_ATTACHMENT_TYPES }) : null;
  const id = createId("ticket");
  await query("INSERT INTO support_tickets (id, organization_id, created_by, opened_by, category, priority, subject, first_response_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())", [id, account.id, account.ownerId, user.id, category, priority, subject]);
  await query(
    "INSERT INTO support_messages (id, ticket_id, author_id, author_role, body, attachment_name, attachment_mime, attachment_size, attachment_path) VALUES (?, ?, ?, 'agent', ?, ?, ?, ?, ?)",
    [createId("msg"), id, user.id, description, attachment?.name ?? null, attachment?.mime ?? null, attachment?.size ?? null, attachment?.storagePath ?? null]
  );
  const ticket = await getStaffTicket(id);
  await recordAudit(user, { action: "support.ticket_opened", entityType: "support_ticket", entityId: id, organizationId: account.id, summary: `Opened ${ticket.reference} for ${account.name}` });
  return ticket;
}

async function findTicket(id) {
  const [row] = await query(`${TICKET_SELECT} WHERE support_tickets.id = ?`, [id]);
  if (!row) throw new ApiError("Ticket not found.", 404);
  return row;
}

// Full ticket: conversation, internal notes and the customer's plan
export async function getStaffTicket(id) {
  const row = await findTicket(id);
  const messages = await query(
    "SELECT support_messages.id, support_messages.author_role AS role, support_messages.body, support_messages.attachment_name AS attachmentName, support_messages.attachment_size AS attachmentSize, support_messages.created_at AS createdAt, users.name AS sender FROM support_messages JOIN users ON users.id = support_messages.author_id WHERE support_messages.ticket_id = ? ORDER BY support_messages.created_at, support_messages.id",
    [id]
  );
  const notes = await query(
    "SELECT support_internal_notes.id, support_internal_notes.body, support_internal_notes.created_at AS createdAt, users.name AS author FROM support_internal_notes JOIN users ON users.id = support_internal_notes.author_id WHERE support_internal_notes.ticket_id = ? ORDER BY support_internal_notes.created_at",
    [id]
  );
  const subscription = await getSubscription(row.organizationId).catch(() => null);
  const ticket = toTicket(row);
  return {
    ...ticket,
    customer: { ...ticket.customer, plan: subscription?.plan?.name ?? null },
    messages: messages.map((message) => ({
      ...message,
      attachment: message.attachmentName ? { name: message.attachmentName, size: formatBytes(Number(message.attachmentSize)) } : null,
    })),
    internalNotes: notes,
  };
}

// People who can be assigned tickets, with their open-ticket load
export async function listTicketAgents() {
  return query(
    `SELECT users.id, users.name, users.email, users.role, staff_profiles.job_title AS jobTitle,
      (SELECT COUNT(*) FROM support_tickets WHERE support_tickets.assigned_to = users.id AND support_tickets.status NOT IN ('Resolved', 'Closed')) AS openTickets
     FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id
     WHERE users.role IN (${AGENT_ROLES.map(() => "?").join(", ")}) AND staff_profiles.status = 'active'
     ORDER BY users.name`,
    AGENT_ROLES
  );
}

async function assertAgent(id) {
  const [agent] = await query(
    `SELECT users.id, users.name FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id WHERE users.id = ? AND users.role IN (${AGENT_ROLES.map(() => "?").join(", ")}) AND staff_profiles.status = 'active'`,
    [id, ...AGENT_ROLES]
  );
  if (!agent) throw new ApiError("Choose an active support agent.");
  return agent;
}

// Support reply (optionally with a file). The first reply stamps first_response_at for the SLA;
// a reply puts an open ticket into "Waiting" (on the customer).
export async function replyAsAgent(user, id, form) {
  const ticket = await findTicket(id);
  const body = text(form.get("body"), "Reply", 5000);
  const file = form.get("file");
  const attachment = file && typeof file !== "string" && file.size ? await saveUpload(ticket.organizationId, file, { maxBytes: TICKET_ATTACHMENT_MAX_BYTES, allowed: TICKET_ATTACHMENT_TYPES }) : null;
  await query(
    "INSERT INTO support_messages (id, ticket_id, author_id, author_role, body, attachment_name, attachment_mime, attachment_size, attachment_path) VALUES (?, ?, ?, 'agent', ?, ?, ?, ?, ?)",
    [createId("msg"), id, user.id, body, attachment?.name ?? null, attachment?.mime ?? null, attachment?.size ?? null, attachment?.storagePath ?? null]
  );
  const status = ["Resolved", "Closed"].includes(ticket.status) ? ticket.status : "Waiting";
  await query(
    "UPDATE support_tickets SET status = ?, first_response_at = COALESCE(first_response_at, NOW()), assigned_to = COALESCE(assigned_to, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    [status, user.id, id]
  );
  return getStaffTicket(id);
}

export async function addInternalNote(user, id, body) {
  await findTicket(id);
  await query("INSERT INTO support_internal_notes (id, ticket_id, author_id, body) VALUES (?, ?, ?, ?)", [createId("tnote"), id, user.id, text(body, "Note", 5000)]);
  await query("UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [id]);
  return getStaffTicket(id);
}

// { assignedTo?, priority?, status?, note? } — note is stored as an internal note (e.g. closing note)
export async function updateStaffTicket(user, id, body) {
  const ticket = await findTicket(id);
  const sets = [];
  const values = [];
  const changes = [];
  if (body.assignedTo !== undefined) {
    const agent = body.assignedTo ? await assertAgent(body.assignedTo) : null;
    sets.push("assigned_to = ?");
    values.push(agent?.id ?? null);
    changes.push(agent ? `assigned to ${agent.name}` : "unassigned");
  }
  if (body.priority !== undefined) {
    if (!TICKET_PRIORITIES.some((option) => option.value === body.priority)) throw new ApiError("Choose a valid priority.");
    sets.push("priority = ?");
    values.push(body.priority);
    changes.push(`priority ${label(TICKET_PRIORITIES, body.priority)}`);
  }
  if (body.status !== undefined) {
    if (!TICKET_STATUSES.includes(body.status)) throw new ApiError("Choose a valid status.");
    sets.push("status = ?", "resolved_at = ?");
    values.push(body.status, ["Resolved", "Closed"].includes(body.status) ? new Date() : null);
    changes.push(`status ${body.status}`);
  }
  if (!sets.length && !body.note) throw new ApiError("No changes supplied.");
  if (sets.length) await query(`UPDATE support_tickets SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
  if (typeof body.note === "string" && body.note.trim()) {
    await query("INSERT INTO support_internal_notes (id, ticket_id, author_id, body) VALUES (?, ?, ?, ?)", [createId("tnote"), id, user.id, text(body.note, "Note", 5000)]);
  }
  if (changes.length) await recordAudit(user, { action: "support.ticket_updated", entityType: "support_ticket", entityId: id, organizationId: ticket.organizationId, summary: `TKT-${ticket.number}: ${changes.join(", ")}` });
  return getStaffTicket(id);
}

// Hand a ticket to a manager/senior agent with a reason (kept as an internal note)
export async function escalateTicket(user, id, { assignedTo, priority, reason }) {
  const ticket = await findTicket(id);
  const agent = await assertAgent(assignedTo);
  if (!TICKET_PRIORITIES.some((option) => option.value === priority)) throw new ApiError("Choose a valid priority.");
  const why = text(reason, "Reason for escalation", 2000);
  await query("UPDATE support_tickets SET assigned_to = ?, priority = ?, status = IF(status IN ('Resolved', 'Closed'), 'Open', status), escalated_at = NOW(), updated_at = CURRENT_TIMESTAMP WHERE id = ?", [agent.id, priority, id]);
  await query("INSERT INTO support_internal_notes (id, ticket_id, author_id, body) VALUES (?, ?, ?, ?)", [createId("tnote"), id, user.id, `Escalated to ${agent.name}: ${why}`]);
  await recordAudit(user, { action: "support.ticket_escalated", entityType: "support_ticket", entityId: id, organizationId: ticket.organizationId, summary: `Escalated TKT-${ticket.number} to ${agent.name}` });
  return getStaffTicket(id);
}

export async function staffAttachment(ticketId, messageId) {
  await findTicket(ticketId);
  const [row] = await query("SELECT attachment_name AS name, attachment_mime AS mime, attachment_path AS path FROM support_messages WHERE id = ? AND ticket_id = ? AND attachment_path IS NOT NULL", [messageId, ticketId]);
  if (!row) throw new ApiError("Attachment not found.", 404);
  return row;
}
