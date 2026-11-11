import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { loadSettings, saveSettings } from "@/lib/settings";
import { STANDARD_PLAYBOOK_ID } from "@/lib/playbook-catalog";
import { CUSTOMER_ROLES } from "@/utils.js/roles";
import { aiPlaybook, playbookInside, playbookOverview } from "@/lib/playbook-runtime";

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

const columns = "id, organization_id AS organizationId, kind, title, subtitle, description, price_cents AS priceCents, icon_letter AS iconLetter, avatar_url AS avatarUrl, status, version, active_version_id AS activeVersionId, created_by AS createdBy, created_at AS createdAt, updated_at AS updatedAt";
const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value) ?? null;

// Which platform playbooks a user sees (set when publishing from the builder): customers only
// Marketplace ones; employees also Team / Organization ones; Private stays with Super Admins.
// The seeded playbooks have no visibility and are shown to everyone.
const platformVisibility = (user) => (isStaff(user) ? "(visibility IS NULL OR visibility IN ('marketplace', 'team', 'organization'))" : "(visibility IS NULL OR visibility = 'marketplace')");

// Platform playbooks plus this organization's own, newest custom first
async function visibleRows(user) {
  const scope = customScope(user);
  return query(`SELECT ${columns} FROM playbooks WHERE (organization_id IS NULL AND ${platformVisibility(user)}) OR ${scope.sql} ORDER BY kind = 'custom' DESC, created_at ASC`, scope.values);
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
  // A premium playbook published as Free (no price) is open to everyone
  if (playbook.kind === "premium") return playbook.priceCents == null || purchased.has(playbook.id);
  return playbook.status === "published";
}

function present(playbook, purchased, activeId, compiled = null) {
  const { priceCents, organizationId, content, activeVersionId, ...rest } = playbook;
  return {
    ...rest,
    price: priceCents == null ? (playbook.kind === "premium" ? "Free" : null) : `$${(priceCents / 100).toFixed(2)}`,
    // Facts from the published version (playbooks published from the Super Admin builder)
    overview: playbookOverview(compiled),
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

// Compiled PremiumPlaybook objects of the versions in force, by playbook id
async function compiledVersions(rows) {
  const ids = rows.map((row) => row.activeVersionId).filter(Boolean);
  if (!ids.length) return new Map();
  const versions = await query(`SELECT id, playbook_id AS playbookId, content FROM playbook_versions WHERE id IN (${ids.map(() => "?").join(", ")})`, ids);
  return new Map(versions.map((version) => [version.playbookId, parse(version.content)]));
}

export async function listPlaybooks(user) {
  const [rows, purchased] = await Promise.all([visibleRows(user), purchasedIds(user)]);
  const [activeId, compiled] = await Promise.all([resolveActiveId(user, rows, purchased), compiledVersions(rows)]);
  return { results: rows.map((row) => present(row, purchased, activeId, compiled.get(row.id))), activePlaybookId: activeId };
}

export async function getPlaybook(user, id) {
  const scope = customScope(user);
  const [row] = await query(`SELECT ${columns}, content FROM playbooks WHERE id = ? AND ((organization_id IS NULL AND ${platformVisibility(user)}) OR ${scope.sql})`, [id, ...scope.values]);
  if (!row) throw new ApiError("Playbook not found.", 404);
  const purchased = await purchasedIds(user);
  const compiled = (await compiledVersions([row])).get(row.id) ?? null;
  const playbook = present(row, purchased, await resolveActiveId(user, [row], purchased), compiled);
  // Buyers (and staff, and free playbooks) can read what's inside; everyone else sees the overview
  return { ...playbook, inside: playbook.isAvailable ? playbookInside(compiled) : null };
}

// What the live-call AI loads for this user: the active playbook's version in force, AI-safe
// (Spec 12 §11: price, access, cover art, marketplace text and internal notes removed).
// Playbooks that were never published from the builder (the seeded ones, custom ones) have no
// compiled version yet: `playbook` is null and the AI uses its built-in methodology for them.
export async function activePlaybookRuntime(user) {
  const { results, activePlaybookId } = await listPlaybooks(user);
  const active = results.find((item) => item.id === activePlaybookId);
  const [row] = await query("SELECT active_version_id AS activeVersionId, version FROM playbooks WHERE id = ?", [activePlaybookId]);
  const compiled = row?.activeVersionId ? (await query("SELECT content FROM playbook_versions WHERE id = ?", [row.activeVersionId]))[0] : null;
  return {
    playbookId: activePlaybookId,
    title: active?.title ?? null,
    kind: active?.kind ?? null,
    version: row?.version ?? null,
    playbook: compiled ? aiPlaybook(parse(compiled.content)) : null,
  };
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
