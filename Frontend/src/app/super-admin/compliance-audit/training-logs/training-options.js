// One set of Training options used everywhere in Training Logs (client spec, Nov 2026).
// Training = a complete course; Training Material = one PDF, Document or Video inside it.

export const TRAINING_DEPARTMENTS = ["Security", "Operations", "HR & People", "Admin", "Sales & Growth", "Support"];
export const TRAINING_STATUSES = ["Not Started", "In Progress", "Completed", "Overdue"];
export const TRAINING_REQUIREMENTS = ["Required", "Recommended", "Optional"];
export const MATERIAL_FORMATS = ["PDF", "Document", "Video"];
export const CERTIFICATE_VALIDITY = ["Does Not Expire", "6 Months", "1 Year", "Custom"];

export const departmentFilterOptions = [{ value: "All", label: "All Departments" }, ...TRAINING_DEPARTMENTS.map((value) => ({ value, label: value }))];
export const statusFilterOptions = [{ value: "All", label: "All Statuses" }, ...TRAINING_STATUSES.map((value) => ({ value, label: value }))];
