"use client";

import React, { useState } from "react";
import { Phone, PhoneOutgoing } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";
import { PHONE_STATUSES } from "@/utils.js/phone-status";
import { contactPath } from "@/utils.js/start-call";
import PhoneStatusBadge from "./phone-status-badge";

// The numbers of a lead/prospect in its details window: status of each, change it, call that number.
// onPhonesChange(phones) after a status change; onCall(phone) starts a call on that number.
export default function ContactPhonesPanel({ contact, kind, onPhonesChange, onCall }) {
  const [busy, setBusy] = useState(null);
  const phones = contact?.phones ?? [];

  const setStatus = async (phone, status) => {
    setBusy(phone.id);
    try {
      const result = await apiRequest(`${contactPath(kind, contact.id)}/phones/${phone.id}`, { method: "PATCH", body: { status } });
      onPhonesChange?.(result.phones);
    } catch (error) {
      showError("Number not updated", error.message);
    } finally {
      setBusy(null);
    }
  };

  if (!phones.length) {
    return (
      <div className="flex items-center gap-3 text-xs">
        <Phone className="h-4 w-4 text-light-black shrink-0" />
        <span className="text-light-black">No phone number yet</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-[10px] text-light-black">
        <Phone className="h-3.5 w-3.5" /> Phone numbers {phones.length > 1 ? `(${phones.filter((phone) => phone.callable).length} of ${phones.length} callable)` : ""}
      </p>
      <ul className="space-y-2">
        {phones.map((phone) => (
          <li key={phone.id} className="rounded-xl border border-light-gray px-3 py-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs">
                <span className={`font-semibold ${phone.callable ? "text-dark-black" : "text-light-black line-through"}`}>{phone.number}</span>
                <span className="ml-1.5 text-light-black">{phone.label}</span>
              </span>
              <PhoneStatusBadge status={phone.status} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                aria-label={`Status of ${phone.number}`}
                value={phone.status}
                disabled={busy === phone.id}
                onChange={(event) => setStatus(phone, event.target.value)}
                className="min-w-0 flex-1 px-2.5 py-1.5 text-xs bg-white border border-light-gray rounded-lg focus:outline-none focus:border-primary"
              >
                {PHONE_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {onCall && (
                <button
                  type="button"
                  onClick={() => onCall(phone)}
                  disabled={!phone.callable}
                  title={phone.callable ? `Call ${phone.number}` : "This number is marked as not callable"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-medium-teal cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PhoneOutgoing className="h-3.5 w-3.5" /> Call
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
