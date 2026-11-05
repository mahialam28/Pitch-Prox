import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { assertCanWrite } from "@/lib/permissions";
import { getSubscription } from "@/lib/billing";
import { formatBytes, saveUpload } from "@/lib/storage";
import { CUSTOMER_ROLES } from "@/utils.js/roles";
import { TICKET_ATTACHMENT_MAX_BYTES, TICKET_ATTACHMENT_TYPES, TICKET_CATEGORIES, TICKET_PRIORITIES } from "@/utils.js/support";

const ticketColumns = "support_tickets.id, support_tickets.number, support_tickets.subject, support_tickets.status, support_tickets.priority, support_tickets.category, support_tickets.created_at AS createdAt, support_tickets.updated_at AS updatedAt";

const text = (value, label, max) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed;
};

// An optional file from a multipart form, stored privately
async function attachmentFrom(user, form) {
  const file = form.get("file");
  if (!file || typeof file === "string" || !file.size) return null;
  return saveUpload(user.organizationId, file, { maxBytes: TICKET_ATTACHMENT_MAX_BYTES, allowed: TICKET_ATTACHMENT_TYPES });
}

async function addMessage(ticketId, user, role, body, attachment) {
  await query("INSERT INTO support_messages (id, ticket_id, author_id, author_role, body, attachment_name, attachment_mime, attachment_size, attachment_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [createId("msg"), ticketId, user.id, role, body, attachment?.name ?? null, attachment?.mime ?? null, attachment?.size ?? null, attachment?.storagePath ?? null]);
}

// Customers see their company's tickets; staff raising their own tickets see only theirs
const ownTickets = (user) =>
  CUSTOMER_ROLES.includes(user.role)
    ? { sql: "organization_id = ?", values: [user.organizationId] }
    : { sql: "organization_id = ? AND created_by = ?", values: [user.organizationId, user.id] };

export async function listCustomerTickets(user) {
  const scope = ownTickets(user);
  return query(`SELECT ${ticketColumns} FROM support_tickets WHERE ${scope.sql} ORDER BY updated_at DESC`, scope.values);
}

export async function createCustomerTicket(user, form) {
  assertCanWrite(user);
  const category = form.get("category");
  const priority = form.get("priority");
  if (!TICKET_CATEGORIES.some((item) => item.value === category)) throw new ApiError("Choose a valid category.");
  if (!TICKET_PRIORITIES.some((item) => item.value === priority)) throw new ApiError("Choose a valid priority.");
  const subject = text(form.get("subject"), "Subject", 255);
  const description = text(form.get("description"), "Description", 5000);
  const attachment = await attachmentFrom(user, form);
  const id = createId("ticket");
  await query("INSERT INTO support_tickets (id, organization_id, created_by, category, priority, subject) VALUES (?, ?, ?, ?, ?, ?)", [id, user.organizationId, user.id, category, priority, subject]);
  await addMessage(id, user, "customer", description, attachment);
  return getCustomerTicket(user, id);
}

async function findCustomerTicket(user, id) {
  const scope = ownTickets(user);
  const [ticket] = await query(`SELECT ${ticketColumns} FROM support_tickets WHERE id = ? AND ${scope.sql}`, [id, ...scope.values]);
  if (!ticket) throw new ApiError("Ticket not found.", 404);
  return ticket;
}

// Full ticket for the details drawer: messages plus the company's details
export async function getCustomerTicket(user, id) {
  const ticket = await findCustomerTicket(user, id);
  const messages = await query("SELECT support_messages.id, support_messages.author_role AS role, support_messages.body, support_messages.attachment_name AS attachmentName, support_messages.attachment_size AS attachmentSize, support_messages.created_at AS createdAt, users.name AS sender FROM support_messages JOIN users ON users.id = support_messages.author_id WHERE support_messages.ticket_id = ? ORDER BY support_messages.created_at, support_messages.id", [id]);
  const [creator] = await query("SELECT users.name, users.email, organizations.name AS company, organizations.id AS organizationId, organizations.created_at AS memberSince FROM support_tickets JOIN users ON users.id = support_tickets.created_by JOIN organizations ON organizations.id = support_tickets.organization_id WHERE support_tickets.id = ?", [id]);
  const subscription = CUSTOMER_ROLES.includes(user.role) ? await getSubscription(user.organizationId).catch(() => null) : null;
  return {
    ...ticket,
    customer: { ...creator, plan: subscription?.plan?.name ?? (CUSTOMER_ROLES.includes(user.role) ? null : "PitchProX staff") },
    messages: messages.map((message) => ({
      ...message,
      attachment: message.attachmentName ? { name: message.attachmentName, size: formatBytes(Number(message.attachmentSize)) } : null,
    })),
  };
}

// A customer reply; a resolved or closed ticket opens again
export async function replyAsCustomer(user, id, form) {
  assertCanWrite(user);
  const ticket = await findCustomerTicket(user, id);
  const body = text(form.get("body"), "Message", 5000);
  const attachment = await attachmentFrom(user, form);
  await addMessage(id, user, "customer", body, attachment);
  // A reply reopens a finished ticket, and answers a "waiting on customer" one
  const status = ["Resolved", "Closed", "Waiting"].includes(ticket.status) ? "Open" : ticket.status;
  await query("UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]);
  return getCustomerTicket(user, id);
}

// The stored file behind a message attachment, if this company owns the ticket
export async function customerAttachment(user, ticketId, messageId) {
  await findCustomerTicket(user, ticketId);
  const [row] = await query("SELECT attachment_name AS name, attachment_mime AS mime, attachment_path AS path FROM support_messages WHERE id = ? AND ticket_id = ? AND attachment_path IS NOT NULL", [messageId, ticketId]);
  if (!row) throw new ApiError("Attachment not found.", 404);
  return row;
}
