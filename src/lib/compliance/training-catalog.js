// ── Training Logs: shared lists and rules (server and browser) ──
// Training = a complete course; Training Material = one PDF, Doc or Video inside it (client spec, Nov 2026).

export const TRAINING_DEPARTMENTS = ["Security", "Operations", "HR & People", "Admin", "Sales & Growth", "Support"];
export const TRAINING_STATUSES = ["Not Started", "In Progress", "Completed", "Overdue"];
export const TRAINING_REQUIREMENTS = ["Required", "Recommended", "Optional"];
export const MATERIAL_FORMATS = ["PDF", "Doc", "Video"];
export const CERTIFICATE_VALIDITY = ["Does Not Expire", "6 Months", "1 Year", "Custom"];

// Columns of the Training Assignment Report (no Score: nothing is scored yet)
export const TRAINING_REPORT_FIELDS = ["Employee Name", "Role", "Department", "Training", "Category", "Requirement", "Assigned On", "Assigned By", "Due Date", "Status", "Completed On", "Certificate", "Certificate Expires"];

// Uploads per format (lower-case extensions) and size limits
export const MATERIAL_FILE_TYPES = { PDF: ["pdf"], Doc: ["doc", "docx"], Video: ["mp4", "webm", "mov"] };
export const MATERIAL_MAX_BYTES = { PDF: 25 * 1024 * 1024, Doc: 25 * 1024 * 1024, Video: 300 * 1024 * 1024 };
export const formatForExtension = (extension) => Object.keys(MATERIAL_FILE_TYPES).find((format) => MATERIAL_FILE_TYPES[format].includes(String(extension).toLowerCase())) ?? null;

// An employee's department in the Training list. Profiles hold free text, so common
// spellings are mapped; anything else falls back to the employee's role.
const DEPARTMENT_ALIASES = { sales: "Sales & Growth", growth: "Sales & Growth", hr: "HR & People", people: "HR & People", "human resources": "HR & People", ops: "Operations", it: "Operations", legal: "Admin", compliance: "Security", management: "Admin" };
const ROLE_DEPARTMENTS = { sales_rep: "Sales & Growth", support: "Support", super_admin: "Admin", admin_manager: "Operations", auditor: "Security" };
export function trainingDepartment(department, role) {
  const text = String(department ?? "").trim().toLowerCase();
  const exact = TRAINING_DEPARTMENTS.find((item) => item.toLowerCase() === text);
  return exact ?? DEPARTMENT_ALIASES[text] ?? ROLE_DEPARTMENTS[role] ?? "Admin";
}

// One assignment's status (dates as ISO strings or Date)
export function assignmentStatus({ completedAt, startedAt, dueDate }, today = new Date().toISOString().slice(0, 10)) {
  if (completedAt) return "Completed";
  if (dueDate && String(dueDate).slice(0, 10) < today) return "Overdue";
  if (startedAt) return "In Progress";
  return "Not Started";
}

// An employee with several Trainings (client spec): "Overdue" if any is overdue,
// "2 of 3 Completed" when some are done, "Mixed" when nothing is done yet and they differ.
export function employeeStatus(statuses) {
  if (!statuses.length) return "Not Started";
  if (statuses.includes("Overdue")) return "Overdue";
  const done = statuses.filter((status) => status === "Completed").length;
  if (statuses.length === 1) return statuses[0];
  if (done) return `${done} of ${statuses.length} Completed`;
  return new Set(statuses).size === 1 ? statuses[0] : "Mixed";
}

// Certificate end date for a completion on `day` (null = does not expire)
export function certificateExpiry(validity, months, day = new Date()) {
  const add = validity === "6 Months" ? 6 : validity === "1 Year" ? 12 : validity === "Custom" ? Number(months) || null : null;
  if (!add) return null;
  const date = new Date(day);
  date.setMonth(date.getMonth() + add);
  return date.toISOString().slice(0, 10);
}
