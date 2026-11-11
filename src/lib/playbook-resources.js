import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { FOLLOW_UP_KINDS, TEMPLATE_PURPOSES } from "@/utils.js/follow-up";

// ── Resource Library (Playbook Builder phase 4, Spec 12 §6.5) ──
// Resources pinned once and shared by every playbook. Importing copies a resource into the
// playbook (keeping `libraryId` as the link), so later library edits never change a published
// version. Removing from the library only hides it from imports. Super Admin only (the routes
// call requireBuilder()).

export const RESOURCE_TYPES = ["Script", "Call Openers", "Email Template", "Objection Script", "Follow Up", "Guide", "Other"];
const ICON_COLORS = ["rose", "sky", "emerald", "amber", "purple", "teal", "blue"];
const FILE_URL = /^\/api\/v1\/admin\/playbook-builds\/files\/[\w-]+$/;
const MAX_CONTENT = 100_000;

const parse = (value) => (typeof value === "string" ? JSON.parse(value) : value);
const text = (value) => String(value ?? "").trim();

const SELECT = `SELECT lib.*, users.name AS addedByName FROM playbook_resource_library lib LEFT JOIN users ON users.id = lib.added_by`;

const present = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  description: row.description ?? "",
  content: row.content ?? "",
  iconColor: row.icon_color ?? "emerald",
  file: row.file ? parse(row.file) : null,
  ...(row.follow_up ? parse(row.follow_up) : {}),
  addedBy: row.addedByName ?? "—",
  addedById: row.added_by,
  addedAt: row.created_at,
  updatedAt: row.updated_at,
});

// A file chosen in the builder: { id, name, size, type, url } from POST playbook-builds/files
function cleanFile(file) {
  if (file == null) return null;
  if (typeof file !== "object" || !FILE_URL.test(String(file.url ?? ""))) throw new ApiError("Attach the file again (upload it from the resource window).");
  return { id: text(file.id).slice(0, 64), name: text(file.name).slice(0, 255), size: text(file.size).slice(0, 20), type: text(file.type).slice(0, 10), url: file.url };
}

function cleanResource(body = {}, existing = null) {
  const merged = { ...(existing ?? {}), ...body };
  const name = text(merged.name);
  if (!name) throw new ApiError("Give the resource a name.");
  if (name.length > 160) throw new ApiError("The resource name is too long (160 characters max).");
  const type = text(merged.type) || "Script";
  if (!RESOURCE_TYPES.includes(type)) throw new ApiError(`Choose a resource type: ${RESOURCE_TYPES.join(", ")}.`);
  const description = text(merged.description);
  if (description.length > 500) throw new ApiError("The short description is too long (500 characters max).");
  const content = text(merged.content);
  if (content.length > MAX_CONTENT) throw new ApiError("The resource text is too long (100,000 characters max).");
  const iconColor = ICON_COLORS.includes(merged.iconColor) ? merged.iconColor : "emerald";
  const file = cleanFile(merged.file);
  if (!content && !description && !file) throw new ApiError("Add some content, a description or a file before pinning.");
  // Email Template: purpose + subject. Follow Up: kind + the template purpose it uses.
  let followUp = null;
  if (type === "Email Template") followUp = { purpose: TEMPLATE_PURPOSES.includes(merged.purpose) ? merged.purpose : null, subject: text(merged.subject).slice(0, 200) || null };
  if (type === "Follow Up") followUp = { followUpKind: FOLLOW_UP_KINDS.some((kind) => kind.value === merged.followUpKind) ? merged.followUpKind : null, templatePurpose: TEMPLATE_PURPOSES.includes(merged.templatePurpose) ? merged.templatePurpose : null };
  return { name, type, description: description || null, content: content || null, iconColor, file, followUp };
}

async function findResource(id) {
  const [row] = await query(`${SELECT} WHERE lib.id = ? AND lib.removed_at IS NULL`, [id]);
  if (!row) throw new ApiError("That resource isn't in the library.", 404);
  return row;
}

