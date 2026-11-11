// ── Campaigns & Journeys vocabulary (client items 259–303) ──
// Plain data shared by the server and the screens.

// User events. `source` says where they come from:
//   app      — recorded by PitchProX when it happens (sign-up, plan change …)
//   computed — worked out by the job runner from the user's state (trial ending, inactive …)
//   pending  — needs a provider that isn't connected yet (calling, Stripe)
export const USER_EVENTS = [
  { key: "user_signed_up", label: "User Signed Up", source: "app" },
  { key: "trial_started", label: "Trial Started", source: "app" },
  { key: "trial_ending_soon", label: "Trial Ending Soon", source: "computed", timed: { label: "Trial ends in", unit: "days", default: 3 } },
  { key: "trial_expired", label: "Trial Expired", source: "computed" },
  { key: "trial_converted", label: "Trial Converted to Paid", source: "app" },
  { key: "calibration_completed", label: "Calibration Completed", source: "app" },
  { key: "calibration_not_completed", label: "Calibration Not Completed", source: "computed", timed: { label: "Not completed within", unit: "hours", default: 24 } },
  { key: "first_call_completed", label: "First Call Completed", source: "app" },
  { key: "call_usage_threshold", label: "Call Usage Threshold Reached", source: "computed", usage: true },
  { key: "call_limit_reached", label: "Call Limit Reached", source: "computed" },
  { key: "call_bundle_purchased", label: "Call Bundle Purchased", source: "pending" },
  { key: "payment_succeeded", label: "Payment Succeeded", source: "pending" },
  { key: "payment_failed", label: "Payment Failed", source: "pending" },
  { key: "payment_method_update_required", label: "Payment Method Update Required", source: "pending" },
  { key: "subscription_started", label: "Subscription Started", source: "app" },
  { key: "plan_upgraded", label: "Plan Upgraded", source: "app" },
  { key: "plan_downgraded", label: "Plan Downgraded", source: "app" },
  { key: "subscription_renewed", label: "Subscription Renewed", source: "pending" },
  { key: "subscription_cancelled", label: "Subscription Cancelled", source: "app" },
  { key: "user_became_inactive", label: "User Became Inactive", source: "computed", timed: { label: "No login for", unit: "days", default: 7 } },
  { key: "user_logged_back_in", label: "User Logged Back In", source: "app" },
];
export const eventByKey = (key) => USER_EVENTS.find((event) => event.key === key) ?? null;
export const eventByLabel = (label) => USER_EVENTS.find((event) => event.label === label) ?? null;

export const TRIGGER_TYPES = ["User Event", "Enters Segment", "Exits Segment", "Date / Relative Date"];
// Date triggers: a fixed date, or N days before/after a date on the user's profile
export const DATE_FIELDS = [
  { key: "signupDate", label: "Signup Date" },
  { key: "trialStart", label: "Trial Start Date" },
  { key: "trialEnd", label: "Trial End Date" },
  { key: "lastLogin", label: "Last Login" },
];
export const AUDIENCE_TYPES = ["All Eligible Users", "Dynamic Segment", "Static Segment"];
export const REENTRY_OPTIONS = ["Never", "Every Time Trigger Occurs", "After X Days"];
export const EXIT_CONDITIONS = ["Goal Completed", "User Exits Segment", "Plan Changed", "Subscription Cancelled", "Subscription Upgraded", "Payment Succeeded", "Custom User Event"];
export const GOALS = ["Trial Converted to Paid", "Plan Upgraded", "Calibration Completed", "Payment Succeeded", "Subscription Started"];
export const STEP_KINDS = ["email", "delay", "condition", "update", "tag", "untag", "end", "goal"];
export const CONDITION_TYPES = [
  "Event Occurred", "Event Did Not Occur", "User Is In Segment", "User Is Not In Segment", "Plan", "Subscription Status",
  "Trial Status", "Call Usage %", "Calibration Status", "Payment Status", "Email Opened", "Email Clicked", "Last Login",
];
// "Update User Field" fields and their values
export const USER_FIELDS = {
  "Lifecycle Stage": ["Trial", "Onboarding", "Active", "At Risk", "Churned"],
  "Customer Health": ["Healthy", "Needs Attention", "At Risk"],
  "Preferred Contact": ["Email", "Phone", "In-App"],
};
export const DELAY_UNITS = { minute: 60000, hour: 3600000, day: 86400000, week: 604800000 };

// Templates (items 277–294)
export const EMAIL_TYPES = ["Marketing", "Lifecycle", "Transactional"];
export const TEMPLATE_CATEGORIES = ["Onboarding", "Trial", "Billing", "Usage", "Product", "Retention", "Account", "Announcement", "Promotional"];
export const TEMPLATE_STATUSES = ["Draft", "Active", "Archived"];
export const CREATION_METHODS = { build: "Build in PitchProX", design: "Upload Design", html: "Upload HTML" };
// Events a Transactional template can be sent on automatically (item 299)
export const TRANSACTIONAL_EVENTS = ["payment_succeeded", "payment_failed", "payment_method_update_required", "subscription_started", "subscription_cancelled", "subscription_renewed", "trial_converted", "call_bundle_purchased", "user_signed_up"];
// Merge fields usable in subjects and bodies
export const MERGE_FIELDS = ["{First Name}", "{Name}", "{Company}", "{Plan}", "{Trial End Date}", "{Calls Remaining}", "{Email}"];
