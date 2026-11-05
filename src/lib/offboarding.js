import { createId, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { getEmployee, employeeNumber } from "@/lib/staff";
import { OFFBOARDING_STEPS } from "@/lib/catalogs/onboarding-catalog";
import { ROLE_LABELS } from "@/utils.js/roles";

// ── Employee offboarding ──
// A case per departing employee with a 6-step checklist. Steps that remove access
// take effect immediately: "Revoke application access" signs the employee out and
// blocks sign-in; finishing the checklist deactivates the account for good.

export { OFFBOARDING_STEPS };
const STEP_KEYS = OFFBOARDING_STEPS.map((step) => step.key);

// Overdue = past the last day and not finished
const statusOf = (row) => {
  if (row.completedAt) return "completed";
  // lastDay is "YYYY-MM-DD" (DATE column); overdue once that day has fully passed
  const lastDay = new Date(`${row.lastDay}T23:59:59`);
  if (lastDay < new Date()) return "overdue";
  return row.doneCount > 0 ? "in_progress" : "pending";
};

const accessOf = (row) => {
  if (row.completedAt || row.staffStatus === "deactivated") return "Revoked";
  if (row.steps.includes("revoke-access") || row.steps.includes("disable-sso")) return "Partially revoked";
  return "Active";
};

async function loadCases(where = "", values = []) {
  const rows = await query(
    `SELECT offboarding_cases.id, offboarding_cases.user_id AS userId, offboarding_cases.last_day AS lastDay, offboarding_cases.reason,
      offboarding_cases.created_at AS createdAt, offboarding_cases.completed_at AS completedAt,
      users.name, users.email, users.role, staff_profiles.job_title AS jobTitle, staff_profiles.department, staff_profiles.status AS staffStatus,
      staff_profiles.employee_number AS employeeNumber,
      owners.id AS ownerId, owners.name AS ownerName, owner_profiles.job_title AS ownerTitle,
      (SELECT GROUP_CONCAT(step_key) FROM offboarding_case_steps WHERE case_id = offboarding_cases.id) AS stepList
     FROM offboarding_cases
     JOIN users ON users.id = offboarding_cases.user_id
     LEFT JOIN staff_profiles ON staff_profiles.user_id = users.id
     LEFT JOIN users AS owners ON owners.id = offboarding_cases.owner_id
     LEFT JOIN staff_profiles AS owner_profiles ON owner_profiles.user_id = owners.id
     ${where}
     ORDER BY offboarding_cases.completed_at IS NOT NULL, offboarding_cases.last_day`,
    values
  );
  return rows.map((row) => {
    const steps = row.stepList ? row.stepList.split(",") : [];
    const item = { ...row, steps, doneCount: steps.length };
    delete item.stepList;
    return {
      ...item,
      employeeId: employeeNumber(row.employeeNumber),
      roleLabel: ROLE_LABELS[row.role] ?? row.role,
      progress: Math.round((steps.length / STEP_KEYS.length) * 100),
      status: statusOf(item),
      access: accessOf(item),
    };
  });
}

export async function listOffboarding() {
  const cases = await loadCases();
  const [stats] = await query(
    `SELECT SUM(completed_at IS NULL) AS pending,
      SUM(completed_at IS NOT NULL AND completed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) AS completed30,
      SUM(completed_at IS NOT NULL AND completed_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND completed_at < DATE_SUB(NOW(), INTERVAL 30 DAY)) AS completedPrev30,
      AVG(CASE WHEN completed_at IS NOT NULL THEN TIMESTAMPDIFF(HOUR, created_at, completed_at) END) AS avgHours
     FROM offboarding_cases`
  );
  return {
    results: cases,
    steps: OFFBOARDING_STEPS,
    stats: {
      pending: Number(stats.pending ?? 0),
      inProgress: cases.filter((item) => item.status === "in_progress").length,
      overdue: cases.filter((item) => item.status === "overdue").length,
      completed30: Number(stats.completed30 ?? 0),
      completedPrev30: Number(stats.completedPrev30 ?? 0),
      avgDaysToRevoke: stats.avgHours == null ? null : Math.round((Number(stats.avgHours) / 24) * 10) / 10,
    },
  };
}

async function getCase(id) {
  const [item] = await loadCases("WHERE offboarding_cases.id = ?", [id]);
  if (!item) throw new ApiError("Offboarding case not found.", 404);
  return item;
}

const validDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) throw new ApiError("Last day must be a date (YYYY-MM-DD).");
  return value;
};