// { search?, type?, addedBy? (user id) } → { resources, types, contributors }
export async function listLibrary({ search, type, addedBy } = {}) {
  const where = ["lib.removed_at IS NULL"];
  const values = [];
  const term = text(search).slice(0, 100);
  if (term) {
    where.push("(lib.name LIKE ? OR lib.description LIKE ? OR lib.content LIKE ?)");
    const like = `%${term.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
    values.push(like, like, like);
  }
  if (type) {
    if (!RESOURCE_TYPES.includes(type)) throw new ApiError("Unknown resource type.");
    where.push("lib.type = ?");
    values.push(type);
  }
  if (addedBy) {
    where.push("lib.added_by = ?");
    values.push(String(addedBy));
  }
  const [rows, contributors] = await Promise.all([
    query(`${SELECT} WHERE ${where.join(" AND ")} ORDER BY lib.created_at DESC, lib.id LIMIT 500`, values),
    query("SELECT DISTINCT users.id, users.name FROM playbook_resource_library lib JOIN users ON users.id = lib.added_by WHERE lib.removed_at IS NULL ORDER BY users.name"),
  ]);
  return { resources: rows.map(present), types: RESOURCE_TYPES, contributors };
}

// Pin a resource. Pinning the same name + type again returns the existing one (alreadyPinned).
export async function pinResource(user, body) {
  const resource = cleanResource(body);
  const [existing] = await query(`${SELECT} WHERE lib.removed_at IS NULL AND LOWER(lib.name) = LOWER(?) AND lib.type = ?`, [resource.name, resource.type]);
  if (existing) return { resource: present(existing), alreadyPinned: true };
  const id = createId("plres");
  await query(
    "INSERT INTO playbook_resource_library (id, name, type, description, content, icon_color, file, follow_up, added_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, resource.name, resource.type, resource.description, resource.content, resource.iconColor, resource.file ? JSON.stringify(resource.file) : null, resource.followUp ? JSON.stringify(resource.followUp) : null, user.id]
  );
  await recordAudit(user, { action: "playbook.resource_pinned", entityType: "playbook_resource", entityId: id, summary: `Pinned "${resource.name}" to the Resource Library` });
  return { resource: present(await findResource(id)), alreadyPinned: false };
}

export async function updateLibraryResource(user, id, body) {
  const row = await findResource(id);
  const resource = cleanResource(body, { name: row.name, type: row.type, description: row.description, content: row.content, iconColor: row.icon_color, file: row.file ? parse(row.file) : null, ...(row.follow_up ? parse(row.follow_up) : {}) });
  const [clash] = await query("SELECT id FROM playbook_resource_library WHERE removed_at IS NULL AND id <> ? AND LOWER(name) = LOWER(?) AND type = ?", [id, resource.name, resource.type]);
  if (clash) throw new ApiError("Another library resource already has that name and type.", 409);
  await query(
    "UPDATE playbook_resource_library SET name = ?, type = ?, description = ?, content = ?, icon_color = ?, file = ?, follow_up = ? WHERE id = ?",
    [resource.name, resource.type, resource.description, resource.content, resource.iconColor, resource.file ? JSON.stringify(resource.file) : null, resource.followUp ? JSON.stringify(resource.followUp) : null, id]
  );
  await recordAudit(user, { action: "playbook.resource_updated", entityType: "playbook_resource", entityId: id, summary: `Updated "${resource.name}" in the Resource Library` });
  return { resource: present(await findResource(id)) };
}

// Hidden from imports; playbooks that already imported it keep their copy
export async function removeLibraryResource(user, id) {
  const row = await findResource(id);
  await query("UPDATE playbook_resource_library SET removed_at = NOW() WHERE id = ?", [id]);
  await recordAudit(user, { action: "playbook.resource_removed", entityType: "playbook_resource", entityId: id, summary: `Removed "${row.name}" from the Resource Library` });
  return { removed: true };
}
