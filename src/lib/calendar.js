import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { assertCanWrite, requireStaff } from "@/lib/permissions";
import { ROLES } from "@/utils.js/roles";

// ── Internal calendar (staff) ──
// Times are wall-clock times as entered ("2026-05-20 09:00") and come back as
// "YYYY-MM-DDTHH:mm", so they never shift with time zones.
// Visibility: "Private" → owner only; "Management Only" → owner + Super Admin / Admin Manager; others → all staff.
// Sales reps also see their own lead follow-ups as read-only Sales events.

export const EVENT_TYPES = ["Company Meeting", "Product", "Billing", "Support", "Sales", "Training", "Compliance", "Other"];
export const DEPARTMENTS = ["Sales", "Support", "Product & Eng", "Billing", "Management", "All Departments"];
export const VISIBILITIES = ["All Employees", "Internal Only", "Management Only", "Private"];

export const requireCalendarUser = requireStaff;

const isManagement = (user) => [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER].includes(user.role);
const COLUMNS = `calendar_events.id, calendar_events.owner_id AS ownerId, users.name AS ownerName, calendar_events.title, calendar_events.description,
  calendar_events.event_type AS eventType, calendar_events.department, calendar_events.visibility, calendar_events.location_link AS locationLink,
  DATE_FORMAT(calendar_events.starts_at, '%Y-%m-%dT%H:%i') AS startsAt, DATE_FORMAT(calendar_events.ends_at, '%Y-%m-%dT%H:%i') AS endsAt`;

const visibleTo = (user) =>
  isManagement(user)
    ? { sql: "(calendar_events.visibility <> 'Private' OR calendar_events.owner_id = ?)", values: [user.id] }
    : { sql: "(calendar_events.visibility NOT IN ('Private', 'Management Only') OR calendar_events.owner_id = ?)", values: [user.id] };

const validDay = (value, label) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) throw new ApiError(`${label} must be a date (YYYY-MM-DD).`);
  return value;
};

// "09:00 AM" or "13:30" → "HH:mm:00"
function parseTime(value, label) {
  const match = typeof value === "string" ? value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i) : null;
  if (!match) throw new ApiError(`${label} must be a time like 09:00 AM.`);
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (match[3]) {
    if (hours < 1 || hours > 12) throw new ApiError(`${label} is not a valid time.`);
    hours = (hours % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
  }
  if (hours > 23 || minutes > 59) throw new ApiError(`${label} is not a valid time.`);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

function parseEvent(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) throw new ApiError("Event title is required.");
  if (title.length > 255) throw new ApiError("Title must be 255 characters or fewer.");
  if (!EVENT_TYPES.includes(body.eventType)) throw new ApiError("Choose a valid event type.");
  if (body.department && !DEPARTMENTS.includes(body.department)) throw new ApiError("Choose a valid department.");
  const visibility = body.visibility || "All Employees";
  if (!VISIBILITIES.includes(visibility)) throw new ApiError("Choose a valid visibility.");
  const startsAt = `${validDay(body.startDate, "Start date")} ${parseTime(body.startTime, "Start time")}`;
  const endsAt = `${validDay(body.endDate || body.startDate, "End date")} ${parseTime(body.endTime, "End time")}`;
  if (endsAt <= startsAt) throw new ApiError("The event must end after it starts.");
  const link = typeof body.locationLink === "string" ? body.locationLink.trim().slice(0, 500) || null : null;
  const description = typeof body.description === "string" ? body.description.trim().slice(0, 5000) || null : null;
  return { title, description, event_type: body.eventType, department: body.department || null, visibility, location_link: link, starts_at: startsAt, ends_at: endsAt };
}

// Events overlapping [from, to] (YYYY-MM-DD), plus the rep's own lead follow-ups
export async function listEvents(user, { from, to }) {
  const start = `${validDay(from, "from")} 00:00:00`;
  const end = `${validDay(to, "to")} 23:59:59`;
  const visible = visibleTo(user);
  const events = await query(
    `SELECT ${COLUMNS} FROM calendar_events JOIN users ON users.id = calendar_events.owner_id
     WHERE calendar_events.starts_at <= ? AND calendar_events.ends_at >= ? AND ${visible.sql} ORDER BY calendar_events.starts_at`,
    [end, start, ...visible.values]
  );
  const results = events.map((event) => ({ ...event, source: "event", canEdit: event.ownerId === user.id || user.role === ROLES.SUPER_ADMIN }));
  if (user.role === ROLES.SALES_REP) {
    const followUps = await query(
      `SELECT id, name, DATE_FORMAT(follow_up_at, '%Y-%m-%dT%H:%i') AS startsAt, DATE_FORMAT(DATE_ADD(follow_up_at, INTERVAL 30 MINUTE), '%Y-%m-%dT%H:%i') AS endsAt
       FROM leads WHERE assigned_to = ? AND follow_up_at BETWEEN ? AND ? ORDER BY follow_up_at`,
      [user.id, start, end]
    );
    for (const lead of followUps) {
      results.push({ id: `follow-up-${lead.id}`, title: `Follow up: ${lead.name}`, description: "Lead follow-up (set from Leads)", eventType: "Sales", department: "Sales", visibility: "Private", locationLink: null, startsAt: lead.startsAt, endsAt: lead.endsAt, ownerId: user.id, ownerName: user.name, source: "follow-up", canEdit: false });
    }
  }
  return results.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

async function findEditable(user, id) {
  assertCanWrite(user);
  const [event] = await query("SELECT id, owner_id AS ownerId FROM calendar_events WHERE id = ?", [id]);
  if (!event) throw new ApiError("Event not found.", 404);
  if (event.ownerId !== user.id && user.role !== ROLES.SUPER_ADMIN) throw new ApiError("Only the person who created this event can change it.", 403);
  return event;
}

const getEvent = async (user, id) => {
  const [event] = await query(`SELECT ${COLUMNS} FROM calendar_events JOIN users ON users.id = calendar_events.owner_id WHERE calendar_events.id = ?`, [id]);
  return { ...event, source: "event", canEdit: event.ownerId === user.id || user.role === ROLES.SUPER_ADMIN };
};

export async function createEvent(user, body) {
  assertCanWrite(user);
  const fields = parseEvent(body);
  const id = createId("event");
  const columns = ["id", "owner_id", ...Object.keys(fields)];
  await query(`INSERT INTO calendar_events (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`, [id, user.id, ...Object.values(fields)]);
  return getEvent(user, id);
}

export async function updateEvent(user, id, body) {
  await findEditable(user, id);
  const fields = parseEvent(body);
  await query(`UPDATE calendar_events SET ${Object.keys(fields).map((column) => `${column} = ?`).join(", ")} WHERE id = ?`, [...Object.values(fields), id]);
  return getEvent(user, id);
}

export async function deleteEvent(user, id) {
  await findEditable(user, id);
  await query("DELETE FROM calendar_events WHERE id = ?", [id]);
}
