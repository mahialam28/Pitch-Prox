"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, X, FileText, ChevronDown, Check } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest, formatDate } from "@/lib/client-api";

// Staff portals: when a policy (or a new version of one) is approved after an employee's
// onboarding, they read and sign it here. Hidden when nothing is waiting.
export default function PolicyPrompt() {
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/me/policies")
      .then((result) => !cancelled && setData(result))
      .catch(() => { /* not available (e.g. design preview): stay hidden */ });
    return () => { cancelled = true; };
  }, []);

  const waiting = data?.results.filter((policy) => !policy.acknowledgedAt) ?? [];
  if (!waiting.length) return null;
  const overdue = waiting.filter((policy) => policy.overdue).length;

  const sign = async (policy) => {
    setBusy(policy.id);
    try {
      const result = await apiRequest(`/api/v1/me/policies/${policy.id}/acknowledge`, { method: "POST", body: { signature } });
      setData(result);
      setExpanded(null);
      toast.success(`${policy.title} acknowledged.`);
      if (!result.pending) setOpen(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <div className={`mb-6 rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${overdue ? "bg-rose-50/60 border-rose-200" : "bg-amber-50/60 border-amber-200"}`}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-light-gray flex items-center justify-center shrink-0">
            <ShieldCheck className={`w-5 h-5 ${overdue ? "text-rose-500" : "text-amber-600"}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-dark-black/85">
              {waiting.length} polic{waiting.length === 1 ? "y" : "ies"} to acknowledge{overdue ? ` (${overdue} overdue)` : ""}
            </p>
            <p className="text-xs text-medium-black">Read the updated company policies and sign them with your full name.</p>
          </div>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold cursor-pointer shrink-0">
          Review &amp; Sign
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs" onClick={() => setOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby="policy-prompt-title" className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden z-10 max-h-[90vh] flex flex-col">
            <div className="p-5 sm:p-6 pb-4 border-b border-light-gray flex items-center justify-between">
              <div>
                <h2 id="policy-prompt-title" className="text-lg font-bold text-dark-black/85 font-secondary">Policies to acknowledge</h2>
                <p className="text-xs text-light-black">Open each policy, read it, then type your full name to sign.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray/70 flex items-center justify-center cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-3 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label htmlFor="policy-signature" className="text-xs font-semibold text-dark-black/80 block">Your signature (full name)</label>
                <input
                  id="policy-signature"
                  type="text"
                  value={signature}
                  onChange={(event) => setSignature(event.target.value)}
                  placeholder="Type your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-sm text-dark-black/85 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {waiting.map((policy) => (
                <div key={policy.id} className="rounded-xl border border-light-gray">
                  <button
                    type="button"
                    onClick={() => setExpanded((current) => (current === policy.id ? null : policy.id))}
                    aria-expanded={expanded === policy.id}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-dark-black/85 truncate">{policy.title} <span className="font-medium text-light-black">{policy.version}</span></p>
                      <p className={`text-[11px] ${policy.overdue ? "text-rose-600 font-semibold" : "text-light-black"}`}>
                        {policy.category} · {policy.overdue ? "Overdue" : `Due ${formatDate(policy.dueAt)}`}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-light-black shrink-0 transition-transform ${expanded === policy.id ? "rotate-180" : ""}`} />
                  </button>
                  {expanded === policy.id && (
                    <div className="px-4 pb-4 space-y-3">
                      {policy.file && (
                        <a href={policy.file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-xl border border-light-gray hover:border-primary/50 text-xs font-semibold text-dark-black/80">
                          <FileText className="w-4 h-4 text-primary" /> Open {policy.file.name}
                        </a>
                      )}
                      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                        {policy.sections.map((section) => (
                          <div key={section.heading}>
                            <p className="text-xs font-bold text-dark-black/85">{section.heading}</p>
                            <p className="text-xs text-medium-black leading-relaxed whitespace-pre-line">{section.text}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={busy === policy.id || !signature.trim()}
                        onClick={() => sign(policy)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {busy === policy.id ? "Signing..." : "I have read and agree, sign"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
