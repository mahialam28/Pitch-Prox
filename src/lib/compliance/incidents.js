import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { deleteUpload, formatBytes, readUpload, saveUpload } from "@/lib/storage";
import { queueEmail } from "@/lib/campaigns/outbox";
import { notify } from "@/lib/notifications";
import { ROLE_LABELS, ROLES } from "@/utils.js/roles";
import { ownerOptions } from "@/lib/compliance/policies";
import {
  CLOSE_REASONS,
  INCIDENT_CATEGORIES,
  INCIDENT_FILE_MAX_BYTES,
  INCIDENT_FILE_TYPES,
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  RESOLUTION_TARGET_HOURS,
} from "@/lib/compliance/incident-catalog";

// ── Incident Management (Compliance & Audit) ──
// Open → Investigating (an incident manager starts it) → Resolved (investigation submitted with
// findings, actions and conclusion) → Closed. Resolved or Closed incidents can be reopened to
// Investigating. Every step is on the incident's timeline and in the audit log.
// "Incident Management permission" = Super Admin and Admin Manager (Compliance section, not
// read-only); Auditors read.

const STORAGE_AREA = "compliance-incidents";
const HOUR = 3600000;
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const reference = (row) => `INC-${new Date(row.reportedAt ?? row.reported_at).getFullYear()}-${String(row.number).padStart(4, "0")}`;
const text = (value, label, max, { required = false } = {}) => {
  const clean = String(value ?? "").trim();
  if (required && !clean) throw new ApiError(`Enter ${label}.`);
  if (clean.length > max) throw new ApiError(`${label[0].toUpperCase()}${label.slice(1)} is too long (${max} characters max).`);
  return clean || null;
};

// People who can own and work incidents
export const incidentManagers = ownerOptions;
async function assertManager(userId) {
  if (!userId) return null;
  const managers = await incidentManagers();
  const person = managers.find((manager) => manager.id === userId);
  if (!person) throw new ApiError("Incidents can only be assigned to people with Incident Management permission.");
  return person;
}

const SELECT = `SELECT incidents.*, incidents.reported_at AS reportedAt,
  reporter.name AS reporterName, reporter.role AS reporterRole, reporter.email AS reporterEmail,
  assignee.name AS assigneeName, assignee.role AS assigneeRole,
  investigator.name AS investigatorName, closer.name AS closerName,
  support_tickets.number AS ticketNumber, support_tickets.subject AS ticketSubject, organizations.name AS ticketCompany
  FROM incidents
  LEFT JOIN users AS reporter ON reporter.id = incidents.reported_by
  LEFT JOIN users AS assignee ON assignee.id = incidents.assigned_to
  LEFT JOIN users AS investigator ON investigator.id = incidents.investigated_by
  LEFT JOIN users AS closer ON closer.id = incidents.closed_by
  LEFT JOIN support_tickets ON support_tickets.id = incidents.related_ticket_id
  LEFT JOIN organizations ON organizations.id = support_tickets.organization_id`;

const person = (name, role) => (name ? { name, role: ROLE_LABELS[role] ?? role } : null);

function toIncident(row) {
  const resolvedOrNow = row.resolved_at ? new Date(row.resolved_at).getTime() : Date.now();
  const hoursOpen = (resolvedOrNow - new Date(row.reported_at).getTime()) / HOUR;
  const target = RESOLUTION_TARGET_HOURS[row.severity] ?? 168;
  const done = row.status === "Resolved" || row.status === "Closed";
  return {
    id: row.id,
    reference: reference(row),
    title: row.title,
    description: row.description,
    category: row.category,
    severity: row.severity,
    status: row.status,
    affectedSystems: row.affected_systems,
    occurredAt: row.occurred_at,
    reportedAt: row.reported_at,
    reportedBy: person(row.reporterName, row.reporterRole) ?? { name: "Former employee", role: "" },
    assignedTo: row.assigned_to ? { id: row.assigned_to, ...person(row.assigneeName, row.assigneeRole) } : null,
    relatedTicket: row.related_ticket_id ? { id: row.related_ticket_id, reference: `TKT-${row.ticketNumber}`, subject: row.ticketSubject, company: row.ticketCompany } : null,
    investigationStartedAt: row.investigation_started_at,
    investigationFindings: row.investigation_findings,
    actionsTaken: row.actions_taken,
    finalConclusion: row.final_conclusion,
    investigationCompletedAt: row.investigation_completed_at,
    investigatedBy: row.investigatorName ?? null,
    resolvedAt: row.resolved_at,
    closedAt: row.closed_at,
    closedBy: row.closerName ?? null,
    closeReason: row.close_reason,
    reopenedCount: row.reopened_count,
    sla: { targetHours: target, hoursOpen: Math.round(hoursOpen * 10) / 10, breached: hoursOpen > target, remainingHours: done ? null : Math.round((target - hoursOpen) * 10) / 10 },
  };
}

