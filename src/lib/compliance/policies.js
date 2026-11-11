import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { requireSection, assertCanWrite } from "@/lib/permissions";
import { requestClient } from "@/lib/auth";
import { deleteUpload, formatBytes, readUpload, saveUpload } from "@/lib/storage";
import { queueEmail } from "@/lib/campaigns/outbox";
import { notify, portalHome, superAdmins, usersWithRoles } from "@/lib/notifications";
import { ROLES, canAccessSection } from "@/utils.js/roles";
import {
  DEFAULT_ACK_DUE_DAYS,
  POLICY_FILE_MAX_BYTES,
  POLICY_FILE_TYPES,
  POLICY_STATUS_LABELS,
  POLICY_TOPICS,
  VERSION_STATUS_LABELS,
  compareVersions,
  displayVersion,
  nextVersion,
  normalizeVersion,
} from "@/lib/compliance/policy-catalog";

// ── Policy Documents (Compliance & Audit) ──
// A policy has versions (policy_versions). New versions go Draft → Under Review → Approved;
// only a Super Admin approves or sends one back. The approved version is copied onto
// policy_documents, which is what onboarding shows and what employees sign
// (policy_acknowledgments is keyed by version, so a new version asks everyone again).
// Super Admin and Admin Manager manage policies; Auditors read.

const DAY = 86400000;
const STORAGE_AREA = "compliance-policies";
const PENDING = ["draft", "under_review", "rejected"];
const parseJson = (value) => (typeof value === "string" ? JSON.parse(value) : value);
const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
const dateText = (value) => (value ? new Date(value).toISOString().slice(0, 10) : null);

export const requireCompliance = () => requireSection("compliance");
export async function requireComplianceWriter() {
  const user = await requireSection("compliance");
  assertCanWrite(user);
  return user;
}
const assertSuperAdmin = (user, what) => {
  if (user.role !== ROLES.SUPER_ADMIN) throw new ApiError(`Only a Super Admin can ${what}.`, 403);
};
const canManage = (user) => canAccessSection(user.role, "compliance") && user.role !== ROLES.AUDITOR;

// ── Acknowledgments ──
// Every active employee signs each published policy that requires it. A signature is due
// `ack_due_days` after the version was approved (or after the employee joined, if later).
async function acknowledgmentRows(policyId = null) {
  return query(
    `SELECT policy_documents.id AS policyId, users.id AS userId, users.name, users.email, users.role,
       ack.created_at AS acknowledgedAt,
       DATE_ADD(GREATEST(policy_documents.approved_at, users.created_at), INTERVAL policy_documents.ack_due_days DAY) AS dueAt
     FROM policy_documents
     JOIN staff_profiles ON staff_profiles.status = 'active'
     JOIN users ON users.id = staff_profiles.user_id
     LEFT JOIN policy_acknowledgments AS ack ON ack.policy_id = policy_documents.id AND ack.version = policy_documents.version AND ack.user_id = users.id
     WHERE policy_documents.status = 'published' AND policy_documents.required = 1 ${policyId ? "AND policy_documents.id = ?" : ""}`,
    policyId ? [policyId] : []
  );
}

function summarize(rows) {
  const now = Date.now();
  const acknowledged = rows.filter((row) => row.acknowledgedAt).length;
  const overdue = rows.filter((row) => !row.acknowledgedAt && new Date(row.dueAt).getTime() < now).length;
  return { total: rows.length, acknowledged, pending: rows.length - acknowledged - overdue, overdue, rate: rows.length ? Math.round((acknowledged / rows.length) * 100) : null };
}

// ── Reading ──
const POLICY_SELECT = `SELECT policy_documents.id, policy_documents.title, policy_documents.topic, policy_documents.description, policy_documents.version,
  policy_documents.status, policy_documents.required, policy_documents.effective_date AS effectiveDate, policy_documents.next_review_date AS nextReviewDate,
  policy_documents.approved_at AS approvedAt, policy_documents.updated_at AS updatedAt, policy_documents.created_at AS createdAt, policy_documents.ack_due_days AS ackDueDays, policy_documents.created_by AS createdBy,
  policy_documents.current_version_id AS currentVersionId, policy_documents.category AS onboardingStep, policy_documents.body,
  owner.id AS ownerId, owner.name AS ownerName
  FROM policy_documents LEFT JOIN users AS owner ON owner.id = policy_documents.owner_id`;

const VERSION_SELECT = `SELECT policy_versions.*, creator.name AS createdByName, submitter.name AS submittedByName, decider.name AS decidedByName
  FROM policy_versions
  LEFT JOIN users AS creator ON creator.id = policy_versions.created_by
  LEFT JOIN users AS submitter ON submitter.id = policy_versions.submitted_by
  LEFT JOIN users AS decider ON decider.id = policy_versions.decided_by`;