export async function startOffboarding(actor, { userId, lastDay, ownerId, reason }) {
  if (userId === actor.id) throw new ApiError("You can't offboard yourself.");
  const employee = await getEmployee(userId);
  if (employee.status === "deactivated") throw new ApiError("This employee is already deactivated.");
  const [open] = await query("SELECT id FROM offboarding_cases WHERE user_id = ? AND completed_at IS NULL", [userId]);
  if (open) throw new ApiError("This employee already has an open offboarding case.", 409);
  if (ownerId) {
    const [owner] = await query("SELECT users.id FROM users JOIN staff_profiles ON staff_profiles.user_id = users.id WHERE users.id = ? AND staff_profiles.status = 'active'", [ownerId]);
    if (!owner) throw new ApiError("Choose an active employee as the owner.");
  }
  const id = createId("offboard");
  await query("INSERT INTO offboarding_cases (id, user_id, last_day, owner_id, reason, created_by) VALUES (?, ?, ?, ?, ?, ?)", [
    id, userId, validDate(lastDay), ownerId || actor.id, typeof reason === "string" ? reason.trim().slice(0, 255) || null : null, actor.id,
  ]);
  await query("UPDATE staff_profiles SET status = 'offboarding' WHERE user_id = ? AND status <> 'deactivated'", [userId]);
  await recordAudit(actor, { action: "offboarding.started", entityType: "user", entityId: userId, summary: `Started offboarding for ${employee.name} (last day ${lastDay})` });
  return getCase(id);
}

// Tick or untick a checklist step. Steps are done in order (like the design's checklist).
export async function setOffboardingStep(actor, caseId, stepKey, done) {
  const item = await getCase(caseId);
  if (item.completedAt) throw new ApiError("This offboarding case is already complete.", 409);
  const index = STEP_KEYS.indexOf(stepKey);
  if (index < 0) throw new ApiError("Unknown checklist step.");
  const label = OFFBOARDING_STEPS[index].label;

  if (done) {
    const missing = STEP_KEYS.slice(0, index).find((key) => !item.steps.includes(key));
    if (missing) throw new ApiError("Complete the earlier checklist steps first.", 409);
    await query("INSERT IGNORE INTO offboarding_case_steps (case_id, step_key, done_by) VALUES (?, ?, ?)", [caseId, stepKey, actor.id]);
    // Access is cut as soon as these steps are ticked
    if (stepKey === "revoke-access" || stepKey === "disable-sso") await query("DELETE FROM sessions WHERE user_id = ?", [item.userId]);
    if (stepKey === "revoke-access") await query("UPDATE staff_profiles SET status = 'deactivated' WHERE user_id = ?", [item.userId]);
  } else {
    const later = STEP_KEYS.slice(index + 1).find((key) => item.steps.includes(key));
    if (later) throw new ApiError("Untick the later checklist steps first.", 409);
    await query("DELETE FROM offboarding_case_steps WHERE case_id = ? AND step_key = ?", [caseId, stepKey]);
    if (stepKey === "revoke-access") await query("UPDATE staff_profiles SET status = 'offboarding' WHERE user_id = ?", [item.userId]);
  }
  await recordAudit(actor, { action: done ? "offboarding.step_done" : "offboarding.step_undone", entityType: "user", entityId: item.userId, summary: `${done ? "Completed" : "Reopened"} "${label}" for ${item.name}` });

  const steps = done ? [...new Set([...item.steps, stepKey])] : item.steps.filter((key) => key !== stepKey);
  if (steps.length === STEP_KEYS.length) {
    await query("UPDATE offboarding_cases SET completed_at = NOW(), status = 'completed' WHERE id = ?", [caseId]);
    await query("UPDATE staff_profiles SET status = 'deactivated' WHERE user_id = ?", [item.userId]);
    await query("DELETE FROM sessions WHERE user_id = ?", [item.userId]);
    await recordAudit(actor, { action: "offboarding.completed", entityType: "user", entityId: item.userId, summary: `Completed offboarding for ${item.name}; access fully revoked` });
  } else {
    await query("UPDATE offboarding_cases SET status = ? WHERE id = ?", [steps.length ? "in_progress" : "pending", caseId]);
  }
  return getCase(caseId);
}
