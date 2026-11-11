import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { PHONE_LABELS, PHONE_STATUSES, MAX_CONTACT_PHONES, isCallable } from "@/utils.js/phone-status";

// ── Phone numbers of a lead or prospect (Phase 13, client Nov 9) ──
// A contact can have several numbers (cell, home, work…), and each one has its own status.
// Marking one "Bad number" leaves the others callable. leads/prospects.phone_number always holds the
// first callable number (or the first number if none is callable), so search, lists and older
// screens keep working.

const OWNER = { lead: { table: "leads", column: "lead_id" }, prospect: { table: "prospects", column: "prospect_id" } };
const ownerOf = (kind) => {
  const owner = OWNER[kind];
  if (!owner) throw new ApiError("Unknown contact type.");
  return owner;
};
export const digitsOf = (value) => String(value ?? "").replace(/\D/g, "");

const present = (row) => ({
  id: row.id,
  number: row.number,
  label: row.label,
  status: row.status,
  callable: isCallable(row.status),
  lastCalledAt: row.last_called_at,
  statusChangedAt: row.status_changed_at,
});

// The numbers a form sent, cleaned: [{ number, label, status? }], at most MAX_CONTACT_PHONES.
// Accepts `phones` ([{ number, label }] or strings), the older `phoneNumbers` (strings) or `phoneNumber`.
// Returns undefined when the request didn't mention phone numbers at all (PATCH leaves them alone).
export function parsePhones(body) {
  let raw;
  if (Array.isArray(body.phones)) raw = body.phones;
  else if (Array.isArray(body.phoneNumbers)) raw = body.phoneNumbers;
  else if (body.phoneNumber !== undefined) raw = body.phoneNumber ? [body.phoneNumber] : [];
  else return undefined;
  const seen = new Set();
  const phones = [];
  for (const entry of raw) {
    const item = typeof entry === "string" ? { number: entry } : entry && typeof entry === "object" ? entry : null;
    const number = typeof item?.number === "string" ? item.number.trim() : "";
    if (!number) continue;
    if (number.length > 64) throw new ApiError("Phone numbers must be 64 characters or fewer.");
    const digits = digitsOf(number);
    if (digits.length < 7) throw new ApiError(`"${number}" doesn't look like a phone number.`);
    if (seen.has(digits)) continue;
    seen.add(digits);
    const label = PHONE_LABELS.includes(item.label) ? item.label : "Mobile";
    const status = PHONE_STATUSES.some((option) => option.value === item.status) ? item.status : undefined;
    phones.push({ number, digits, label, status });
  }
  if (phones.length > MAX_CONTACT_PHONES) throw new ApiError(`A contact can have up to ${MAX_CONTACT_PHONES} phone numbers.`);
  return phones;
}

// Numbers by contact id: { [id]: [phone…] } in their saved order
export async function phonesFor(kind, ids) {
  const { column } = ownerOf(kind);
  const list = [...new Set(ids.filter(Boolean))];
  if (!list.length) return {};
  const rows = await query(`SELECT * FROM contact_phones WHERE ${column} IN (${list.map(() => "?").join(", ")}) ORDER BY position, created_at`, list);
  const byId = Object.fromEntries(list.map((id) => [id, []]));
  for (const row of rows) byId[row[column]].push(present(row));
  return byId;
}

// Add `phones` (and `workingPhones`) to lead/prospect objects from the API
export async function withPhones(kind, records) {
  const many = Array.isArray(records);
  const list = (many ? records : [records]).filter(Boolean);
  const phones = await phonesFor(kind, list.map((record) => record.id));
  const out = list.map((record) => {
    const own = phones[record.id] ?? [];
    return { ...record, phones: own, workingPhones: own.filter((phone) => phone.callable).length };
  });
  return many ? out : out[0] ?? records;
}

// Keep the contact's phone_number = first callable number (else the first one, else null)
async function syncPrimary(kind, id) {
  const { table, column } = ownerOf(kind);
  const [row] = await query(
    `SELECT number FROM contact_phones WHERE ${column} = ? ORDER BY status IN ('bad', 'wrong', 'disconnected', 'fax', 'do_not_call'), position LIMIT 1`,
    [id]
  );
  await query(`UPDATE ${table} SET phone_number = ? WHERE id = ?`, [row?.number ?? null, id]);
}