const toVersion = (row) => ({
  id: row.id,
  version: row.version,
  versionLabel: displayVersion(row.version),
  status: row.status,
  statusLabel: VERSION_STATUS_LABELS[row.status] ?? row.status,
  title: row.title,
  topic: row.topic,
  description: row.description,
  sections: parseJson(row.body) ?? [],
  effectiveDate: dateText(row.effective_date),
  nextReviewDate: dateText(row.next_review_date),
  required: Boolean(row.required),
  file: row.file_path ? { name: row.file_name, size: formatBytes(Number(row.file_size)), mime: row.file_mime, isPdf: row.file_mime === "application/pdf" || /\.pdf$/i.test(row.file_name ?? "") } : null,
  changeNote: row.change_note,
  reviewNote: row.review_note,
  restoredFrom: row.restored_from,
  createdBy: row.createdByName ?? (row.created_by ? "Former employee" : "PitchProX"),
  createdAt: row.created_at,
  submittedBy: row.submittedByName ?? null,
  submittedAt: row.submitted_at,
  decidedBy: row.decidedByName ?? null,
  decidedAt: row.decided_at,
});

function toPolicy(row, versions, acks) {
  const pending = versions.find((version) => PENDING.includes(version.status)) ?? null;
  const current = versions.find((version) => version.id === row.currentVersionId) ?? null;
  // What the table shows: the version in force, or the one being prepared for a new policy
  const shown = current ?? pending ?? versions[0] ?? null;
  return {
    id: row.id,
    name: row.title,
    description: row.description ?? "",
    category: row.topic ?? "Compliance",
    version: displayVersion(row.version),
    status: POLICY_STATUS_LABELS[row.status] ?? row.status,
    statusKey: row.status,
    requireAcknowledgment: Boolean(row.required),
    effectiveDate: dateText(row.effectiveDate),
    lastUpdated: row.updatedAt,
    nextReviewDate: dateText(row.nextReviewDate),
    reviewOverdue: Boolean(row.status === "published" && row.nextReviewDate && new Date(row.nextReviewDate).getTime() < Date.now()),
    approvedAt: row.approvedAt,
    owner: row.ownerId ? { id: row.ownerId, name: row.ownerName } : null,
    acknowledgment: row.status === "published" && row.required ? acks : null,
    file: shown?.file ?? null,
    pendingVersion: pending ? { id: pending.id, version: pending.versionLabel, status: pending.status, statusLabel: pending.statusLabel, submittedBy: pending.submittedBy, submittedAt: pending.submittedAt, reviewNote: pending.reviewNote } : null,
  };
}

async function loadVersions(policyIds) {
  if (!policyIds.length) return [];
  return query(`${VERSION_SELECT} WHERE policy_versions.policy_id IN (${policyIds.map(() => "?").join(", ")}) ORDER BY policy_versions.created_at DESC`, policyIds);
}

// Table rows, KPI cards, Pending Approvals and the overdue count
export async function listPolicies(user) {
  const rows = await query(`${POLICY_SELECT} ORDER BY policy_documents.status = 'archived', policy_documents.updated_at DESC`);
  const versions = await loadVersions(rows.map((row) => row.id));
  const ackRows = await acknowledgmentRows();
  const policies = rows.map((row) =>
    toPolicy(row, versions.filter((version) => version.policy_id === row.id).map(toVersion), summarize(ackRows.filter((ack) => ack.policyId === row.id)))
  );
  const live = policies.filter((policy) => policy.statusKey !== "archived");
  const overall = summarize(ackRows);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const pendingApprovals = versions
    .filter((version) => version.status === "under_review")
    .map((version) => ({ policyId: version.policy_id, versionId: version.id, name: version.title, version: displayVersion(version.version), category: version.topic, submittedBy: version.submittedByName ?? "—", submittedAt: version.submitted_at, isNewPolicy: rows.find((row) => row.id === version.policy_id)?.status !== "published" }))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return {
    results: policies,
    stats: {
      total: live.length,
      // Policies people added (the built-in ones have no creator)
      addedThisMonth: rows.filter((row) => row.status !== "archived" && row.createdBy && new Date(row.createdAt) >= monthStart).length,
      approved: live.filter((policy) => policy.statusKey === "published").length,
      underReview: pendingApprovals.length,
      drafts: versions.filter((version) => version.status === "draft" || version.status === "rejected").length,
      acknowledgment: overall,
      reviewsDue: live.filter((policy) => policy.reviewOverdue).length,
      overdueEmployees: new Set(ackRows.filter((row) => !row.acknowledgedAt && new Date(row.dueAt).getTime() < Date.now()).map((row) => row.userId)).size,
    },
    pendingApprovals,
    owners: [...new Map(policies.filter((policy) => policy.owner).map((policy) => [policy.owner.id, policy.owner.name])).entries()].map(([id, name]) => ({ id, name })),
    topics: POLICY_TOPICS,
    ownerOptions: canManage(user) ? await ownerOptions() : [],
    permissions: { manage: canManage(user), approve: user.role === ROLES.SUPER_ADMIN },
  };
}

async function findPolicy(id) {
  const [row] = await query(`${POLICY_SELECT} WHERE policy_documents.id = ?`, [id]);
  if (!row) throw new ApiError("Policy not found.", 404);
  return row;
}

