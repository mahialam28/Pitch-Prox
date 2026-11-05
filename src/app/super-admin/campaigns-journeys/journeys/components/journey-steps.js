import { Clock, Mail, Tag, Target, Triangle, UserCheck, Workflow, CircleCheckBig, Tags } from "lucide-react";

// Step catalogue for the journey builder (design only, local state).
export const STEP_TYPES = {
  trigger: { label: "Entry trigger", icon: Triangle, tone: "bg-emerald-50 text-emerald-600", badge: "bg-emerald-500" },
  email: { label: "Send email", icon: Mail, tone: "bg-blue-50 text-blue-600", badge: "bg-blue-500", chip: "bg-blue-50 text-blue-600" },
  delay: { label: "Wait", icon: Clock, tone: "bg-orange-50 text-orange-500", badge: "bg-orange-500", chip: "bg-orange-50 text-orange-500" },
  condition: { label: "Condition", icon: Workflow, tone: "bg-purple-50 text-purple-600", badge: "bg-purple-500", chip: "bg-purple-50 text-purple-600" },
  update: { label: "Update user field", icon: UserCheck, tone: "bg-emerald-50 text-emerald-600", badge: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-600" },
  tag: { label: "Add user tag", icon: Tag, tone: "bg-fuchsia-50 text-fuchsia-600", badge: "bg-fuchsia-500", chip: "bg-fuchsia-50 text-fuchsia-600" },
  untag: { label: "Remove user tag", icon: Tags, tone: "bg-slate-100 text-slate-600", badge: "bg-slate-500", chip: "bg-slate-100 text-slate-600" },
  goal: { label: "Goal", icon: CircleCheckBig, tone: "bg-emerald-50 text-emerald-600", badge: "bg-emerald-600", chip: "bg-emerald-50 text-emerald-600" },
  end: { label: "End journey", icon: Target, tone: "bg-red-50 text-red-600", badge: "bg-red-500", chip: "bg-red-50 text-red-600" },
};

// Types offered by "Add Step" (in menu order)
export const ADDABLE_TYPES = ["email", "delay", "condition", "update", "tag", "untag", "end"];

export const EMAIL_TEMPLATES = ["Trial Welcome", "Getting Started Tips", "Trial Ending Soon", "Upgrade Offer"];
// ── Journeys run on PitchProX users (customers) ──
export const TRIGGER_TYPES = ["User Event", "Enters Segment", "Exits Segment", "Date / Relative Date"];
export const USER_EVENTS = [
  "User Signed Up", "Trial Started", "Trial Ending Soon", "Trial Expired", "Trial Converted to Paid",
  "Calibration Completed", "Calibration Not Completed", "First Call Completed", "Call Usage Threshold Reached",
  "Call Limit Reached", "Call Bundle Purchased", "Payment Succeeded", "Payment Failed", "Payment Method Update Required",
  "Subscription Started", "Plan Upgraded", "Plan Downgraded", "Subscription Renewed", "Subscription Cancelled",
  "User Became Inactive", "User Logged Back In",
];
// Events that need a time condition ("Trial ends in 3 days", "not completed within 24 hours", "no login for 7 days")
export const TIMED_EVENTS = { "Trial Ending Soon": "Trial ends in", "Calibration Not Completed": "Not completed within", "User Became Inactive": "No login for" };
export const USAGE_EVENT = "Call Usage Threshold Reached";
export const TRIGGERS = USER_EVENTS; // older import name

export const CONDITION_TYPES = [
  "Event Occurred", "Event Did Not Occur", "User Is In Segment", "User Is Not In Segment", "Plan", "Subscription Status",
  "Trial Status", "Call Usage %", "Calibration Status", "Payment Status", "Email Opened", "Email Clicked", "Last Login",
];
export const CONDITIONS = CONDITION_TYPES; // older import name
export const GOALS = ["Trial Converted to Paid", "Plan Upgraded", "Calibration Completed", "Payment Succeeded"];
export const USER_FIELDS = {
  Plan: ["Free Trial", "Basic", "Pro", "Elite"],
  "Subscription Status": ["Active", "Trialing", "Past Due", "Paused", "Canceled"],
  "Lifecycle Stage": ["Trial", "Onboarding", "Active", "At Risk", "Churned"],
  "Calibration Status": ["Completed", "In Progress", "Not Started"],
};
export const LEAD_STATUSES = USER_FIELDS["Lifecycle Stage"]; // older import name
export const REENTRY_OPTIONS = ["Never", "Every Time Trigger Occurs", "After X Days"];
export const EXIT_CONDITIONS = ["Goal Completed", "User Exits Segment", "Plan Changed", "Subscription Cancelled", "Subscription Upgraded", "Payment Succeeded", "Custom User Event"];
export const DELAY_UNITS = ["minute", "hour", "day", "week"];

export const delayTitle = (amount, unit) => `Wait ${amount} ${unit}${Number(amount) === 1 ? "" : "s"}`;

let counter = 0;
const nextId = (type) => `${type}-${Date.now()}-${(counter += 1)}`;

export const createStep = (type) => {
  const base = { id: nextId(type), type };
  switch (type) {
    case "email":
      return { ...base, title: "Send email", subtitle: EMAIL_TEMPLATES[0], template: EMAIL_TEMPLATES[0], timing: "immediately", track: true };
    case "delay":
      return { ...base, title: delayTitle(1, "day"), amount: 1, unit: "day" };
    case "condition":
      return { ...base, title: "Email Opened: Trial Welcome?", condition: "Email Opened", conditionValue: "Trial Welcome", branches: { yes: [], no: [] } };
    case "update":
      return { ...base, title: "Update user field", subtitle: "Lifecycle Stage: Onboarding", field: "Lifecycle Stage", status: "Onboarding" };
    case "tag":
      return { ...base, title: "Add user tag", subtitle: "Trial user", tag: "Trial user" };
    case "untag":
      return { ...base, title: "Remove user tag", subtitle: "Trial user", tag: "Trial user" };
    default:
      return { ...base, title: "End journey", subtitle: "Users leave the journey here" };
  }
};

export const INITIAL_STEPS = [
  { id: "trigger-1", type: "trigger", title: "Trial Started", subtitle: "User Event", triggerType: "User Event", trigger: "Trial Started" },
  { id: "email-1", type: "email", title: "Send email", subtitle: "Trial Welcome", template: "Trial Welcome", timing: "immediately", track: true },
  { id: "delay-1", type: "delay", title: "Wait 1 day", amount: 1, unit: "day" },
  {
    id: "condition-1",
    type: "condition",
    title: "Email Opened: Trial Welcome?",
    condition: "Email Opened",
    conditionValue: "Trial Welcome",
    branches: {
      yes: [{ id: "email-2", type: "email", title: "Send email", subtitle: "Trial Welcome", template: "Trial Welcome", timing: "immediately", track: true }],
      no: [
        { id: "delay-2", type: "delay", title: "Wait 1 day", amount: 1, unit: "day" },
        { id: "email-3", type: "email", title: "Send email", subtitle: "Trial Welcome", template: "Trial Welcome", timing: "immediately", track: true },
      ],
    },
  },
  { id: "goal-1", type: "goal", title: "Trial Converted to Paid?", goal: "Trial Converted to Paid" },
];

// ── Pure tree helpers (main path + one level of Yes/No branches) ──

const mapBranches = (step, fn) =>
  step.type === "condition" ? { ...step, branches: { yes: fn(step.branches.yes), no: fn(step.branches.no) } } : step;

export const findStep = (steps, id) => {
  for (const step of steps) {
    if (step.id === id) return step;
    if (step.type === "condition") {
      const found = findStep(step.branches.yes, id) || findStep(step.branches.no, id);
      if (found) return found;
    }
  }
  return null;
};

export const updateStep = (steps, id, changes) =>
  steps.map((step) => (step.id === id ? { ...step, ...changes } : mapBranches(step, (list) => updateStep(list, id, changes))));

export const removeStep = (steps, id) =>
  steps.filter((step) => step.id !== id).map((step) => mapBranches(step, (list) => removeStep(list, id)));

// Insert after `index` in the main path (parentId null) or in a condition's branch
export const insertStep = (steps, { parentId, side, index }, newStep) => {
  const insert = (list) => [...list.slice(0, index + 1), newStep, ...list.slice(index + 1)];
  if (!parentId) return insert(steps);
  return steps.map((step) => (step.id === parentId ? { ...step, branches: { ...step.branches, [side]: insert(step.branches[side]) } } : step));
};

// Move a main-path step up or down; the entry trigger always stays first
export const moveStep = (steps, id, direction) => {
  const index = steps.findIndex((step) => step.id === id);
  const target = index + direction;
  if (index < 1 || target < 1 || target >= steps.length) return steps;
  const next = [...steps];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};
