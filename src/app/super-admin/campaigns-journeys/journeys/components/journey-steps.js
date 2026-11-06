import { Clock, Mail, Tag, Target, Triangle, UserCheck, Workflow, CircleCheckBig, Tags } from "lucide-react";
import {
  CONDITION_TYPES as CATALOG_CONDITIONS, DATE_FIELDS, EXIT_CONDITIONS as CATALOG_EXITS, GOALS as CATALOG_GOALS, REENTRY_OPTIONS as CATALOG_REENTRY,
  TRIGGER_TYPES as CATALOG_TRIGGERS, USER_EVENTS as CATALOG_EVENTS, USER_FIELDS as CATALOG_FIELDS, eventByKey,
} from "@/lib/campaigns/catalog";

// Step catalogue for the journey builder. The vocabulary comes from lib/campaigns/catalog,
// which the server validates against; the trigger is shown as the first card and saved
// separately as the journey's triggerConfig.
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
export const ADDABLE_TYPES = ["email", "delay", "condition", "update", "tag", "untag", "goal", "end"];

export const TRIGGER_TYPES = CATALOG_TRIGGERS;
export const USER_EVENTS = CATALOG_EVENTS;
export const CONDITION_TYPES = CATALOG_CONDITIONS;
export const GOALS = CATALOG_GOALS;
export const USER_FIELDS = CATALOG_FIELDS;
export const REENTRY_OPTIONS = CATALOG_REENTRY;
export const EXIT_CONDITIONS = CATALOG_EXITS;
export { DATE_FIELDS, eventByKey };
export const DELAY_UNITS = ["minute", "hour", "day", "week"];

export const delayTitle = (amount, unit) => `Wait ${amount} ${unit}${Number(amount) === 1 ? "" : "s"}`;

// Title of the trigger card from its settings
export function triggerTitle(trigger, segments = []) {
  if (!trigger) return "Choose a trigger";
  if (trigger.type === "Enters Segment" || trigger.type === "Exits Segment") return `${trigger.type}: ${segments.find((segment) => segment.id === trigger.segmentId)?.name ?? "choose a segment"}`;
  if (trigger.type === "Date / Relative Date") {
    if (trigger.mode === "fixed") return `On ${trigger.at ? new Date(trigger.at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "a date"}`;
    const field = DATE_FIELDS.find((item) => item.key === trigger.field)?.label ?? "a date";
    const days = Number(trigger.offsetDays ?? 0);
    return days === 0 ? `On the ${field}` : `${Math.abs(days)} days ${days < 0 ? "before" : "after"} ${field}`;
  }
  const event = eventByKey(trigger.event);
  if (!event) return "Choose a user event";
  if (event.timed) return `${event.label} (${event.timed.label.toLowerCase()} ${trigger.amount ?? event.timed.default} ${event.timed.unit})`;
  if (event.usage) return `${event.label} (${trigger.usagePct ?? 80}%)`;
  return event.label;
}

let counter = 0;
const nextId = (type) => `${type}-${Date.now()}-${(counter += 1)}`;

export const createStep = (type) => {
  const base = { id: nextId(type), type };
  switch (type) {
    case "email":
      return { ...base, title: "Send email", subtitle: "Choose a template", templateId: null };
    case "delay":
      return { ...base, title: delayTitle(1, "day"), amount: 1, unit: "day" };
    case "condition":
      return { ...base, title: "Trial Status: Active Trial?", condition: "Trial Status", conditionValue: "Active Trial", branches: { yes: [], no: [] } };
    case "update":
      return { ...base, title: "Update user field", subtitle: "Lifecycle Stage: Onboarding", field: "Lifecycle Stage", status: "Onboarding" };
    case "tag":
      return { ...base, title: "Add user tag", subtitle: "Trial user", tag: "Trial user" };
    case "untag":
      return { ...base, title: "Remove user tag", subtitle: "Trial user", tag: "Trial user" };
    case "goal":
      return { ...base, title: "Trial Converted to Paid?", goal: "Trial Converted to Paid" };
    default:
      return { ...base, title: "End journey", subtitle: "Users leave the journey here" };
  }
};

// A new journey: trial onboarding outline (the admin picks the templates)
export const NEW_JOURNEY = {
  name: "New Journey",
  description: "",
  triggerConfig: { type: "User Event", event: "trial_started" },
  audience: { type: "All Eligible Users" },
  reentry: { mode: "Never" },
  exitConditions: [{ type: "Goal Completed" }, { type: "Subscription Cancelled" }],
  goal: "Trial Converted to Paid",
  steps: [
    { id: "email-1", type: "email", title: "Send email", subtitle: "Choose a template", templateId: null },
    { id: "delay-1", type: "delay", title: "Wait 1 day", amount: 1, unit: "day" },
    { id: "goal-1", type: "goal", title: "Trial Converted to Paid?", goal: "Trial Converted to Paid" },
  ],
};

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

// A condition can't sit inside another condition's branch
export const nestedTypes = ADDABLE_TYPES.filter((type) => type !== "condition");
