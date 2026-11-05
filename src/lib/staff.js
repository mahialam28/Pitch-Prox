import { randomBytes } from "node:crypto";
import { createId, hashPassword, hashToken, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { likePattern, paged } from "@/lib/listing";
import { EMPLOYEE_ROLE_OPTIONS, ROLE_LABELS, STAFF_ROLES } from "@/utils.js/roles";

// ── PitchProX employees (staff) ──
// Staff users belong to the internal organization and have a staff_profiles row.
// Lifecycle: invited → onboarding → active → (offboarding) → deactivated.

export const INTERNAL_ORGANIZATION = { id: "org_pitchprox_internal", name: "PitchProX" };
const INVITE_DAYS = 7;
const ONBOARDING_DAYS = 14;

export const employeeNumber = (number) => (number ? `EMP-${number}` : null);

const STATUS_LABELS = {
  invited: "Pending",
  expired: "Expired",
  onboarding: "Onboarding",
  active: "Active",
  offboarding: "Offboarding",
  deactivated: "Deactivated",
};

// Invited users whose latest link has run out show as "Expired"
const EFFECTIVE_STATUS = `CASE WHEN staff_profiles.status = 'invited' AND NOT EXISTS (SELECT 1 FROM staff_invites WHERE staff_invites.user_id = users.id AND staff_invites.accepted_at IS NULL AND staff_invites.expires_at > NOW()) THEN 'expired' ELSE staff_profiles.status END`;

const EMPLOYEE_COLUMNS = `users.id, users.name, users.email, users.role, users.created_at AS createdAt,
  staff_profiles.employee_number AS employeeNumber, staff_profiles.department, staff_profiles.job_title AS jobTitle,
  staff_profiles.manager_id AS managerId, managers.name AS managerName, staff_profiles.phone, staff_profiles.timezone,
  staff_profiles.language, staff_profiles.start_date AS startDate, staff_profiles.onboarding_due AS onboardingDue,
  staff_profiles.mfa_method AS mfaMethod, ${EFFECTIVE_STATUS} AS status,
  (SELECT MAX(created_at) FROM login_events WHERE login_events.user_id = users.id AND login_events.success = 1) AS lastLoginAt`;

const EMPLOYEE_FROM = `FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id LEFT JOIN users AS managers ON managers.id = staff_profiles.manager_id`;

const initialsOf = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");

const toEmployee = (row) => ({
  ...row,
  initials: initialsOf(row.name),
  employeeId: employeeNumber(row.employeeNumber),
  roleLabel: ROLE_LABELS[row.role] ?? row.role,
  statusLabel: STATUS_LABELS[row.status] ?? row.status,
  mfa: row.mfaMethod ? "Enabled" : "Disabled",
});

// Access Records tabs → status filter
const TAB_STATUSES = {
  all: null,
  pending: ["invited"],
  "in-progress": ["onboarding"],
  active: ["active"],
  offboarding: ["offboarding"],
  completed: ["active"], // older name for the Active tab
  expired: ["expired"],
};

export const EMPLOYEE_SORTS = { name: "users.name", role: "users.role", status: "status", lastLogin: "lastLoginAt", created: "users.created_at" };

export async function listEmployees({ tab = "all", role, status, mfa, search, page, pageSize, offset, orderBy }) {
  if (!(tab in TAB_STATUSES)) throw new ApiError("Unknown tab.");
  const clauses = ["users.role IN (" + STAFF_ROLES.map(() => "?").join(", ") + ")"];
  const values = [...STAFF_ROLES];
  const statuses = TAB_STATUSES[tab] ?? (status ? [status] : null);
  if (statuses) {
    clauses.push(`${EFFECTIVE_STATUS} IN (${statuses.map(() => "?").join(", ")})`);
    values.push(...statuses);
  }
  if (role) { clauses.push("users.role = ?"); values.push(role); }
  if (mfa === "enabled") clauses.push("staff_profiles.mfa_method IS NOT NULL");
  if (mfa === "disabled") clauses.push("staff_profiles.mfa_method IS NULL");
  if (search) {
    clauses.push("(users.name LIKE ? OR users.email LIKE ?)");
    values.push(likePattern(search), likePattern(search));
  }
  const where = `WHERE ${clauses.join(" AND ")}`;
  const [{ total }] = await query(`SELECT COUNT(*) AS total ${EMPLOYEE_FROM} ${where}`, values);
  const rows = await query(`SELECT ${EMPLOYEE_COLUMNS} ${EMPLOYEE_FROM} ${where} ORDER BY ${orderBy ?? "users.created_at DESC"} LIMIT ${Number(pageSize)} OFFSET ${Number(offset)}`, values);
  return paged(rows.map(toEmployee), total, { page, pageSize });
}

export async function getEmployee(id) {
  const [row] = await query(`SELECT ${EMPLOYEE_COLUMNS} ${EMPLOYEE_FROM} WHERE users.id = ?`, [id]);
  if (!row) throw new ApiError("Employee not found.", 404);
  return toEmployee(row);
}

// Top cards and the role donut on Access Records
export async function employeeStats() {
  const [counts] = await query(
    `SELECT COUNT(*) AS total,
      SUM(staff_profiles.status = 'active') AS active,
      SUM(staff_profiles.status IN ('invited', 'onboarding')) AS onboarding,
      SUM(users.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS addedThisMonth
     ${EMPLOYEE_FROM}`
  );
  const [{ offboarding }] = await query("SELECT COUNT(*) AS offboarding FROM offboarding_cases WHERE status <> 'completed'");
  const roles = await query(`SELECT users.role, COUNT(*) AS count ${EMPLOYEE_FROM} GROUP BY users.role ORDER BY count DESC`);
  return {
    total: Number(counts.total),
    active: Number(counts.active ?? 0),
    onboarding: Number(counts.onboarding ?? 0),
    offboarding: Number(offboarding),
    addedThisMonth: Number(counts.addedThisMonth ?? 0),
    roles: roles.map((row) => ({ role: row.role, label: ROLE_LABELS[row.role] ?? row.role, count: Number(row.count) })),
  };
}

// Active staff who can be picked as a manager / owner
export async function listManagers() {
  return query(
    `SELECT users.id, users.name, users.email, users.role, staff_profiles.job_title AS jobTitle, staff_profiles.department ${EMPLOYEE_FROM} WHERE staff_profiles.status = 'active' ORDER BY users.name`
  );
}

const ensureInternalOrganization = () => query("INSERT IGNORE INTO organizations (id, name) VALUES (?, ?)", [INTERNAL_ORGANIZATION.id, INTERNAL_ORGANIZATION.name]);

const text = (value, label, max, { required = false } = {}) => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (required && !trimmed) throw new ApiError(`${label} is required.`);
  if (trimmed.length > max) throw new ApiError(`${label} must be ${max} characters or fewer.`);
  return trimmed || null;
};

