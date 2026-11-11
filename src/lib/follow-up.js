import { query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { requireCurrentUser } from "@/lib/auth";
import { listPlaybooks } from "@/lib/playbooks";
import { STANDARD_PLAYBOOK_ID } from "@/lib/playbook-catalog";
import { CUSTOMER_ROLES, ROLES } from "@/utils.js/roles";
import { CALL_FACTS, FOLLOW_UP_KINDS, TEMPLATE_PURPOSES } from "@/utils.js/follow-up";

// ── After-call follow-up emails (client's Google Doc, Nov 9) ──
// Email Templates and Follow-Up resources belong to the playbook. Only the ACTIVE playbook's
// are offered; buyers use them but can't edit them. A draft is filled only with real facts
// (the contact record, the signed-in user, what the user confirms after the call); a line whose
// placeholder has no value is left out. Nothing is attached or sent: the user edits the draft
// in Mail and sends it themselves. "Do Not Contact" prospects and unsubscribed addresses get no draft.

const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value) ?? null;
const list = (value) => (Array.isArray(value) ? value : []);
const clean = (value, max = 300) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "");

// The Standard playbook (PitchProX's own) comes with these. Premium playbooks bring their own.
const STANDARD_TEMPLATES = [
  {
    name: "Appointment Confirmation",
    purpose: "Appointment Confirmation",
    subject: "Confirming our appointment on {Appointment Date}",
    content: "Hi {Prospect First Name},\n\nThank you for your time today. This confirms our appointment on {Appointment Date} at {Appointment Time}.\nWe'll talk about {Meeting Topic}.\n\nIf anything changes, just reply to this email.\n\nBest regards,\n{Your Name}\n{Your Company}",
  },
  {
    name: "Requested Information",
    purpose: "Requested Information",
    subject: "The information you asked for",
    content: "Hi {Prospect First Name},\n\nThank you for speaking with me today. As promised, I'm following up with the information you asked for about {Requested Information}.\n\nIf you have any questions, I'm happy to go through it with you.\nAs agreed, I'll check in on {Follow-Up Date} at {Follow-Up Time}.\n\nBest regards,\n{Your Name}\n{Your Company}",
  },
  {
    name: "Agreed Follow-Up",
    purpose: "Agreed Follow-Up",
    subject: "Following up as agreed",
    content: "Hi {Prospect First Name},\n\nThank you for your time today.\nAs agreed, I'll reach out again on {Follow-Up Date} at {Follow-Up Time}.\nWe agreed to continue by {Agreed Channel}.\n\nIf a different time suits you better, just reply and let me know.\n\nBest regards,\n{Your Name}\n{Your Company}",
  },
  {
    name: "Post-Meeting Follow-Up",
    purpose: "Post-Meeting Follow-Up",
    subject: "Thank you for meeting with me",
    content: "Hi {Prospect First Name},\n\nThank you for meeting with me.\nIt was good to talk through {Meeting Topic}.\nAs a next step, we agreed to speak again on {Follow-Up Date} at {Follow-Up Time}.\n\nPlease reply if you have any questions in the meantime.\n\nBest regards,\n{Your Name}\n{Your Company}",
  },
  {
    name: "Unresolved Objection Follow-Up",
    purpose: "Unresolved Objection Follow-Up",
    subject: "Following up on our conversation",
    content: "Hi {Prospect First Name},\n\nThank you for being open with me today.\nI've been thinking about your concern regarding {Concern}, and I'd be glad to go over it with you in more detail.\n\nWould you be open to a short conversation? Reply to this email or let me know a time that suits you.\n\nBest regards,\n{Your Name}\n{Your Company}",
  },
];