// ── List page ──
export async function listIncidents(user) {
  const incidents = (await query(`${SELECT} ORDER BY incidents.reported_at DESC`)).map(toIncident);
  const count = (status) => incidents.filter((incident) => incident.status === status).length;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  const resolvedTimes = incidents.filter((incident) => incident.resolvedAt).map((incident) => new Date(incident.resolvedAt) - new Date(incident.reportedAt));
  const categories = INCIDENT_CATEGORIES.map((category) => ({ category, count: incidents.filter((incident) => incident.category === category).length })).filter((item) => item.count).sort((a, b) => b.count - a.count);
  return {
    results: incidents,
    stats: {
      total: incidents.length,
      // Active = Open + Investigating; Critical/High counts only active incidents (client items 133–135)
      active: count("Open") + count("Investigating"),
      criticalHigh: incidents.filter((incident) => ["Open", "Investigating"].includes(incident.status) && ["Critical", "High"].includes(incident.severity)).length,
      // Resolved or closed this month, each incident once
      resolvedThisMonth: incidents.filter((incident) => [incident.resolvedAt, incident.closedAt].some((when) => when && new Date(when).getTime() >= monthStart)).length,
      avgResolutionHours: resolvedTimes.length ? Math.round((resolvedTimes.reduce((sum, value) => sum + value, 0) / resolvedTimes.length / HOUR) * 10) / 10 : null,
    },
    summary: INCIDENT_STATUSES.map((status) => ({ status, count: count(status) })),
    topCategories: categories.slice(0, 5),
    managers: await incidentManagers(),
    permissions: { manage: user.role !== ROLES.AUDITOR },
  };
}

// ── Detail ──
async function findIncident(id) {
  const [row] = await query(`${SELECT} WHERE incidents.id = ?`, [id]);
  if (!row) throw new ApiError("Incident not found.", 404);
  return row;
}

export async function getIncident(user, id) {
  const incident = toIncident(await findIncident(id));
  const [events, files] = await Promise.all([
    query("SELECT id, kind, body, actor_name AS actor, created_at AS createdAt FROM incident_events WHERE incident_id = ? ORDER BY created_at DESC, id DESC", [id]),
    query("SELECT incident_files.id, incident_files.file_name AS name, incident_files.file_size AS size, incident_files.created_at AS createdAt, users.name AS uploadedBy FROM incident_files LEFT JOIN users ON users.id = incident_files.uploaded_by WHERE incident_id = ? ORDER BY incident_files.created_at DESC", [id]),
  ]);
  return {
    incident: { ...incident, timeline: events, files: files.map((file) => ({ ...file, size: formatBytes(Number(file.size)) })) },
    managers: await incidentManagers(),
    closeReasons: CLOSE_REASONS,
    permissions: { manage: user.role !== ROLES.AUDITOR },
  };
}

async function addEvent(user, incidentId, kind, body) {
  await query("INSERT INTO incident_events (id, incident_id, kind, body, actor_id, actor_name) VALUES (?, ?, ?, ?, ?, ?)", [createId("ievt"), incidentId, kind, String(body).slice(0, 2000), user?.id ?? null, user?.name ?? "System"]);
}

// A support ticket by its reference ("TKT-1234" or "1234")
async function findTicket(value) {
  const match = String(value ?? "").trim().match(/^(?:TKT-)?(\d{1,9})$/i);
  if (!match) throw new ApiError("Enter the support ticket like TKT-1234.");
  const [ticket] = await query("SELECT id, number FROM support_tickets WHERE number = ?", [Number(match[1])]);
  if (!ticket) throw new ApiError(`Support ticket TKT-${match[1]} doesn't exist.`);
  return ticket;
}

