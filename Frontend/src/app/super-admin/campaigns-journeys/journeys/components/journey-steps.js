import { Clock, Mail, Tag, Target, Triangle, UserCheck, Workflow, CircleCheckBig } from "lucide-react";

// Step catalogue for the journey builder (design only, local state).
export const STEP_TYPES = {
  trigger: { label: "Entry trigger", icon: Triangle, tone: "bg-emerald-50 text-emerald-600", badge: "bg-emerald-500" },
  email: { label: "Send email", icon: Mail, tone: "bg-blue-50 text-blue-600", badge: "bg-blue-500", chip: "bg-blue-50 text-blue-600" },
  delay: { label: "Add delay", icon: Clock, tone: "bg-orange-50 text-orange-500", badge: "bg-orange-500", chip: "bg-orange-50 text-orange-500" },
  condition: { label: "Condition", icon: Workflow, tone: "bg-purple-50 text-purple-600", badge: "bg-purple-500", chip: "bg-purple-50 text-purple-600" },
  update: { label: "Update lead", icon: UserCheck, tone: "bg-emerald-50 text-emerald-600", badge: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-600" },
  tag: { label: "Add tag", icon: Tag, tone: "bg-fuchsia-50 text-fuchsia-600", badge: "bg-fuchsia-500", chip: "bg-fuchsia-50 text-fuchsia-600" },
  goal: { label: "Goal", icon: CircleCheckBig, tone: "bg-emerald-50 text-emerald-600", badge: "bg-emerald-600", chip: "bg-emerald-50 text-emerald-600" },
  end: { label: "End journey", icon: Target, tone: "bg-red-50 text-red-600", badge: "bg-red-500", chip: "bg-red-50 text-red-600" },
};

// Types offered by "Add Step" (in menu order)
export const ADDABLE_TYPES = ["email", "delay", "condition", "update", "tag", "end"];

export const EMAIL_TEMPLATES = ["Trial Welcome", "Getting Started Tips", "Trial Ending Soon", "Upgrade Offer"];
export const TRIGGERS = ["User signs up", "Trial started", "Lead created", "Subscription cancelled"];
export const CONDITIONS = ["Opened Trial Welcome", "Clicked a link in Trial Welcome", "Booked a demo", "Upgraded to paid plan"];
export const GOALS = ["Upgrade to paid plan", "Book a demo", "Complete onboarding"];
export const LEAD_STATUSES = ["Hot", "Warm", "Cold", "Unknown"];
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
      return { ...base, title: `${CONDITIONS[0]}?`, condition: CONDITIONS[0], branches: { yes: [], no: [] } };
    case "update":
      return { ...base, title: "Update lead", subtitle: "Status: Hot", status: "Hot" };
    case "tag":
      return { ...base, title: "Add tag", subtitle: "Trial user", tag: "Trial user" };
    default:
      return { ...base, title: "End journey", subtitle: "Leads leave the journey here" };
  }
};

export const INITIAL_STEPS = [
  { id: "trigger-1", type: "trigger", title: "User signs up", subtitle: "Any new trial account", trigger: "User signs up" },
  { id: "email-1", type: "email", title: "Send email", subtitle: "Trial Welcome", template: "Trial Welcome", timing: "immediately", track: true },
  { id: "delay-1", type: "delay", title: "Wait 1 day", amount: 1, unit: "day" },
  {
    id: "condition-1",
    type: "condition",
    title: "Opened Trial Welcome?",
    condition: "Opened Trial Welcome",
    branches: {
      yes: [{ id: "email-2", type: "email", title: "Send email", subtitle: "Trial Welcome", template: "Trial Welcome", timing: "immediately", track: true }],
      no: [
        { id: "delay-2", type: "delay", title: "Wait 1 day", amount: 1, unit: "day" },
        { id: "email-3", type: "email", title: "Send email", subtitle: "Trial Welcome", template: "Trial Welcome", timing: "immediately", track: true },
      ],
    },
  },
  { id: "goal-1", type: "goal", title: "Upgrade to paid plan?", goal: "Upgrade to paid plan" },
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
