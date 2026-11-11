import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { deleteUpload, formatBytes, readUpload, saveUpload } from "@/lib/storage";
import { ROLE_LABELS, ROLES } from "@/utils.js/roles";
import { ownerOptions } from "@/lib/compliance/policies";
import { EVIDENCE_FILE_MAX_BYTES, EVIDENCE_FILE_TYPES, TRUST_SERVICE_CRITERIA } from "@/lib/compliance/evidence-catalog";

// ── Evidence Repository (Compliance & Audit) ──
// Upload → Under Review; Save as Draft → Draft; Verify → Verified (Verified By / At automatic);
// Request Changes → Needs Changes; a Verified item past its expiry date shows as Expired
// (client item 201); Archive keeps it out of the counts (233–234). Only drafts are deleted.
// Super Admin and Admin Manager manage; Auditors read.

const STORAGE_AREA = "compliance-evidence";
const DAY = 86400000;
const parseJson = (value) => (typeof value === "string" ? JSON.parse(value) : value) ?? [];
const today = () => new Date().toISOString().slice(0, 10);
const dateText = (value) => (value ? new Date(value).toISOString().slice(0, 10) : null);
const reference = (number) => `EV-${String(number).padStart(3, "0")}`;
const text = (value, label, max, { required = false } = {}) => {
  const clean = String(value ?? "").trim();
  if (required && !clean) throw new ApiError(`Enter ${label}.`);
  if (clean.length > max) throw new ApiError(`${label[0].toUpperCase()}${label.slice(1)} is too long (${max} characters max).`);
  return clean || null;
};

// Stored status → shown status (Verified past its date = Expired)
export const shownStatus = (row) => (row.status === "Verified" && row.expires_on && dateText(row.expires_on) < today() ? "Expired" : row.status);

const SELECT = `SELECT evidence_items.*, owner.name AS ownerName, owner.role AS ownerRole, verifier.name AS verifierName, creator.name AS creatorName,
  latest.id AS versionId, latest.version AS latestVersion, latest.file_name AS fileName, latest.file_size AS fileSize, latest.file_mime AS fileMime,
  latest.uploaded_at AS uploadedAt, uploader.name AS uploaderName
  FROM evidence_items
  LEFT JOIN users AS owner ON owner.id = evidence_items.owner_id
  LEFT JOIN users AS verifier ON verifier.id = evidence_items.verified_by
  LEFT JOIN users AS creator ON creator.id = evidence_items.created_by
  LEFT JOIN evidence_versions AS latest ON latest.evidence_id = evidence_items.id AND latest.version = (SELECT MAX(version) FROM evidence_versions WHERE evidence_versions.evidence_id = evidence_items.id)
  LEFT JOIN users AS uploader ON uploader.id = latest.uploaded_by`;