const STANDARD_FOLLOW_UPS = [
  { name: "Call back later", followUpKind: "Call back later", templatePurpose: "Agreed Follow-Up", content: "Confirm the day, time and channel they agreed to, then send the Agreed Follow-Up email." },
  { name: "Send information", followUpKind: "Send information", templatePurpose: "Requested Information", content: "Send only what they asked for, and say when you'll check in." },
  { name: "Appointment confirmed", followUpKind: "Appointment confirmed", templatePurpose: "Appointment Confirmation", content: "Confirm the appointment in writing the same day." },
  { name: "After a meeting", followUpKind: "After a meeting", templatePurpose: "Post-Meeting Follow-Up", content: "Thank them and restate the agreed next step." },
  { name: "Revisit a concern", followUpKind: "Revisit a concern", templatePurpose: "Unresolved Objection Follow-Up", content: "Acknowledge the concern they raised and offer a short conversation. Don't pressure." },
];

// Who can use it: customer users and sales reps (they run calls)
async function requireCaller() {
  const user = await requireCurrentUser();
  if (!CUSTOMER_ROLES.includes(user.role) && user.role !== ROLES.SALES_REP) throw new Error("FORBIDDEN");
  return user;
}

const templateOf = (resource, id) => ({
  id,
  name: clean(resource.name ?? resource.title, 160) || "Email template",
  purpose: TEMPLATE_PURPOSES.includes(resource.purpose) ? resource.purpose : null,
  subject: clean(resource.subject, 200) || clean(resource.name ?? resource.title, 200) || "Following up",
  description: clean(resource.description, 500) || null,
  body: typeof resource.content === "string" ? resource.content.slice(0, 10000) : "",
});

const followUpOf = (resource, id) => ({
  id,
  name: clean(resource.name ?? resource.title, 160) || "Follow-up",
  kind: FOLLOW_UP_KINDS.some((kind) => kind.value === resource.followUpKind) ? resource.followUpKind : null,
  templatePurpose: TEMPLATE_PURPOSES.includes(resource.templatePurpose) ? resource.templatePurpose : null,
  guidance: typeof resource.content === "string" ? resource.content.slice(0, 2000) : clean(resource.description, 2000),
});

// The active playbook's templates and follow-up guidance (read-only copies)
async function activeResources(user) {
  const { results, activePlaybookId } = await listPlaybooks(user);
  const active = results.find((item) => item.id === activePlaybookId);
  const [row] = await query("SELECT active_version_id AS activeVersionId, version FROM playbooks WHERE id = ?", [activePlaybookId]);
  const compiled = row?.activeVersionId ? parse((await query("SELECT content FROM playbook_versions WHERE id = ?", [row.activeVersionId]))[0]?.content) : null;
  const playbook = { id: activePlaybookId, title: active?.title ?? null, kind: active?.kind ?? null, version: row?.version ?? null };

  if (compiled) {
    const resources = list(compiled.resources);
    return {
      playbook,
      templates: resources.map((resource, index) => [resource, index]).filter(([resource]) => resource.type === "Email Template").map(([resource, index]) => templateOf(resource, `v${row.version ?? 0}-r${index}`)),
      followUps: resources.map((resource, index) => [resource, index]).filter(([resource]) => resource.type === "Follow Up").map(([resource, index]) => followUpOf(resource, `v${row.version ?? 0}-r${index}`)),
    };
  }
  if (activePlaybookId === STANDARD_PLAYBOOK_ID) {
    return {
      playbook,
      templates: STANDARD_TEMPLATES.map((template, index) => templateOf(template, `standard-${index}`)),
      followUps: STANDARD_FOLLOW_UPS.map((followUp, index) => followUpOf(followUp, `standard-f${index}`)),
    };
  }
  // Custom playbooks and premium ones without a builder version have no templates yet
  return { playbook, templates: [], followUps: [] };
}

export async function followUpOptions() {
  const user = await requireCaller();
  return { ...(await activeResources(user)), facts: CALL_FACTS };
}

// ── Contact ──
const digits = (value) => String(value ?? "").replace(/\D/g, "");