// ── Report New Incident ──
// Fields from a multipart form (evidence file optional). Status starts Open; Reported At and
// Reported By are set here and can't be changed.
export async function reportIncident(user, form) {
  const title = text(form.get("title"), "an incident title", 255, { required: true });
  const description = text(form.get("description"), "a description", 5000, { required: true });
  const category = form.get("category");
  if (!INCIDENT_CATEGORIES.includes(category)) throw new ApiError("Choose a category.");
  const severity = form.get("severity");
  if (!INCIDENT_SEVERITIES.includes(severity)) throw new ApiError("Choose a severity.");
  const occurredInput = String(form.get("occurredAt") ?? "").trim();
  let occurredAt = null;
  if (occurredInput) {
    occurredAt = new Date(occurredInput);
    if (Number.isNaN(occurredAt.getTime())) throw new ApiError("The time the incident occurred isn't valid.");
    if (occurredAt.getTime() > Date.now() + 5 * 60000) throw new ApiError("The incident can't have occurred in the future.");
  }
  const affectedSystems = text(form.get("affectedSystems"), "the affected systems", 255);
  const ticket = form.get("relatedTicket") ? await findTicket(form.get("relatedTicket")) : null;
  const assignee = await assertManager(form.get("assignedTo") || null);
  const file = form.get("file");
  const saved = file && typeof file !== "string" && file.size ? await saveUpload(STORAGE_AREA, file, { maxBytes: INCIDENT_FILE_MAX_BYTES, allowed: INCIDENT_FILE_TYPES }) : null;

  const id = createId("inc");
  await query(
    "INSERT INTO incidents (id, title, description, category, severity, status, affected_systems, occurred_at, reported_by, assigned_to, related_ticket_id) VALUES (?, ?, ?, ?, ?, 'Open', ?, ?, ?, ?, ?)",
    [id, title, description, category, severity, affectedSystems, occurredAt, user.id, assignee?.id ?? null, ticket?.id ?? null]
  );
  if (saved) await query("INSERT INTO incident_files (id, incident_id, file_path, file_name, file_size, file_mime, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)", [createId("ifile"), id, saved.storagePath, saved.name, saved.size, saved.mime, user.id]);
  const row = await findIncident(id);
  await addEvent(user, id, "Created", `Incident reported${ticket ? ` from escalated ticket TKT-${ticket.number}` : ""}${assignee ? `, assigned to ${assignee.name}` : ""}`);
  await recordAudit(user, { action: "incident.reported", entityType: "incident", entityId: id, summary: `Reported ${reference(row)}: ${title} (${severity}, ${category})` });
  return getIncident(user, id);
}

// ── Changes ──
// { title, description, category, severity, affectedSystems, assignedTo, relatedTicket }
export async function updateIncident(user, id, body) {
  const row = await findIncident(id);
  const changes = [];
  const fields = {};
  if (body.title !== undefined) fields.title = text(body.title, "an incident title", 255, { required: true });
  if (body.description !== undefined) fields.description = text(body.description, "a description", 5000, { required: true });
  if (body.affectedSystems !== undefined) fields.affected_systems = text(body.affectedSystems, "the affected systems", 255);
  if (body.category !== undefined) {
    if (!INCIDENT_CATEGORIES.includes(body.category)) throw new ApiError("Choose a category.");
    fields.category = body.category;
  }
  if (body.severity !== undefined) {
    if (!INCIDENT_SEVERITIES.includes(body.severity)) throw new ApiError("Choose a severity.");
    if (body.severity !== row.severity) changes.push(`Severity ${row.severity} → ${body.severity}`);
    fields.severity = body.severity;
  }
  if (body.assignedTo !== undefined) {
    const assignee = await assertManager(body.assignedTo || null);
    if ((assignee?.id ?? null) !== row.assigned_to) changes.push(assignee ? `Assigned to ${assignee.name}` : "Unassigned");
    fields.assigned_to = assignee?.id ?? null;
  }
  if (body.relatedTicket !== undefined) {
    const ticket = body.relatedTicket ? await findTicket(body.relatedTicket) : null;
    if ((ticket?.id ?? null) !== row.related_ticket_id) changes.push(ticket ? `Linked support ticket TKT-${ticket.number}` : "Removed the linked support ticket");
    fields.related_ticket_id = ticket?.id ?? null;
  }
  const keys = Object.keys(fields);
  if (!keys.length) throw new ApiError("Nothing to update.");
  await query(`UPDATE incidents SET ${keys.map((key) => `${key} = ?`).join(", ")} WHERE id = ?`, [...keys.map((key) => fields[key]), id]);
  const summary = changes.length ? changes.join("; ") : "Details updated";
  await addEvent(user, id, "Update", summary);
  if (fields.assigned_to && fields.assigned_to !== row.assigned_to) {
    await notify([fields.assigned_to], { type: "incident", title: `Incident assigned to you: ${reference(row)}`, body: `${user.name} assigned you "${fields.title ?? row.title}" (${fields.severity ?? row.severity}).`, link: `/super-admin/compliance-audit/incident-management/${id}`, entityType: "incident", entityId: id, actor: user });
  }
  await recordAudit(user, { action: "incident.updated", entityType: "incident", entityId: id, summary: `${reference(row)}: ${summary}` });
  return getIncident(user, id);
}

