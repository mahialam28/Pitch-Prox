// ── Audit log: categories, action names and entity names ──
// Shared by the server (filters, stats, exports) and the Audit Logs page.
// Every recorded action is "<area>.<what_happened>"; the area decides the category
// unless the action is listed in CATEGORY_OVERRIDES. The six categories add up to
// Total Events (client item 168).

export const AUDIT_CATEGORIES = [
  { id: "user-management", label: "User Management" },
  { id: "billing", label: "Billing & Payments" },
  { id: "security", label: "Security" },
  { id: "system", label: "System" },
  { id: "compliance", label: "Compliance" },
  { id: "data-changes", label: "Data Changes" },
];
export const categoryLabel = (id) => AUDIT_CATEGORIES.find((category) => category.id === id)?.label ?? "System";

const CATEGORY_BY_AREA = {
  staff: "user-management",
  onboarding: "user-management",
  offboarding: "user-management",
  customer: "user-management",
  account: "user-management",
  team: "user-management",
  billing: "billing",
  pricing: "billing",
  security: "security",
  auth: "security",
  policy: "compliance",
  training: "compliance",
  incident: "compliance",
  evidence: "compliance",
  compliance: "compliance",
  audit: "compliance",
  campaigns: "system",
  announcement: "system",
  mail: "system",
  system: "system",
  support: "data-changes",
  data: "data-changes",
};
// Actions whose category differs from their area
const CATEGORY_OVERRIDES = {
  "account.impersonation_started": "security",
  "account.impersonation_ended": "security",
  "account.deleted": "data-changes",
  "account.calibration_reset": "data-changes",
};
export const DEFAULT_CATEGORY = "system";

export const categoryOf = (action) => CATEGORY_OVERRIDES[action] ?? CATEGORY_BY_AREA[String(action).split(".")[0]] ?? DEFAULT_CATEGORY;

// Lists for building the SQL CASE that files each row under its category
export const CATEGORY_RULES = { areas: CATEGORY_BY_AREA, overrides: CATEGORY_OVERRIDES };

// Readable names; anything not listed is built from the action ("staff.invite_resent" → "Invite Resent")
const ACTION_LABELS = {
  "security.sign_in": "Sign-in Success",
  "security.sign_in_failed": "Sign-in Failed",
  "security.password_set": "Password Set",
  "security.mfa_selected": "MFA Method Chosen",
  "account.impersonation_started": "Impersonation Started",
  "account.impersonation_ended": "Impersonation Ended",
  "staff.invited": "Employee Invited",
  "staff.updated": "Employee Updated",
  "customer.created": "Customer Account Created",
  "customer.activated": "Customer Account Activated",
  "policy.acknowledged": "Policy Acknowledged",
  "training.completed": "Training Completed",
  "audit.exported": "Audit Logs Exported",
  "billing.adjustment_reversed": "Adjustment Reversed",
  "billing.refund_recorded": "Refund Recorded",
};
const humanize = (text) => String(text).replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
// Areas whose records read better with their name in front ("policy.approved" → "Policy Approved")
const AREA_NOUNS = { policy: "Policy", training: "Training", incident: "Incident", evidence: "Evidence" };
export function actionLabel(action) {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  const [area, ...rest] = String(action).split(".");
  const what = humanize(rest.join(" ") || action);
  return AREA_NOUNS[area] && !what.startsWith(AREA_NOUNS[area]) ? `${AREA_NOUNS[area]} ${what}` : what;
}

const ENTITY_LABELS = {
  user: "User",
  organization: "Account",
  account: "Account",
  account_adjustment: "Adjustment",
  adjustment: "Adjustment",
  policy: "Policy",
  training_course: "Training",
  training_assignment: "Training Assignment",
  incident: "Incident",
  evidence: "Evidence",
  support_ticket: "Support Ticket",
  campaign: "Campaign",
  journey: "Journey",
  segment: "Segment",
  template: "Email Template",
  mail_template: "Mail Template",
  announcement: "Announcement",
  sales_quota: "Quota",
  plan: "Plan",
  promo_code: "Promo Code",
  pricing_settings: "Pricing Settings",
  offboarding_case: "Offboarding",
  audit_log: "Audit Log",
};
export const entityLabel = (type) => (type ? ENTITY_LABELS[type] ?? humanize(type) : "—");
