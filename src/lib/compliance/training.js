import { randomBytes } from "node:crypto";
import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { deleteUpload, formatBytes, readUpload, saveUpload } from "@/lib/storage";
import { queueEmail } from "@/lib/campaigns/outbox";
import { notify as notifyBell, portalHome } from "@/lib/notifications";
import { ROLE_LABELS, ROLES, STAFF_ROLES } from "@/utils.js/roles";
import { likePattern } from "@/lib/listing";
import {
  CERTIFICATE_VALIDITY,
  MATERIAL_FILE_TYPES,
  MATERIAL_FORMATS,
  MATERIAL_MAX_BYTES,
  TRAINING_DEPARTMENTS,
  TRAINING_REQUIREMENTS,
  TRAINING_STATUSES,
  assignmentStatus,
  certificateExpiry,
  employeeStatus,
  formatForExtension,
  trainingDepartment,
} from "@/lib/compliance/training-catalog";

// ── Training Logs (Compliance & Audit) ──
// Trainings (training_courses) contain library materials (training_materials). Assignments give a
// Training to an employee with a due date; employees open the materials and mark it complete from
// their portal. The onboarding course is assigned and completed through onboarding itself.
// Super Admin and Admin Manager manage; Auditors read.

const STORAGE_AREA = "compliance-training";
const DAY = 86400000;
const today = () => new Date().toISOString().slice(0, 10);
const dateText = (value) => (value ? new Date(value).toISOString().slice(0, 10) : null);
const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const text = (value, label, max, { required = false } = {}) => {
  const clean = String(value ?? "").trim();
  if (required && !clean) throw new ApiError(`Enter ${label}.`);
  if (clean.length > max) throw new ApiError(`${label[0].toUpperCase()}${label.slice(1)} is too long (${max} characters max).`);
  return clean || null;
};

// ── Onboarding course → assignments ──
// Employees who go through onboarding get the onboarding Training as an assignment, completed
// when they finish its modules. Runs before reads so Training Logs matches onboarding; one run at
// a time per server, and it only writes when something changed (parallel page loads used to deadlock).
let syncing = null;
async function syncOnboardingAssignments() {
  syncing ??= runSync().finally(() => { syncing = null; });
  return syncing;
}

async function runSync(attempt = 1) {
  try {
    const [{ missing }] = await query(
      `SELECT COUNT(*) AS missing FROM staff_profiles
       JOIN training_courses ON training_courses.required_for_onboarding = 1 AND training_courses.status = 'published'
       LEFT JOIN onboarding_records ON onboarding_records.user_id = staff_profiles.user_id
       WHERE (onboarding_records.user_id IS NOT NULL OR staff_profiles.status IN ('invited', 'onboarding'))
         AND NOT EXISTS (SELECT 1 FROM training_assignments AS existing WHERE existing.user_id = staff_profiles.user_id AND existing.course_id = training_courses.id AND existing.source = 'onboarding')`
    );
    const [{ stale }] = await query(
      `SELECT COUNT(*) AS stale FROM training_assignments
       LEFT JOIN onboarding_records ON onboarding_records.user_id = training_assignments.user_id
       WHERE training_assignments.source = 'onboarding' AND training_assignments.completed_at IS NULL
         AND (onboarding_records.training_done_at IS NOT NULL OR (training_assignments.started_at IS NULL AND EXISTS (SELECT 1 FROM training_module_progress WHERE training_module_progress.user_id = training_assignments.user_id)))`
    );
    if (!Number(missing) && !Number(stale)) return;
    await writeSync();
  } catch (error) {
    if (error?.code === "ER_LOCK_DEADLOCK" && attempt < 3) return runSync(attempt + 1);
    throw error;
  }
}

async function writeSync() {
  await query(
    `INSERT INTO training_assignments (id, course_id, user_id, requirement, due_date, assigned_at, source)
     SELECT CONCAT('tasg_', SUBSTRING(SHA2(CONCAT(training_courses.id, staff_profiles.user_id), 256), 1, 24)), training_courses.id, staff_profiles.user_id, 'Required', staff_profiles.onboarding_due, staff_profiles.created_at, 'onboarding'
     FROM staff_profiles
     JOIN training_courses ON training_courses.required_for_onboarding = 1 AND training_courses.status = 'published'
     LEFT JOIN onboarding_records ON onboarding_records.user_id = staff_profiles.user_id
     WHERE (onboarding_records.user_id IS NOT NULL OR staff_profiles.status IN ('invited', 'onboarding'))
       AND NOT EXISTS (SELECT 1 FROM training_assignments AS existing WHERE existing.user_id = staff_profiles.user_id AND existing.course_id = training_courses.id AND existing.source = 'onboarding')`
  );
  await query(
    `UPDATE training_assignments
     JOIN onboarding_records ON onboarding_records.user_id = training_assignments.user_id
     SET training_assignments.completed_at = onboarding_records.training_done_at,
         training_assignments.started_at = COALESCE(training_assignments.started_at, onboarding_records.started_at, onboarding_records.training_done_at)
     WHERE training_assignments.source = 'onboarding' AND training_assignments.completed_at IS NULL AND onboarding_records.training_done_at IS NOT NULL`
  );
  await query(
    `UPDATE training_assignments
     JOIN training_module_progress AS progress ON progress.user_id = training_assignments.user_id
     JOIN training_course_modules ON training_course_modules.id = progress.module_id AND training_course_modules.course_id = training_assignments.course_id
     SET training_assignments.started_at = progress.completed_at
     WHERE training_assignments.source = 'onboarding' AND training_assignments.started_at IS NULL`
  );
}