function toEvidence(row) {
  const status = shownStatus(row);
  const expires = dateText(row.expires_on);
  return {
    id: row.id,
    reference: reference(row.number),
    name: row.title,
    description: row.description ?? "",
    criteria: parseJson(row.criteria),
    controls: parseJson(row.controls),
    owner: row.owner_id ? { id: row.owner_id, name: row.ownerName, role: ROLE_LABELS[row.ownerRole] ?? row.ownerRole } : null,
    status,
    period: row.evidence_period,
    expiresOn: expires,
    daysRemaining: expires ? Math.round((Date.parse(`${expires}T12:00:00`) - Date.now()) / DAY) : null,
    verificationNote: row.verification_note,
    verifiedBy: row.verifierName ?? null,
    verifiedAt: row.verified_at,
    file: row.versionId ? { versionId: row.versionId, version: row.latestVersion, name: row.fileName, size: formatBytes(Number(row.fileSize)), type: (row.fileName.split(".").pop() || "").toLowerCase(), mime: row.fileMime } : null,
    uploadedBy: row.uploaderName ?? row.creatorName ?? null,
    uploadedAt: row.uploadedAt ?? row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
}

// Valid SOC 2 control ids from the library
async function controlIds() {
  return (await query("SELECT id FROM soc2_controls ORDER BY sort_order")).map((row) => row.id);
}

export async function listEvidence(user) {
  const items = (await query(`${SELECT} ORDER BY evidence_items.updated_at DESC`)).map(toEvidence);
  const live = items.filter((item) => item.status !== "Archived");
  const soon = live.filter((item) => item.status === "Verified" && item.daysRemaining !== null && item.daysRemaining <= 30);
  const types = new Map();
  for (const item of live) {
    const type = item.file?.type ? item.file.type.toUpperCase() : "No file";
    types.set(type, (types.get(type) ?? 0) + 1);
  }
  return {
    results: items,
    // Counts leave archived evidence out (client items 233–234)
    stats: {
      total: live.length,
      verified: live.filter((item) => item.status === "Verified").length,
      underReview: live.filter((item) => item.status === "Under Review").length,
      needsAttention: live.filter((item) => ["Needs Changes", "Expired"].includes(item.status)).length + soon.length,
      expiringSoon: soon.length,
      expired: live.filter((item) => item.status === "Expired").length,
    },
    byType: [...types.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
    recent: live.filter((item) => item.file).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 5).map((item) => ({ id: item.id, name: item.name, file: item.file, uploadedBy: item.uploadedBy, uploadedAt: item.uploadedAt })),
    controls: await query("SELECT id, name, criteria FROM soc2_controls ORDER BY sort_order"),
    owners: await ownerOptions(),
    permissions: { manage: user.role !== ROLES.AUDITOR },
  };
}

async function findEvidence(id) {
  const [row] = await query(`${SELECT} WHERE evidence_items.id = ?`, [id]);
  if (!row) throw new ApiError("Evidence not found.", 404);
  return row;
}

export async function getEvidence(user, id) {
  const evidence = toEvidence(await findEvidence(id));
  const versions = await query(
    "SELECT evidence_versions.id, evidence_versions.version, evidence_versions.file_name AS name, evidence_versions.file_size AS size, evidence_versions.note, evidence_versions.uploaded_at AS uploadedAt, users.name AS uploadedBy FROM evidence_versions LEFT JOIN users ON users.id = evidence_versions.uploaded_by WHERE evidence_id = ? ORDER BY version DESC",
    [id]
  );
  return { evidence: { ...evidence, versions: versions.map((version) => ({ ...version, size: formatBytes(Number(version.size)) })) }, permissions: { manage: user.role !== ROLES.AUDITOR } };
}

// Shared field rules for upload and edit (form or JSON values)
async function cleanFields(input, existing = {}) {
  const has = (key) => input[key] !== undefined && input[key] !== null;
  const list = (value) => (Array.isArray(value) ? value : typeof value === "string" && value ? (value.startsWith("[") ? JSON.parse(value) : value.split(",")) : []).map((item) => String(item).trim()).filter(Boolean);
  const title = has("name") ? text(input.name, "an evidence name", 255, { required: true }) : existing.title;
  const description = has("description") ? text(input.description, "the description", 5000) : existing.description ?? null;
  const criteria = has("criteria") ? [...new Set(list(input.criteria))] : parseJson(existing.criteria);
  if (!criteria.length) throw new ApiError("Choose at least one Trust Service Criteria.");
  if (criteria.some((item) => !TRUST_SERVICE_CRITERIA.includes(item))) throw new ApiError("Unknown Trust Service Criteria.");
  const controls = has("controls") ? [...new Set(list(input.controls))] : parseJson(existing.controls);
  if (!controls.length) throw new ApiError("Choose at least one associated control.");
  const known = await controlIds();
  if (controls.some((item) => !known.includes(item))) throw new ApiError("One of the controls isn't in the SOC 2 control library.");
  let ownerId = has("ownerId") ? input.ownerId || null : existing.owner_id ?? null;
  if (ownerId && !(await ownerOptions()).some((owner) => owner.id === ownerId)) throw new ApiError("The evidence owner must be a Super Admin or Admin Manager.");
  // Evidence Expiration: "never" (Does Not Expire) or "on" with a date
  let expiresOn = existing.expires_on ? dateText(existing.expires_on) : null;
  if (has("expires")) {
    if (input.expires === "never") expiresOn = null;
    else if (input.expires === "on") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.expiryDate ?? ""))) throw new ApiError("Choose an expiration date, or select Does Not Expire.");
      expiresOn = input.expiryDate;
    } else throw new ApiError("Choose when the evidence expires.");
  }
  const period = has("period") ? text(input.period, "the evidence period", 80) : existing.evidence_period ?? null;
  return { title, description, criteria, controls, ownerId, expiresOn, period };
}

