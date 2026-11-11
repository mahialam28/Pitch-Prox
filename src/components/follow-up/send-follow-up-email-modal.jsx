"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, X, Loader2, BookOpen } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
import { saveMailDraft } from "./mail-draft";

const usedKeys = (template) => new Set([...`${template?.subject ?? ""}\n${template?.body ?? ""}`.matchAll(/\{([^{}]{1,60})\}/g)].map((match) => match[1].trim()));

// After the call: pick a follow-up from the ACTIVE playbook, confirm the facts that were agreed,
// and open an editable draft in Mail. Nothing is sent from here.
// Render it only while open (conditional render with a key), so its fields start fresh.
// setup = { leadName, phoneNumber } from the call; facts = known call facts (e.g. a scheduled follow-up)
// callId: the call this follows (its contact and agreed facts are used); suggestedPurpose: the template the call report suggests
export default function SendFollowUpEmailModal({ onClose, setup = {}, mailPath, facts: knownFacts = {}, callId = null, suggestedPurpose = null }) {
  const router = useRouter();
  const [options, setOptions] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [followUpId, setFollowUpId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [facts, setFacts] = useState(knownFacts);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/follow-up")
      .then((result) => {
        if (cancelled) return;
        setOptions(result);
        setTemplateId((result.templates.find((item) => suggestedPurpose && item.purpose === suggestedPurpose) ?? result.templates[0])?.id ?? "");
      })
      .catch((requestError) => !cancelled && setLoadError(requestError.message));
    return () => {
      cancelled = true;
    };
  }, [suggestedPurpose]);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const templates = options ? options.templates : [];
  const followUps = options ? options.followUps : [];
  const allFacts = options ? options.facts : [];
  const template = templates.find((item) => item.id === templateId) ?? null;
  const followUp = followUps.find((item) => item.id === followUpId) ?? null;
  // Only ask for the facts the chosen template actually uses
  const keys = usedKeys(template);
  const factFields = allFacts.filter((fact) => fact.fills.some((key) => keys.has(key)));

  const chooseFollowUp = (id) => {
    setFollowUpId(id);
    const chosen = followUps.find((item) => item.id === id);
    const match = chosen?.templatePurpose && templates.find((item) => item.purpose === chosen.templatePurpose);
    if (match) setTemplateId(match.id);
  };

  const createDraft = async () => {
    if (!template) return;
    setCreating(true);
    setError("");
    try {
      const shared = Object.fromEntries(factFields.map((fact) => [fact.key, facts[fact.key] ?? ""]).filter(([, value]) => value));
      const draft = await apiRequest("/api/v1/follow-up/draft", {
        method: "POST",
        body: { templateId: template.id, leadName: setup.leadName, phoneNumber: setup.phoneNumber, ...(callId ? { callId } : {}), ...(setup.contactId ? { contactId: setup.contactId, contactKind: setup.contactKind } : {}), facts: shared, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      });
      saveMailDraft(draft);
      router.push(`${mailPath}?draft=follow-up`);
    } catch (draftError) {
      setError(draftError.message);
      setCreating(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="follow-up-email-title" className="w-full max-w-lg bg-white rounded-2xl border border-light-gray shadow-xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-light-gray">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 id="follow-up-email-title" className="text-sm font-bold text-dark-black/80 font-secondary">Send an email</h3>
              <p className="text-[11px] text-light-black mt-0.5">
                {setup.leadName ? `Follow-up for ${setup.leadName}. ` : ""}You&apos;ll review and send it from Mail.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-light-black hover:text-dark-black p-1 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {!options && !loadError && (
            <div className="flex items-center gap-2 text-xs text-light-black">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading your playbook&apos;s templates…
            </div>
          )}
          {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{loadError}</p>}

          {options && (
            <>
              <p className="flex items-center gap-1.5 text-[11px] text-light-black">
                <BookOpen className="w-3.5 h-3.5" /> From your active playbook: <span className="font-semibold text-dark-black/80">{options?.playbook?.title ?? "—"}</span>
              </p>

              {templates.length === 0 ? (
                <p className="rounded-xl border border-light-gray bg-light-gray/30 px-4 py-3 text-xs text-medium-black">
                  This playbook has no email templates. Switch to a playbook that includes them, or write the email yourself in Mail.
                </p>
              ) : (
                <>
                  {followUps.length > 0 && (
                    <div>
                      <label htmlFor="follow-up-kind" className="block text-xs font-medium text-medium-black mb-1.5">What did you agree?</label>
                      <select id="follow-up-kind" value={followUpId} onChange={(event) => chooseFollowUp(event.target.value)} className={inputClass}>
                        <option value="">Choose a follow-up (optional)</option>
                        {followUps.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      {followUp?.guidance && <p className="mt-1.5 text-[11px] text-light-black leading-relaxed">{followUp.guidance}</p>}
                    </div>
                  )}

                  <fieldset>
                    <legend className="block text-xs font-medium text-medium-black mb-1.5">Email template</legend>
                    <div className="space-y-2">
                      {templates.map((item) => (
                        <label key={item.id} className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 cursor-pointer ${item.id === templateId ? "border-primary bg-primary/5" : "border-light-gray hover:border-primary/40"}`}>
                          <input type="radio" name="follow-up-template" value={item.id} checked={item.id === templateId} onChange={() => setTemplateId(item.id)} className="mt-0.5 accent-primary" />
                          <span>
                            <span className="block text-xs font-semibold text-dark-black/80">{item.name}</span>
                            <span className="block text-[11px] text-light-black">{item.purpose && item.purpose !== item.name ? `${item.purpose} · ` : ""}Subject: {item.subject}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {factFields.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-medium-black">Confirm what was agreed (leave blank if it wasn&apos;t)</p>
                      {factFields.map((fact) => (
                        <div key={fact.key}>
                          <label htmlFor={`fact-${fact.key}`} className="block text-[11px] text-light-black mb-1">{fact.label}</label>
                          {fact.type === "select" ? (
                            <select id={`fact-${fact.key}`} value={facts[fact.key] ?? ""} onChange={(event) => setFacts({ ...facts, [fact.key]: event.target.value })} className={inputClass}>
                              <option value="">Not agreed</option>
                              {fact.options.map((option) => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <input id={`fact-${fact.key}`} type={fact.type} maxLength={300} value={facts[fact.key] ?? ""} onChange={(event) => setFacts({ ...facts, [fact.key]: event.target.value })} className={inputClass} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{error}</p>}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2.5 p-5 border-t border-light-gray">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray/40 cursor-pointer">
            Cancel
          </button>
          <button type="button" disabled={!template || creating} onClick={createDraft} className="px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-bold disabled:opacity-60 cursor-pointer inline-flex items-center gap-2">
            {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Open draft in Mail
          </button>
        </div>
      </div>
    </div>
  );
}
