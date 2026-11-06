"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink, Info, X } from "lucide-react";
import {
  STEP_TYPES, TRIGGER_TYPES, USER_EVENTS, CONDITION_TYPES, GOALS, USER_FIELDS, DELAY_UNITS, DATE_FIELDS, delayTitle, eventByKey, triggerTitle,
} from "./journey-steps";
import { SUBSCRIPTION_STATUSES, TRIAL_STATUSES, CALIBRATION_STATUSES, PAYMENT_STATUSES } from "@/lib/campaigns/rules";

const sectionLabel = "block text-[11px] font-semibold uppercase tracking-wider text-medium-black mb-2";
const fieldLabel = "block text-xs font-semibold text-dark-black mb-1.5";
const fieldClass = "w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-dark-black outline-none focus:border-primary transition-colors";

// options: [{ value, label }] or strings
const Select = ({ id, value, onChange, options, placeholder }) => (
  <div className="relative">
    <select id={id} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} appearance-none pr-9 cursor-pointer`}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => {
        const item = typeof option === "string" ? { value: option, label: option } : option;
        return (
          <option key={item.value} value={item.value}>{item.label}</option>
        );
      })}
    </select>
    <ChevronDown className="w-4 h-4 text-dark-black/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
  </div>
);

const EVENT_OPTIONS = USER_EVENTS.map((event) => ({ value: event.key, label: `${event.label}${event.source === "pending" ? " (needs payments/calling)" : ""}` }));

// What a Condition step compares against: options, or a number input
function conditionChoices(condition, { templates, segments, plans }) {
  switch (condition) {
    case "Event Occurred":
    case "Event Did Not Occur":
      return { options: EVENT_OPTIONS };
    case "User Is In Segment":
    case "User Is Not In Segment":
      return { options: segments.map((segment) => ({ value: segment.id, label: segment.name })) };
    case "Email Opened":
    case "Email Clicked":
      return { options: templates.map((template) => ({ value: template.id, label: template.name })) };
    case "Plan":
      return { options: plans };
    case "Subscription Status":
      return { options: SUBSCRIPTION_STATUSES };
    case "Trial Status":
      return { options: TRIAL_STATUSES };
    case "Calibration Status":
      return { options: CALIBRATION_STATUSES };
    case "Payment Status":
      return { options: PAYMENT_STATUSES };
    case "Call Usage %":
      return { number: "Usage at or above (%)", fallback: 80 };
    case "Last Login":
      return { number: "Signed in within the last (days)", fallback: 7 };
    default:
      return { options: [] };
  }
}
const firstValue = (choices) => (choices.number ? choices.fallback : (typeof choices.options[0] === "string" ? choices.options[0] : choices.options[0]?.value) ?? "");

function conditionTitle(condition, value, context) {
  const choices = conditionChoices(condition, context);
  if (choices.number) return condition === "Last Login" ? `Signed in within ${value} days?` : `Call usage ≥ ${value}%?`;
  const option = choices.options.find((item) => (typeof item === "string" ? item : item.value) === value);
  return `${condition}: ${typeof option === "string" ? option : option?.label ?? "…"}?`;
}

// Turns the form into the step's fields (and its card title)
function describe(type, form, context) {
  switch (type) {
    case "trigger": {
      const trigger =
        form.triggerType === "User Event"
          ? { type: form.triggerType, event: form.event, ...(eventByKey(form.event)?.timed && { amount: Number(form.amount) }), ...(eventByKey(form.event)?.usage && { usagePct: Number(form.usagePct) }) }
          : form.triggerType === "Date / Relative Date"
            ? form.dateMode === "fixed"
              ? { type: form.triggerType, mode: "fixed", at: form.at ? new Date(form.at).toISOString() : "" }
              : { type: form.triggerType, mode: "relative", field: form.field, offsetDays: (form.direction === "before" ? -1 : 1) * Number(form.days) }
            : { type: form.triggerType, segmentId: form.segmentId };
      return { trigger, title: triggerTitle(trigger, context.segments), subtitle: form.triggerType };
    }
    case "email":
      return { templateId: form.templateId || null, subtitle: context.templates.find((template) => template.id === form.templateId)?.name ?? "Choose a template" };
    case "delay":
      return { title: delayTitle(form.amountDelay, form.unit), amount: Number(form.amountDelay), unit: form.unit };
    case "condition":
      return { title: conditionTitle(form.condition, form.conditionValue, context), condition: form.condition, conditionValue: form.conditionValue };
    case "update":
      return { subtitle: `${form.fieldName}: ${form.status}`, field: form.fieldName, status: form.status };
    case "tag":
    case "untag":
      return { subtitle: form.tag.trim(), tag: form.tag.trim() };
    case "goal":
      return { title: `${form.goal}?`, goal: form.goal };
    default:
      return {};
  }
}

// Remount with key={step.id} so the form starts from the selected step.
// templates / segments / plans: live lists for the pickers.
const StepSettingsPanel = ({ step, trigger, templates = [], segments = [], plans = [], audienceSize, readOnly = false, onClose, onSave, onDelete }) => {
  const context = { templates, segments, plans };
  const relativeDays = Number(trigger?.offsetDays ?? -3);
  const [form, setForm] = useState(() => ({
    triggerType: trigger?.type ?? "User Event",
    event: trigger?.event ?? "trial_started",
    amount: trigger?.amount ?? eventByKey(trigger?.event)?.timed?.default ?? 3,
    usagePct: trigger?.usagePct ?? 80,
    segmentId: trigger?.segmentId ?? segments[0]?.id ?? "",
    dateMode: trigger?.mode ?? "relative",
    at: trigger?.at ? new Date(trigger.at).toISOString().slice(0, 16) : "",
    field: trigger?.field ?? "trialEnd",
    days: Math.abs(relativeDays),
    direction: relativeDays < 0 ? "before" : "after",
    templateId: step.templateId ?? "",
    amountDelay: step.amount ?? 1,
    unit: step.unit ?? "day",
    condition: step.condition ?? CONDITION_TYPES[0],
    conditionValue: step.conditionValue ?? firstValue(conditionChoices(step.condition ?? CONDITION_TYPES[0], context)),
    fieldName: step.field ?? "Lifecycle Stage",
    status: step.status ?? USER_FIELDS["Lifecycle Stage"][0],
    tag: step.tag ?? "",
    goal: step.goal ?? GOALS[0],
  }));
  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));
  const meta = STEP_TYPES[step.type];
  const event = eventByKey(form.event);
  const choices = conditionChoices(form.condition, context);
  const template = templates.find((item) => item.id === form.templateId);

  const valid =
    (step.type !== "delay" || Number(form.amountDelay) > 0) &&
    (!["tag", "untag"].includes(step.type) || form.tag.trim()) &&
    (step.type !== "trigger" || form.triggerType === "User Event" || form.triggerType === "Date / Relative Date" ? true : Boolean(form.segmentId)) &&
    (step.type !== "trigger" || form.triggerType !== "Date / Relative Date" || form.dateMode !== "fixed" || Boolean(form.at));

  const save = () => onSave(step.id, describe(step.type, form, context));

  return (
    <aside className="bg-white rounded-2xl border border-light-gray shadow-xs flex flex-col font-secondary xl:sticky xl:top-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
        <h2 className="text-base font-semibold text-dark-black">Step Settings</h2>
        <button type="button" onClick={onClose} aria-label="Close step settings" className="p-1 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-5">
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${step.type === "email" ? "bg-blue-50/70" : "bg-light-gray/60"}`}>
          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${step.type === "email" ? "bg-blue-500 text-white" : meta.tone}`}>
            <meta.icon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${step.type === "email" ? "text-blue-600" : "text-light-black"}`}>{meta.label}</p>
            <p className="text-sm font-semibold text-dark-black truncate">{step.type === "email" ? template?.name ?? "Choose a template" : step.title}</p>
          </div>
        </div>

        {step.type === "trigger" && (
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="step-trigger-type" className={sectionLabel}>Trigger Type</label>
              <Select id="step-trigger-type" value={form.triggerType} onChange={set("triggerType")} options={TRIGGER_TYPES} />
            </div>
            {form.triggerType === "User Event" && (
              <>
                <div>
                  <label htmlFor="step-trigger" className={fieldLabel}>User Event</label>
                  <Select id="step-trigger" value={form.event} onChange={(value) => setForm((prev) => ({ ...prev, event: value, amount: eventByKey(value)?.timed?.default ?? prev.amount }))} options={EVENT_OPTIONS} />
                  {event?.source === "pending" && <p className="mt-1.5 text-[11px] text-amber-700">This event starts happening once payments or calling are connected.</p>}
                </div>
                {event?.timed && (
                  <div>
                    <label htmlFor="step-time" className={fieldLabel}>{event.timed.label} ({event.timed.unit})</label>
                    <input id="step-time" type="number" min={1} value={form.amount} onChange={(e) => set("amount")(e.target.value)} className={fieldClass} />
                  </div>
                )}
                {event?.usage && (
                  <div>
                    <label htmlFor="step-usage" className={fieldLabel}>Usage Percentage</label>
                    <input id="step-usage" type="number" min={1} max={1000} value={form.usagePct} onChange={(e) => set("usagePct")(e.target.value)} className={fieldClass} />
                    <p className="mt-1.5 text-[11px] text-medium-black">E.g. 80% → usage warning, 90% → stronger warning, 100% → offer more calls. Make one journey per threshold.</p>
                  </div>
                )}
              </>
            )}
            {(form.triggerType === "Enters Segment" || form.triggerType === "Exits Segment") && (
              <div>
                <label htmlFor="step-segment" className={fieldLabel}>Segment</label>
                <Select id="step-segment" value={form.segmentId} onChange={set("segmentId")} placeholder="Choose a segment" options={segments.map((segment) => ({ value: segment.id, label: `${segment.name} (${segment.memberCount})` }))} />
              </div>
            )}
            {form.triggerType === "Date / Relative Date" && (
              <div className="flex flex-col gap-3">
                <Select id="step-date-mode" value={form.dateMode} onChange={set("dateMode")} options={[{ value: "relative", label: "Relative to a date on the user" }, { value: "fixed", label: "On a fixed date" }]} />
                {form.dateMode === "fixed" ? (
                  <input aria-label="Start date and time" type="datetime-local" value={form.at} onChange={(e) => set("at")(e.target.value)} className={fieldClass} />
                ) : (
                  <div className="grid grid-cols-[72px_1fr_1.4fr] gap-2">
                    <input aria-label="Days" type="number" min={0} max={365} value={form.days} onChange={(e) => set("days")(e.target.value)} className={fieldClass} />
                    <Select id="step-rel-dir" value={form.direction} onChange={set("direction")} options={["before", "after"]} />
                    <Select id="step-rel-date" value={form.field} onChange={set("field")} options={DATE_FIELDS.map((field) => ({ value: field.key, label: field.label }))} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step.type === "email" && (
          <>
            <div>
              <label htmlFor="step-template" className={sectionLabel}>Email template</label>
              <Select
                id="step-template"
                value={form.templateId}
                onChange={set("templateId")}
                placeholder="Choose a template"
                options={templates.filter((item) => item.emailType !== "Transactional" && item.status !== "Archived").map((item) => ({ value: item.id, label: `${item.name}${item.status === "Draft" ? " (Draft)" : ""}` }))}
              />
              {template?.status === "Draft" && <p className="mt-1.5 text-[11px] text-amber-700">Activate this template before publishing the journey.</p>}
              {template && (
                <Link href={`/super-admin/campaigns-journeys/templates/${template.id}`} target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  Open template <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
            <p className="flex items-start gap-2 text-[11px] text-medium-black">
              <Info className="w-3.5 h-3.5 shrink-0 text-primary" />
              Sent when the user reaches this step; use Wait steps to space emails out. Before every email the user&apos;s current state is checked again (e.g. no upgrade email if they already upgraded).
            </p>
          </>
        )}

        {step.type === "delay" && (
          <div>
            <p className={sectionLabel}>Wait for</p>
            <div className="grid grid-cols-[96px_1fr] gap-2">
              <input aria-label="Wait amount" type="number" min={1} max={1000} value={form.amountDelay} onChange={(e) => set("amountDelay")(e.target.value)} className={fieldClass} />
              <Select id="step-unit" value={form.unit} onChange={set("unit")} options={DELAY_UNITS.map((unit) => ({ value: unit, label: `${unit}s` }))} />
            </div>
          </div>
        )}

        {step.type === "condition" && (
          <div>
            <label htmlFor="step-condition" className={sectionLabel}>Condition</label>
            <Select id="step-condition" value={form.condition} onChange={(value) => setForm((prev) => ({ ...prev, condition: value, conditionValue: firstValue(conditionChoices(value, context)) }))} options={CONDITION_TYPES} />
            <div className="mt-2">
              {choices.number ? (
                <label className="flex flex-col gap-1.5 text-xs text-medium-black">
                  {choices.number}
                  <input type="number" min={1} value={form.conditionValue} onChange={(e) => set("conditionValue")(Number(e.target.value))} className={fieldClass} />
                </label>
              ) : (
                <Select id="step-condition-value" value={form.conditionValue} onChange={set("conditionValue")} options={choices.options} />
              )}
            </div>
            <p className="mt-2 text-xs text-medium-black">Users who match continue down the Yes path; everyone else follows No. Opens and clicks count once an email service reports them.</p>
          </div>
        )}

        {step.type === "update" && (
          <div>
            <label htmlFor="step-field" className={sectionLabel}>User field</label>
            <Select id="step-field" value={form.fieldName} onChange={(value) => setForm((prev) => ({ ...prev, fieldName: value, status: USER_FIELDS[value][0] }))} options={Object.keys(USER_FIELDS)} />
            <div className="mt-2">
              <Select id="step-status" value={form.status} onChange={set("status")} options={USER_FIELDS[form.fieldName] ?? []} />
            </div>
          </div>
        )}

        {(step.type === "tag" || step.type === "untag") && (
          <div>
            <label htmlFor="step-tag" className={sectionLabel}>{step.type === "untag" ? "Tag to remove" : "Tag to add"}</label>
            <input id="step-tag" value={form.tag} maxLength={60} onChange={(e) => set("tag")(e.target.value)} placeholder="e.g. Trial user" className={fieldClass} />
            <p className="mt-1.5 text-[11px] text-medium-black">Tags can be used in segment rules (User Tag).</p>
          </div>
        )}

        {step.type === "goal" && (
          <div>
            <label htmlFor="step-goal" className={sectionLabel}>Journey goal</label>
            <Select id="step-goal" value={form.goal} onChange={set("goal")} options={GOALS} />
            <p className="mt-2 text-xs text-medium-black">Users who have reached this goal leave the journey here; the others continue.</p>
          </div>
        )}

        {step.type === "end" && <p className="text-xs text-medium-black">Users leave the journey when they reach this step.</p>}

        {audienceSize != null && (
          <div className="border-t border-light-gray pt-4">
            <p className={sectionLabel}>Audience</p>
            <p className="text-2xl font-semibold text-dark-black">
              {audienceSize} <span className="text-sm font-normal text-light-black">users can enter</span>
            </p>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-light-gray">
          {step.type !== "trigger" ? (
            <button type="button" onClick={() => onDelete(step)} className="text-sm font-semibold text-red-600 hover:text-red-700 cursor-pointer">
              Delete Step
            </button>
          ) : (
            <span />
          )}
          <button type="button" disabled={!valid} onClick={save} className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            Apply
          </button>
        </div>
      )}
    </aside>
  );
};

export default StepSettingsPanel;
