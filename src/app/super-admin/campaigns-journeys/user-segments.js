// ── Campaigns & Journeys target PitchProX users (customers), not their real-estate leads ──
// Segments are Dynamic (rule-based: membership updates automatically when a user starts or
// stops matching) or Static (an admin picks the users). Sample data uses a fixed "today" so the
// preview always shows the same members.

export const TODAY = new Date("2026-11-05T12:00:00");
const daysFromToday = (days) => new Date(TODAY.getTime() + days * 86400000).toISOString().slice(0, 10);

export const PLANS = ["Free Trial", "Basic", "Pro", "Elite"];
export const SUBSCRIPTION_STATUSES = ["Active", "Trialing", "Past Due", "Paused", "Canceled"];
export const TRIAL_STATUSES = ["Active Trial", "Trial Expired", "Converted", "No Trial"];
export const CALIBRATION_STATUSES = ["Completed", "In Progress", "Not Started"];
export const PAYMENT_STATUSES = ["Paid", "Failed", "Update Required", "No Payment Method"];
export const EMAIL_ENGAGEMENT = ["High", "Medium", "Low", "None"];
export const FEATURES = ["Live Calling", "CRM", "Leads", "Playbooks", "AI Training", "Reports", "Calibration"];

// Rule fields: type decides which operators apply
export const RULE_FIELDS = [
  { key: "plan", label: "Plan", type: "status", options: PLANS },
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
export const fieldOf = (key) => RULE_FIELDS.find((field) => field.key === key) ?? RULE_FIELDS[0];

const dayDiff = (iso) => Math.round((new Date(`${iso}T12:00:00`) - TODAY) / 86400000); // + future, - past

function matchesCondition(user, { field, operator, value }) {
  const definition = fieldOf(field);
  const raw = user[field];
  if (raw === null || raw === undefined || raw === "") return operator === "Is Not" || operator === "Does Not Contain";
  if (definition.type === "number") {
    const a = Number(raw);
    const b = Number(value);
    return { Equals: a === b, "Greater Than": a > b, "Greater Than or Equal To": a >= b, "Less Than": a < b, "Less Than or Equal To": a <= b }[operator] ?? false;
  }
  if (definition.type === "date") {
    const diff = dayDiff(raw);
    const days = Number(value);
    if (operator === "Before") return raw < value;
    if (operator === "After") return raw > value;
    if (operator === "Within Last") return diff <= 0 && -diff <= days;
    if (operator === "More Than X Days Ago") return -diff > days;
    if (operator === "Within Next X Days") return diff >= 0 && diff <= days;
    return false;
  }
  const text = Array.isArray(raw) ? raw.join(", ").toLowerCase() : String(raw).toLowerCase();
  const needle = String(value ?? "").toLowerCase();
  const list = Array.isArray(raw) ? raw.map((item) => String(item).toLowerCase()) : [text];
  if (operator === "Is") return list.includes(needle);
  if (operator === "Is Not") return !list.includes(needle);
  if (operator === "Contains") return text.includes(needle);
  if (operator === "Does Not Contain") return !text.includes(needle);
  return false;
}

// Dynamic segments: members are whoever matches the rules right now; Static: the saved list
export function membersOf(segment, users = PLATFORM_USERS) {
  if (segment.type === "Static") return users.filter((user) => (segment.userIds ?? []).includes(user.id));
  const conditions = segment.rules?.conditions ?? [];
  if (!conditions.length) return [];
  const test = (user) => conditions.map((condition) => matchesCondition(user, condition));
  return users.filter((user) => (segment.rules.match === "any" ? test(user).some(Boolean) : test(user).every(Boolean)));
}

export const describeRule = ({ field, operator, value }) => {
  const definition = fieldOf(field);
  const unit = DAY_OPERATORS.includes(operator) ? " days" : definition.unit ?? "";
  return `${definition.label} ${operator.toLowerCase()} ${value}${unit}`;
};

const rule = (field, operator, value) => ({ field, operator, value });

// ── Sample PitchProX users ──
const user = (id, name, email, fields) => ({
  id,
  name,
  email,
  initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2),
  tags: [],
  featureUsage: [],
  ...fields,
});

