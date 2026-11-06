"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { DAY_OPERATORS, OPERATORS, RULE_FIELDS, fieldOf, membersOf } from "../user-segments";
import { showError } from "@/lib/alerts";
import { campaignApi } from "../campaign-api";

// Create / Edit Segment. Segment Type comes first:
//  - Dynamic (default): Entry Rules (Match ALL / ANY). Members update automatically.
//  - Static: the admin picks users ("Add Users").
// The parent remounts this modal (key) for each segment, so state starts from `segment`.
const fieldClass = "w-full h-10 px-3 rounded-xl border border-light-gray bg-white text-xs sm:text-sm text-dark-black outline-none focus:border-primary";

const defaultValue = (field, operator) => {
  const definition = fieldOf(field);
  if (definition.type === "date") return DAY_OPERATORS.includes(operator) ? 7 : new Date().toISOString().slice(0, 10);
  if (definition.type === "number") return definition.key === "callUsagePct" ? 80 : 0;
  return definition.options?.[0] ?? "";
};

function RuleRow({ condition, onChange, onRemove, canRemove, plans }) {
  const known = fieldOf(condition.field);
  // Plan values are the real plan names
  const definition = known.key === "plan" && plans?.length ? { ...known, options: plans } : known;
  const operators = OPERATORS[definition.type];
  const usesDays = definition.type === "date" && DAY_OPERATORS.includes(condition.operator);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1.2fr_1fr_auto] gap-2 items-center">
      <select
        aria-label="Field"
        value={condition.field}
        onChange={(event) => {
          const field = event.target.value;
          const operator = OPERATORS[fieldOf(field).type][0];
          onChange({ field, operator, value: defaultValue(field, operator) });
        }}
        className={fieldClass}
      >
        {RULE_FIELDS.map((field) => (
          <option key={field.key} value={field.key}>{field.label}</option>
        ))}
      </select>
      <select
        aria-label="Operator"
        value={condition.operator}
        onChange={(event) => onChange({ ...condition, operator: event.target.value, value: defaultValue(condition.field, event.target.value) })}
        className={fieldClass}
      >
        {operators.map((operator) => (
          <option key={operator} value={operator}>{operator}</option>
        ))}
      </select>
      <div className="relative">
        {definition.options && ["Is", "Is Not"].includes(condition.operator) ? (
          <select aria-label="Value" value={condition.value} onChange={(event) => onChange({ ...condition, value: event.target.value })} className={fieldClass}>
            {definition.options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <input
            aria-label="Value"
            type={definition.type === "number" || usesDays ? "number" : definition.type === "date" ? "date" : "text"}
            min={definition.type === "number" || usesDays ? 0 : undefined}
            value={condition.value}
            onChange={(event) => onChange({ ...condition, value: definition.type === "number" || usesDays ? Number(event.target.value) : event.target.value })}
            className={`${fieldClass} ${definition.unit || usesDays ? "pr-12" : ""}`}
          />
        )}
        {(definition.unit || usesDays) && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-light-black pointer-events-none">{usesDays ? "days" : definition.unit}</span>
        )}
      </div>
      <button type="button" onClick={onRemove} disabled={!canRemove} aria-label="Remove rule" className="w-9 h-9 rounded-xl border border-light-gray flex items-center justify-center text-light-black hover:text-red-500 disabled:opacity-40 cursor-pointer">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// Saves through the API; users / plans come from the Segments page (live preview uses the same rules as the server)