// Detail page: the policy, its sections, every version and who has signed
export async function getPolicy(user, id) {
  const row = await findPolicy(id);
  const versions = (await loadVersions([id])).map(toVersion);
  const ackRows = await acknowledgmentRows(id);
  const policy = toPolicy(row, versions, summarize(ackRows));
  const now = Date.now();
  return {
    policy: {
      ...policy,
      sections: parseJson(row.body) ?? [],
      ackDueDays: row.ackDueDays,
      onboardingStep: row.onboardingStep === "ai" ? "AI Ethics" : "Review Policies",
      versions,
      employees: row.status === "published" && row.required
        ? ackRows.map((ack) => ({ id: ack.userId, name: ack.name, acknowledgedAt: ack.acknowledgedAt, dueAt: ack.dueAt, status: ack.acknowledgedAt ? "Acknowledged" : new Date(ack.dueAt).getTime() < now ? "Overdue" : "Pending" })).sort((a, b) => a.name.localeCompare(b.name))
        : [],
    },
    owners: await ownerOptions(),
    topics: POLICY_TOPICS,
    permissions: { manage: canManage(user), approve: user.role === ROLES.SUPER_ADMIN },
  };
}

// People who can own a policy: employees with Compliance access who can change it
export async function ownerOptions() {
  return query("SELECT users.id, users.name FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id AND staff_profiles.status = 'active' WHERE users.role IN (?, ?) ORDER BY users.name", [ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER]);
}

