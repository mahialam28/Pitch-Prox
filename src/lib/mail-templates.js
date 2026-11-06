import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { assertCanWrite } from "@/lib/permissions";
import { allTemplates } from "@/lib/catalogs/mail-template-catalog";
import { ROLES } from "@/utils.js/roles";

// ── Staff email templates (Mail → Templates) ──
// Three kinds, listed together:
//   library  — the built-in PitchProX templates (read-only, in lib/catalogs)
//   team     — written by a Super Admin or Admin Manager, visible to every employee
//   personal — written by any employee, visible only to them

export const TEMPLATE_CATEGORIES = ["Follow Up", "Product", "Trial", "Pricing", "Meeting", "Appreciation", "Onboarding", "Support", "Other"];
const canShare = (user) => [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER].includes(user.role);
const canChange = (user, row) => (row.scope === "personal" ? row.ownerId === user.id : canShare(user));

const preview = (body) => {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > 110 ? `${flat.slice(0, 107)}...` : flat;
};
const COLUMNS = "mail_templates.id, mail_templates.scope, mail_templates.owner_id AS ownerId, mail_templates.title, mail_templates.category, mail_templates.subject, mail_templates.body, mail_templates.created_at AS createdAt, mail_templates.updated_at AS updatedAt, users.name AS authorName";

const toTemplate = (row, user) => ({ ...row, preview: preview(row.body), canEdit: canChange(user, row) });
const LIBRARY = allTemplates.map((template) => ({ ...template, scope: "library", ownerId: null, authorName: "PitchProX", canEdit: false }));

export async function listTemplates(user) {
  const rows = await query(
    `SELECT ${COLUMNS} FROM mail_templates LEFT JOIN users ON users.id = mail_templates.owner_id WHERE mail_templates.scope = 'team' OR mail_templates.owner_id = ? ORDER BY mail_templates.scope = 'personal' DESC, mail_templates.updated_at DESC, mail_templates.created_at DESC`,
    [user.id]
  );
  return { results: [...rows.map((row) => toTemplate(row, user)), ...LIBRARY], categories: TEMPLATE_CATEGORIES, canShare: canShare(user) };
}

async function loadTemplate(user, id) {
  const [row] = await query(`SELECT ${COLUMNS} FROM mail_templates LEFT JOIN users ON users.id = mail_templates.owner_id WHERE mail_templates.id = ?`, [id]);
  // Someone else's personal template doesn't exist as far as this user is concerned
  if (!row || (row.scope === "personal" && row.ownerId !== user.id)) throw new ApiError("Template not found.", 404);
  return row;
}

export async function getTemplate(user, id) {
  const builtIn = LIBRARY.find((template) => template.id === id);
  return builtIn ?? toTemplate(await loadTemplate(user, id), user);
}

const cleanText = (value, label, max) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed;
};

function fields(body, existing = {}) {
  const category = body.category ?? existing.category ?? "Other";
  if (!TEMPLATE_CATEGORIES.includes(category)) throw new ApiError("Choose a valid category.");
  return {
    title: body.title === undefined ? existing.title : cleanText(body.title, "Template name", 120),
    category,
    subject: body.subject === undefined ? existing.subject : cleanText(body.subject, "Subject", 255),
    body: body.body === undefined ? existing.body : cleanText(body.body, "Message", 20000),
  };
}

export async function createTemplate(user, body) {
  assertCanWrite(user);
  const scope = body?.scope === "team" ? "team" : "personal";
  if (scope === "team" && !canShare(user)) throw new ApiError("Only a Super Admin or Admin Manager can share templates with the team.", 403);
  const item = fields(body ?? {});
  const id = createId("mailtpl");
  await query("INSERT INTO mail_templates (id, scope, owner_id, title, category, subject, body) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, scope, user.id, item.title, item.category, item.subject, item.body]);
  if (scope === "team") await recordAudit(user, { action: "mail.template_created", entityType: "mail_template", entityId: id, summary: `Shared the email template "${item.title}" with the team` });
  return getTemplate(user, id);
}

// Text changes; { scope } moves a template between personal and team (managers only)
export async function updateTemplate(user, id, body) {
  assertCanWrite(user);
  if (LIBRARY.some((template) => template.id === id)) throw new ApiError("Built-in templates can't be changed. Save a copy instead.", 403);
  const row = await loadTemplate(user, id);
  if (!canChange(user, row)) throw new ApiError("You can't change this template.", 403);
  const item = fields(body ?? {}, row);
  let scope = row.scope;
  if (body.scope !== undefined && body.scope !== row.scope) {
    if (!canShare(user) || !["team", "personal"].includes(body.scope)) throw new ApiError("Only a Super Admin or Admin Manager can share templates with the team.", 403);
    scope = body.scope;
  }
  await query("UPDATE mail_templates SET scope = ?, title = ?, category = ?, subject = ?, body = ?, updated_at = NOW() WHERE id = ?", [scope, item.title, item.category, item.subject, item.body, id]);
  if (scope === "team" || row.scope === "team") await recordAudit(user, { action: "mail.template_updated", entityType: "mail_template", entityId: id, summary: `Updated the team email template "${item.title}"${scope !== row.scope ? (scope === "team" ? " (now shared)" : " (no longer shared)") : ""}` });
  return getTemplate(user, id);
}

export async function deleteTemplate(user, id) {
  assertCanWrite(user);
  if (LIBRARY.some((template) => template.id === id)) throw new ApiError("Built-in templates can't be deleted.", 403);
  const row = await loadTemplate(user, id);
  if (!canChange(user, row)) throw new ApiError("You can't delete this template.", 403);
  await query("DELETE FROM mail_templates WHERE id = ?", [id]);
  if (row.scope === "team") await recordAudit(user, { action: "mail.template_deleted", entityType: "mail_template", entityId: id, summary: `Deleted the team email template "${row.title}"` });
}
