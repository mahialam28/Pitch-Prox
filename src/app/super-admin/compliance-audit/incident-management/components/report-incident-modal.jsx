"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileCheck, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";
import { INCIDENT_CATEGORIES, INCIDENT_FILE_TYPES, INCIDENT_SEVERITIES } from "@/lib/compliance/incident-catalog";

const label = "font-semibold text-dark-black/85 block";
const input = "w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium";

// Report New Incident. Status starts Open; Reported At and Reported By are set by the server.
export default function ReportIncidentModal({ isOpen, onClose, onSubmitSuccess, managers = [] }) {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", severity: "", date: "", time: "", description: "", affectedSystems: "", relatedTicket: "", assignedTo: "", file: null });
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    apiRequest("/api/v1/me").then((data) => setMe(data.user)).catch(() => setMe(null));
  }, []);

  if (!isOpen) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return toast.error("Enter an incident title.");
    if (!form.category) return toast.error("Choose a category.");
    if (!form.severity) return toast.error("Choose a severity.");
    if (!form.description.trim()) return toast.error("Describe what happened.");
    const body = new FormData();
    for (const key of ["title", "category", "severity", "description", "affectedSystems", "relatedTicket", "assignedTo"]) body.append(key, form[key]);
    if (form.date) body.append("occurredAt", new Date(`${form.date}T${form.time || "00:00"}`).toISOString());
    if (form.file) body.append("file", form.file);
    setSaving(true);
    try {
      const result = await apiRequest("/api/v1/compliance/incidents", { method: "POST", body });
      toast.success(`${result.incident.reference} reported. Status: Open.`);
      onSubmitSuccess?.(result);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-incident-title"
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          <div className="p-5 sm:p-6 pb-4 border-b border-light-gray flex items-center justify-between">
            <h3 id="report-incident-title" className="text-lg font-bold text-dark-black/85 font-secondary">Report New Incident</h3>
            <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray/70 flex items-center justify-center cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={submit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            <div className="space-y-1.5">
              <label htmlFor="incident-title" className={label}>Incident Title <span className="text-red">*</span></label>
              <input id="incident-title" maxLength={255} value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="e.g. Suspicious login attempts on admin accounts" className={input} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="incident-category" className={label}>Category <span className="text-red">*</span></label>
                <select id="incident-category" value={form.category} onChange={(event) => set("category", event.target.value)} className={`${input} cursor-pointer`}>
                  <option value="">Select category</option>
                  {INCIDENT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="incident-severity" className={label}>Severity <span className="text-red">*</span></label>
                <select id="incident-severity" value={form.severity} onChange={(event) => set("severity", event.target.value)} className={`${input} cursor-pointer`}>
                  <option value="">Select severity</option>
                  {INCIDENT_SEVERITIES.map((severity) => <option key={severity}>{severity}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className={label}>Incident Occurred At</span>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" aria-label="Date it occurred" max={new Date().toISOString().slice(0, 10)} value={form.date} onChange={(event) => set("date", event.target.value)} className={input} />
                <input type="time" aria-label="Time it occurred" value={form.time} onChange={(event) => set("time", event.target.value)} className={input} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className={label}>Reported By</span>
                <div className={`${input} bg-light-gray/30 text-light-black flex items-center gap-2`}><Lock className="w-3.5 h-3.5" /> {me?.name ?? "You"}</div>
              </div>
              <div className="space-y-1.5">
                <span className={label}>Reported At</span>
                <div className={`${input} bg-light-gray/30 text-light-black flex items-center gap-2`}><Lock className="w-3.5 h-3.5" /> Set when you submit</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="incident-description" className={label}>Description <span className="text-red">*</span></label>
              <textarea id="incident-description" rows={4} maxLength={5000} value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="What happened, who or what is affected, and how it was noticed..." className={`${input} resize-none`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="incident-systems" className={label}>Affected Systems</label>
                <input id="incident-systems" maxLength={255} value={form.affectedSystems} onChange={(event) => set("affectedSystems", event.target.value)} placeholder="e.g. Sign-in, Billing" className={input} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="incident-ticket" className={label}>Escalated Support Ticket</label>
                <input id="incident-ticket" value={form.relatedTicket} onChange={(event) => set("relatedTicket", event.target.value)} placeholder="e.g. TKT-1042" className={input} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="incident-owner" className={label}>Assign To</label>
              <select id="incident-owner" value={form.assignedTo} onChange={(event) => set("assignedTo", event.target.value)} className={`${input} cursor-pointer`}>
                <option value="">Unassigned (whoever starts the investigation owns it)</option>
                {managers.map((manager) => <option key={manager.id} value={manager.id}>{manager.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <span className={label}>Evidence (optional)</span>
              <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-light-gray hover:border-primary/60 rounded-2xl p-5 text-center cursor-pointer bg-light-gray/20 hover:bg-primary/5">
                {form.file ? (
                  <span className="flex items-center justify-center gap-2 text-primary font-medium"><FileCheck className="w-5 h-5" /> {form.file.name}</span>
                ) : (
                  <span className="flex flex-col items-center gap-1 text-light-black"><Upload className="w-5 h-5 text-primary" /><span><span className="font-semibold text-dark-black/80">Click to upload</span> logs, screenshots or documents (up to 20 MB)</span></span>
                )}
              </button>
              <input ref={fileRef} type="file" accept={INCIDENT_FILE_TYPES.map((extension) => `.${extension}`).join(",")} className="hidden" onChange={(event) => set("file", event.target.files?.[0] ?? null)} />
            </div>

            <div className="pt-4 border-t border-light-gray flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-dark-black/70 hover:bg-light-gray rounded-xl cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-[#0c9593] rounded-xl shadow-xs cursor-pointer disabled:opacity-50">{saving ? "Submitting..." : "Submit Incident"}</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
