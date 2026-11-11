// One set of Training options used everywhere in Training Logs (client spec, Nov 2026); the
// lists live in lib/compliance/training-catalog so the server checks the same values.
// Training = a complete course; Training Material = one PDF, Doc or Video inside it.
import { CERTIFICATE_VALIDITY, MATERIAL_FORMATS, TRAINING_DEPARTMENTS, TRAINING_REQUIREMENTS, TRAINING_STATUSES } from "@/lib/compliance/training-catalog";

export { CERTIFICATE_VALIDITY, MATERIAL_FORMATS, TRAINING_DEPARTMENTS, TRAINING_REQUIREMENTS, TRAINING_STATUSES };

export const departmentFilterOptions = [{ value: "All", label: "All Departments" }, ...TRAINING_DEPARTMENTS.map((value) => ({ value, label: value }))];
export const statusFilterOptions = [{ value: "All", label: "All Statuses" }, ...TRAINING_STATUSES.map((value) => ({ value, label: value }))];