const validDate = (value, label) => {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) throw new ApiError(`${label} must be a date (YYYY-MM-DD).`);
  return value;
};

async function assertManager(managerId) {
  if (!managerId) return null;
  const [manager] = await query("SELECT users.id FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id WHERE users.id = ? AND staff_profiles.status = 'active'", [managerId]);
  if (!manager) throw new ApiError("Choose an active employee as the manager.");
  return managerId;
}

// New one-time activation link; returns the raw token (only its hash is stored)
async function createInvite(userId, actorId) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + INVITE_DAYS * 86400000);
  await query("INSERT INTO staff_invites (id, user_id, token_hash, expires_at, created_by) VALUES (?, ?, ?, ?, ?)", [createId("invite"), userId, hashToken(token), expires, actorId]);
  return { token, expiresAt: expires.toISOString() };
}

// Add Employee wizard. Until an email service is connected the activation
// link is returned to the admin to share; later it is emailed automatically.
export async function inviteEmployee(actor, body) {
  const name = text(body.fullName ?? body.name, "Full name", 255, { required: true });
  const email = text(body.email, "Email", 255, { required: true })?.toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ApiError("Enter a valid email address.");
  const option = EMPLOYEE_ROLE_OPTIONS.find((item) => item.role === body.role || item.label === body.role);
  if (!option) throw new ApiError("Choose a valid role.");
  const [existing] = await query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) throw new ApiError("Someone with this email already has an account.", 409);
  const managerId = await assertManager(body.managerId || null);
  const startDate = validDate(body.startDate, "Start date") ?? new Date().toISOString().slice(0, 10);
  const due = new Date(Date.parse(startDate) + ONBOARDING_DAYS * 86400000).toISOString().slice(0, 10);

  await ensureInternalOrganization();
  const id = createId("user");
  // A random password nobody knows; the employee sets their own during onboarding
  const { salt, hash } = hashPassword(randomBytes(24).toString("hex"));
  await query("INSERT INTO users (id, organization_id, name, email, password_hash, password_salt, role) VALUES (?, ?, ?, ?, ?, ?, ?)", [id, INTERNAL_ORGANIZATION.id, name, email, hash, salt, option.role]);
  await query(
    "INSERT INTO staff_profiles (user_id, department, job_title, manager_id, timezone, language, start_date, onboarding_due, status, password_set, invited_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'invited', 0, ?)",
    [id, text(body.department, "Department", 80) ?? (option.role === "sales_rep" ? "Sales" : null), text(body.jobTitle, "Job title", 120), managerId, text(body.timezone, "Timezone", 80), text(body.language, "Language", 40), startDate, due, actor.id]
  );
  const invite = await createInvite(id, actor.id);
  await recordAudit(actor, { action: "staff.invited", entityType: "user", entityId: id, summary: `Invited ${name} (${email}) as ${option.label}` });
  return { employee: await getEmployee(id), invite };
}

