// ── Segment rules for Campaigns & Journeys ──
// Pure functions shared by the server (which decides membership) and the browser
// (live preview in the segment form), so both always agree.
// A "profile" is one PitchProX customer user with the fields below (lib/campaigns/profiles).

export const PLANS_HINT = ["Free Trial", "Basic", "Pro", "Elite"]; // real plan names come from the API
export const SUBSCRIPTION_STATUSES = ["Active", "Trialing", "Pending Payment", "Past Due", "Paused", "Cancellation Scheduled", "Canceled"];
export const TRIAL_STATUSES = ["Active Trial", "Trial Expired", "Converted", "No Trial"];
export const CALIBRATION_STATUSES = ["Completed", "In Progress", "Not Started"];
export const PAYMENT_STATUSES = ["Paid", "Failed", "Update Required", "No Payment Method"];
export const EMAIL_ENGAGEMENT = ["High", "Medium", "Low", "None"];
export const FEATURES = ["Live Calling", "CRM", "Leads", "Playbooks", "AI Training", "Reports", "Calibration"];

// Rule fields: `type` decides which operators apply
export const RULE_FIELDS = [
  { key: "plan", label: "Plan", type: "status", options: PLANS_HINT },
  { key: "subscriptionStatus", label: "Subscription Status", type: "status", options: SUBSCRIPTION_STATUSES },
  { key: "trialStatus", label: "Trial Status", type: "status", options: TRIAL_STATUSES },
  { key: "trialStart", label: "Trial Start Date", type: "date" },
  { key: "trialEnd", label: "Trial End Date", type: "date" },
  { key: "callUsagePct", label: "Call Usage %", type: "number", unit: "%" },
  { key: "callsRemaining", label: "Calls Remaining", type: "number" },
  { key: "calibrationStatus", label: "Calibration Status", type: "status", options: CALIBRATION_STATUSES },
  { key: "paymentStatus", label: "Payment Status", type: "status", options: PAYMENT_STATUSES },
  { key: "lastLogin", label: "Last Login", type: "date" },
  { key: "lastCallDate", label: "Last Call Date", type: "date" },
  { key: "signupDate", label: "Signup Date", type: "date" },
  { key: "tags", label: "User Tag", type: "text" },
  { key: "emailEngagement", label: "Email Engagement", type: "status", options: EMAIL_ENGAGEMENT },
  { key: "featureUsage", label: "Feature Usage", type: "text" },
];

export const OPERATORS = {
  number: ["Equals", "Greater Than", "Greater Than or Equal To", "Less Than", "Less Than or Equal To"],
  status: ["Is", "Is Not", "Contains", "Does Not Contain"],
  text: ["Is", "Is Not", "Contains", "Does Not Contain"],
  date: ["Before", "After", "Within Last", "More Than X Days Ago", "Within Next X Days"],
};
// Date operators that take a number of days rather than a date
export const DAY_OPERATORS = ["Within Last", "More Than X Days Ago", "Within Next X Days"];
export const fieldOf = (key) => RULE_FIELDS.find((field) => field.key === key) ?? null;

const isoDay = (date) => {
  const local = new Date(date);
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
};
// Whole days from `today` to an ISO date (+ future, - past)
const dayDiff = (iso, today) => Math.round((new Date(`${iso}T12:00:00`) - new Date(`${isoDay(today)}T12:00:00`)) / 86400000);

