import { createId, hashPassword, query } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { recordAudit } from "@/lib/audit";
import { requestClient } from "@/lib/auth";
import { getEmployee } from "@/lib/staff";
import { ROLES } from "@/utils.js/roles";

// ── Employee onboarding ──
// Steps unlock in order. Each mutation re-checks the step it belongs to, and
// when the last step is done the employee becomes "active" and gets portal access.

const BASE_STEPS = ["welcome", "policies", "ethics", "security", "training", "final"];
export const stepsFor = (role) => [...BASE_STEPS, ...(role === ROLES.SALES_REP ? ["voice"] : []), "complete"];

export const PASSWORD_RULES = [
  { label: "At least 8 characters long", test: (value) => value.length >= 8 },
  { label: "Uppercase & lowercase letters", test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { label: "At least one number", test: (value) => /\d/.test(value) },
  { label: "At least one special symbol (@, #, $)", test: (value) => /[^A-Za-z0-9]/.test(value) },
];
const MFA_METHODS = ["sms", "mail"];

const parseJson = (value) => (typeof value === "string" ? JSON.parse(value) : value);

async function loadPolicies(userId) {
  const rows = await query(
    `SELECT policy_documents.id, policy_documents.title, policy_documents.category, policy_documents.version, policy_documents.icon,
      policy_documents.effective_date AS effectiveDate, policy_documents.body, ack.signature_name AS signature, ack.created_at AS acknowledgedAt
     FROM policy_documents
     LEFT JOIN policy_acknowledgments AS ack ON ack.policy_id = policy_documents.id AND ack.version = policy_documents.version AND ack.user_id = ?
     WHERE policy_documents.status = 'published' AND policy_documents.required = 1
     ORDER BY policy_documents.sort_order`,
    [userId]
  );
  return rows.map((row) => ({ ...row, body: parseJson(row.body), acknowledged: Boolean(row.signature) }));
}

async function loadTraining(userId) {
  const courses = await query("SELECT id, title, description, category, minutes, resources FROM training_courses WHERE required_for_onboarding = 1 AND status = 'published' ORDER BY created_at");
  const modules = await query(
    `SELECT training_course_modules.id, training_course_modules.course_id AS courseId, training_course_modules.title, training_course_modules.minutes, progress.completed_at AS completedAt
     FROM training_course_modules
     JOIN training_courses ON training_courses.id = training_course_modules.course_id AND training_courses.required_for_onboarding = 1 AND training_courses.status = 'published'
     LEFT JOIN training_module_progress AS progress ON progress.module_id = training_course_modules.id AND progress.user_id = ?
     ORDER BY training_courses.created_at, training_course_modules.sort_order`,
    [userId]
  );
  return courses.map((course) => ({
    ...course,
    resources: parseJson(course.resources) ?? [],
    modules: modules.filter((trainingModule) => trainingModule.courseId === course.id).map((trainingModule) => ({ ...trainingModule, completed: Boolean(trainingModule.completedAt) })),
  }));
}

// Full onboarding state for the signed-in employee
export async function getOnboardingState(user) {
  const employee = await getEmployee(user.id);
  await query("INSERT IGNORE INTO onboarding_records (user_id) VALUES (?)", [user.id]);
  const [record] = await query("SELECT * FROM onboarding_records WHERE user_id = ?", [user.id]);
  const policies = await loadPolicies(user.id);
  const training = await loadTraining(user.id);
  const [staff] = await query("SELECT mfa_method AS mfaMethod, password_set AS passwordSet FROM staff_profiles WHERE user_id = ?", [user.id]);

  const company = policies.filter((policy) => policy.category === "company");
  const ai = policies.filter((policy) => policy.category === "ai");
  const modules = training.flatMap((course) => course.modules);
  const done = {
    welcome: Boolean(record.started_at),
    policies: company.every((policy) => policy.acknowledged),
    ethics: ai.every((policy) => policy.acknowledged),
    security: Boolean(staff.mfaMethod) && Boolean(staff.passwordSet),
    training: modules.every((trainingModule) => trainingModule.completed),
    final: Boolean(record.final_signed_at),
    voice: Boolean(record.voice_done_at),
  };
  const steps = stepsFor(user.role);
  const complete = steps.filter((step) => step !== "complete").every((step) => done[step]);
  done.complete = complete;

  return {
    variant: user.role === ROLES.SALES_REP ? "sales-rep" : "team",
    steps: steps.map((id) => ({ id, done: Boolean(done[id]) })),
    current: steps.find((id) => !done[id]) ?? "complete",
    completed: complete && employee.status === "active",
    profile: {
      name: employee.name,
      email: employee.email,
      role: employee.role,
      roleLabel: employee.role === ROLES.SALES_REP ? "Sales Representative" : employee.roleLabel,
      department: employee.department,
      managerName: employee.managerName,
      startDate: employee.startDate,
      onboardingDue: employee.onboardingDue,
      employeeId: employee.employeeId,
    },
    policies: company,
    aiPolicies: ai,
    security: { mfaMethod: staff.mfaMethod, passwordSet: Boolean(staff.passwordSet) },
    training,
    final: { signedAt: record.final_signed_at, signature: record.final_signature },
    voice: { doneAt: record.voice_done_at },
  };
}

// The employee must still be onboarding, and every step before `step` must be done
async function assertStep(user, step) {
  const state = await getOnboardingState(user);
  if (state.completed) throw new ApiError("Onboarding is already complete.", 409);
  const index = state.steps.findIndex((item) => item.id === step);
  if (index < 0) throw new ApiError("This step isn't part of your onboarding.", 404);
  const blocked = state.steps.slice(0, index).find((item) => !item.done);
  if (blocked) throw new ApiError("Finish the earlier onboarding steps first.", 409);
  return state;
}

// Typed signature must match the name on the account
function checkSignature(user, signature) {
  const typed = typeof signature === "string" ? signature.trim().replace(/\s+/g, " ") : "";
  if (!typed) throw new ApiError("Type your full name to sign.");
  if (typed.toLowerCase() !== user.name.trim().replace(/\s+/g, " ").toLowerCase()) {
    throw new ApiError(`Type your full name exactly as it appears on your account (${user.name}).`);
  }
  return typed;
}

// Finishes onboarding once every step is done: the employee becomes active
async function completeIfDone(user) {
  const state = await getOnboardingState(user);
  if (!state.completed && state.steps.filter((step) => step.id !== "complete").every((step) => step.done)) {
    await query("UPDATE onboarding_records SET completed_at = NOW() WHERE user_id = ?", [user.id]);
    await query("UPDATE staff_profiles SET status = 'active' WHERE user_id = ? AND status IN ('invited', 'onboarding')", [user.id]);
    await recordAudit(user, { action: "onboarding.completed", entityType: "user", entityId: user.id, summary: `${user.name} completed onboarding` });
    return getOnboardingState(user);
  }
  return state;
}

// Welcome step: "Get Started"
export async function startOnboarding(user) {
  await query("INSERT IGNORE INTO onboarding_records (user_id) VALUES (?)", [user.id]);
  await query("UPDATE onboarding_records SET started_at = COALESCE(started_at, NOW()) WHERE user_id = ?", [user.id]);
  return getOnboardingState(user);
}

export async function acknowledgePolicy(user, policyId, signature) {
  const [policy] = await query("SELECT id, title, category, version FROM policy_documents WHERE id = ? AND status = 'published' AND required = 1", [policyId]);
  if (!policy) throw new ApiError("Policy not found.", 404);
  await assertStep(user, policy.category === "ai" ? "ethics" : "policies");
  const name = checkSignature(user, signature);
  const { ip, userAgent } = await requestClient();
  await query(
    "INSERT IGNORE INTO policy_acknowledgments (id, user_id, policy_id, version, signature_name, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [createId("ack"), user.id, policy.id, policy.version, name, ip, userAgent]
  );
  await recordAudit(user, { action: "policy.acknowledged", entityType: "policy", entityId: policy.id, summary: `${user.name} acknowledged ${policy.title} (v${policy.version})`, metadata: { version: policy.version } });
  await query(`UPDATE onboarding_records SET ${policy.category === "ai" ? "ethics_done_at" : "policies_done_at"} = NOW() WHERE user_id = ?`, [user.id]);
  return completeIfDone(user);
}

export async function setMfaMethod(user, method) {
  if (!MFA_METHODS.includes(method)) throw new ApiError("Choose SMS or Mail verification.");
  await assertStep(user, "security");
  await query("UPDATE staff_profiles SET mfa_method = ? WHERE user_id = ?", [method, user.id]);
  await recordAudit(user, { action: "security.mfa_selected", entityType: "user", entityId: user.id, summary: `${user.name} chose ${method === "sms" ? "SMS" : "mail"} verification` });
  return completeIfDone(user);
}

// First password for invited employees (no current password exists yet)
export async function setOnboardingPassword(user, { password, confirm }) {
  await assertStep(user, "security");
  if (typeof password !== "string" || PASSWORD_RULES.some((rule) => !rule.test(password))) throw new ApiError("The password doesn't meet all of the requirements.");
  if (password.length > 200) throw new ApiError("Password is too long.");
  if (password !== confirm) throw new ApiError("Passwords don't match.");
  const { salt, hash } = hashPassword(password);
  await query("UPDATE users SET password_hash = ?, password_salt = ? WHERE id = ?", [hash, salt, user.id]);
  await query("UPDATE staff_profiles SET password_set = 1 WHERE user_id = ?", [user.id]);
  await recordAudit(user, { action: "security.password_set", entityType: "user", entityId: user.id, summary: `${user.name} set their password` });
  return completeIfDone(user);
}

// Modules are completed in order
export async function completeTrainingModule(user, moduleId) {
  const state = await assertStep(user, "training");
  const modules = state.training.flatMap((course) => course.modules);
  const trainingModule = modules.find((item) => item.id === moduleId);
  if (!trainingModule) throw new ApiError("Training module not found.", 404);
  if (!trainingModule.completed) {
    const next = modules.find((item) => !item.completed);
    if (next.id !== trainingModule.id) throw new ApiError("Complete the modules in order.", 409);
    await query("INSERT IGNORE INTO training_module_progress (user_id, module_id) VALUES (?, ?)", [user.id, trainingModule.id]);
    if (modules.every((item) => item.id === trainingModule.id || item.completed)) {
      await query("UPDATE onboarding_records SET training_done_at = NOW() WHERE user_id = ?", [user.id]);
      await recordAudit(user, { action: "training.completed", entityType: "training_course", entityId: trainingModule.courseId, summary: `${user.name} completed onboarding training` });
    }
  }
  return completeIfDone(user);
}

export async function signFinalAcknowledgment(user, { signature, employeeId, statements }) {
  await assertStep(user, "final");
  if (!Array.isArray(statements) || statements.length < 5 || !statements.every((value) => value === true)) throw new ApiError("Tick every certification statement to continue.");
  const name = checkSignature(user, signature);
  const id = typeof employeeId === "string" ? employeeId.trim().slice(0, 40) || null : null;
  const { ip, userAgent } = await requestClient();
  await query("UPDATE onboarding_records SET final_signed_at = NOW(), final_signature = ?, final_employee_id = ?, final_ip = ?, final_user_agent = ? WHERE user_id = ?", [name, id, ip, userAgent, user.id]);
  await recordAudit(user, { action: "onboarding.final_signed", entityType: "user", entityId: user.id, summary: `${user.name} signed the final onboarding acknowledgment` });
  return completeIfDone(user);
}

// Sales reps: voice calibration (scores come with the AI provider; completion is recorded now)
export async function completeVoiceCalibration(user, { durationSeconds } = {}) {
  await assertStep(user, "voice");
  const seconds = Math.min(Math.max(Number.parseInt(durationSeconds, 10) || 0, 0), 7200);
  await query("INSERT INTO calibration_sessions (id, organization_id, user_id, rounds_completed, duration_seconds) VALUES (?, ?, ?, 7, ?)", [createId("cal"), user.organizationId, user.id, seconds]);
  await query("UPDATE onboarding_records SET voice_done_at = NOW() WHERE user_id = ?", [user.id]);
  await recordAudit(user, { action: "onboarding.voice_calibrated", entityType: "user", entityId: user.id, summary: `${user.name} completed voice calibration` });
  return completeIfDone(user);
}

// For admins: where an employee is in onboarding (Access Records)
export async function onboardingProgressFor(userId) {
  const [user] = await query("SELECT id, name, role, organization_id AS organizationId FROM users WHERE id = ?", [userId]);
  if (!user) throw new ApiError("Employee not found.", 404);
  const state = await getOnboardingState(user);
  const countable = state.steps.filter((step) => step.id !== "complete");
  return { steps: state.steps, done: countable.filter((step) => step.done).length, total: countable.length };
}
