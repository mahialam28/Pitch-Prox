import { INCIDENT_CATEGORIES, INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "@/lib/compliance/incident-catalog";

// Filter lists for the Incident Management table: the same category, severity and status
// lists used everywhere (lib/compliance/incident-catalog, client items 119–152)
export { INCIDENT_CATEGORIES, INCIDENT_STATUSES };
export const severityFilterOptions = ["All Severity", ...INCIDENT_SEVERITIES];
export const categoryFilterOptions = ["All Categories", ...INCIDENT_CATEGORIES];
export const statusFilterOptions = ["All Statuses", ...INCIDENT_STATUSES];