export async function resendInvite(actor, id) {
  const employee = await getEmployee(id);
  if (!["invited", "expired"].includes(employee.status)) throw new ApiError("This employee has already accepted their invite.");
  // Older links stop working once a new one is issued
  await query("UPDATE staff_invites SET expires_at = NOW() WHERE user_id = ? AND accepted_at IS NULL AND expires_at > NOW()", [id]);
  const invite = await createInvite(id, actor.id);
  await recordAudit(actor, { action: "staff.invite_resent", entityType: "user", entityId: id, summary: `Sent a new invite link to ${employee.name}` });
  return { employee: await getEmployee(id), invite };
}

// Activation link → marks the invite used and moves the employee into onboarding
export async function acceptInvite(token) {
  if (typeof token !== "string" || token.length < 20) throw new ApiError("This invite link is not valid.", 400);
  const [invite] = await query(
    "SELECT staff_invites.id, staff_invites.user_id AS userId, staff_invites.expires_at AS expiresAt, staff_invites.accepted_at AS acceptedAt, staff_profiles.status FROM staff_invites JOIN staff_profiles ON staff_profiles.user_id = staff_invites.user_id WHERE staff_invites.token_hash = ?",
    [hashToken(token)]
  );
  if (!invite) throw new ApiError("This invite link is not valid.", 404);
  if (invite.acceptedAt) throw new ApiError("This invite link was already used. Sign in instead.", 410);
  if (new Date(invite.expiresAt) <= new Date()) throw new ApiError("This invite link has expired. Ask your administrator for a new one.", 410);
  if (invite.status === "deactivated") throw new ApiError("This account has been deactivated.", 403);
  await query("UPDATE staff_invites SET accepted_at = NOW() WHERE id = ?", [invite.id]);
  if (invite.status === "invited") await query("UPDATE staff_profiles SET status = 'onboarding' WHERE user_id = ?", [invite.userId]);
  // started_at is set when they click "Get Started" on the Welcome step
  await query("INSERT IGNORE INTO onboarding_records (user_id) VALUES (?)", [invite.userId]);
  const [user] = await query("SELECT id, name, role FROM users WHERE id = ?", [invite.userId]);
  await recordAudit(user, { action: "staff.invite_accepted", entityType: "user", entityId: user.id, summary: `${user.name} accepted their invite` });
  return user;
}

// Role, manager and job details; suspend / reactivate
export async function updateEmployee(actor, id, body) {
  const employee = await getEmployee(id);
  if (id === actor.id && (body.role !== undefined || body.status !== undefined)) throw new ApiError("You can't change your own role or status.");
  const changes = [];
  const sets = [];
  const values = [];

  if (body.role !== undefined) {
    const option = EMPLOYEE_ROLE_OPTIONS.find((item) => item.role === body.role || item.label === body.role);
    if (!option) throw new ApiError("Choose a valid role.");
    if (option.role !== employee.role) {
      await query("UPDATE users SET role = ? WHERE id = ?", [option.role, id]);
      changes.push(`role ${employee.roleLabel} → ${ROLE_LABELS[option.role]}`);
    }
  }
  if (body.managerId !== undefined) {
    const managerId = body.managerId ? await assertManager(body.managerId) : null;
    if (managerId === id) throw new ApiError("An employee can't manage themselves.");
    sets.push("manager_id = ?"); values.push(managerId); changes.push("manager");
  }
  for (const [key, column, label, max] of [["department", "department", "Department", 80], ["jobTitle", "job_title", "Job title", 120], ["phone", "phone", "Phone", 64], ["timezone", "timezone", "Timezone", 80]]) {
    if (body[key] !== undefined) { sets.push(`${column} = ?`); values.push(text(body[key], label, max)); changes.push(label.toLowerCase()); }
  }
  if (body.status !== undefined) {
    if (!["active", "deactivated"].includes(body.status)) throw new ApiError("Status can only be set to active or deactivated here.");
    if (body.status === "active" && employee.status !== "deactivated") throw new ApiError("Only deactivated employees can be reactivated.");
    sets.push("status = ?"); values.push(body.status);
    changes.push(body.status === "deactivated" ? "deactivated" : "reactivated");
    // Deactivation signs the employee out everywhere
    if (body.status === "deactivated") await query("DELETE FROM sessions WHERE user_id = ?", [id]);
  }
  if (sets.length) await query(`UPDATE staff_profiles SET ${sets.join(", ")} WHERE user_id = ?`, [...values, id]);
  if (changes.length) await recordAudit(actor, { action: "staff.updated", entityType: "user", entityId: id, summary: `Updated ${employee.name}: ${changes.join(", ")}` });
  return getEmployee(id);
}

// Details shown on the onboarding screens for the signed-in employee
export async function getOwnStaffProfile(user) {
  return getEmployee(user.id);
}