async function findContact(user, { contactId, contactKind, phoneNumber, leadName }) {
  const ownOnly = user.role === ROLES.SALES_REP;
  const scope = (table) => (ownOnly ? { sql: `${table}.organization_id = ? AND ${table}.assigned_to = ?`, values: [user.organizationId, user.id] } : { sql: `${table}.organization_id = ?`, values: [user.organizationId] });
  const columns = "id, name, email, phone_number AS phoneNumber, property_address AS propertyAddress, outcome, status, follow_up_at AS followUpAt";
  if (contactId) {
    const table = contactKind === "lead" ? "leads" : "prospects";
    const where = scope(table);
    const [row] = await query(`SELECT ${columns} FROM ${table} WHERE id = ? AND ${where.sql}`, [contactId, ...where.values]);
    if (!row) throw new ApiError("Contact not found.", 404);
    return { ...row, kind: contactKind === "lead" ? "lead" : "prospect" };
  }
  // The live call is set up by phone number (and name): match it to a prospect, then a lead
  const phone = digits(phoneNumber);
  const name = clean(leadName, 255);
  if (phone.length < 7 && !name) return null;
  for (const [table, kind] of [["prospects", "prospect"], ["leads", "lead"]]) {
    const where = scope(table);
    const rows = await query(`SELECT ${columns} FROM ${table} WHERE ${where.sql} ORDER BY updated_at DESC LIMIT 2000`, where.values);
    const byPhone = phone.length >= 7 ? rows.filter((row) => digits(row.phoneNumber).endsWith(phone.slice(-10))) : [];
    const matches = byPhone.length ? byPhone : name ? rows.filter((row) => row.name.toLowerCase() === name.toLowerCase()) : [];
    if (matches.length === 1 || (matches.length > 1 && byPhone.length)) return { ...matches[0], kind };
  }
  return null;
}

// ── Filling ──
const pad = (value) => String(value).padStart(2, "0");
// "2026-11-12T14:30" (what the user picked, in their own time) → { date: "Thursday, November 12", time: "2:30 PM" }
function wallClock(value) {
  const match = typeof value === "string" && value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/);
  if (!match) return null;
  const [, year, month, day, hours, minutes] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hours || 0, minutes || 0));
  if (Number.isNaN(date.getTime()) || date.getUTCMonth() !== month - 1) return null;
  const options = { timeZone: "UTC" };
  return {
    date: date.toLocaleDateString("en-US", { ...options, weekday: "long", month: "long", day: "numeric" }),
    time: match[4] === undefined ? null : date.toLocaleTimeString("en-US", { ...options, hour: "numeric", minute: "2-digit" }),
  };
}

// A date the database holds (the prospect's scheduled follow-up), in the user's time zone
function stored(value, timeZone) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime()) || date <= new Date()) return null;
  let zone = "UTC";
  try {
    if (timeZone) {
      new Intl.DateTimeFormat("en-US", { timeZone });
      zone = timeZone;
    }
  } catch {
    zone = "UTC";
  }
  return {
    date: date.toLocaleDateString("en-US", { timeZone: zone, weekday: "long", month: "long", day: "numeric" }),
    time: date.toLocaleTimeString("en-US", { timeZone: zone, hour: "numeric", minute: "2-digit" }),
  };
}

const PLACEHOLDER = /\{([^{}]{1,60})\}/g;