// action: start | resolve (findings, actionsTaken, conclusion) | close (reason when not resolved) | reopen
export async function incidentAction(user, id, body) {
  const row = await findIncident(id);
  const ref = reference(row);
  const action = body.action;

  if (action === "start") {
    if (row.status !== "Open") throw new ApiError("Only an Open incident can move to Investigating.", 409);
    // Whoever starts the investigation owns it unless someone already does
    await query("UPDATE incidents SET status = 'Investigating', investigation_started_at = NOW(), assigned_to = COALESCE(assigned_to, ?) WHERE id = ?", [user.id, id]);
    await addEvent(user, id, "Action", "Investigation started");
    await recordAudit(user, { action: "incident.investigation_started", entityType: "incident", entityId: id, summary: `Started investigating ${ref}` });
  } else if (action === "resolve") {
    if (row.status !== "Investigating") throw new ApiError("Start the investigation first.", 409);
    const findings = text(body.findings, "the investigation findings", 5000, { required: true });
    const actions = text(body.actionsTaken, "the actions taken", 5000, { required: true });
    const conclusion = text(body.conclusion, "the final conclusion", 2000, { required: true });
    // Investigation Completed At / Investigated By are filled in automatically (client items)
    await query(
      "UPDATE incidents SET status = 'Resolved', investigation_findings = ?, actions_taken = ?, final_conclusion = ?, investigation_completed_at = NOW(), investigated_by = ?, resolved_at = NOW(), closed_at = NULL, close_reason = NULL WHERE id = ?",
      [findings, actions, conclusion, user.id, id]
    );
    await addEvent(user, id, "Resolved", "Investigation submitted; incident resolved");
    await recordAudit(user, { action: "incident.resolved", entityType: "incident", entityId: id, summary: `Submitted the investigation for ${ref}; it's now Resolved` });
  } else if (action === "close") {
    if (row.status === "Closed") throw new ApiError("This incident is already closed.", 409);
    const reason = row.status === "Resolved" ? null : String(body.reason ?? "");
    if (row.status !== "Resolved" && !CLOSE_REASONS.includes(reason)) throw new ApiError("Choose why it's being closed without an investigation.");
    await query("UPDATE incidents SET status = 'Closed', closed_at = NOW(), closed_by = ?, close_reason = ? WHERE id = ?", [user.id, reason, id]);
    await addEvent(user, id, "Closed", reason ? `Closed without incident: ${reason}` : "Incident closed");
    await recordAudit(user, { action: "incident.closed", entityType: "incident", entityId: id, summary: `Closed ${ref}${reason ? ` (${reason})` : ""}` });
  } else if (action === "reopen") {
    if (row.status !== "Resolved" && row.status !== "Closed") throw new ApiError("Only a Resolved or Closed incident can be reopened.", 409);
    const reason = text(body.reason, "the reason for reopening", 500);
    await query("UPDATE incidents SET status = 'Investigating', resolved_at = NULL, closed_at = NULL, closed_by = NULL, close_reason = NULL, investigation_started_at = COALESCE(investigation_started_at, NOW()), reopened_count = reopened_count + 1 WHERE id = ?", [id]);
    await addEvent(user, id, "Action", `Incident reopened${reason ? `: ${reason}` : ""}`);
    await recordAudit(user, { action: "incident.reopened", entityType: "incident", entityId: id, summary: `Reopened ${ref}${reason ? `: ${reason}` : ""}` });
  } else {
    throw new ApiError("Unknown action.");
  }
  return getIncident(user, id);
}