// ── Employees ──
async function staffDirectory() {
  const rows = await query(
    `SELECT users.id, users.name, users.email, users.role, staff_profiles.department, staff_profiles.job_title AS jobTitle, staff_profiles.status
     FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id
     WHERE users.role IN (${STAFF_ROLES.map(() => "?").join(", ")}) ORDER BY users.name`,
    STAFF_ROLES
  );
  return rows.map((row) => ({ ...row, department: trainingDepartment(row.department, row.role), roleLabel: ROLE_LABELS[row.role] ?? row.role }));
}

// Employees who can be given Training (active, or still onboarding)
export async function assignableEmployees() {
  return (await staffDirectory()).filter((person) => ["active", "onboarding", "invited"].includes(person.status)).map(({ id, name, email, roleLabel, jobTitle, department, status }) => ({ id, name, email, role: roleLabel, jobTitle, department, status }));
}

// ── Assignments ──
const ASSIGNMENT_SELECT = `SELECT training_assignments.id, training_assignments.course_id AS courseId, training_assignments.user_id AS userId, training_assignments.requirement,
  training_assignments.due_date AS dueDate, training_assignments.assigned_at AS assignedAt, training_assignments.started_at AS startedAt, training_assignments.completed_at AS completedAt,
  training_assignments.certificate_number AS certificateNumber, training_assignments.certificate_expires_on AS certificateExpiresOn, training_assignments.source,
  training_courses.title AS trainingTitle, training_categories.name AS category, assigner.name AS assignedBy
  FROM training_assignments
  JOIN training_courses ON training_courses.id = training_assignments.course_id
  LEFT JOIN training_categories ON training_categories.id = training_courses.category_id
  LEFT JOIN users AS assigner ON assigner.id = training_assignments.assigned_by`;

function toAssignment(row, people) {
  const person = people.get(row.userId);
  const status = assignmentStatus({ completedAt: row.completedAt, startedAt: row.startedAt, dueDate: dateText(row.dueDate) });
  return {
    id: row.id,
    trainingId: row.courseId,
    trainingTitle: row.trainingTitle,
    category: row.category ?? "Uncategorized",
    requirement: row.requirement,
    employee: person ? { id: person.id, name: person.name, role: person.roleLabel, department: person.department, status: person.status } : { id: row.userId, name: "Former employee", role: "—", department: "—", status: "removed" },
    assignedOn: row.assignedAt,
    assignedBy: row.assignedBy ?? (row.source === "onboarding" ? "Onboarding" : "—"),
    dueDate: dateText(row.dueDate),
    startedAt: row.startedAt,
    completedOn: row.completedAt,
    status,
    certificate: row.certificateNumber ? { number: row.certificateNumber, expiresOn: dateText(row.certificateExpiresOn), expired: Boolean(row.certificateExpiresOn && dateText(row.certificateExpiresOn) < today()) } : null,
    source: row.source,
  };
}

async function loadAssignments(where = "", values = []) {
  const [rows, people] = await Promise.all([query(`${ASSIGNMENT_SELECT} ${where} ORDER BY training_assignments.assigned_at DESC`, values), staffDirectory()]);
  const byId = new Map(people.map((person) => [person.id, person]));
  return rows.map((row) => toAssignment(row, byId));
}

// Training Logs page: every assignment, one row per employee, the cards and side panels
export async function trainingOverview(user) {
  await syncOnboardingAssignments();
  const assignments = await loadAssignments();
  const count = (status) => assignments.filter((item) => item.status === status).length;
  const now = today();
  const soon = new Date(Date.now() + 30 * DAY).toISOString().slice(0, 10);
  const dueSoon = assignments.filter((item) => item.status !== "Completed" && item.status !== "Overdue" && item.dueDate && item.dueDate >= now && item.dueDate <= soon);

  // Upcoming Due Dates: one line per Training and date
  const upcoming = new Map();
  for (const item of dueSoon) {
    const key = `${item.trainingId}|${item.dueDate}`;
    const entry = upcoming.get(key) ?? { trainingId: item.trainingId, title: item.trainingTitle, dueDate: item.dueDate, employees: 0 };
    entry.employees += 1;
    upcoming.set(key, entry);
  }

  // One row per employee (client spec: "2 of 3 Completed", "Mixed", "Overdue")
  const byEmployee = new Map();
  for (const item of assignments) {
    if (item.employee.status === "removed") continue;
    const entry = byEmployee.get(item.employee.id) ?? { employee: item.employee, assignments: [] };
    entry.assignments.push({ id: item.id, trainingTitle: item.trainingTitle, status: item.status, dueDate: item.dueDate });
    byEmployee.set(item.employee.id, entry);
  }
  const employees = [...byEmployee.values()].map((entry) => {
    const open = entry.assignments.filter((item) => item.status !== "Completed").map((item) => item.dueDate).filter(Boolean).sort();
    return { ...entry, total: entry.assignments.length, completed: entry.assignments.filter((item) => item.status === "Completed").length, status: employeeStatus(entry.assignments.map((item) => item.status)), nextDue: open[0] ?? null };
  });

  return {
    results: assignments,
    employees,
    stats: {
      total: assignments.length,
      completed: count("Completed"),
      inProgress: count("In Progress"),
      notStarted: count("Not Started"),
      overdue: count("Overdue"),
      dueSoon: dueSoon.length,
      completionRate: assignments.length ? Math.round((count("Completed") / assignments.length) * 1000) / 10 : null,
    },
    statuses: TRAINING_STATUSES.map((status) => ({ status, count: count(status) })),
    upcoming: [...upcoming.values()].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((item) => ({ ...item, daysLeft: Math.max(0, Math.round((Date.parse(`${item.dueDate}T12:00:00`) - Date.now()) / DAY)) })),
    trainings: (await query("SELECT id, title FROM training_courses WHERE status = 'published' ORDER BY title")).map((row) => ({ id: row.id, title: row.title })),
    categories: (await query("SELECT name FROM training_categories ORDER BY name")).map((row) => row.name),
    departments: TRAINING_DEPARTMENTS,
    permissions: { manage: user.role !== ROLES.AUDITOR },
  };
}