export default function SegmentFormModal({ isOpen, onClose, segment = null, initialUserIds = [], onSave, users = [], plans = [] }) {
  const editing = Boolean(segment && !segment.isNew);
  const [type, setType] = useState(segment?.type ?? "Dynamic");
  const [name, setName] = useState(segment?.name ?? "");
  const [description, setDescription] = useState(segment?.description ?? "");
  const [match, setMatch] = useState(segment?.rules?.match ?? "all");
  const [conditions, setConditions] = useState(segment?.rules?.conditions?.length ? segment.rules.conditions : [{ field: "trialStatus", operator: "Is", value: "Active Trial" }]);
  const [userIds, setUserIds] = useState(segment?.userIds ?? initialUserIds);
  const [saving, setSaving] = useState(false);
  const [userQuery, setUserQuery] = useState("");

  const draft = { type, rules: { match, conditions }, userIds };
  const preview = membersOf(draft, users);
  const valid = name.trim() && (type === "Static" ? userIds.length > 0 : conditions.length > 0);

  const save = async () => {
    setSaving(true);
    try {
      const body = { name: name.trim(), description: description.trim(), type, ...(type === "Dynamic" ? { rules: { match, conditions } } : { userIds }) };
      const result = editing ? await campaignApi.updateSegment(segment.id, body) : await campaignApi.createSegment(body);
      onSave?.(result.segment, { created: !editing });
      onClose();
    } catch (error) {
      showError("Segment not saved", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Edit Segment" : "Create New Segment"}
      subtitle="Group PitchProX users for broadcast campaigns and lifecycle journeys."
      size="xl"
      footer={
        <>
          <span className="mr-auto text-xs text-medium-black">
            {preview.length} {preview.length === 1 ? "user" : "users"} {type === "Dynamic" ? "match right now" : "selected"}
          </span>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" disabled={!valid || saving} onClick={save}>
            {editing ? "Save Segment" : "Create Segment"}
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-medium-black">
            Segment Type
            <select value={type} onChange={(event) => setType(event.target.value)} className={fieldClass} disabled={editing}>
              <option value="Dynamic">Dynamic</option>
              <option value="Static">Static</option>
            </select>
            <span className="font-normal text-[11px] text-light-black">
              {type === "Dynamic" ? "Users join and leave automatically as they match the rules." : "Only the users you choose. Use when you want a fixed list."}
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-medium-black">
            Segment Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Trial users with low usage" className={fieldClass} maxLength={120} disabled={segment?.system} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-medium-black">
          Description (optional)
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What this segment is for" className={fieldClass} />
        </label>

        {type === "Dynamic" ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-dark-black">Entry Rules</p>
              <div className="flex items-center bg-light-gray p-0.5 rounded-lg" role="radiogroup" aria-label="Rule logic">
                {[
                  ["all", "Match ALL conditions"],
                  ["any", "Match ANY conditions"],
                ].map(([value, label]) => (
                  <button key={value} type="button" role="radio" aria-checked={match === value} onClick={() => setMatch(value)} className={`px-3 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer ${match === value ? "bg-white text-primary shadow-xs" : "text-medium-black"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {conditions.map((condition, index) => (
              <RuleRow
                key={index}
                condition={condition}
                canRemove={conditions.length > 1}
                plans={plans}
                onChange={(next) => setConditions((list) => list.map((item, position) => (position === index ? next : item)))}
                onRemove={() => setConditions((list) => list.filter((_, position) => position !== index))}
              />
            ))}
            <button
              type="button"
              onClick={() => setConditions((list) => [...list, { field: "plan", operator: "Is", value: "Pro" }])}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add condition
            </button>
            <p className="text-[11px] text-light-black">
              Tip: thresholds are part of the rule. For example &ldquo;Call Usage % greater than or equal to 80&rdquo;; change the number for 50%, 75%, 90% or 100%.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-dark-black">Add Users</p>
              <input type="search" value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="Search users…" aria-label="Search users" className="h-8 px-3 rounded-lg border border-light-gray text-xs outline-none focus:border-primary w-48" />
            </div>
            <div className="max-h-56 overflow-y-auto rounded-xl border border-light-gray divide-y divide-light-gray">
              {users.filter((item) => `${item.name} ${item.email} ${item.company}`.toLowerCase().includes(userQuery.trim().toLowerCase())).slice(0, 200).map((item) => (
                <label key={item.id} className="flex items-center gap-3 px-3 py-2 text-xs cursor-pointer hover:bg-light-gray/40">
                  <input type="checkbox" checked={userIds.includes(item.id)} onChange={() => setUserIds((ids) => (ids.includes(item.id) ? ids.filter((id) => id !== item.id) : [...ids, item.id]))} className="accent-primary w-4 h-4" />
                  <span className="font-semibold text-dark-black/85 flex-1">{item.name}</span>
                  <span className="text-light-black">{item.email}</span>
                  <span className="text-medium-black w-16 text-right">{item.plan}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </DialogModal>
  );
}