// Replace a contact's numbers with what the form sent. A number that was already saved (same digits)
// keeps its status and call history; the order follows the form.
export async function savePhones(kind, id, organizationId, phones) {
  if (phones === undefined) return;
  const { column } = ownerOf(kind);
  const existing = await query(`SELECT * FROM contact_phones WHERE ${column} = ?`, [id]);
  const byDigits = new Map(existing.map((row) => [row.digits, row]));
  const keep = new Set();
  for (const [position, phone] of phones.entries()) {
    const old = byDigits.get(phone.digits);
    if (old) {
      keep.add(old.id);
      await query("UPDATE contact_phones SET number = ?, label = ?, position = ?, status = COALESCE(?, status) WHERE id = ?", [phone.number, phone.label, position, phone.status ?? null, old.id]);
    } else {
      await query(`INSERT INTO contact_phones (id, organization_id, ${column}, number, digits, label, status, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        createId("phone"), organizationId, id, phone.number, phone.digits, phone.label, phone.status ?? "not_called", position,
      ]);
    }
  }
  const remove = existing.filter((row) => !keep.has(row.id)).map((row) => row.id);
  if (remove.length) await query(`DELETE FROM contact_phones WHERE id IN (${remove.map(() => "?").join(", ")})`, remove);
  await syncPrimary(kind, id);
}

// Copy a lead's numbers (with their statuses) to the prospect made from it
export async function copyLeadPhones(leadId, prospectId, organizationId) {
  const rows = await query("SELECT * FROM contact_phones WHERE lead_id = ? ORDER BY position", [leadId]);
  for (const row of rows) {
    await query("INSERT INTO contact_phones (id, organization_id, prospect_id, number, digits, label, status, position, last_called_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
      createId("phone"), organizationId, prospectId, row.number, row.digits, row.label, row.status, row.position, row.last_called_at,
    ]);
  }
  if (rows.length) await syncPrimary("prospect", prospectId);
}

// One number's status after a call: "Bad number" etc. apply to that number only.
// `called: true` also stamps when it was last dialled.
export async function setPhoneStatus(user, kind, contactId, phoneId, { status, called = false }) {
  const { column } = ownerOf(kind);
  if (status !== undefined && !PHONE_STATUSES.some((option) => option.value === status)) throw new ApiError("Choose a valid number status.");
  const [row] = await query(`SELECT * FROM contact_phones WHERE id = ? AND ${column} = ?`, [phoneId, contactId]);
  if (!row) throw new ApiError("Phone number not found.", 404);
  await query(
    `UPDATE contact_phones SET ${status !== undefined ? "status = ?, status_changed_at = NOW(), status_changed_by = ?," : ""} last_called_at = ${called ? "NOW()" : "last_called_at"} WHERE id = ?`,
    status !== undefined ? [status, user.id, phoneId] : [phoneId]
  );
  await syncPrimary(kind, contactId);
  return (await phonesFor(kind, [contactId]))[contactId];
}

// The "Wrong Number" outcome (CRM / Leads dropdown, after-call disposition) is about one number, not
// the whole contact (client, Nov 9). It marks that number; the contact's outcome only becomes
// "Wrong Number" once none of its numbers can be called. `fields` is the parsed PATCH; returns it,
// without `outcome` when other numbers still work.
export async function applyWrongNumberOutcome(user, kind, contactId, fields, phoneId) {
  if (fields.outcome !== "Wrong Number") return fields;
  const phones = (await phonesFor(kind, [contactId]))[contactId] ?? [];
  if (!phones.length) return fields;
  const target = phoneId ? phones.find((phone) => phone.id === phoneId) : phones.length === 1 ? phones[0] : null;
  if (!target) throw new ApiError(phoneId ? "Phone number not found." : "This contact has several numbers. Choose which number is wrong.", phoneId ? 404 : 409);
  const after = await setPhoneStatus(user, kind, contactId, target.id, { status: "wrong" });
  if (after.some((phone) => phone.callable)) {
    const { outcome, ...rest } = fields;
    return rest;
  }
  return fields;
}