// Bulk Assign: every Training × every employee. Someone who already has the Training open is
// skipped; a completed one is only assigned again when allowReassign is on (a new record, the old
// completion is kept).
export async function assignTraining(user, { courseIds, userIds, dueDate, requirement, notify = true, allowReassign = false }) {
  if (!Array.isArray(courseIds) || !courseIds.length) throw new ApiError("Choose at least one Training.");
  if (!Array.isArray(userIds) || !userIds.length) throw new ApiError("Choose at least one employee.");
  if (courseIds.length > 50 || userIds.length > 500) throw new ApiError("That's too many at once. Assign in smaller groups.");
  if (!isDate(dueDate)) throw new ApiError("Choose a due date.");
  if (dueDate < today()) throw new ApiError("The due date can't be in the past.");
  if (!TRAINING_REQUIREMENTS.includes(requirement)) throw new ApiError("Choose Required, Recommended or Optional.");
  const courses = await query(`SELECT id, title FROM training_courses WHERE status = 'published' AND required_for_onboarding = 0 AND id IN (${courseIds.map(() => "?").join(", ")})`, courseIds);
  if (courses.length !== new Set(courseIds).size) throw new ApiError("One of the Trainings isn't available (onboarding training is assigned automatically).");
  const people = (await assignableEmployees()).filter((person) => userIds.includes(person.id));
  if (people.length !== new Set(userIds).size) throw new ApiError("One of the employees can't be assigned Training.");

  const existing = await query(
    `SELECT course_id AS courseId, user_id AS userId, completed_at AS completedAt FROM training_assignments WHERE course_id IN (${courses.map(() => "?").join(", ")}) AND user_id IN (${people.map(() => "?").join(", ")})`,
    [...courses.map((course) => course.id), ...people.map((person) => person.id)]
  );
  const created = [];
  const skipped = [];
  for (const course of courses) {
    for (const person of people) {
      const theirs = existing.filter((row) => row.courseId === course.id && row.userId === person.id);
      if (theirs.some((row) => !row.completedAt)) { skipped.push({ training: course.title, employee: person.name, reason: "Already assigned" }); continue; }
      if (theirs.length && !allowReassign) { skipped.push({ training: course.title, employee: person.name, reason: "Already completed" }); continue; }
      const id = createId("tasg");
      await query("INSERT INTO training_assignments (id, course_id, user_id, requirement, due_date, assigned_by, source) VALUES (?, ?, ?, ?, ?, ?, 'manual')", [id, course.id, person.id, requirement, dueDate, user.id]);
      created.push({ id, course, person });
    }
  }
  if (notify && created.length) {
    const appUrl = process.env.APP_URL || "";
    for (const person of people) {
      const theirs = created.filter((item) => item.person.id === person.id);
      if (!theirs.length) continue;
      await notifyBell([person.id], { type: "training", title: theirs.length === 1 ? `New training: ${theirs[0].course.title}` : `${theirs.length} new trainings assigned`, body: `Due ${dueDate} (${requirement}). Open My Training to start.`, link: portalHome, entityType: "training_assignment", entityId: theirs[0].id, actor: user });
      await queueEmail({
        source: "compliance",
        sourceId: person.id,
        template: { id: null, emailType: "Transactional" },
        userId: person.id,
        email: person.email,
        subject: theirs.length === 1 ? `New training: ${theirs[0].course.title}` : `${theirs.length} new trainings assigned`,
        html: `<p>Hi ${escapeHtml(person.name.split(" ")[0])},</p><p>You've been assigned:</p><ul>${theirs.map((item) => `<li>${escapeHtml(item.course.title)}</li>`).join("")}</ul><p>Due ${escapeHtml(dueDate)} (${escapeHtml(requirement)}). Sign in to PitchProX${appUrl ? ` (<a href="${escapeHtml(appUrl)}">${escapeHtml(appUrl)}</a>)` : ""} and open <strong>My Training</strong>.</p>`,
      });
    }
  }
  if (created.length) {
    await recordAudit(user, {
      action: "training.assigned",
      entityType: "training_assignment",
      summary: `Assigned ${courses.length} Training${courses.length === 1 ? "" : "s"} to ${people.length} employee${people.length === 1 ? "" : "s"} (${created.length} assignment${created.length === 1 ? "" : "s"}), due ${dueDate}`,
      metadata: { courseIds: courses.map((course) => course.id), userIds: people.map((person) => person.id), dueDate, requirement, created: created.length, skipped: skipped.length, allowReassign },
    });
  }
  return { created: created.length, skipped };
}

async function findAssignment(id) {
  const [row] = await query("SELECT training_assignments.*, training_courses.title FROM training_assignments JOIN training_courses ON training_courses.id = training_assignments.course_id WHERE training_assignments.id = ?", [id]);
  if (!row) throw new ApiError("Assignment not found.", 404);
  return row;
}

