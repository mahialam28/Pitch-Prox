"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatPhoneNumber } from "@/utils.js/phone";
import { MAX_CONTACT_PHONES, PHONE_LABELS, phoneStatusLabel } from "@/utils.js/phone-status";
import PhoneStatusBadge from "./phone-status-badge";

// Rows a form edits: [{ number, label, status? }]. Saved numbers keep their status on the server.
export const phoneRowsFrom = (contact) =>
  contact?.phones?.length ? contact.phones.map((phone) => ({ number: phone.number, label: phone.label, status: phone.status })) : [{ number: contact?.phoneNumber ?? "", label: "Mobile" }];

// What the API expects: the filled rows only
export const phonesPayload = (rows) => rows.filter((row) => row.number.trim()).map((row) => ({ number: row.number.trim(), label: row.label }));

// Phone numbers of a lead/prospect: number + type (Mobile/Home/Work/Other) + status of saved numbers
export default function PhoneNumbersEditor({ value, onChange }) {
  const update = (index, changes) => onChange(value.map((row, i) => (i === index ? { ...row, ...changes } : row)));
  const remove = (index) => onChange(value.length > 1 ? value.filter((_, i) => i !== index) : [{ number: "", label: "Mobile" }]);
  const add = () => value.length < MAX_CONTACT_PHONES && onChange([...value, { number: "", label: "Mobile" }]);

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-medium-black mb-1.5">Phone Numbers</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {value.map((row, index) => (
          <div key={index} className="rounded-xl border border-light-gray p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={`phone-${index}`} className="text-xs font-semibold text-medium-black">
                Number {index + 1}
              </label>
              <div className="flex items-center gap-2">
                {row.status && <PhoneStatusBadge status={row.status} />}
                <button type="button" onClick={() => remove(index)} aria-label={`Remove number ${index + 1}`} title="Remove number" className="text-light-black hover:text-red-500 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                id={`phone-${index}`}
                type="tel"
                placeholder="(213) 555-1234"
                value={row.number}
                onChange={(event) => update(index, { number: formatPhoneNumber(event.target.value), status: undefined })}
                className="min-w-0 flex-1 px-3.5 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder-light-black"
              />
              <select
                aria-label={`Type of number ${index + 1}`}
                value={row.label}
                onChange={(event) => update(index, { label: event.target.value })}
                className="w-[104px] shrink-0 px-2.5 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black"
              >
                {PHONE_LABELS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {row.status && !["not_called", "good"].includes(row.status) && (
              <p className="text-[11px] text-light-black">Marked &quot;{phoneStatusLabel(row.status)}&quot; after a call. Change it from the contact&apos;s details.</p>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={value.length >= MAX_CONTACT_PHONES}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Add number
      </button>
      {value.length >= MAX_CONTACT_PHONES && <p className="text-[11px] text-light-black">Maximum {MAX_CONTACT_PHONES} phone numbers</p>}
    </fieldset>
  );
}
