"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ExternalLink, Info, X } from "lucide-react";
import {
  STEP_TYPES,
  EMAIL_TEMPLATES,
  TRIGGER_TYPES,
  USER_EVENTS,
  TIMED_EVENTS,
  USAGE_EVENT,
  CONDITION_TYPES,
  GOALS,
  USER_FIELDS,
  DELAY_UNITS,
  delayTitle,
} from "./journey-steps";
import { SAVED_SEGMENTS } from "../../user-segments";

const SEGMENT_NAMES = SAVED_SEGMENTS.map((segment) => segment.name);
// What a Condition step compares against
const CONDITION_VALUES = {
  "Event Occurred": USER_EVENTS,
  "Event Did Not Occur": USER_EVENTS,
  "User Is In Segment": SEGMENT_NAMES,
  "User Is Not In Segment": SEGMENT_NAMES,
  Plan: ["Free Trial", "Basic", "Pro", "Elite"],
  "Subscription Status": ["Active", "Trialing", "Past Due", "Paused", "Canceled"],
  "Trial Status": ["Active Trial", "Trial Expired", "Converted", "No Trial"],
  "Call Usage %": ["50% or more", "75% or more", "80% or more", "90% or more", "100%"],
  "Calibration Status": ["Completed", "In Progress", "Not Started"],
  "Payment Status": ["Paid", "Failed", "Update Required"],
  "Email Opened": EMAIL_TEMPLATES,
  "Email Clicked": EMAIL_TEMPLATES,
  "Last Login": ["Within last 7 days", "More than 7 days ago", "More than 30 days ago"],
};

const TIMEZONES = ["GMT 6+", "GMT -5 (Eastern)", "GMT -8 (Pacific)", "GMT 0 (UTC)"];

const sectionLabel = "block text-[11px] font-semibold uppercase tracking-wider text-medium-black mb-2";
const fieldLabel = "block text-xs font-semibold text-dark-black mb-1.5";
const fieldClass =
  "w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm text-dark-black outline-none focus:border-primary transition-colors";

