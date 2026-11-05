import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { loadSettings, saveSettings } from "@/lib/settings";
import { STANDARD_PLAYBOOK_ID } from "@/lib/playbook-catalog";
import { CUSTOMER_ROLES } from "@/utils.js/roles";

// Customers share their company's custom playbooks; each sales rep sees only the ones they built.
// PitchProX staff can use every premium playbook without buying it.
const isStaff = (user) => !CUSTOMER_ROLES.includes(user.role);
const customScope = (user) =>
  isStaff(user)
    ? { sql: "(organization_id = ? AND created_by = ?)", values: [user.organizationId, user.id] }
    : { sql: "organization_id = ?", values: [user.organizationId] };

export const PREFERENCE_DEFAULTS = { fontSize: 110, defaultPlaybook: STANDARD_PLAYBOOK_ID };
const MAX_CONTENT_BYTES = 256 * 1024;
const STATUSES = new Set(["draft", "published"]);

const columns = "id, organization_id AS organizationId, kind, title, subtitle, description, price_cents AS priceCents, icon_letter AS iconLetter, avatar_url AS avatarUrl, status, created_by AS createdBy, created_at AS createdAt, updated_at AS updatedAt";
const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value) ?? null;

// Platform playbooks plus this organization's own, newest custom first
async function visibleRows(user) {
  const scope = customScope(user);
  return query(`SELECT ${columns} FROM playbooks WHERE organization_id IS NULL OR ${scope.sql} ORDER BY kind = 'custom' DESC, created_at ASC`, scope.values);
}

async function purchasedIds(user) {
  if (isStaff(user)) return new Set((await query("SELECT id FROM playbooks WHERE kind = 'premium'")).map((row) => row.id));
  const rows = await query("SELECT playbook_id AS playbookId FROM playbook_purchases WHERE organization_id = ?", [user.organizationId]);
  return new Set(rows.map((row) => row.playbookId));
}

// Can this organization run calls with the playbook? Standard always; premium
// once bought (payments aren't connected yet); custom when published.
function isAvailable(playbook, purchased) {
  if (playbook.kind === "standard") return true;
  if (playbook.kind === "premium") return purchased.has(playbook.id);
  return playbook.status === "published";
}

function present(playbook, purchased, activeId) {
  const { priceCents, organizationId, content, ...rest } = playbook;
  return {
    ...rest,
    price: priceCents == null ? null : `$${(priceCents / 100).toFixed(2)}`,
    isCustom: Boolean(organizationId),
    isAvailable: isAvailable(playbook, purchased),
    isActive: playbook.id === activeId,
    ...(content !== undefined && { content: parse(content) }),
  };
}

// The user's saved choice when they can still use it, otherwise Standard
async function resolveActiveId(user, rows, purchased) {
  const { defaultPlaybook } = await loadSettings(user.id, "preferences", PREFERENCE_DEFAULTS);
  const chosen = rows.find((row) => row.id === defaultPlaybook);
  return chosen && isAvailable(chosen, purchased) ? chosen.id : STANDARD_PLAYBOOK_ID;
}

export async function listPlaybooks(user) {
  const [rows, purchased] = await Promise.all([visibleRows(user), purchasedIds(user)]);
  const activeId = await resolveActiveId(user, rows, purchased);
  return { results: rows.map((row) => present(row, purchased, activeId)), activePlaybookId: activeId };
}

export async function getPlaybook(user, id) {
  const scope = customScope(user);
  const [row] = await query(`SELECT ${columns}, content FROM playbooks WHERE id = ? AND (organization_id IS NULL OR ${scope.sql})`, [id, ...scope.values]);
  if (!row) throw new ApiError("Playbook not found.", 404);
  const purchased = await purchasedIds(user);
  return present(row, purchased, await resolveActiveId(user, [row], purchased));
}

export async function setActivePlaybook(user, id) {
  const playbook = await getPlaybook(user, id);
  if (!playbook.isAvailable) {
    throw new ApiError(playbook.kind === "premium" ? "Purchase this playbook before using it." : "Publish this playbook before using it.");
  }
  await saveSettings(user.id, "preferences", PREFERENCE_DEFAULTS, { defaultPlaybook: playbook.id });
  return { ...playbook, isActive: true };
}

// Validate a wizard save: name, short description, status and the step data
function parseCustomBody(body, { partial }) {
  const fields = {};
  if (!partial || body.title !== undefined) {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) throw new ApiError("Give your playbook a name.");
    if (title.length > 255) throw new ApiError("Playbook name must be 255 characters or fewer.");
    fields.title = title;
  }
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") throw new ApiError("Description must be text.");
    const description = body.description?.trim() || null;
    if (description && description.length > 500) throw new ApiError("Description must be 500 characters or fewer.");
    fields.description = description;
  }
  if (!partial || body.status !== undefined) {
    const status = body.status ?? "draft";
    if (!STATUSES.has(status)) throw new ApiError("Status must be draft or published.");
    fields.status = status;
  }
  if (!partial || body.content !== undefined) {
    const content = body.content ?? {};
    if (typeof content !== "object" || Array.isArray(content)) throw new ApiError("Playbook content must be an object.");
    const json = JSON.stringify(content);
    if (Buffer.byteLength(json) > MAX_CONTENT_BYTES) throw new ApiError("This playbook is too large to save.");
    fields.content = json;
  }
  return fields;
}

export async function createCustomPlaybook(user, body) {
  const fields = parseCustomBody(body, { partial: false });
  const id = createId("playbook");
  await query("INSERT INTO playbooks (id, organization_id, kind, title, description, status, content, created_by) VALUES (?, ?, 'custom', ?, ?, ?, ?, ?)", [id, user.organizationId, fields.title, fields.description ?? null, fields.status, fields.content, user.id]);
  return id;
}

// Only the organization's own custom playbooks can be edited or deleted
async function requireOwnCustom(user, id) {
  const scope = customScope(user);
  const [row] = await query(`SELECT id FROM playbooks WHERE id = ? AND ${scope.sql} AND kind = 'custom'`, [id, ...scope.values]);
  if (row) return;
  const [platform] = await query("SELECT id FROM playbooks WHERE id = ? AND organization_id IS NULL", [id]);
  throw platform ? new ApiError("Platform playbooks can't be changed.", 403) : new ApiError("Playbook not found.", 404);
}

export async function updateCustomPlaybook(user, id, body) {
  await requireOwnCustom(user, id);
  const fields = parseCustomBody(body, { partial: true });
  const entries = Object.entries(fields);
  if (!entries.length) throw new ApiError("No updates supplied.");
  await query(`UPDATE playbooks SET ${entries.map(([column]) => `${column} = ?`).join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND organization_id = ?`, [...entries.map(([, value]) => value), id, user.organizationId]);
}

export async function deleteCustomPlaybook(user, id) {
  await requireOwnCustom(user, id);
  await query("DELETE FROM playbooks WHERE id = ? AND organization_id = ?", [id, user.organizationId]);
}