// Change the due date (or requirement) of an open assignment
export async function updateAssignment(user, id, { dueDate, requirement }) {
  const row = await findAssignment(id);
  if (row.completed_at) throw new ApiError("This Training is already completed.", 409);
  if (row.source === "onboarding") throw new ApiError("Onboarding training follows the onboarding deadline.", 409);
  if (dueDate !== undefined && (!isDate(dueDate) || dueDate < today())) throw new ApiError("Choose a due date from today on.");
  if (requirement !== undefined && !TRAINING_REQUIREMENTS.includes(requirement)) throw new ApiError("Choose Required, Recommended or Optional.");
  await query("UPDATE training_assignments SET due_date = COALESCE(?, due_date), requirement = COALESCE(?, requirement) WHERE id = ?", [dueDate ?? null, requirement ?? null, id]);
  await recordAudit(user, { action: "training.assignment_updated", entityType: "training_assignment", entityId: id, summary: `Changed ${row.title} for ${await nameOf(row.user_id)}${dueDate ? `: due ${dueDate}` : ""}${requirement ? ` (${requirement})` : ""}` });
  return { success: true };
}

// Remove an assignment that hasn't been completed (a completion is a record and stays)
export async function removeAssignment(user, id) {
  const row = await findAssignment(id);
  if (row.completed_at) throw new ApiError("Completed Training stays on record.", 409);
  if (row.source === "onboarding") throw new ApiError("Onboarding training can't be removed.", 409);
  await query("DELETE FROM training_assignments WHERE id = ?", [id]);
  await recordAudit(user, { action: "training.unassigned", entityType: "training_assignment", entityId: id, summary: `Removed ${row.title} from ${await nameOf(row.user_id)}` });
  return { success: true };
}

const nameOf = async (userId) => (await query("SELECT name FROM users WHERE id = ?", [userId]))[0]?.name ?? "a former employee";

// ── Trainings (courses) ──
async function categoryById(id, { required = true } = {}) {
  if (!id) {
    if (required) throw new ApiError("Choose a category.");
    return null;
  }
  const [row] = await query("SELECT id, name FROM training_categories WHERE id = ?", [id]);
  if (!row) throw new ApiError("That category doesn't exist.");
  return row;
}

export async function listTrainings() {
  await syncOnboardingAssignments();
  const rows = await query(
    `SELECT training_courses.*, training_categories.name AS categoryName, creator.name AS createdByName
     FROM training_courses LEFT JOIN training_categories ON training_categories.id = training_courses.category_id LEFT JOIN users AS creator ON creator.id = training_courses.created_by
     WHERE training_courses.status = 'published' ORDER BY training_courses.required_for_onboarding DESC, training_courses.title`
  );
  const links = await query("SELECT training_course_materials.course_id AS courseId, training_materials.id, training_materials.title, training_materials.format FROM training_course_materials JOIN training_materials ON training_materials.id = training_course_materials.material_id ORDER BY training_course_materials.sort_order");
  const modules = await query("SELECT course_id AS courseId, COUNT(*) AS modules FROM training_course_modules GROUP BY course_id");
  const counts = await query("SELECT course_id AS courseId, COUNT(*) AS assigned, SUM(completed_at IS NOT NULL) AS completed FROM training_assignments GROUP BY course_id");
  return rows.map((row) => {
    const materials = links.filter((link) => link.courseId === row.id).map(({ id, title, format }) => ({ id, title, format }));
    const stat = counts.find((item) => item.courseId === row.id);
    return {
      id: row.id,
      title: row.title,
      description: row.description ?? "",
      categoryId: row.category_id,
      category: row.categoryName ?? "Uncategorized",
      minutes: row.minutes,
      requirement: row.requirement,
      issueCertificate: Boolean(row.issue_certificate),
      certificateValidity: row.certificate_validity,
      certificateMonths: row.certificate_months,
      onboarding: Boolean(row.required_for_onboarding),
      materials,
      formats: [...new Set(materials.map((material) => material.format))],
      modules: Number(modules.find((item) => item.courseId === row.id)?.modules ?? 0),
      assigned: Number(stat?.assigned ?? 0),
      completed: Number(stat?.completed ?? 0),
      createdBy: row.createdByName ?? "PitchProX",
      createdAt: row.created_at,
    };
  });
}

async function cleanTraining(input, existing = {}) {
  const has = (key) => input[key] !== undefined;
  const title = has("title") ? text(input.title, "a Training title", 255, { required: true }) : existing.title;
  const description = has("description") ? text(input.description, "the description", 2000) : existing.description ?? null;
  const category = await categoryById(has("categoryId") ? input.categoryId : existing.category_id);
  const minutes = has("minutes") ? (input.minutes === "" || input.minutes === null ? null : Number.parseInt(input.minutes, 10)) : existing.minutes ?? null;
  if (minutes !== null && (!Number.isFinite(minutes) || minutes < 1 || minutes > 2400)) throw new ApiError("Estimated duration must be between 1 and 2400 minutes.");
  const requirement = has("requirement") ? input.requirement : existing.requirement ?? "Required";
  if (!TRAINING_REQUIREMENTS.includes(requirement)) throw new ApiError("Choose Required, Recommended or Optional.");
  const issueCertificate = has("issueCertificate") ? Boolean(input.issueCertificate) : Boolean(existing.issue_certificate);
  const certificateValidity = has("certificateValidity") ? input.certificateValidity : existing.certificate_validity ?? "Does Not Expire";
  if (!CERTIFICATE_VALIDITY.includes(certificateValidity)) throw new ApiError("Choose how long the certificate is valid.");
  let certificateMonths = has("certificateMonths") ? Number.parseInt(input.certificateMonths, 10) : existing.certificate_months ?? null;
  if (issueCertificate && certificateValidity === "Custom") {
    if (!Number.isFinite(certificateMonths) || certificateMonths < 1 || certificateMonths > 120) throw new ApiError("Enter a custom validity between 1 and 120 months.");
  } else {
    certificateMonths = null;
  }
  const materialIds = has("materialIds") ? input.materialIds : undefined;
  if (materialIds !== undefined) {
    if (!Array.isArray(materialIds) || !materialIds.length) throw new ApiError("Add at least one Training Material from the library.");
    const found = await query(`SELECT id FROM training_materials WHERE status = 'active' AND id IN (${materialIds.map(() => "?").join(", ")})`, materialIds);
    if (found.length !== new Set(materialIds).size) throw new ApiError("One of the materials isn't in the library.");
  }
  return { title, description, category, minutes, requirement, issueCertificate, certificateValidity, certificateMonths, materialIds };
}

