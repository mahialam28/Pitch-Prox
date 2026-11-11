"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, FileText, MessageSquare, ShieldAlert, Folder, Sliders, ChevronRight, Check, AlertTriangle, XCircle, RefreshCw, Rocket, Lock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { VISIBILITIES, visibilityKey } from "@/lib/playbook-compile";

// Review & Publish (Spec 12 §6.12, §9): everything here comes from the saved draft. The checks run
// on the server; errors block publishing, warnings need a reviewer to confirm the intended behavior.
// Publishing freezes an immutable version (v1, v2…); later edits start a new draft.
// flush(): saves pending changes and returns { buildId, revision }.
export default function ReviewPublishSection({ formData = {}, onChange, onJumpToStep, flush, onPublished }) {
  const [check, setCheck] = useState(null);
  const [checking, setChecking] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(null);

  const runChecks = useCallback(async () => {
    setChecking(true);
    try {
      const { buildId } = await flush();
      if (!buildId) {
        setCheck({ ok: false, errors: [{ step: 1, section: "Basic Info", message: "Fill in the playbook details first." }], warnings: [], nextVersion: 1 });
        return;
      }
      const response = await fetch(`/api/v1/admin/playbook-builds/${buildId}/check`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checks didn't run.");
      setCheck(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setChecking(false);
    }
  }, [flush]);

  useEffect(() => {
    // Run once when the step opens (after the latest edits are saved)
    const timer = setTimeout(runChecks, 0);
    return () => clearTimeout(timer);
  }, [runChecks]);

  const publish = async () => {
    setPublishing(true);
    try {
      const { buildId, revision } = await flush();
      const response = await fetch(`/api/v1/admin/playbook-builds/${buildId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision, releaseNotes, acknowledgeWarnings: acknowledged }),
      });
      const data = await response.json();
      if (response.ok && data.ok) {
        setPublished(data);
        onPublished?.(data);
        toast.success(`Published v${data.version}.`);
      } else if (data.errors || data.warnings) {
        setCheck((current) => ({ ...current, ok: !data.errors?.length, errors: data.errors ?? [], warnings: data.warnings ?? [] }));
        toast.error(data.errors?.length ? "Fix the items marked below first." : "Confirm you reviewed the warnings.");
      } else {
        throw new Error(data.error || "Not published.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPublishing(false);
    }
  };

  const stages = formData.stages ?? [];
  const objections = formData.objections ?? [];
  const resources = formData.resources ?? [];
  const ai = formData.aiFramework ?? {};
  const visibility = visibilityKey(formData.visibility) ?? "marketplace";
  const errorsFor = (step) => check?.errors.filter((item) => item.step === step).length ?? 0;
  const warningsFor = (step) => check?.warnings.filter((item) => item.step === step).length ?? 0;

  const SUMMARY = [
    { step: 1, icon: BookOpen, title: "Basic Info", detail: `${formData.playbookName || "Untitled"} · ${(formData.leadTypes ?? []).length} lead type${(formData.leadTypes ?? []).length === 1 ? "" : "s"} · ${formData.accessType === "free" ? "Free" : `$${formData.price || "0.00"}`}` },
    { step: 2, icon: MessageSquare, title: "Style & Voice", detail: `${(formData.tones ?? []).join(", ") || "No tone"} · ${formData.communicationStyle ?? "—"} · ${(formData.voicePhrases ?? []).length} voice phrases` },
    { step: 3, icon: FileText, title: "Conversation Flow", detail: `${stages.length} stage${stages.length === 1 ? "" : "s"}: ${stages.map((stage) => stage.title).filter(Boolean).slice(0, 4).join(" → ")}${stages.length > 4 ? " …" : ""}` },
    { step: 4, icon: ShieldAlert, title: "Objection Handling", detail: `${objections.length} objection${objections.length === 1 ? "" : "s"}` },
    { step: 5, icon: Folder, title: "Resources & Scripts", detail: `${resources.length} resource${resources.length === 1 ? "" : "s"}` },
    { step: 6, icon: Sliders, title: "AI Prompt Framework", detail: `${(ai.logicRules ?? []).filter((rule) => rule.enabled !== false).length} active logic rules · ${(ai.prohibitedTerms ?? []).length} prohibited terms` },
  ];

  if (published) {
    return (
      <div className="bg-white rounded-2xl border border-light-gray p-8 shadow-sm text-center space-y-4 max-w-xl mx-auto">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
        <h2 className="text-xl font-bold text-dark-black font-secondary">{formData.playbookName} v{published.version} is published</h2>
        <p className="text-sm text-medium-black">
          This version is now fixed. Edits you make from here start a new draft and don&apos;t change it until you publish again.
          {` Visible to: ${VISIBILITIES[visibility]}.`}
        </p>
        <Link href="/super-admin/playbook" className="inline-block px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-medium-teal">Back to the Playbook Library</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      {/* Left: summary and checks */}
      <div className="xl:col-span-8 space-y-6">
        <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">Playbook Summary</h2>
              <p className="text-xs text-light-black">From the saved draft. Open a section to change it.</p>
            </div>
          </div>
          <div className="divide-y divide-light-gray/70">
            {SUMMARY.map((item) => {
              const errors = errorsFor(item.step);
              const warnings = warningsFor(item.step);
              return (
                <button key={item.step} type="button" onClick={() => onJumpToStep(item.step)} className="w-full py-3 flex items-center gap-3 text-left group cursor-pointer">
                  <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><item.icon className="w-4 h-4" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold text-dark-black group-hover:text-primary">{item.title}</span>
                    <span className="block text-xs text-light-black truncate">{item.detail}</span>
                  </span>
                  {errors > 0 && <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> {errors} to fix</span>}
                  {!errors && warnings > 0 && <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {warnings} to review</span>}
                  {check && !errors && !warnings && <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Ready</span>}
                  <ChevronRight className="w-4 h-4 text-light-black" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary">Publish Checks</h2>
              <p className="text-xs text-light-black">Required fields, allowed values, lengths, duplicates and contradictions (Spec 12 §9).</p>
            </div>
            <button type="button" onClick={runChecks} disabled={checking} className="px-3 py-2 rounded-xl border border-light-gray text-xs font-semibold flex items-center gap-1.5 hover:bg-light-gray/50 cursor-pointer disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} /> {checking ? "Checking..." : "Run checks again"}
            </button>
          </div>

          {!check && <p className="text-xs text-light-black">Running checks...</p>}
          {check && check.ok && !check.warnings.length && <p className="text-sm text-emerald-600 font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Everything checks out.</p>}

          {check?.errors.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-red-600">Must fix before publishing ({check.errors.length})</p>
              {check.errors.map((item, index) => (
                <div key={`e-${index}`} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-red-50/60 border border-red-100 text-xs">
                  <span className="flex items-start gap-2 text-dark-black"><XCircle className="w-4 h-4 text-red-500 shrink-0" /> {item.message}</span>
                  <button type="button" onClick={() => onJumpToStep(item.step)} className="text-primary font-semibold whitespace-nowrap cursor-pointer">Fix in {item.section}</button>
                </div>
              ))}
            </div>
          )}

          {check?.warnings.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-amber-700">Needs a reviewer&apos;s decision ({check.warnings.length})</p>
              {check.warnings.map((item, index) => (
                <div key={`w-${index}`} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs">
                  <span className="flex items-start gap-2 text-dark-black">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span><span className="font-semibold">{item.kind === "contradiction" ? "Contradiction: " : ""}</span>{item.message}</span>
                  </span>
                  <button type="button" onClick={() => onJumpToStep(item.step)} className="text-primary font-semibold whitespace-nowrap cursor-pointer">Open {item.section}</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: version and publish */}
      <div id="publish-card" className="xl:col-span-4 space-y-6">
        <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-dark-black font-secondary">Publish Playbook</h2>
          </div>
          <p className="text-xs text-medium-black flex items-start gap-1.5">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Publishes as <span className="font-semibold">v{check?.nextVersion ?? "…"}</span>. A published version never changes; later edits become a new draft.
            </span>
          </p>
          {check?.changedSections?.length > 0 && <p className="text-xs text-light-black">Changed since the version in force: {check.changedSections.join(", ")}.</p>}

          <div className="space-y-1.5">
            <label htmlFor="playbook-visibility" className="text-xs font-semibold text-dark-black block">Visibility</label>
            <select id="playbook-visibility" value={visibility} onChange={(event) => onChange("visibility", event.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-light-gray text-xs bg-white focus:outline-none focus:border-primary cursor-pointer">
              {Object.entries(VISIBILITIES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
            <p className="text-[11px] text-light-black">Who can see and use it. This doesn&apos;t change how the AI coaches.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="release-notes" className="text-xs font-semibold text-dark-black block">
              Release notes {check?.releaseNotesRequired ? <span className="text-red-500">*</span> : <span className="font-normal text-light-black">(optional for the first version)</span>}
            </label>
            <textarea id="release-notes" rows={3} maxLength={2000} value={releaseNotes} onChange={(event) => setReleaseNotes(event.target.value)} placeholder="What changed in the methodology, and how it affects live coaching" className="w-full px-3 py-2.5 rounded-xl border border-light-gray text-xs resize-none focus:outline-none focus:border-primary" />
          </div>

          {check?.warnings.length > 0 && (
            <label className="flex items-start gap-2 text-xs text-dark-black cursor-pointer">
              <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-0.5 accent-primary" />
              I reviewed the {check.warnings.length} warning{check.warnings.length === 1 ? "" : "s"} and confirm this is the intended behavior.
            </label>
          )}

          <button
            type="button"
            onClick={publish}
            disabled={publishing || checking || !check?.ok || (check.warnings.length > 0 && !acknowledged) || (check.releaseNotesRequired && releaseNotes.trim().length < 10)}
            className="w-full py-3 rounded-xl bg-primary hover:bg-medium-teal text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Rocket className="w-4 h-4" /> {publishing ? "Publishing..." : `Publish v${check?.nextVersion ?? ""}`}
          </button>
          {check && !check.ok && <p className="text-[11px] text-red-600 text-center">Fix the {check.errors.length} item{check.errors.length === 1 ? "" : "s"} on the left first.</p>}
        </div>
      </div>
    </div>
  );
}