// Fill a body: a line with a placeholder that has no value is dropped (reported in `left`)
function fillBody(text, values, left) {
  const lines = [];
  for (const line of String(text).split("\n")) {
    const missing = [...line.matchAll(PLACEHOLDER)].map((match) => match[1].trim()).filter((key) => !values[key]);
    if (missing.length) {
      missing.forEach((key) => left.add(key));
      // "Hi {Prospect First Name}," without a name → "Hi,"
      const greeting = line.match(/^\s*(Hi|Hello|Dear|Good (?:morning|afternoon|evening))\s+\{[^{}]+\}\s*([,!])?\s*$/i);
      if (greeting) lines.push(`${greeting[1]}${greeting[2] ?? ","}`);
      continue;
    }
    lines.push(line.replace(PLACEHOLDER, (_, key) => values[key.trim()]));
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// Subjects keep their words; an unknown placeholder (and its "on" / "at" / "for") is removed
function fillSubject(text, values, left) {
  return String(text)
    .replace(/\s*(?:\b(?:on|at|for|about|by|with|from|re:?)\s+)?\{([^{}]{1,60})\}/gi, (whole, key) => {
      const value = values[key.trim()];
      if (value) return whole.replace(`{${key}}`, value);
      left.add(key.trim());
      return "";
    })
    .replace(/\s+/g, " ")
    .replace(/[\s:,\-–]+$/, "")
    .trim();
}

// { templateId, contactId?, contactKind?, phoneNumber?, leadName?, facts?, timeZone? } → draft for the Mail tab
export async function buildFollowUpDraft(body) {
  const user = await requireCaller();
  const { playbook, templates } = await activeResources(user);
  const template = templates.find((item) => item.id === body.templateId);
  if (!template) throw new ApiError("This email template isn't part of your active playbook.", 404);

  // A draft from a call uses that call's contact (no guessing by phone number)
  let lookup = body;
  if (body.callId && !body.contactId) {
    const [call] = await query("SELECT contact_kind AS contactKind, contact_id AS contactId, contact_name AS contactName, user_id AS userId FROM calls WHERE id = ? AND organization_id = ?", [body.callId, user.organizationId]);
    if (!call || (call.userId !== user.id && user.role !== "customer_admin")) throw new ApiError("Call not found.", 404);
    lookup = call.contactId ? { contactId: call.contactId, contactKind: call.contactKind } : { ...body, leadName: body.leadName || call.contactName };
  }
  const contact = await findContact(user, lookup);
  if (contact && /do not contact/i.test(`${contact.outcome ?? ""} ${contact.status ?? ""}`)) {
    throw new ApiError(`${contact.name} asked not to be contacted, so no follow-up email is drafted.`, 409);
  }
  const email = contact?.email?.trim().toLowerCase() || null;
  if (email) {
    const [suppressed] = await query("SELECT reason FROM email_suppressions WHERE email = ?", [email]);
    if (suppressed) throw new ApiError(`${email} has unsubscribed from emails, so no follow-up email is drafted.`, 409);
  }

  const facts = body.facts && typeof body.facts === "object" ? body.facts : {};
  const [me] = await query("SELECT users.name, users.email, organizations.name AS company FROM users JOIN organizations ON organizations.id = users.organization_id WHERE users.id = ?", [user.id]);
  const contactName = clean(contact?.name, 255) || clean(lookup.leadName ?? body.leadName, 255);
  const appointment = wallClock(facts.appointmentAt);
  const followUp = wallClock(facts.followUpAt) ?? stored(contact?.followUpAt, body.timeZone);
  const values = {
    "Prospect Name": contactName,
    "Prospect First Name": contactName.split(" ")[0],
    "Property Address": clean(contact?.propertyAddress, 300),
    "Your Name": me.name,
    "Your First Name": me.name.split(" ")[0],
    "Your Email": me.email,
    // Customers' own company; PitchProX staff sign as PitchProX
    "Your Company": CUSTOMER_ROLES.includes(user.role) ? me.company : "PitchProX",
    "Appointment Date": appointment?.date,
    "Appointment Time": appointment?.time,
    "Follow-Up Date": followUp?.date,
    "Follow-Up Time": followUp?.time,
    "Agreed Channel": clean(facts.channel, 60).toLowerCase(),
    "Requested Information": clean(facts.requestedInformation),
    Concern: clean(facts.concern),
    "Meeting Topic": clean(facts.meetingTopic),
  };
  const left = new Set();
  const subject = fillSubject(template.subject, values, left) || template.name;
  const draftBody = fillBody(template.body, values, left);
  return {
    to: email ?? "",
    subject: subject.slice(0, 255),
    body: draftBody,
    templateName: template.name,
    playbook: { id: playbook.id, title: playbook.title },
    contact: contact ? { id: contact.id, kind: contact.kind, name: contact.name, email } : null,
    // Placeholders with no known value: their lines were left out
    leftOut: [...left],
  };
}