async function saveMaterials(courseId, materialIds) {
  await query("DELETE FROM training_course_materials WHERE course_id = ?", [courseId]);
  for (const [index, materialId] of [...new Set(materialIds)].entries()) {
    await query("INSERT INTO training_course_materials (course_id, material_id, sort_order) VALUES (?, ?, ?)", [courseId, materialId, index]);
  }
}

export async function createTraining(user, input) {
  const fields = await cleanTraining({ materialIds: input.materialIds ?? [], ...input });
  const [duplicate] = await query("SELECT id FROM training_courses WHERE LOWER(title) = LOWER(?) AND status = 'published'", [fields.title]);
  if (duplicate) throw new ApiError("A Training with this title already exists.", 409);
  const id = createId("course");
  await query(
    "INSERT INTO training_courses (id, title, description, category, category_id, minutes, requirement, issue_certificate, certificate_validity, certificate_months, required_for_onboarding, status, created_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'published', ?, NOW())",
    [id, fields.title, fields.description, fields.category.name, fields.category.id, fields.minutes, fields.requirement, fields.issueCertificate ? 1 : 0, fields.certificateValidity, fields.certificateMonths, user.id]
  );
  await saveMaterials(id, fields.materialIds);
  await recordAudit(user, { action: "training.created", entityType: "training_course", entityId: id, summary: `Created the Training ${fields.title} (${fields.materialIds.length} material${fields.materialIds.length === 1 ? "" : "s"})` });
  return (await listTrainings()).find((training) => training.id === id);
}

export async function updateTraining(user, id, input) {
  const [row] = await query("SELECT * FROM training_courses WHERE id = ? AND status = 'published'", [id]);
  if (!row) throw new ApiError("Training not found.", 404);
  if (row.required_for_onboarding && input.materialIds !== undefined) throw new ApiError("The onboarding Training uses its onboarding modules.", 409);
  const fields = await cleanTraining(input, row);
  await query(
    "UPDATE training_courses SET title = ?, description = ?, category = ?, category_id = ?, minutes = ?, requirement = ?, issue_certificate = ?, certificate_validity = ?, certificate_months = ?, updated_at = NOW() WHERE id = ?",
    [fields.title, fields.description, fields.category.name, fields.category.id, fields.minutes, fields.requirement, fields.issueCertificate ? 1 : 0, fields.certificateValidity, fields.certificateMonths, id]
  );
  if (fields.materialIds) await saveMaterials(id, fields.materialIds);
  await recordAudit(user, { action: "training.updated", entityType: "training_course", entityId: id, summary: `Updated the Training ${fields.title}` });
  return (await listTrainings()).find((training) => training.id === id);
}

// Retire a Training: open assignments are removed, completions stay on record
export async function archiveTraining(user, id) {
  const [row] = await query("SELECT title, required_for_onboarding FROM training_courses WHERE id = ? AND status = 'published'", [id]);
  if (!row) throw new ApiError("Training not found.", 404);
  if (row.required_for_onboarding) throw new ApiError("The onboarding Training can't be retired here.", 409);
  const [{ open }] = await query("SELECT COUNT(*) AS open FROM training_assignments WHERE course_id = ? AND completed_at IS NULL", [id]);
  await query("DELETE FROM training_assignments WHERE course_id = ? AND completed_at IS NULL", [id]);
  await query("UPDATE training_courses SET status = 'archived', updated_at = NOW() WHERE id = ?", [id]);
  await recordAudit(user, { action: "training.archived", entityType: "training_course", entityId: id, summary: `Retired the Training ${row.title}${Number(open) ? ` (${open} open assignment${Number(open) === 1 ? "" : "s"} removed)` : ""}` });
  return { archived: true };
}

// ── Library materials ──
const MATERIAL_SELECT = `SELECT training_materials.*, training_categories.name AS categoryName, creator.name AS createdByName,
  (SELECT COUNT(*) FROM training_course_materials WHERE training_course_materials.material_id = training_materials.id) AS usedIn
  FROM training_materials LEFT JOIN training_categories ON training_categories.id = training_materials.category_id LEFT JOIN users AS creator ON creator.id = training_materials.created_by`;

const toMaterial = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description ?? "",
  format: row.format,
  categoryId: row.category_id,
  category: row.categoryName ?? "Uncategorized",
  file: row.file_path ? { name: row.file_name, size: formatBytes(Number(row.file_size)), mime: row.file_mime } : null,
  videoUrl: row.video_url,
  minutes: row.minutes,
  usedIn: Number(row.usedIn ?? 0),
  createdBy: row.createdByName ?? "—",
  createdAt: row.created_at,
});