export const PLATFORM_USERS = [
  user("u1", "Olivia Bennett", "olivia@sunriserealty.demo", { plan: "Pro", subscriptionStatus: "Active", trialStatus: "Converted", trialStart: daysFromToday(-60), trialEnd: daysFromToday(-46), callUsagePct: 84, callsRemaining: 32, calibrationStatus: "Completed", paymentStatus: "Paid", lastLogin: daysFromToday(0), lastCallDate: daysFromToday(0), signupDate: daysFromToday(-60), tags: ["Recently Upgraded"], emailEngagement: "High", featureUsage: ["Live Calling", "CRM", "Playbooks"] }),
  user("u2", "Daniel Price", "daniel@harborhomes.demo", { plan: "Basic", subscriptionStatus: "Active", trialStatus: "Converted", trialStart: daysFromToday(-40), trialEnd: daysFromToday(-26), callUsagePct: 100, callsRemaining: 0, calibrationStatus: "Completed", paymentStatus: "Paid", lastLogin: daysFromToday(-1), lastCallDate: daysFromToday(-1), signupDate: daysFromToday(-40), emailEngagement: "Medium", featureUsage: ["Live Calling", "Leads"] }),
  user("u3", "Rachel Kim", "rachel@keystone.demo", { plan: "Free Trial", subscriptionStatus: "Trialing", trialStatus: "Active Trial", trialStart: daysFromToday(-12), trialEnd: daysFromToday(2), callUsagePct: 60, callsRemaining: 4, calibrationStatus: "Completed", paymentStatus: "No Payment Method", lastLogin: daysFromToday(-2), lastCallDate: daysFromToday(-2), signupDate: daysFromToday(-12), emailEngagement: "High", featureUsage: ["Live Calling", "Calibration"] }),
  user("u4", "Thomas Reed", "thomas@mapleoak.demo", { plan: "Free Trial", subscriptionStatus: "Trialing", trialStatus: "Active Trial", trialStart: daysFromToday(-2), trialEnd: daysFromToday(12), callUsagePct: 10, callsRemaining: 9, calibrationStatus: "Not Started", paymentStatus: "No Payment Method", lastLogin: daysFromToday(-2), lastCallDate: null, signupDate: daysFromToday(-2), emailEngagement: "Low", featureUsage: [] }),
  user("u5", "Angela Foster", "angela@summitbrokers.demo", { plan: "Elite", subscriptionStatus: "Active", trialStatus: "No Trial", trialStart: null, trialEnd: null, callUsagePct: 92, callsRemaining: 40, calibrationStatus: "Completed", paymentStatus: "Paid", lastLogin: daysFromToday(0), lastCallDate: daysFromToday(0), signupDate: daysFromToday(-120), tags: ["VIP"], emailEngagement: "High", featureUsage: ["Live Calling", "CRM", "Reports", "AI Training"] }),
  user("u6", "Brian Walker", "brian@coastalliving.demo", { plan: "Basic", subscriptionStatus: "Canceled", trialStatus: "Converted", trialStart: daysFromToday(-95), trialEnd: daysFromToday(-81), callUsagePct: 0, callsRemaining: 0, calibrationStatus: "Completed", paymentStatus: "Paid", lastLogin: daysFromToday(-20), lastCallDate: daysFromToday(-22), signupDate: daysFromToday(-95), tags: ["Churned"], emailEngagement: "None", featureUsage: ["Leads"] }),
  user("u7", "Sofia Martinez", "sofia@casarealty.demo", { plan: "Pro", subscriptionStatus: "Past Due", trialStatus: "Converted", trialStart: daysFromToday(-80), trialEnd: daysFromToday(-66), callUsagePct: 45, callsRemaining: 110, calibrationStatus: "Completed", paymentStatus: "Failed", lastLogin: daysFromToday(-3), lastCallDate: daysFromToday(-4), signupDate: daysFromToday(-80), emailEngagement: "Medium", featureUsage: ["Live Calling", "CRM"] }),
  user("u8", "Kevin O'Brien", "kevin@obrienhomes.demo", { plan: "Basic", subscriptionStatus: "Active", trialStatus: "Converted", trialStart: daysFromToday(-150), trialEnd: daysFromToday(-136), callUsagePct: 30, callsRemaining: 70, calibrationStatus: "In Progress", paymentStatus: "Update Required", lastLogin: daysFromToday(-9), lastCallDate: daysFromToday(-12), signupDate: daysFromToday(-150), emailEngagement: "Low", featureUsage: ["Leads"] }),
  user("u9", "Priya Shah", "priya@shahgroup.demo", { plan: "Free Trial", subscriptionStatus: "Canceled", trialStatus: "Trial Expired", trialStart: daysFromToday(-30), trialEnd: daysFromToday(-16), callUsagePct: 100, callsRemaining: 0, calibrationStatus: "Not Started", paymentStatus: "No Payment Method", lastLogin: daysFromToday(-15), lastCallDate: daysFromToday(-17), signupDate: daysFromToday(-30), emailEngagement: "Low", featureUsage: ["Live Calling"] }),
  user("u10", "Marcus Lee", "marcus@sunriserealty.demo", { plan: "Pro", subscriptionStatus: "Active", trialStatus: "No Trial", trialStart: null, trialEnd: null, callUsagePct: 76, callsRemaining: 48, calibrationStatus: "Completed", paymentStatus: "Paid", lastLogin: daysFromToday(-1), lastCallDate: daysFromToday(-1), signupDate: daysFromToday(-30), tags: ["Recently Upgraded"], emailEngagement: "Medium", featureUsage: ["Live Calling", "Playbooks"] }),
  user("u11", "Hannah Cole", "hannah@colerealty.demo", { plan: "Free Trial", subscriptionStatus: "Trialing", trialStatus: "Active Trial", trialStart: daysFromToday(-13), trialEnd: daysFromToday(1), callUsagePct: 90, callsRemaining: 1, calibrationStatus: "In Progress", paymentStatus: "No Payment Method", lastLogin: daysFromToday(0), lastCallDate: daysFromToday(0), signupDate: daysFromToday(-13), emailEngagement: "High", featureUsage: ["Live Calling", "Leads", "CRM"] }),
  user("u12", "George Allen", "george@allenteam.demo", { plan: "Elite", subscriptionStatus: "Active", trialStatus: "Converted", trialStart: daysFromToday(-200), trialEnd: daysFromToday(-186), callUsagePct: 55, callsRemaining: 260, calibrationStatus: "Completed", paymentStatus: "Paid", lastLogin: daysFromToday(-11), lastCallDate: daysFromToday(-14), signupDate: daysFromToday(-200), emailEngagement: "Low", featureUsage: ["Reports"] }),
];

