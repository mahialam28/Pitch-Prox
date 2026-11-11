"use client";

import React, { useEffect, useState } from "react";
import { PhoneForwarded, PhoneOff } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { PHONE_STATUSES, nextCallablePhone } from "@/utils.js/phone-status";
import { contactPath, queueCall } from "@/utils.js/start-call";
import PhoneStatusBadge from "./phone-status-badge";

// After a call to a lead/prospect from the CRM or Leads (client, Nov 9):
//   - mark how THIS number went (Bad / Wrong / Disconnected / Fax…); the contact's other numbers stay callable
//   - "Call next number" dials the contact's next working number, nothing retyped.
// Calls set up by hand (no contact) show nothing. onCallNext() starts the queued call.
export default function CallNumberPanel({ setup = {}, onCallNext, tone = "light" }) {
  const { contactKind: kind, contactId, phoneId } = setup;
  const [contact, setContact] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the contact and stamp the number as called (once per call)
  useEffect(() => {
    if (!kind || !contactId) return undefined;
    let cancelled = false;
    const path = contactPath(kind, contactId);
    (async () => {
      try {
        if (phoneId) await apiRequest(`${path}/phones/${phoneId}`, { method: "PATCH", body: { called: true } });
        const result = await apiRequest(path);
        if (!cancelled) setContact(result.lead ?? result.prospect);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, contactId, phoneId]);

  if (!kind || !contactId) return null;
  const phones = contact?.phones ?? [];
  const current = phones.find((phone) => phone.id === phoneId) ?? null;
  const next = nextCallablePhone(phones, phoneId);
  const dark = tone === "dark";

  const mark = async (status) => {
    if (!current) return;
    setSaving(true);
    setError("");
    try {
      const result = await apiRequest(`${contactPath(kind, contactId)}/phones/${current.id}`, { method: "PATCH", body: { status } });
      setContact((value) => ({ ...value, phones: result.phones }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const callNext = () => {
    queueCall(contact, kind, next);
    onCallNext?.();
  };

  return (
    <section aria-label="This number" className={`rounded-2xl border p-5 ${dark ? "border-slate-800 bg-[#051824] text-slate-200" : "border-light-gray bg-white"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className={`text-sm font-bold ${dark ? "text-white" : "text-dark-black"}`}>How did this number go?</h3>
          <p className={`text-xs mt-0.5 ${dark ? "text-slate-400" : "text-light-black"}`}>
            {current ? (
              <>
                {current.number} · {current.label}. Only this number is marked; {contact?.name}&apos;s other numbers stay callable.
              </>
            ) : (
              "Loading the number…"
            )}
          </p>
        </div>
        {current && <PhoneStatusBadge status={current.status} />}
      </div>

      {current && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Number status">
          {PHONE_STATUSES.filter((option) => option.value !== "not_called").map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={saving}
              aria-pressed={current.status === option.value}
              onClick={() => mark(option.value)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer disabled:opacity-60 ${
                current.status === option.value
                  ? "border-primary bg-primary text-white"
                  : dark
                    ? "border-slate-700 text-slate-200 hover:border-primary/60"
                    : "border-light-gray text-medium-black hover:border-primary/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {error && <p role="alert" className="mt-3 text-xs text-red-500">{error}</p>}

      {contact && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {next ? (
            <button type="button" onClick={callNext} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-bold cursor-pointer">
              <PhoneForwarded className="h-4 w-4" />
              Call next number: {next.number} ({next.label})
            </button>
          ) : (
            <span className={`inline-flex items-center gap-2 text-xs ${dark ? "text-slate-400" : "text-light-black"}`}>
              <PhoneOff className="h-4 w-4" />
              {phones.some((phone) => phone.callable && phone.id !== phoneId) ? "" : "No other working numbers for this contact."}
            </span>
          )}
        </div>
      )}
    </section>
  );
}