export async function listMaterials({ search = "" } = {}) {
  const values = [];
  let where = "WHERE training_materials.status = 'active'";
  if (search) {
    where += " AND (training_materials.title LIKE ? OR training_materials.description LIKE ?)";
    values.push(likePattern(search), likePattern(search));
  }
  const materials = (await query(`${MATERIAL_SELECT} ${where} ORDER BY training_materials.created_at DESC`, values)).map(toMaterial);
  return {
    results: materials,
    stats: { total: materials.length, ...Object.fromEntries(MATERIAL_FORMATS.map((format) => [format, materials.filter((material) => material.format === format).length])) },
    categories: await query("SELECT id, name FROM training_categories ORDER BY name"),
  };
}

// Video links: https only, so nothing else can be embedded
function cleanVideoUrl(value) {
  const url = String(value ?? "").trim();
  if (!url) return null;
  let parsed;
  try { parsed = new URL(url); } catch { throw new ApiError("Enter a valid video link (https://…)."); }
  if (parsed.protocol !== "https:") throw new ApiError("Video links must start with https://.");
  return parsed.toString().slice(0, 500);
}

// Upload: multipart with file (PDF / Doc / Video) or a video link
export async function addMaterial(user, form) {
  const title = text(form.get("title"), "a material title", 255, { required: true });
  const description = text(form.get("description"), "the description", 500);
  const category = await categoryById(form.get("categoryId") || null);
  const minutes = form.get("minutes") ? Number.parseInt(form.get("minutes"), 10) : null;
  if (minutes !== null && (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440)) throw new ApiError("Duration must be between 1 and 1440 minutes.");
  const file = form.get("file");
  const videoUrl = cleanVideoUrl(form.get("videoUrl"));
  let saved = null;
  let format;
  if (file && typeof file !== "string" && file.size) {
    format = formatForExtension((file.name.split(".").pop() || ""));
    if (!format) throw new ApiError("Upload a PDF, Word document (DOC/DOCX) or video (MP4/WEBM/MOV).");
    saved = await saveUpload(STORAGE_AREA, file, { maxBytes: MATERIAL_MAX_BYTES[format], allowed: MATERIAL_FILE_TYPES[format] });
  } else if (videoUrl) {
    format = "Video";
  } else {
    throw new ApiError("Upload a file or add a video link.");
  }
  const id = createId("tmat");
  await query(
    "INSERT INTO training_materials (id, title, description, format, category_id, file_path, file_name, file_size, file_mime, video_url, minutes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, title, description, format, category.id, saved?.storagePath ?? null, saved?.name ?? null, saved?.size ?? null, saved?.mime ?? null, saved ? null : videoUrl, minutes, user.id]
  );
  await recordAudit(user, { action: "training.material_added", entityType: "training_material", entityId: id, summary: `Added ${format} material ${title} to the Training Library` });
  return toMaterial((await query(`${MATERIAL_SELECT} WHERE training_materials.id = ?`, [id]))[0]);
}

export async function updateMaterial(user, id, body) {
  const [row] = await query("SELECT * FROM training_materials WHERE id = ? AND status = 'active'", [id]);
  if (!row) throw new ApiError("Material not found.", 404);
  const title = body.title !== undefined ? text(body.title, "a material title", 255, { required: true }) : row.title;
  const description = body.description !== undefined ? text(body.description, "the description", 500) : row.description;
  const category = await categoryById(body.categoryId !== undefined ? body.categoryId : row.category_id);
  await query("UPDATE training_materials SET title = ?, description = ?, category_id = ? WHERE id = ?", [title, description, category.id, id]);
  await recordAudit(user, { action: "training.material_updated", entityType: "training_material", entityId: id, summary: `Updated the material ${title}` });
  return toMaterial((await query(`${MATERIAL_SELECT} WHERE training_materials.id = ?`, [id]))[0]);
}

// A material used by a Training is retired (kept for its history); an unused one is deleted
export async function removeMaterial(user, id) {
  const [row] = await query(`${MATERIAL_SELECT} WHERE training_materials.id = ? AND training_materials.status = 'active'`, [id]);
  if (!row) throw new ApiError("Material not found.", 404);
  if (Number(row.usedIn)) throw new ApiError(`This material is part of ${row.usedIn} Training${Number(row.usedIn) === 1 ? "" : "s"}. Remove it from them first.`, 409);
  await query("DELETE FROM training_materials WHERE id = ?", [id]);
  if (row.file_path) await deleteUpload(row.file_path);
  await recordAudit(user, { action: "training.material_deleted", entityType: "training_material", entityId: id, summary: `Deleted the material ${row.title}` });
  return { deleted: true };
}

export async function materialFile(id) {
  const [row] = await query("SELECT file_path, file_name, file_mime FROM training_materials WHERE id = ?", [id]);
  if (!row?.file_path) throw new ApiError("This material has no file.", 404);
  return { bytes: await readUpload(row.file_path), name: row.file_name, mime: row.file_mime || "application/octet-stream" };
}

// ── Categories ──
export async function listCategories() {
  return query(
    `SELECT training_categories.id, training_categories.name, training_categories.description, training_categories.created_at AS createdAt,
       (SELECT COUNT(*) FROM training_courses WHERE training_courses.category_id = training_categories.id AND training_courses.status = 'published') AS trainings,
       (SELECT COUNT(*) FROM training_materials WHERE training_materials.category_id = training_categories.id AND training_materials.status = 'active') AS materials
     FROM training_categories ORDER BY training_categories.name`
  ).then((rows) => rows.map((row) => ({ ...row, trainings: Number(row.trainings), materials: Number(row.materials) })));
}