const formFields = (form) => Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === "string"));
const saveFile = (file) => saveUpload(STORAGE_AREA, file, { maxBytes: EVIDENCE_FILE_MAX_BYTES, allowed: EVIDENCE_FILE_TYPES });
const hasFile = (file) => file && typeof file !== "string" && file.size;

async function addVersion(user, evidenceId, file, note) {
  const saved = await saveFile(file);
  const [{ next }] = await query("SELECT COALESCE(MAX(version), 0) + 1 AS next FROM evidence_versions WHERE evidence_id = ?", [evidenceId]);
  await query("INSERT INTO evidence_versions (id, evidence_id, version, file_path, file_name, file_size, file_mime, note, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [createId("evv"), evidenceId, next, saved.storagePath, saved.name, saved.size, saved.mime, note, user.id]);
  return next;
}

// Upload Evidence (multipart): action "submit" → Under Review (a file is required); "draft" → Draft
export async function uploadEvidence(user, form) {
  const fields = await cleanFields({ expires: "never", ...formFields(form) });
  const submitting = form.get("action") !== "draft";
  const file = form.get("file");
  if (submitting && !hasFile(file)) throw new ApiError("Attach the evidence file before submitting it for review.");
  const id = createId("ev");
  await query(
    "INSERT INTO evidence_items (id, title, description, criteria, controls, owner_id, status, evidence_period, expires_on, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, fields.title, fields.description, JSON.stringify(fields.criteria), JSON.stringify(fields.controls), fields.ownerId ?? user.id, submitting ? "Under Review" : "Draft", fields.period, fields.expiresOn, user.id]
  );
  if (hasFile(file)) await addVersion(user, id, file, null);
  const row = await findEvidence(id);
  await recordAudit(user, { action: submitting ? "evidence.submitted" : "evidence.drafted", entityType: "evidence", entityId: id, summary: `${submitting ? "Uploaded" : "Saved a draft of"} ${reference(row.number)} ${fields.title} (${fields.controls.join(", ")})` });
  return getEvidence(user, id);
}

// Edit details (Draft or Needs Changes only, so verified evidence isn't changed silently)
export async function updateEvidence(user, id, body) {
  const row = await findEvidence(id);
  const status = shownStatus(row);
  const detailsOnly = Object.keys(body).every((key) => ["ownerId"].includes(key));
  if (!detailsOnly && !["Draft", "Needs Changes"].includes(status)) throw new ApiError("Only a Draft or Needs Changes item can be edited. Upload a new version instead.", 409);
  const fields = await cleanFields(body, row);
  await query("UPDATE evidence_items SET title = ?, description = ?, criteria = ?, controls = ?, owner_id = ?, evidence_period = ?, expires_on = ? WHERE id = ?", [fields.title, fields.description, JSON.stringify(fields.criteria), JSON.stringify(fields.controls), fields.ownerId, fields.period, fields.expiresOn, id]);
  await recordAudit(user, { action: "evidence.updated", entityType: "evidence", entityId: id, summary: `Updated ${reference(row.number)} ${fields.title}` });
  return getEvidence(user, id);
}

// Upload New Version: keeps the old file; the item goes back to Under Review
export async function uploadEvidenceVersion(user, id, form) {
  const row = await findEvidence(id);
  if (row.status === "Archived") throw new ApiError("Restore this evidence before adding a version.", 409);
  const file = form.get("file");
  if (!hasFile(file)) throw new ApiError("Choose the new file.");
  const fields = form.get("expires") ? await cleanFields(formFields(form), row) : null;
  const version = await addVersion(user, id, file, text(form.get("note"), "the version note", 500));
  await query("UPDATE evidence_items SET status = 'Under Review', verified_by = NULL, verified_at = NULL, verification_note = NULL, expires_on = ? WHERE id = ?", [fields ? fields.expiresOn : row.expires_on, id]);
  await recordAudit(user, { action: "evidence.version_uploaded", entityType: "evidence", entityId: id, summary: `Uploaded version ${version} of ${reference(row.number)} ${row.title}; it's back under review` });
  return getEvidence(user, id);
}

// submit | verify (note) | request_changes (note required) | archive | restore
export async function evidenceAction(user, id, { action, note }) {
  const row = await findEvidence(id);
  const status = shownStatus(row);
  const ref = `${reference(row.number)} ${row.title}`;
  const cleanNote = text(note, "the note", 1000);
  if (action === "submit") {
    if (!["Draft", "Needs Changes"].includes(status)) throw new ApiError("Only a Draft or Needs Changes item can be submitted.", 409);
    if (!row.versionId) throw new ApiError("Attach the evidence file before submitting it for review.");
    await query("UPDATE evidence_items SET status = 'Under Review' WHERE id = ?", [id]);
    await recordAudit(user, { action: "evidence.submitted", entityType: "evidence", entityId: id, summary: `Submitted ${ref} for review` });
  } else if (action === "verify") {
    if (status !== "Under Review") throw new ApiError("Only evidence under review can be verified.", 409);
    if (row.expires_on && dateText(row.expires_on) < today()) throw new ApiError("The expiration date has passed. Upload a current version first.", 409);
    await query("UPDATE evidence_items SET status = 'Verified', verified_by = ?, verified_at = NOW(), verification_note = ? WHERE id = ?", [user.id, cleanNote, id]);
    await recordAudit(user, { action: "evidence.verified", entityType: "evidence", entityId: id, summary: `Verified ${ref}` });
  } else if (action === "request_changes") {
    if (status !== "Under Review") throw new ApiError("Only evidence under review can be sent back.", 409);
    if (!cleanNote) throw new ApiError("Add a note saying what needs to change.");
    await query("UPDATE evidence_items SET status = 'Needs Changes', verification_note = ? WHERE id = ?", [cleanNote, id]);
    await recordAudit(user, { action: "evidence.changes_requested", entityType: "evidence", entityId: id, summary: `Requested changes to ${ref}: ${cleanNote}` });
  } else if (action === "archive") {
    if (status === "Archived") throw new ApiError("Already archived.", 409);
    if (status === "Draft") throw new ApiError("Delete a draft instead of archiving it.", 409);
    await query("UPDATE evidence_items SET status = 'Archived', archived_at = NOW() WHERE id = ?", [id]);
    await recordAudit(user, { action: "evidence.archived", entityType: "evidence", entityId: id, summary: `Archived ${ref}` });
  } else if (action === "restore") {
    if (status !== "Archived") throw new ApiError("Only archived evidence can be restored.", 409);
    await query("UPDATE evidence_items SET status = 'Under Review', archived_at = NULL, verified_by = NULL, verified_at = NULL WHERE id = ?", [id]);
    await recordAudit(user, { action: "evidence.restored", entityType: "evidence", entityId: id, summary: `Restored ${ref} for review` });
  } else {
    throw new ApiError("Unknown action.");
  }
  return getEvidence(user, id);
}

// Only drafts are deleted (everything else is archived, client item)
export async function deleteEvidence(user, id) {
  const row = await findEvidence(id);
  if (row.status !== "Draft") throw new ApiError("Only drafts can be deleted. Archive it instead.", 409);
  const files = await query("SELECT file_path FROM evidence_versions WHERE evidence_id = ?", [id]);
  await query("DELETE FROM evidence_items WHERE id = ?", [id]);
  for (const file of files) await deleteUpload(file.file_path);
  await recordAudit(user, { action: "evidence.deleted", entityType: "evidence", entityId: id, summary: `Deleted the draft ${reference(row.number)} ${row.title}` });
  return { deleted: true };
}

export async function evidenceFile(id, versionId) {
  const [file] = await query(
    versionId ? "SELECT file_path, file_name, file_mime FROM evidence_versions WHERE evidence_id = ? AND id = ?" : "SELECT file_path, file_name, file_mime FROM evidence_versions WHERE evidence_id = ? ORDER BY version DESC LIMIT 1",
    versionId ? [id, versionId] : [id]
  );
  if (!file) throw new ApiError("File not found.", 404);
  return { bytes: await readUpload(file.file_path), name: file.file_name, mime: file.file_mime || "application/octet-stream" };
}