export async function addIncidentNote(user, id, note) {
  const row = await findIncident(id);
  const body = text(note, "a note", 2000, { required: true });
  await addEvent(user, id, "Note", body);
  await recordAudit(user, { action: "incident.note_added", entityType: "incident", entityId: id, summary: `Added a note to ${reference(row)}` });
  return getIncident(user, id);
}

// Ask the reporter for more information (queued email + timeline)
export async function requestIncidentInfo(user, id, message) {
  const row = await findIncident(id);
  const body = text(message, "what you need", 2000, { required: true });
  if (!row.reporterEmail) throw new ApiError("The reporter's account no longer exists.", 409);
  if (row.reported_by === user.id) throw new ApiError("You reported this incident yourself.", 409);
  await queueEmail({
    source: "compliance",
    sourceId: id,
    template: { id: null, emailType: "Transactional" },
    userId: row.reported_by,
    email: row.reporterEmail,
    subject: `More information needed: ${reference(row)}`,
    html: `<p>Hi ${escapeHtml(row.reporterName.split(" ")[0])},</p><p>${escapeHtml(user.name)} is investigating <strong>${escapeHtml(row.title)}</strong> (${reference(row)}) and asked:</p><blockquote>${escapeHtml(body)}</blockquote><p>Please reply to ${escapeHtml(user.name)}.</p>`,
  });
  await addEvent(user, id, "Request", `Requested more information from ${row.reporterName}: ${body}`);
  await notify([row.reported_by], { type: "incident", title: `More information needed: ${reference(row)}`, body: `${user.name} asked: ${body}`, entityType: "incident", entityId: id, actor: user });
  await recordAudit(user, { action: "incident.info_requested", entityType: "incident", entityId: id, summary: `Asked ${row.reporterName} for more information on ${reference(row)}` });
  return getIncident(user, id);
}

// ── Evidence files ──
export async function addIncidentFiles(user, id, files) {
  const row = await findIncident(id);
  const list = files.filter((file) => file && typeof file !== "string" && file.size);
  if (!list.length) throw new ApiError("Choose a file to upload.");
  if (list.length > 10) throw new ApiError("Upload up to 10 files at a time.");
  for (const file of list) {
    const saved = await saveUpload(STORAGE_AREA, file, { maxBytes: INCIDENT_FILE_MAX_BYTES, allowed: INCIDENT_FILE_TYPES });
    await query("INSERT INTO incident_files (id, incident_id, file_path, file_name, file_size, file_mime, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)", [createId("ifile"), id, saved.storagePath, saved.name, saved.size, saved.mime, user.id]);
  }
  const names = list.length === 1 ? list[0].name : `${list.length} files`;
  await addEvent(user, id, "Update", `Uploaded ${names}`);
  await recordAudit(user, { action: "incident.evidence_added", entityType: "incident", entityId: id, summary: `Attached ${names} to ${reference(row)}` });
  return getIncident(user, id);
}

export async function incidentFile(incidentId, fileId) {
  const [file] = await query("SELECT file_path, file_name, file_mime FROM incident_files WHERE id = ? AND incident_id = ?", [fileId, incidentId]);
  if (!file) throw new ApiError("File not found.", 404);
  return { bytes: await readUpload(file.file_path), name: file.file_name, mime: file.file_mime || "application/octet-stream" };
}

// Evidence is part of the record: only a Super Admin removes a file uploaded by mistake
export async function removeIncidentFile(user, incidentId, fileId) {
  if (user.role !== ROLES.SUPER_ADMIN) throw new ApiError("Only a Super Admin can remove evidence.", 403);
  const row = await findIncident(incidentId);
  const [file] = await query("SELECT file_path, file_name FROM incident_files WHERE id = ? AND incident_id = ?", [fileId, incidentId]);
  if (!file) throw new ApiError("File not found.", 404);
  await query("DELETE FROM incident_files WHERE id = ?", [fileId]);
  await deleteUpload(file.file_path);
  await addEvent(user, incidentId, "Update", `Removed ${file.file_name}`);
  await recordAudit(user, { action: "incident.evidence_removed", entityType: "incident", entityId: incidentId, summary: `Removed ${file.file_name} from ${reference(row)}` });
  return getIncident(user, incidentId);
}