async function assertUniqueCategory(name, exceptId = null) {
  const [duplicate] = await query("SELECT id FROM training_categories WHERE name_key = ? AND id <> ?", [name.toLowerCase(), exceptId ?? ""]);
  if (duplicate) throw new ApiError(`A category called "${name}" already exists.`, 409);
}

export async function createCategory(user, { name, description }) {
  const clean = text(name, "a category name", 80, { required: true });
  await assertUniqueCategory(clean);
  const id = createId("tcat");
  await query("INSERT INTO training_categories (id, name, name_key, description, created_by) VALUES (?, ?, ?, ?, ?)", [id, clean, clean.toLowerCase(), text(description, "the description", 255), user.id]);
  await recordAudit(user, { action: "training.category_created", entityType: "training_category", entityId: id, summary: `Added the training category ${clean}` });
  return (await listCategories()).find((category) => category.id === id);
}

export async function updateCategory(user, id, { name, description }) {
  const [row] = await query("SELECT * FROM training_categories WHERE id = ?", [id]);
  if (!row) throw new ApiError("Category not found.", 404);
  const clean = name !== undefined ? text(name, "a category name", 80, { required: true }) : row.name;
  await assertUniqueCategory(clean, id);
  await query("UPDATE training_categories SET name = ?, name_key = ?, description = ? WHERE id = ?", [clean, clean.toLowerCase(), description !== undefined ? text(description, "the description", 255) : row.description, id]);
  await query("UPDATE training_courses SET category = ? WHERE category_id = ?", [clean, id]);
  await recordAudit(user, { action: "training.category_updated", entityType: "training_category", entityId: id, summary: row.name === clean ? `Updated the training category ${clean}` : `Renamed the training category ${row.name} to ${clean}` });
  return (await listCategories()).find((category) => category.id === id);
}

// A category with Trainings or materials needs somewhere to move them first (client item)
export async function deleteCategory(user, id, { moveTo } = {}) {
  const category = (await listCategories()).find((item) => item.id === id);
  if (!category) throw new ApiError("Category not found.", 404);
  if (category.trainings || category.materials) {
    if (!moveTo) throw new ApiError(`Move the ${category.trainings} Training${category.trainings === 1 ? "" : "s"} and ${category.materials} material${category.materials === 1 ? "" : "s"} to another category first.`, 409);
    if (moveTo === id) throw new ApiError("Choose a different category to move them to.");
    const target = await categoryById(moveTo);
    await query("UPDATE training_courses SET category_id = ?, category = ? WHERE category_id = ?", [target.id, target.name, id]);
    await query("UPDATE training_materials SET category_id = ? WHERE category_id = ?", [target.id, id]);
  }
  await query("DELETE FROM training_categories WHERE id = ?", [id]);
  await recordAudit(user, { action: "training.category_deleted", entityType: "training_category", entityId: id, summary: `Deleted the training category ${category.name}${moveTo ? " (its Trainings were moved)" : ""}` });
  return { deleted: true };
}

// ── Export Training Report (Training Assignment Report) ──
export const REPORT_FIELDS = {
  "Employee Name": (row) => row.employee.name,
  "Role": (row) => row.employee.role,
  "Department": (row) => row.employee.department,
  "Training": (row) => row.trainingTitle,
  "Category": (row) => row.category,
  "Requirement": (row) => row.requirement,
  "Assigned On": (row) => dateText(row.assignedOn),
  "Assigned By": (row) => row.assignedBy,
  "Due Date": (row) => row.dueDate ?? "",
  "Status": (row) => row.status,
  "Completed On": (row) => dateText(row.completedOn) ?? "",
  "Certificate": (row) => row.certificate?.number ?? "",
  "Certificate Expires": (row) => (row.certificate ? row.certificate.expiresOn ?? "Does not expire" : ""),
};

export async function trainingReport(user, params) {
  const training = params.get("training") || "All";
  const status = params.get("status") || "All";
  const department = params.get("department") || "All";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  if ((from && !isDate(from)) || (to && !isDate(to))) throw new ApiError("Dates must look like 2026-11-08.");
  if (status !== "All" && !TRAINING_STATUSES.includes(status)) throw new ApiError("Unknown status.");
  if (department !== "All" && !TRAINING_DEPARTMENTS.includes(department)) throw new ApiError("Unknown department.");
  const fields = (params.get("fields") || Object.keys(REPORT_FIELDS).join(",")).split(",").map((field) => field.trim()).filter((field) => REPORT_FIELDS[field]);
  if (!fields.length) throw new ApiError("Choose at least one field.");
  await syncOnboardingAssignments();
  // The date range applies to when the Training was assigned
  const rows = (await loadAssignments()).filter((row) =>
    (training === "All" || row.trainingId === training) &&
    (status === "All" || row.status === status) &&
    (department === "All" || row.employee.department === department) &&
    (!from || dateText(row.assignedOn) >= from) &&
    (!to || dateText(row.assignedOn) <= to)
  );
  const cell = (value) => {
    let clean = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(clean)) clean = `'${clean}`;
    return `"${clean.replace(/"/g, '""')}"`;
  };
  const csv = [fields.map(cell).join(","), ...rows.map((row) => fields.map((field) => cell(REPORT_FIELDS[field](row))).join(","))].join("\n");
  if (params.get("count") !== "1") {
    await recordAudit(user, { action: "training.report_exported", entityType: "training_assignment", summary: `Exported the Training Assignment Report (${rows.length} assignment${rows.length === 1 ? "" : "s"})`, metadata: { training, status, department, from, to, fields } });
  }
  return { csv, rows: rows.length, filename: `training-assignment-report-${today()}.csv` };
}