// ── Input ──
// Fields from JSON or a multipart form (the file comes as `file`)
export async function readPolicyInput(request) {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    let form;
    try { form = await request.formData(); } catch { throw new ApiError("Invalid upload."); }
    const fields = Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === "string"));
    const file = form.get("file");
    return { ...fields, file: file && typeof file !== "string" && file.size ? file : null };
  }
  let body;
  try { body = await request.json(); } catch { throw new ApiError("Invalid request body."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError("Invalid request body.");
  return { ...body, file: null };
}

const bool = (value, fallback) => (value === undefined || value === null || value === "" ? fallback : value === true || value === "true" || value === "1" || value === 1);

async function cleanFields(input, { submitting, existing = {} }) {
  const has = (key) => input[key] !== undefined && input[key] !== null;
  const name = has("name") ? String(input.name).trim() : existing.title;
  if (!name) throw new ApiError("Enter a document name.");
  if (name.length > 255) throw new ApiError("The document name is too long (255 characters max).");
  const topic = has("category") ? String(input.category) : existing.topic;
  if (!POLICY_TOPICS.includes(topic)) throw new ApiError("Choose a category.");
  const versionInput = has("version") ? input.version : existing.version;
  const version = normalizeVersion(versionInput);
  if (!version) throw new ApiError("Enter a version number like v1.0.");
  const description = has("description") ? String(input.description).trim() : existing.description ?? "";
  if (description.length > 500) throw new ApiError("The description is too long (500 characters max).");
  const effectiveDate = has("effectiveDate") ? input.effectiveDate || null : dateText(existing.effective_date ?? existing.effectiveDate) ?? null;
  const nextReviewDate = has("nextReviewDate") ? input.nextReviewDate || null : dateText(existing.next_review_date ?? existing.nextReviewDate) ?? null;
  for (const [label, value] of [["effective date", effectiveDate], ["next review date", nextReviewDate]]) {
    if (value && !isDate(value)) throw new ApiError(`The ${label} isn't a valid date.`);
  }
  if (submitting && !effectiveDate) throw new ApiError("Choose the effective date.");
  if (submitting && !nextReviewDate) throw new ApiError("Choose the next review date.");
  if (effectiveDate && nextReviewDate && nextReviewDate <= effectiveDate) throw new ApiError("The next review date must be after the effective date.");
  const changeNote = has("changeNote") ? String(input.changeNote).trim().slice(0, 500) : null;
  let ownerId = has("ownerId") ? input.ownerId || null : existing.owner_id ?? existing.ownerId ?? null;
  if (ownerId && !(await ownerOptions()).some((owner) => owner.id === ownerId)) throw new ApiError("The owner must be a Super Admin or Admin Manager.");
  return { name, topic, version, description, effectiveDate, nextReviewDate, changeNote, ownerId, required: bool(input.requireAcknowledgment, existing.required === undefined ? true : Boolean(existing.required)) };
}

const saveFile = (file) => (file ? saveUpload(STORAGE_AREA, file, { maxBytes: POLICY_FILE_MAX_BYTES, allowed: POLICY_FILE_TYPES }) : null);
const sectionsFrom = (description) => (description ? [{ heading: "Summary", text: description }] : []);

async function assertNewVersionNumber(policyId, version, { ignoreVersionId = null } = {}) {
  const versions = await query("SELECT id, version FROM policy_versions WHERE policy_id = ?", [policyId]);
  if (versions.some((row) => row.version === version && row.id !== ignoreVersionId)) throw new ApiError(`${displayVersion(version)} already exists for this policy. Use a new version number.`, 409);
  const [current] = await query("SELECT version FROM policy_documents WHERE id = ? AND status IN ('published', 'archived')", [policyId]);
  if (current && compareVersions(version, current.version) <= 0) throw new ApiError(`The new version must be higher than the current ${displayVersion(current.version)}.`);
}

// ── Creating and editing ──
// action: "draft" (Save as Draft) or "submit" (send for a Super Admin's approval)
// ── Notifications (the bell) ──
const policyLink = (id) => `/super-admin/compliance-audit/policy-documents/${id}`;
async function notifySubmitted(user, policyId, label) {
  await notify(await superAdmins(), { type: "approval", title: "Policy waiting for approval", body: `${user.name} submitted ${label}.`, link: policyLink(policyId), entityType: "policy", entityId: policyId, actor: user });
}

export async function createPolicy(user, input) {
  const submitting = input.action !== "draft";
  const fields = await cleanFields(input, { submitting });
  const file = await saveFile(input.file);
  const id = createId("policy");
  const versionId = createId("pver");
  const status = submitting ? "under_review" : "draft";
  const [{ nextSort }] = await query("SELECT COALESCE(MAX(sort_order), 0) + 1 AS nextSort FROM policy_documents");
  await query(
    "INSERT INTO policy_documents (id, title, category, version, effective_date, icon, body, required, status, sort_order, topic, description, owner_id, next_review_date, created_by, ack_due_days) VALUES (?, ?, 'company', ?, ?, 'file', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, fields.name, fields.version, fields.effectiveDate, JSON.stringify(sectionsFrom(fields.description)), fields.required ? 1 : 0, status, nextSort, fields.topic, fields.description || null, fields.ownerId ?? user.id, fields.nextReviewDate, user.id, DEFAULT_ACK_DUE_DAYS]
  );
  await insertVersion(user, id, versionId, fields, { status, file, sections: sectionsFrom(fields.description) });
  await recordAudit(user, { action: submitting ? "policy.submitted" : "policy.created", entityType: "policy", entityId: id, summary: `${submitting ? "Submitted" : "Saved a draft of"} ${fields.name} ${displayVersion(fields.version)}${submitting ? " for approval" : ""}`, metadata: { version: fields.version } });
  if (submitting) await notifySubmitted(user, id, `${fields.name} ${displayVersion(fields.version)}`);
  return getPolicy(user, id);
}

async function insertVersion(user, policyId, versionId, fields, { status, file, sections, restoredFrom = null }) {
  const submitted = status === "under_review";
  await query(
    "INSERT INTO policy_versions (id, policy_id, version, status, title, topic, description, body, effective_date, next_review_date, required, file_path, file_name, file_size, file_mime, change_note, restored_from, created_by, submitted_by, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [versionId, policyId, fields.version, status, fields.name, fields.topic, fields.description || null, JSON.stringify(sections), fields.effectiveDate, fields.nextReviewDate, fields.required ? 1 : 0, file?.storagePath ?? null, file?.name ?? null, file?.size ?? null, file?.mime ?? null, fields.changeNote, restoredFrom, user.id, submitted ? user.id : null, submitted ? new Date() : null]
  );
}

// Edit: changes the version being prepared, or starts a new version of an approved policy
// (a new version number or a new file); otherwise only the details (owner, category, review date…) change.
export async function updatePolicy(user, id, input) {
  const row = await findPolicy(id);
  if (row.status === "archived") throw new ApiError("Restore this policy before editing it.", 409);
  const [pending] = await query("SELECT * FROM policy_versions WHERE policy_id = ? AND status IN ('draft', 'under_review', 'rejected') ORDER BY created_at DESC LIMIT 1", [id]);
  const submitting = input.action === "submit";

  if (pending) {
    const fields = await cleanFields(input, { submitting, existing: { ...pending, owner_id: row.ownerId } });
    if (fields.version !== pending.version) await assertNewVersionNumber(id, fields.version, { ignoreVersionId: pending.id });
    const file = await saveFile(input.file);
    const status = submitting ? "under_review" : input.action === "draft" ? "draft" : pending.status;
    const newlySubmitted = status === "under_review" && pending.status !== "under_review";
    if (file && pending.file_path && !(await fileShared(pending.file_path, pending.id))) await deleteUpload(pending.file_path);
    await query(
      `UPDATE policy_versions SET version = ?, status = ?, title = ?, topic = ?, description = ?, body = ?, effective_date = ?, next_review_date = ?, required = ?, change_note = COALESCE(?, change_note)${file ? ", file_path = ?, file_name = ?, file_size = ?, file_mime = ?" : ""}${newlySubmitted ? ", submitted_by = ?, submitted_at = NOW(), review_note = NULL" : ""} WHERE id = ?`,
      [fields.version, status, fields.name, fields.topic, fields.description || null, JSON.stringify(sectionsFrom(fields.description)), fields.effectiveDate, fields.nextReviewDate, fields.required ? 1 : 0, fields.changeNote, ...(file ? [file.storagePath, file.name, file.size, file.mime] : []), ...(newlySubmitted ? [user.id] : []), pending.id]
    );
    if (row.status !== "published") {
      await query("UPDATE policy_documents SET title = ?, topic = ?, description = ?, version = ?, effective_date = ?, next_review_date = ?, required = ?, owner_id = ?, status = ?, body = ? WHERE id = ?", [fields.name, fields.topic, fields.description || null, fields.version, fields.effectiveDate, fields.nextReviewDate, fields.required ? 1 : 0, fields.ownerId ?? row.ownerId, status === "under_review" ? "under_review" : "draft", JSON.stringify(sectionsFrom(fields.description)), id]);
    } else if (fields.ownerId !== row.ownerId) {
      await query("UPDATE policy_documents SET owner_id = ? WHERE id = ?", [fields.ownerId, id]);
    }
    await recordAudit(user, { action: newlySubmitted ? "policy.submitted" : "policy.draft_updated", entityType: "policy", entityId: id, summary: `${newlySubmitted ? "Submitted" : "Updated the draft of"} ${fields.name} ${displayVersion(fields.version)}${newlySubmitted ? " for approval" : ""}`, metadata: { version: fields.version } });
    if (newlySubmitted) await notifySubmitted(user, id, `${fields.name} ${displayVersion(fields.version)}`);
    return getPolicy(user, id);
  }

  // The policy is approved and nothing is being prepared
  const [current] = await query("SELECT * FROM policy_versions WHERE id = ?", [row.currentVersionId]);
  const requestedVersion = input.version ? normalizeVersion(input.version) : row.version;
  if (input.version && !requestedVersion) throw new ApiError("Enter a version number like v1.0.");
  if (requestedVersion !== row.version || input.file) {
    const fields = await cleanFields({ ...input, version: requestedVersion }, { submitting, existing: { ...current, owner_id: row.ownerId } });
    await assertNewVersionNumber(id, fields.version);
    const file = (await saveFile(input.file)) ?? (current?.file_path ? { storagePath: current.file_path, name: current.file_name, size: current.file_size, mime: current.file_mime } : null);
    const status = submitting ? "under_review" : "draft";
    await insertVersion(user, id, createId("pver"), fields, { status, file, sections: input.description !== undefined ? sectionsFrom(fields.description) : parseJson(row.body) ?? [] });
    if (fields.ownerId !== row.ownerId) await query("UPDATE policy_documents SET owner_id = ? WHERE id = ?", [fields.ownerId, id]);
    await recordAudit(user, { action: submitting ? "policy.submitted" : "policy.version_drafted", entityType: "policy", entityId: id, summary: `${submitting ? "Submitted" : "Drafted"} ${fields.name} ${displayVersion(fields.version)}${submitting ? " for approval" : ""} (current ${displayVersion(row.version)})`, metadata: { version: fields.version, previous: row.version } });
    if (submitting) await notifySubmitted(user, id, `${fields.name} ${displayVersion(fields.version)}`);
    return getPolicy(user, id);
  }

  // Details only: these don't change what employees sign
  const fields = await cleanFields({ ...input, version: row.version }, { submitting: false, existing: { ...current, title: row.title, topic: row.topic, description: row.description, owner_id: row.ownerId, required: row.required, effective_date: row.effectiveDate, next_review_date: row.nextReviewDate } });
  if (fields.effectiveDate !== dateText(row.effectiveDate)) throw new ApiError("To change the effective date, upload a new version.");
  await query("UPDATE policy_documents SET title = ?, topic = ?, description = ?, next_review_date = ?, required = ?, owner_id = ? WHERE id = ?", [fields.name, fields.topic, fields.description || null, fields.nextReviewDate, fields.required ? 1 : 0, fields.ownerId, id]);
  await query("UPDATE policy_versions SET title = ?, topic = ?, description = ?, next_review_date = ?, required = ? WHERE id = ?", [fields.name, fields.topic, fields.description || null, fields.nextReviewDate, fields.required ? 1 : 0, row.currentVersionId]);
  await recordAudit(user, { action: "policy.details_updated", entityType: "policy", entityId: id, summary: `Updated the details of ${fields.name}`, metadata: { nextReviewDate: fields.nextReviewDate, requireAcknowledgment: fields.required } });
  return getPolicy(user, id);
}

const fileShared = async (path, exceptVersionId) => (await query("SELECT COUNT(*) AS uses FROM policy_versions WHERE file_path = ? AND id <> ?", [path, exceptVersionId]))[0].uses > 0;

// ── Version actions ──
// submit | withdraw (back to draft) | approve | reject (Super Admin) | restore (copy an old version into a new one) | discard
export async function versionAction(user, policyId, versionId, { action, note }) {
  const row = await findPolicy(policyId);
  const [version] = await query("SELECT * FROM policy_versions WHERE id = ? AND policy_id = ?", [versionId, policyId]);
  if (!version) throw new ApiError("Version not found.", 404);
  const label = `${version.title} ${displayVersion(version.version)}`;
  const reviewNote = String(note ?? "").trim().slice(0, 500);

  if (action === "submit") {
    if (!["draft", "rejected"].includes(version.status)) throw new ApiError("Only a draft can be submitted.", 409);
    await cleanFields({}, { submitting: true, existing: { ...version, owner_id: row.ownerId } });
    await query("UPDATE policy_versions SET status = 'under_review', submitted_by = ?, submitted_at = NOW(), review_note = NULL WHERE id = ?", [user.id, versionId]);
    if (row.status === "draft") await query("UPDATE policy_documents SET status = 'under_review' WHERE id = ?", [policyId]);
    await recordAudit(user, { action: "policy.submitted", entityType: "policy", entityId: policyId, summary: `Submitted ${label} for approval` });
    await notifySubmitted(user, policyId, label);
  } else if (action === "withdraw") {
    if (version.status !== "under_review") throw new ApiError("Only a version under review can be withdrawn.", 409);
    await query("UPDATE policy_versions SET status = 'draft' WHERE id = ?", [versionId]);
    if (row.status === "under_review") await query("UPDATE policy_documents SET status = 'draft' WHERE id = ?", [policyId]);
    await recordAudit(user, { action: "policy.withdrawn", entityType: "policy", entityId: policyId, summary: `Withdrew ${label} from review` });
  } else if (action === "approve") {
    assertSuperAdmin(user, "approve policies");
    if (version.status !== "under_review") throw new ApiError("Only a version under review can be approved.", 409);
    if (row.status === "archived") throw new ApiError("Restore this policy before approving a version.", 409);
    const sections = parseJson(version.body);
    await query("UPDATE policy_versions SET status = 'superseded' WHERE policy_id = ? AND status = 'approved'", [policyId]);
    await query("UPDATE policy_versions SET status = 'approved', decided_by = ?, decided_at = NOW(), review_note = ? WHERE id = ?", [user.id, reviewNote || null, versionId]);
    await query(
      "UPDATE policy_documents SET status = 'published', title = ?, topic = ?, description = ?, version = ?, effective_date = ?, next_review_date = ?, required = ?, body = ?, approved_at = NOW(), current_version_id = ? WHERE id = ?",
      [version.title, version.topic, version.description, version.version, version.effective_date, version.next_review_date, version.required, JSON.stringify(sections?.length ? sections : parseJson(row.body) ?? []), versionId, policyId]
    );
    await recordAudit(user, { action: "policy.approved", entityType: "policy", entityId: policyId, summary: `Approved ${label}${version.required ? "; employees are asked to acknowledge it" : ""}`, metadata: { version: version.version, previous: row.status === "published" ? row.version : null } });
    if (version.submitted_by) await notify([version.submitted_by], { type: "approval", title: "Policy approved", body: `${user.name} approved ${label}.`, link: policyLink(policyId), entityType: "policy", entityId: policyId, actor: user });
    // Every employee is asked to read and sign a required policy (the prompt opens in their portal)
    if (version.required) {
      await notify(await usersWithRoles([ROLES.SUPER_ADMIN, ROLES.ADMIN_MANAGER, ROLES.SUPPORT, ROLES.AUDITOR, ROLES.SALES_REP]), { type: "policy", title: `New policy to sign: ${version.title}`, body: `Please read and acknowledge ${label}.`, link: portalHome, entityType: "policy", entityId: policyId, actor: user });
    }
  } else if (action === "reject") {
    assertSuperAdmin(user, "send policies back");
    if (version.status !== "under_review") throw new ApiError("Only a version under review can be sent back.", 409);
    if (!reviewNote) throw new ApiError("Add a note saying what needs to change.");
    await query("UPDATE policy_versions SET status = 'rejected', decided_by = ?, decided_at = NOW(), review_note = ? WHERE id = ?", [user.id, reviewNote, versionId]);
    if (row.status === "under_review") await query("UPDATE policy_documents SET status = 'draft' WHERE id = ?", [policyId]);
    await recordAudit(user, { action: "policy.changes_requested", entityType: "policy", entityId: policyId, summary: `Requested changes to ${label}: ${reviewNote}` });
    if (version.submitted_by) await notify([version.submitted_by], { type: "approval", title: "Changes requested on a policy", body: `${user.name} sent back ${label}: ${reviewNote}`, link: policyLink(policyId), entityType: "policy", entityId: policyId, actor: user });
  } else if (action === "restore") {
    if (!["superseded", "approved"].includes(version.status)) throw new ApiError("Only an earlier approved version can be restored.", 409);
    if (row.status === "archived") throw new ApiError("Restore this policy before restoring a version.", 409);
    const [pending] = await query("SELECT id FROM policy_versions WHERE policy_id = ? AND status IN ('draft', 'under_review', 'rejected')", [policyId]);
    if (pending) throw new ApiError("Finish or discard the version being prepared first.", 409);
    const numbers = (await query("SELECT version FROM policy_versions WHERE policy_id = ?", [policyId])).map((item) => item.version);
    const fields = { name: version.title, topic: version.topic, description: version.description, effectiveDate: dateText(version.effective_date), nextReviewDate: dateText(version.next_review_date), required: Boolean(version.required), version: nextVersion(numbers), changeNote: `Restored from ${displayVersion(version.version)}` };
    if (!fields.effectiveDate || fields.effectiveDate < dateText(new Date())) fields.effectiveDate = dateText(new Date());
    if (!fields.nextReviewDate || fields.nextReviewDate <= fields.effectiveDate) fields.nextReviewDate = dateText(new Date(Date.parse(fields.effectiveDate) + 365 * DAY));
    await insertVersion(user, policyId, createId("pver"), fields, { status: "under_review", file: version.file_path ? { storagePath: version.file_path, name: version.file_name, size: version.file_size, mime: version.file_mime } : null, sections: parseJson(version.body) ?? [], restoredFrom: version.version });
    await recordAudit(user, { action: "policy.version_restored", entityType: "policy", entityId: policyId, summary: `Restored ${label} as ${displayVersion(fields.version)} and sent it for approval` });
    await notifySubmitted(user, policyId, `${version.title} ${displayVersion(fields.version)}`);
  } else if (action === "discard") {
    if (!["draft", "rejected"].includes(version.status)) throw new ApiError("Only a draft can be discarded.", 409);
    if (row.status !== "published" && row.status !== "archived") throw new ApiError("Delete the policy instead; this is its only version.", 409);
    await query("DELETE FROM policy_versions WHERE id = ?", [versionId]);
    if (version.file_path && !(await fileShared(version.file_path, versionId))) await deleteUpload(version.file_path);
    await recordAudit(user, { action: "policy.draft_discarded", entityType: "policy", entityId: policyId, summary: `Discarded the draft ${label}` });
  } else {
    throw new ApiError("Unknown action.");
  }
  return getPolicy(user, policyId);
}

// Delete: a policy that was never approved is removed; an approved one is archived
// (kept with its history and signatures, no longer shown in onboarding). Super Admin only.
export async function removePolicy(user, id) {
  assertSuperAdmin(user, "delete or archive policies");
  const row = await findPolicy(id);
  if (row.status === "published") {
    await query("UPDATE policy_documents SET status = 'archived' WHERE id = ?", [id]);
    await query("DELETE FROM policy_versions WHERE policy_id = ? AND status IN ('draft', 'rejected')", [id]);
    await query("UPDATE policy_versions SET status = 'draft' WHERE policy_id = ? AND status = 'under_review'", [id]);
    await recordAudit(user, { action: "policy.archived", entityType: "policy", entityId: id, summary: `Archived ${row.title} ${displayVersion(row.version)}` });
    return { archived: true };
  }
  if (row.status === "archived") throw new ApiError("This policy is already archived.", 409);
  const files = await query("SELECT DISTINCT file_path FROM policy_versions WHERE policy_id = ? AND file_path IS NOT NULL", [id]);
  await query("DELETE FROM policy_documents WHERE id = ?", [id]);
  for (const file of files) await deleteUpload(file.file_path);
  await recordAudit(user, { action: "policy.deleted", entityType: "policy", entityId: id, summary: `Deleted the unapproved policy ${row.title}` });
  return { deleted: true };
}

export async function unarchivePolicy(user, id) {
  assertSuperAdmin(user, "restore archived policies");
  const row = await findPolicy(id);
  if (row.status !== "archived") throw new ApiError("Only an archived policy can be restored.", 409);
  await query("UPDATE policy_documents SET status = 'published', approved_at = NOW() WHERE id = ?", [id]);
  await recordAudit(user, { action: "policy.unarchived", entityType: "policy", entityId: id, summary: `Restored the archived policy ${row.title} ${displayVersion(row.version)}` });
  return getPolicy(user, id);
}

// ── Files ──
// Staff with Compliance access read any version; other employees only the version in force
export async function policyFile(user, policyId, versionId, { employeeOnly = false } = {}) {
  const row = await findPolicy(policyId);
  const id = employeeOnly || !versionId ? row.currentVersionId : versionId;
  if (employeeOnly && row.status !== "published") throw new ApiError("Policy not found.", 404);
  const [version] = await query("SELECT file_path, file_name, file_mime FROM policy_versions WHERE id = ? AND policy_id = ?", [id, policyId]);
  if (!version?.file_path) throw new ApiError("This version has no file.", 404);
  return { bytes: await readUpload(version.file_path), name: version.file_name, mime: version.file_mime || "application/octet-stream" };
}

// ── Overdue signatures and reminders ──
export async function overdueEmployees() {
  const rows = (await acknowledgmentRows()).filter((row) => !row.acknowledgedAt && new Date(row.dueAt).getTime() < Date.now());
  const titles = Object.fromEntries((await query("SELECT id, title FROM policy_documents WHERE status = 'published'")).map((row) => [row.id, row.title]));
  const reminders = await query("SELECT user_id AS userId, MAX(created_at) AS lastReminder FROM policy_reminders GROUP BY user_id");
  const byUser = new Map();
  for (const row of rows) {
    const entry = byUser.get(row.userId) ?? { id: row.userId, name: row.name, email: row.email, policies: [], daysOverdue: 0 };
    entry.policies.push({ id: row.policyId, title: titles[row.policyId] });
    entry.daysOverdue = Math.max(entry.daysOverdue, Math.floor((Date.now() - new Date(row.dueAt).getTime()) / DAY));
    byUser.set(row.userId, entry);
  }
  return [...byUser.values()]
    .map((entry) => ({ ...entry, lastReminderAt: reminders.find((reminder) => reminder.userId === entry.id)?.lastReminder ?? null }))
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

// Queue a reminder email to each overdue employee (all of them, or `userIds`)
export async function sendReminders(user, userIds) {
  const overdue = await overdueEmployees();
  const targets = Array.isArray(userIds) && userIds.length ? overdue.filter((entry) => userIds.includes(entry.id)) : overdue;
  if (!targets.length) throw new ApiError("Nobody selected has an overdue acknowledgment.", 409);
  const appUrl = process.env.APP_URL || "";
  for (const target of targets) {
    const list = target.policies.map((policy) => `<li>${escapeHtml(policy.title)}</li>`).join("");
    await queueEmail({
      source: "compliance",
      sourceId: target.id,
      template: { id: null, emailType: "Transactional" },
      userId: target.id,
      email: target.email,
      subject: "Reminder: please acknowledge PitchProX policies",
      html: `<p>Hi ${escapeHtml(target.name.split(" ")[0])},</p><p>These policies are waiting for your acknowledgment:</p><ul>${list}</ul><p>Sign in to PitchProX${appUrl ? ` (<a href="${escapeHtml(appUrl)}">${escapeHtml(appUrl)}</a>)` : ""} and open <strong>Policies to acknowledge</strong> to read and sign them.</p>`,
    });
    await query("INSERT INTO policy_reminders (id, user_id, policy_ids, sent_by) VALUES (?, ?, ?, ?)", [createId("prem"), target.id, JSON.stringify(target.policies.map((policy) => policy.id)), user.id]);
    await notify([target.id], { type: "policy", title: "Reminder: policies to sign", body: `Waiting for your acknowledgment: ${target.policies.map((policy) => policy.title).join(", ")}.`, link: portalHome, entityType: "policy", actor: user });
  }
  await recordAudit(user, { action: "policy.reminders_sent", entityType: "policy", summary: `Sent policy acknowledgment reminders to ${targets.length} employee${targets.length === 1 ? "" : "s"}`, metadata: { userIds: targets.map((target) => target.id) } });
  return { reminded: targets.length };
}

// ── The signed-in employee's own policies (outside onboarding) ──
export async function myPolicies(user) {
  const rows = await query(
    `SELECT policy_documents.id, policy_documents.title, policy_documents.topic, policy_documents.version, policy_documents.effective_date AS effectiveDate, policy_documents.body,
       policy_documents.current_version_id AS currentVersionId, policy_versions.file_name AS fileName, ack.created_at AS acknowledgedAt,
       DATE_ADD(GREATEST(policy_documents.approved_at, users.created_at), INTERVAL policy_documents.ack_due_days DAY) AS dueAt
     FROM policy_documents
     JOIN users ON users.id = ?
     LEFT JOIN policy_versions ON policy_versions.id = policy_documents.current_version_id
     LEFT JOIN policy_acknowledgments AS ack ON ack.policy_id = policy_documents.id AND ack.version = policy_documents.version AND ack.user_id = users.id
     WHERE policy_documents.status = 'published' AND policy_documents.required = 1
     ORDER BY ack.created_at IS NOT NULL, policy_documents.approved_at DESC`,
    [user.id]
  );
  const policies = rows.map((row) => ({
    id: row.id,
    title: row.title,
    category: row.topic,
    version: displayVersion(row.version),
    effectiveDate: dateText(row.effectiveDate),
    sections: parseJson(row.body) ?? [],
    file: row.fileName ? { name: row.fileName, url: `/api/v1/me/policies/${row.id}/file` } : null,
    acknowledgedAt: row.acknowledgedAt,
    dueAt: row.dueAt,
    overdue: !row.acknowledgedAt && new Date(row.dueAt).getTime() < Date.now(),
  }));
  return { results: policies, pending: policies.filter((policy) => !policy.acknowledgedAt).length };
}

export async function acknowledgeMyPolicy(user, policyId, signature) {
  const [policy] = await query("SELECT id, title, version FROM policy_documents WHERE id = ? AND status = 'published' AND required = 1", [policyId]);
  if (!policy) throw new ApiError("Policy not found.", 404);
  // Same rule as onboarding: the typed name must match the account name
  const name = String(signature ?? "").trim().replace(/\s+/g, " ");
  if (!name) throw new ApiError("Type your full name to sign.");
  if (name.toLowerCase() !== user.name.trim().replace(/\s+/g, " ").toLowerCase()) throw new ApiError(`Type your full name exactly as it appears on your account (${user.name}).`);
  const { ip, userAgent } = await requestClient();
  const result = await query("INSERT IGNORE INTO policy_acknowledgments (id, user_id, policy_id, version, signature_name, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)", [createId("ack"), user.id, policy.id, policy.version, name, ip, userAgent]);
  if (result.affectedRows) {
    await recordAudit(user, { action: "policy.acknowledged", entityType: "policy", entityId: policy.id, summary: `${user.name} acknowledged ${policy.title} (v${policy.version})`, metadata: { version: policy.version } });
  }
  return myPolicies(user);
}
