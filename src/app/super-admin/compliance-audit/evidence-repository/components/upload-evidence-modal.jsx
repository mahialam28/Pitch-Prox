"use client";

import React, { useRef, useState } from "react";
import { Upload, FileCheck } from "lucide-react";
import toast from "react-hot-toast";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { apiRequest } from "@/lib/client-api";
import { EVIDENCE_FILE_MAX_BYTES, EVIDENCE_FILE_TYPES } from "@/lib/compliance/evidence-catalog";
import EvidenceFields, { evidenceFieldsError } from "./evidence-fields";

const input = "w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-xs";

// Upload Evidence (evidence = null) or Edit Evidence (a Draft / Needs Changes item).
// "Upload" sends it for review; "Save as Draft" keeps it as a draft. onSaved gets the API result.
export default function UploadEvidenceModal({ isOpen, onClose, onSaved, evidence = null, controls = [], owners = [] }) {
  const [form, setForm] = useState(() => ({
    name: evidence?.name ?? "",
    description: evidence?.description ?? "",
    period: evidence?.period ?? "",
    controls: evidence?.controls ?? [],
    criteria: evidence?.criteria ?? [],
    ownerId: evidence?.owner?.id ?? "",
    expires: evidence?.expiresOn ? "on" : "never",
    expiryDate: evidence?.expiresOn ?? "",
    file: null,
  }));
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  if (!isOpen) return null;
  const set = (changes) => setForm((current) => ({ ...current, ...changes }));

  const pickFile = (file) => {
    if (!file) return;
    if (file.size > EVIDENCE_FILE_MAX_BYTES) return toast.error("Files must be 25 MB or smaller.");
    set({ file, name: form.name || file.name.replace(/\.[^/.]+$/, "") });
  };

  const save = async (action) => {
    if (!form.name.trim()) return toast.error("Enter an evidence name.");
    const problem = evidenceFieldsError(form);
    if (problem) return toast.error(problem);
    setSaving(true);
    try {
      let result;
      const fields = { name: form.name, description: form.description, period: form.period, criteria: form.criteria, controls: form.controls, ownerId: form.ownerId, expires: form.expires, expiryDate: form.expiryDate };
      if (evidence) {
        result = await apiRequest(`/api/v1/compliance/evidence/${evidence.id}`, { method: "PATCH", body: fields });
        if (action === "submit") result = await apiRequest(`/api/v1/compliance/evidence/${evidence.id}/actions`, { method: "POST", body: { action: "submit" } });
      } else {
        if (action === "submit" && !form.file) throw new Error("Attach the evidence file, or save it as a draft.");
        const body = new FormData();
        for (const [key, value] of Object.entries(fields)) body.append(key, Array.isArray(value) ? JSON.stringify(value) : value ?? "");
        body.append("action", action);
        if (form.file) body.append("file", form.file);
        result = await apiRequest("/api/v1/compliance/evidence", { method: "POST", body });
      }
      toast.success(action === "submit" ? "Sent for review." : "Saved.");
      onSaved?.(result);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title={evidence ? `Edit ${evidence.reference}` : "Upload Evidence"}
      subtitle={evidence ? "Change the details, then resubmit it for review." : "Upload sends it for review; Save as Draft keeps it to finish later."}
      size="lg"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton disabled={saving} onClick={() => save("draft")}>{evidence ? "Save" : "Save as Draft"}</DialogButton>
          <DialogButton variant="primary" disabled={saving} onClick={() => save("submit")}>{saving ? "Saving..." : evidence ? "Save & Resubmit" : "Upload"}</DialogButton>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label htmlFor="evidence-name" className="font-semibold text-dark-black/80 block">Evidence Name <span className="text-red-500">*</span></label>
          <input id="evidence-name" maxLength={255} value={form.name} onChange={(event) => set({ name: event.target.value })} placeholder="e.g. Access Review - Q4 2026" className={input} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="evidence-description" className="font-semibold text-dark-black/80 block">Description / Supporting Notes</label>
          <textarea id="evidence-description" rows={3} maxLength={5000} value={form.description} onChange={(event) => set({ description: event.target.value })} placeholder="What this evidence shows and how it was produced" className={`${input} resize-none`} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="evidence-period" className="font-semibold text-dark-black/80 block">Evidence Period</label>
          <input id="evidence-period" maxLength={80} value={form.period} onChange={(event) => set({ period: event.target.value })} placeholder="e.g. Q4 2026" className={input} />
        </div>
        <EvidenceFields value={form} onChange={(value) => setForm(value)} controls={controls} owners={owners} />
        {!evidence && (
          <div className="space-y-1.5">
            <span className="font-semibold text-dark-black/80 block">File</span>
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-light-gray hover:border-primary/60 rounded-2xl p-5 text-center cursor-pointer bg-light-gray/20 hover:bg-primary/5">
              {form.file ? (
                <span className="flex items-center justify-center gap-2 text-primary font-medium"><FileCheck className="w-5 h-5" /> {form.file.name}</span>
              ) : (
                <span className="flex flex-col items-center gap-1 text-light-black"><Upload className="w-5 h-5 text-primary" /><span><span className="font-semibold text-dark-black/80">Click to upload</span> PDF, spreadsheet, image or document (up to 25 MB)</span></span>
              )}
            </button>
            <input ref={fileRef} type="file" accept={EVIDENCE_FILE_TYPES.map((extension) => `.${extension}`).join(",")} className="hidden" onChange={(event) => pickFile(event.target.files?.[0])} />
          </div>
        )}
      </div>
    </DialogModal>
  );
}