// ── The signed-in employee's own Training ──
export async function myTraining(user) {
  await syncOnboardingAssignments();
  const assignments = await loadAssignments("WHERE training_assignments.user_id = ?", [user.id]);
  const ids = assignments.map((item) => item.id);
  const materials = ids.length
    ? await query(
        `SELECT training_assignments.id AS assignmentId, training_materials.id, training_materials.title, training_materials.format, training_materials.description, training_materials.file_path IS NOT NULL AS hasFile, training_materials.video_url AS videoUrl, views.viewed_at AS viewedAt
         FROM training_assignments
         JOIN training_course_materials ON training_course_materials.course_id = training_assignments.course_id
         JOIN training_materials ON training_materials.id = training_course_materials.material_id
         LEFT JOIN training_material_views AS views ON views.assignment_id = training_assignments.id AND views.material_id = training_materials.id
         WHERE training_assignments.id IN (${ids.map(() => "?").join(", ")}) ORDER BY training_course_materials.sort_order`,
        ids
      )
    : [];
  const results = assignments.map((item) => {
    const list = materials.filter((material) => material.assignmentId === item.id).map((material) => ({
      id: material.id,
      title: material.title,
      format: material.format,
      description: material.description,
      url: material.hasFile ? `/api/v1/me/training/${item.id}/materials/${material.id}/file` : material.videoUrl,
      external: !material.hasFile,
      viewed: Boolean(material.viewedAt),
    }));
    return { ...item, materials: list, canComplete: item.source !== "onboarding" && !item.completedOn && list.every((material) => material.viewed) };
  });
  return { results, open: results.filter((item) => item.status !== "Completed").length };
}

async function myAssignment(user, assignmentId) {
  const row = await findAssignment(assignmentId);
  if (row.user_id !== user.id) throw new ApiError("Assignment not found.", 404);
  return row;
}

// Opening a material marks it as viewed (and the Training as started)
export async function viewMaterial(user, assignmentId, materialId) {
  const assignment = await myAssignment(user, assignmentId);
  const [link] = await query("SELECT material_id FROM training_course_materials WHERE course_id = ? AND material_id = ?", [assignment.course_id, materialId]);
  if (!link) throw new ApiError("Material not found.", 404);
  await query("INSERT IGNORE INTO training_material_views (assignment_id, material_id) VALUES (?, ?)", [assignmentId, materialId]);
  await query("UPDATE training_assignments SET started_at = COALESCE(started_at, NOW()) WHERE id = ?", [assignmentId]);
  return materialId;
}

export async function completeMyTraining(user, assignmentId) {
  const assignment = await myAssignment(user, assignmentId);
  if (assignment.completed_at) throw new ApiError("You've already completed this Training.", 409);
  if (assignment.source === "onboarding") throw new ApiError("Onboarding training is completed in onboarding.", 409);
  const [{ missing }] = await query(
    "SELECT COUNT(*) AS missing FROM training_course_materials LEFT JOIN training_material_views AS views ON views.material_id = training_course_materials.material_id AND views.assignment_id = ? WHERE training_course_materials.course_id = ? AND views.material_id IS NULL",
    [assignmentId, assignment.course_id]
  );
  if (Number(missing)) throw new ApiError("Open every material before completing the Training.", 409);
  const [course] = await query("SELECT issue_certificate, certificate_validity, certificate_months FROM training_courses WHERE id = ?", [assignment.course_id]);
  const certificate = course?.issue_certificate ? `CERT-${randomBytes(4).toString("hex").toUpperCase()}` : null;
  await query(
    "UPDATE training_assignments SET completed_at = NOW(), started_at = COALESCE(started_at, NOW()), certificate_number = ?, certificate_expires_on = ? WHERE id = ?",
    [certificate, certificate ? certificateExpiry(course.certificate_validity, course.certificate_months) : null, assignmentId]
  );
  await recordAudit(user, { action: "training.completed", entityType: "training_course", entityId: assignment.course_id, summary: `${user.name} completed ${assignment.title}${certificate ? ` (certificate ${certificate})` : ""}` });
  return myTraining(user);
}

// Reminder for one open assignment (queued email)
export async function remindAssignment(user, id) {
  const row = await findAssignment(id);
  if (row.completed_at) throw new ApiError("This Training is already completed.", 409);
  const [person] = await query("SELECT name, email FROM users WHERE id = ?", [row.user_id]);
  if (!person) throw new ApiError("Employee not found.", 404);
  await queueEmail({
    source: "compliance",
    sourceId: row.user_id,
    template: { id: null, emailType: "Transactional" },
    userId: row.user_id,
    email: person.email,
    subject: `Reminder: ${row.title}`,
    html: `<p>Hi ${escapeHtml(person.name.split(" ")[0])},</p><p>Please complete <strong>${escapeHtml(row.title)}</strong>${row.due_date ? ` by ${escapeHtml(dateText(row.due_date))}` : ""}. Open <strong>My Training</strong> in PitchProX.</p>`,
  });
  await notifyBell([row.user_id], { type: "training", title: `Reminder: ${row.title}`, body: row.due_date ? `Please complete it by ${dateText(row.due_date)}.` : "Please complete it soon.", link: portalHome, entityType: "training_assignment", entityId: id, actor: user });
  await recordAudit(user, { action: "training.reminder_sent", entityType: "training_assignment", entityId: id, summary: `Reminded ${person.name} about ${row.title}` });
  return { reminded: true };
}