// ── Segments ──
const systemSegment = (id, name, description, match, conditions, extra = {}) => ({
  id,
  name,
  description,
  type: "Dynamic",
  system: true,
  rules: { match, conditions },
  creator: "PitchProX (system)",
  createdAt: "Nov 1, 2026",
  updatedAt: "Auto-updated",
  usedInCampaign: false,
  campaigns: [],
  ...extra,
});

export const SAVED_SEGMENTS = [
  systemSegment("all-trial", "All Trial Users", "Everyone who has started a free trial.", "any", [rule("trialStatus", "Is", "Active Trial"), rule("trialStatus", "Is", "Trial Expired"), rule("trialStatus", "Is", "Converted")]),
  systemSegment("active-trial", "Active Trial Users", "Users currently in their free trial.", "all", [rule("trialStatus", "Is", "Active Trial")], { usedInCampaign: true, campaigns: [{ id: "c-1", name: "Trial Welcome Series", status: "ACTIVE", sent: "412", openRate: "48.2%", conversion: "21.4%", iconType: "navigation" }] }),
  systemSegment("trial-ending", "Trial Ending Soon", "Active trials that end within the next 3 days.", "all", [rule("trialStatus", "Is", "Active Trial"), rule("trialEnd", "Within Next X Days", 3)], { usedInCampaign: true, campaigns: [{ id: "c-2", name: "Trial Ending: Upgrade Prompt", status: "ACTIVE", sent: "126", openRate: "52.6%", conversion: "28.0%", iconType: "tag" }] }),
  systemSegment("trial-expired", "Trial Expired", "Trials that ended without upgrading.", "all", [rule("trialStatus", "Is", "Trial Expired")]),
  systemSegment("active-paid", "Active Paid Users", "Paying users with an active subscription.", "all", [rule("subscriptionStatus", "Is", "Active"), rule("plan", "Is Not", "Free Trial")]),
  systemSegment("inactive", "Inactive Users", "No login for more than 7 days.", "all", [rule("lastLogin", "More Than X Days Ago", 7)], { usedInCampaign: true, campaigns: [{ id: "c-3", name: "We Miss You", status: "SCHEDULED", sent: "0", openRate: "—", conversion: "—", iconType: "tag" }] }),
  systemSegment("calibration-incomplete", "Calibration Incomplete", "Users who haven't finished calibration.", "all", [rule("calibrationStatus", "Is Not", "Completed")]),
  systemSegment("high-usage", "High Call Usage", "Users at or above the call-usage threshold (change the % in the rule).", "all", [rule("callUsagePct", "Greater Than or Equal To", 80)]),
  systemSegment("limit-reached", "Call Limit Reached", "Users with no calls left this cycle.", "all", [rule("callsRemaining", "Equals", 0), rule("subscriptionStatus", "Is Not", "Canceled")]),
  systemSegment("payment-failed", "Payment Failed", "The latest payment failed.", "all", [rule("paymentStatus", "Is", "Failed")]),
  systemSegment("payment-update", "Payment Method Update Required", "Card expired or needs to be updated.", "all", [rule("paymentStatus", "Is", "Update Required")]),
  systemSegment("recently-upgraded", "Recently Upgraded", "Users who moved to a higher plan recently.", "all", [rule("tags", "Contains", "Recently Upgraded")]),
  systemSegment("recently-cancelled", "Recently Cancelled", "Users who cancelled their subscription.", "all", [rule("subscriptionStatus", "Is", "Canceled"), rule("trialStatus", "Is Not", "Trial Expired")]),
];

export const findSegment = (id) => SAVED_SEGMENTS.find((segment) => String(segment.id) === String(id));
export const segmentNamesOf = (userItem, segments = SAVED_SEGMENTS) => segments.filter((segment) => membersOf(segment).some((member) => member.id === userItem.id)).map((segment) => segment.name);

// Display helpers for tables
export const formatDay = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");
export const STATUS_TONE = {
  Active: "bg-emerald-50 text-emerald-600",
  Trialing: "bg-sky-50 text-sky-600",
  "Past Due": "bg-amber-50 text-amber-600",
  Paused: "bg-slate-100 text-slate-600",
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