const Select = ({ id, value, onChange, options }) => (
  <div className="relative">
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${fieldClass} appearance-none pr-9 cursor-pointer`}>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </select>
    <ChevronDown className="w-4 h-4 text-dark-black/60 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
  </div>
);

const Checkbox = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-2.5 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only peer" />
    <span className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </span>
    <span className="text-xs text-dark-black">{children}</span>
  </label>
);

const formatSendDate = (date, time) => {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  const [hours = 0, minutes = 0] = (time || "00:00").split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).replace(/, (\d{1,2}:\d{2})/, " at $1");
};

// Builds the card title/subtitle from the edited fields
const describe = (type, form) => {
  switch (type) {
    case "trigger": {
      if (form.triggerType === "Enters Segment" || form.triggerType === "Exits Segment") {
        return { title: `${form.triggerType}: ${form.segment}`, subtitle: form.triggerType, triggerType: form.triggerType, segment: form.segment };
      }
      if (form.triggerType === "Date / Relative Date") {
        return { title: `${form.relativeAmount} days ${form.relativeDirection} ${form.relativeDate}`, subtitle: "Date / Relative Date", triggerType: form.triggerType, relativeAmount: form.relativeAmount, relativeDirection: form.relativeDirection, relativeDate: form.relativeDate };
      }
      const timed = TIMED_EVENTS[form.trigger];
      const detail = form.trigger === USAGE_EVENT ? ` (${form.usagePct}%)` : timed ? ` (${timed.toLowerCase()} ${form.timeAmount} ${form.timeUnit})` : "";
      return { title: `${form.trigger}${detail}`, subtitle: "User Event", triggerType: "User Event", trigger: form.trigger, usagePct: form.usagePct, timeAmount: form.timeAmount, timeUnit: form.timeUnit };
    }
    case "email":
      return { subtitle: form.template, template: form.template, timing: form.timing, track: form.track, sendDate: form.sendDate, sendTime: form.sendTime, timezone: form.timezone, localTime: form.localTime };
    case "delay":
      return { title: delayTitle(form.amount, form.unit), amount: Number(form.amount), unit: form.unit };
    case "condition":
      return { title: `${form.condition}: ${form.conditionValue}?`, condition: form.condition, conditionValue: form.conditionValue };
    case "update":
      return { subtitle: `${form.field}: ${form.status}`, field: form.field, status: form.status };
    case "tag":
    case "untag":
      return { subtitle: form.tag, tag: form.tag };
    case "goal":
      return { title: `${form.goal}?`, goal: form.goal };
    default:
      return {};
  }
};

// Remount with key={step.id} so the form starts from the selected step
const StepSettingsPanel = ({ step, audienceSize = "2,456", onClose, onSave, onDelete }) => {
  const [form, setForm] = useState(() => ({
    triggerType: step.triggerType ?? "User Event",
    trigger: step.trigger ?? USER_EVENTS[1],
    segment: step.segment ?? SEGMENT_NAMES[0],
    usagePct: step.usagePct ?? 80,
    timeAmount: step.timeAmount ?? 3,
    timeUnit: step.timeUnit ?? "days",
    relativeAmount: step.relativeAmount ?? 3,
    relativeDirection: step.relativeDirection ?? "before",
    relativeDate: step.relativeDate ?? "Trial End Date",
    field: step.field ?? "Lifecycle Stage",
    conditionValue: step.conditionValue ?? EMAIL_TEMPLATES[0],
    template: step.template ?? EMAIL_TEMPLATES[0],
    timing: step.timing ?? "immediately",
    track: step.track ?? true,
    sendDate: step.sendDate ?? "2026-08-05",
    sendTime: step.sendTime ?? "10:00",
    timezone: step.timezone ?? TIMEZONES[0],
    localTime: step.localTime ?? true,
    amount: step.amount ?? 1,
    unit: step.unit ?? "day",
    condition: step.condition ?? CONDITION_TYPES[0],
    status: step.status ?? USER_FIELDS["Lifecycle Stage"][0],
    tag: step.tag ?? "",
    goal: step.goal ?? GOALS[0],
  }));
  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));
  const meta = STEP_TYPES[step.type];
  const canSave = step.type !== "delay" || Number(form.amount) > 0;

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
            <p className="text-sm font-semibold text-dark-black truncate">{step.type === "email" ? form.template : step.title}</p>
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
                  <Select id="step-trigger" value={form.trigger} onChange={set("trigger")} options={USER_EVENTS} />
                </div>
                {TIMED_EVENTS[form.trigger] && (
                  <div>
                    <p className={fieldLabel}>{TIMED_EVENTS[form.trigger]}</p>
                    <div className="grid grid-cols-[96px_1fr] gap-2">
                      <input aria-label="Time amount" type="number" min={1} value={form.timeAmount} onChange={(event) => set("timeAmount")(event.target.value)} className={fieldClass} />
                      <Select id="step-time-unit" value={form.timeUnit} onChange={set("timeUnit")} options={["hours", "days"]} />
                    </div>
                  </div>
                )}
                {form.trigger === USAGE_EVENT && (
                  <div>
                    <label htmlFor="step-usage" className={fieldLabel}>Usage Percentage</label>
                    <input id="step-usage" type="number" min={1} max={100} value={form.usagePct} onChange={(event) => set("usagePct")(event.target.value)} className={fieldClass} />
                    <p className="mt-1.5 text-[11px] text-medium-black">E.g. 80% → usage warning, 90% → stronger warning, 100% → offer more calls.</p>
                  </div>
                )}
              </>
            )}
            {(form.triggerType === "Enters Segment" || form.triggerType === "Exits Segment") && (
              <div>
                <label htmlFor="step-segment" className={fieldLabel}>Segment</label>
                <Select id="step-segment" value={form.segment} onChange={set("segment")} options={SEGMENT_NAMES} />
              </div>
            )}
            {form.triggerType === "Date / Relative Date" && (
              <div className="grid grid-cols-[72px_1fr_1.4fr] gap-2">
                <input aria-label="Days" type="number" min={0} value={form.relativeAmount} onChange={(event) => set("relativeAmount")(event.target.value)} className={fieldClass} />
                <Select id="step-rel-dir" value={form.relativeDirection} onChange={set("relativeDirection")} options={["before", "after"]} />
                <Select id="step-rel-date" value={form.relativeDate} onChange={set("relativeDate")} options={["Trial End Date", "Trial Start Date", "Signup Date", "Renewal Date"]} />
              </div>
            )}
          </div>
        )}

        {step.type === "email" && (
          <>
            <div>
              <label htmlFor="step-template" className={sectionLabel}>Email template</label>
              <Select id="step-template" value={form.template} onChange={set("template")} options={EMAIL_TEMPLATES} />
              <Link
                href="/super-admin/campaigns-journeys?tab=templates"
                target="_blank"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Preview template <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div>
              <p className={sectionLabel}>Send timing</p>
              <div role="radiogroup" aria-label="Send timing" className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-light-gray">
                {["immediately", "schedule"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={form.timing === option}
                    onClick={() => set("timing")(option)}
                    className={`h-8 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      form.timing === option ? "bg-white text-primary border border-primary shadow-xs" : "text-medium-black hover:text-dark-black"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {form.timing === "schedule" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label htmlFor="step-date" className={fieldLabel}>Send date</label>
                  <input id="step-date" type="date" value={form.sendDate} onChange={(event) => set("sendDate")(event.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="step-time" className={fieldLabel}>Send time</label>
                  <input id="step-time" type="time" value={form.sendTime} onChange={(event) => set("sendTime")(event.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="step-timezone" className={fieldLabel}>Timezone</label>
                  <Select id="step-timezone" value={form.timezone} onChange={set("timezone")} options={TIMEZONES} />
                </div>
                <Checkbox checked={form.localTime} onChange={set("localTime")}>Use each user&apos;s local timezone</Checkbox>
                {form.sendDate && (
                  <p className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
                    <Info className="w-4 h-4 shrink-0 text-emerald-600" />
                    This email will be sent on {formatSendDate(form.sendDate, form.sendTime)}.
                  </p>
                )}
              </div>
            )}

            <Checkbox checked={form.track} onChange={set("track")}>Track opens and clicks</Checkbox>
            <p className="flex items-start gap-2 text-[11px] text-medium-black">
              <Info className="w-3.5 h-3.5 shrink-0 text-primary" />
              Before a delayed email is sent, the user&apos;s current state is checked again (e.g. no upgrade email if they already upgraded).
            </p>
          </>
        )}

        {step.type === "delay" && (
          <div>
            <p className={sectionLabel}>Wait for</p>
            <div className="grid grid-cols-[96px_1fr] gap-2">
              <input
                aria-label="Wait amount"
                type="number"
                min={1}
                value={form.amount}
                onChange={(event) => set("amount")(event.target.value)}
                className={fieldClass}
              />
              <Select id="step-unit" value={form.unit} onChange={set("unit")} options={DELAY_UNITS} />
            </div>
          </div>
        )}

        {step.type === "condition" && (
          <div>
            <label htmlFor="step-condition" className={sectionLabel}>Condition</label>
            <Select id="step-condition" value={form.condition} onChange={(value) => setForm((prev) => ({ ...prev, condition: value, conditionValue: CONDITION_VALUES[value][0] }))} options={CONDITION_TYPES} />
            <div className="mt-2">
              <Select id="step-condition-value" value={form.conditionValue} onChange={set("conditionValue")} options={CONDITION_VALUES[form.condition] ?? []} />
            </div>
            <p className="mt-2 text-xs text-medium-black">Users who match continue down the Yes path; everyone else follows No.</p>
          </div>
        )}

        {step.type === "update" && (
          <div>
            <label htmlFor="step-field" className={sectionLabel}>User field</label>
            <Select id="step-field" value={form.field} onChange={(value) => setForm((prev) => ({ ...prev, field: value, status: USER_FIELDS[value][0] }))} options={Object.keys(USER_FIELDS)} />
            <div className="mt-2">
              <Select id="step-status" value={form.status} onChange={set("status")} options={USER_FIELDS[form.field] ?? []} />
            </div>
          </div>
        )}

        {(step.type === "tag" || step.type === "untag") && (
          <div>
            <label htmlFor="step-tag" className={sectionLabel}>{step.type === "untag" ? "Tag to remove" : "Tag to add"}</label>
            <input id="step-tag" value={form.tag} onChange={(event) => set("tag")(event.target.value)} placeholder="e.g. Trial user" className={fieldClass} />
          </div>
        )}

        {step.type === "goal" && (
          <div>
            <label htmlFor="step-goal" className={sectionLabel}>Journey goal</label>
            <Select id="step-goal" value={form.goal} onChange={set("goal")} options={GOALS} />
            <p className="mt-2 text-xs text-medium-black">Users who reach this goal leave the journey.</p>
          </div>
        )}

        {step.type === "end" && <p className="text-xs text-medium-black">Users leave the journey when they reach this step.</p>}

        <div className="border-t border-light-gray pt-4">
          <p className={sectionLabel}>Step summary</p>
          <p className="text-xs text-medium-black">Estimated audience</p>
          <p className="text-2xl font-semibold text-dark-black">
            {audienceSize} <span className="text-sm font-normal text-light-black">users</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-light-gray">
        {step.type !== "trigger" ? (
          <button type="button" onClick={() => onDelete(step)} className="text-sm font-semibold text-red-600 hover:text-red-700 cursor-pointer">
            Delete Step
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          disabled={!canSave || (step.type === "tag" && !form.tag.trim())}
          onClick={() => onSave(step.id, describe(step.type, form))}
          className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-medium-teal transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Save Step
        </button>
      </div>
    </aside>
  );
};

export default StepSettingsPanel;
