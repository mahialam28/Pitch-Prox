// ── Incident Management: shared lists (server and browser) ──
// One category list for reporting, the table and the filters (client items 119–152).
export const INCIDENT_CATEGORIES = [
  "Security Incident",
  "Unauthorized Access",
  "Data Privacy / Exposure",
  "Payment / Billing Abuse",
  "Compliance / Policy Violation",
  "System / Service Outage",
  "Other",
];
export const INCIDENT_SEVERITIES = ["Critical", "High", "Medium", "Low"];
// Open → Investigating → Resolved (investigation submitted) → Closed; Resolved/Closed reopen to Investigating
export const INCIDENT_STATUSES = ["Open", "Investigating", "Resolved", "Closed"];
export const CLOSE_REASONS = ["False positive", "Duplicate report", "Expected behaviour", "Not a security issue"];

// Resolution targets by severity, counted from Reported At
export const RESOLUTION_TARGET_HOURS = { Critical: 24, High: 72, Medium: 168, Low: 720 };
export const targetLabel = (severity) => {
  const hours = RESOLUTION_TARGET_HOURS[severity] ?? 168;
  return hours < 48 ? `${hours}h` : `${Math.round(hours / 24)} days`;
};

export const INCIDENT_FILE_TYPES = ["pdf", "png", "jpg", "jpeg", "gif", "txt", "csv", "log", "json", "doc", "docx", "xls", "xlsx", "zip"];
export const INCIDENT_FILE_MAX_BYTES = 20 * 1024 * 1024;
