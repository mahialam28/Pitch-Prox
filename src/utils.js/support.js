// ── Support ticket options & labels ──
// Shared by the ticket form, the ticket views and the API's validation.
export const TICKET_CATEGORIES = [
  { value: "technical", label: "Technical Support" },
  { value: "billing", label: "Billing & Plans" },
  { value: "account", label: "Account Access" },
  { value: "feature", label: "Feature Request" },
];

export const TICKET_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

// "Waiting" = waiting on the customer (set when support replies)
export const TICKET_STATUSES = ["Open", "In progress", "Waiting", "Resolved", "Closed"];

// Hours to the first support reply, by priority (drives the SLA badge)
export const TICKET_SLA_HOURS = { urgent: 4, high: 8, medium: 24, low: 48 };

export const TICKET_ATTACHMENT_TYPES = ["png", "jpg", "jpeg", "webp", "gif", "pdf", "txt", "log", "csv", "doc", "docx", "xls", "xlsx", "zip"];
export const TICKET_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