// Checks one rule; returns an error message for a malformed rule (used by the API) or null
export function ruleError(condition) {
  const definition = fieldOf(condition?.field);
  if (!definition) return "Choose a field for every rule.";
  if (!OPERATORS[definition.type].includes(condition.operator)) return `"${condition.operator}" can't be used with ${definition.label}.`;
  const value = condition.value;
  if (definition.type === "number" || (definition.type === "date" && DAY_OPERATORS.includes(condition.operator))) {
    if (value === "" || value === null || !Number.isFinite(Number(value)) || Number(value) < 0) return `${definition.label} needs a number of 0 or more.`;
    if (definition.key === "callUsagePct" && Number(value) > 1000) return "Call Usage % must be a percentage.";
  } else if (definition.type === "date") {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${definition.label} needs a date.`;
  } else if (typeof value !== "string" || !value.trim() || value.length > 120) {
    return `${definition.label} needs a value.`;
  }
  return null;
}

export function matchesCondition(profile, { field, operator, value }, today = new Date()) {
  const definition = fieldOf(field);
  if (!definition) return false;
  const raw = profile[field];
  if (raw === null || raw === undefined || raw === "" || (Array.isArray(raw) && !raw.length && ["Is", "Contains"].includes(operator))) {
    return operator === "Is Not" || operator === "Does Not Contain";
  }
  if (definition.type === "number") {
    const a = Number(raw);
    const b = Number(value);
    return { Equals: a === b, "Greater Than": a > b, "Greater Than or Equal To": a >= b, "Less Than": a < b, "Less Than or Equal To": a <= b }[operator] ?? false;
  }
  if (definition.type === "date") {
    const diff = dayDiff(raw, today);
    const days = Number(value);
    if (operator === "Before") return raw < value;
    if (operator === "After") return raw > value;
    if (operator === "Within Last") return diff <= 0 && -diff <= days;
    if (operator === "More Than X Days Ago") return -diff > days;
    if (operator === "Within Next X Days") return diff >= 0 && diff <= days;
    return false;
  }
  const text = Array.isArray(raw) ? raw.join(", ").toLowerCase() : String(raw).toLowerCase();
  const needle = String(value ?? "").trim().toLowerCase();
  const list = Array.isArray(raw) ? raw.map((item) => String(item).toLowerCase()) : [text];
  if (operator === "Is") return list.includes(needle);
  if (operator === "Is Not") return !list.includes(needle);
  if (operator === "Contains") return text.includes(needle);
  if (operator === "Does Not Contain") return !text.includes(needle);
  return false;
}

export function matchesRules(profile, rules, today = new Date()) {
  const conditions = rules?.conditions ?? [];
  if (!conditions.length) return false;
  const results = conditions.map((condition) => matchesCondition(profile, condition, today));
  return rules.match === "any" ? results.some(Boolean) : results.every(Boolean);
}

// Dynamic: whoever matches the rules now; Static: the saved list
export function membersOf(segment, profiles, today = new Date()) {
  if (!segment) return [];
  if (segment.type === "Static") {
    const ids = new Set(segment.userIds ?? []);
    return profiles.filter((profile) => ids.has(profile.id));
  }
  return profiles.filter((profile) => matchesRules(profile, segment.rules, today));
}

export const describeRule = ({ field, operator, value }) => {
  const definition = fieldOf(field);
  if (!definition) return "";
  const unit = DAY_OPERATORS.includes(operator) ? " days" : definition.unit ?? "";
  return `${definition.label} ${operator.toLowerCase()} ${value}${unit}`;
};

const rule = (field, operator, value) => ({ field, operator, value });

// Built-in Dynamic segments (client item 256). They can be edited (e.g. the usage threshold) but not deleted.
export const SYSTEM_SEGMENTS = [
  { key: "all-trial", name: "All Trial Users", description: "Everyone who has started a free trial.", rules: { match: "any", conditions: [rule("trialStatus", "Is", "Active Trial"), rule("trialStatus", "Is", "Trial Expired"), rule("trialStatus", "Is", "Converted")] } },
  { key: "active-trial", name: "Active Trial Users", description: "Users currently in their free trial.", rules: { match: "all", conditions: [rule("trialStatus", "Is", "Active Trial")] } },
  { key: "trial-ending", name: "Trial Ending Soon", description: "Active trials that end within the next 3 days.", rules: { match: "all", conditions: [rule("trialStatus", "Is", "Active Trial"), rule("trialEnd", "Within Next X Days", 3)] } },
  { key: "trial-expired", name: "Trial Expired", description: "Trials that ended without upgrading.", rules: { match: "all", conditions: [rule("trialStatus", "Is", "Trial Expired")] } },
  { key: "active-paid", name: "Active Paid Users", description: "Paying users with an active subscription.", rules: { match: "all", conditions: [rule("subscriptionStatus", "Is", "Active"), rule("trialStatus", "Is Not", "Active Trial")] } },
  { key: "inactive", name: "Inactive Users", description: "No login for more than 7 days.", rules: { match: "all", conditions: [rule("lastLogin", "More Than X Days Ago", 7)] } },
  { key: "calibration-incomplete", name: "Calibration Incomplete", description: "Users who haven't finished calibration.", rules: { match: "all", conditions: [rule("calibrationStatus", "Is Not", "Completed")] } },
  { key: "high-usage", name: "High Call Usage", description: "Users at or above the call-usage threshold (change the % in the rule: 50, 75, 80, 90, 100 or any other).", rules: { match: "all", conditions: [rule("callUsagePct", "Greater Than or Equal To", 80)] } },
  { key: "limit-reached", name: "Call Limit Reached", description: "Users with no calls left this cycle.", rules: { match: "all", conditions: [rule("callsRemaining", "Equals", 0), rule("subscriptionStatus", "Is Not", "Canceled")] } },
  { key: "payment-failed", name: "Payment Failed", description: "The latest payment failed.", rules: { match: "all", conditions: [rule("paymentStatus", "Is", "Failed")] } },
  { key: "payment-update", name: "Payment Method Update Required", description: "Card expired or needs to be updated.", rules: { match: "all", conditions: [rule("paymentStatus", "Is", "Update Required")] } },
  { key: "recently-upgraded", name: "Recently Upgraded", description: "Users who moved to a higher plan in the last 30 days.", rules: { match: "all", conditions: [rule("tags", "Contains", "Recently Upgraded")] } },
  { key: "recently-cancelled", name: "Recently Cancelled", description: "Users whose subscription is cancelled or set to end.", rules: { match: "all", conditions: [rule("subscriptionStatus", "Contains", "Cancel")] } },
];

// Display helpers shared by the tables
export const formatDay = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");
export const STATUS_TONE = {
  Active: "bg-emerald-50 text-emerald-600",
  Trialing: "bg-sky-50 text-sky-600",
  "Pending Payment": "bg-amber-50 text-amber-600",
  "Past Due": "bg-amber-50 text-amber-600",
  Paused: "bg-slate-100 text-slate-600",
  "Cancellation Scheduled": "bg-orange-50 text-orange-600",
  Canceled: "bg-red-50 text-red-500",
  Paid: "bg-emerald-50 text-emerald-600",
  Failed: "bg-red-50 text-red-500",
  "Update Required": "bg-amber-50 text-amber-600",
  "No Payment Method": "bg-slate-100 text-slate-500",
  Completed: "bg-emerald-50 text-emerald-600",
  "In Progress": "bg-sky-50 text-sky-600",
  "Not Started": "bg-slate-100 text-slate-500",
  "Active Trial": "bg-sky-50 text-sky-600",
  "Trial Expired": "bg-red-50 text-red-500",
  Converted: "bg-emerald-50 text-emerald-600",
  "No Trial": "bg-slate-100 text-slate-500",
};
