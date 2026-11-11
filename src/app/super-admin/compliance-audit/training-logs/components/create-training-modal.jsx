"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Trash2, FileText, FileCode, Video, Award } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";
import { CERTIFICATE_VALIDITY, TRAINING_REQUIREMENTS } from "../training-options";

const label = "text-xs font-bold text-dark-black flex items-center gap-1 font-secondary";
const input = "w-full px-3.5 py-2.5 rounded-xl border border-light-gray bg-white text-sm text-dark-black placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

export function MaterialIcon({ format }) {
  if (format === "Doc") return <div className="w-9 h-9 rounded-xl bg-[#EFF8FF] text-[#175CD3] flex items-center justify-center shrink-0"><FileCode className="w-4 h-4" /></div>;
  if (format === "Video") return <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0"><Video className="w-4 h-4" /></div>;
  return <div className="w-9 h-9 rounded-xl bg-[#FEE4E2] text-[#D92D20] flex items-center justify-center shrink-0"><FileText className="w-4 h-4" /></div>;
}

// Create (training = null) or edit a Training built from Training Library materials
export default function CreateTrainingModal({ isOpen, onClose, onSaved, training = null }) {
  const [library, setLibrary] = useState(null);
  const [form, setForm] = useState(() => ({
    title: training?.title ?? "",
    categoryId: training?.categoryId ?? "",
    description: training?.description ?? "",
    minutes: training?.minutes ?? "",
    requirement: training?.requirement ?? "Required",
    issueCertificate: training?.issueCertificate ?? false,
    certificateValidity: training?.certificateValidity ?? "Does Not Expire",
    certificateMonths: training?.certificateMonths ?? "",
    materials: training?.materials ?? [],
  }));
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (!isOpen) return;
    apiRequest("/api/v1/compliance/training/materials")
      .then((data) => {
        setLibrary(data);
        setForm((current) => (current.categoryId ? current : { ...current, categoryId: data.categories[0]?.id ?? "" }));
      })
      .catch((error) => toast.error(error.message));
  }, [isOpen]);

  if (!isOpen) return null;

  const chosen = new Set(form.materials.map((material) => material.id));
  const term = search.trim().toLowerCase();
  const matches = (library?.results ?? []).filter((material) => !chosen.has(material.id) && (!term || `${material.title} ${material.category} ${material.format}`.toLowerCase().includes(term))).slice(0, 6);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return toast.error("Enter a Training title.");
    if (!form.materials.length) return toast.error("Add at least one material from the Training Library.");
    setSaving(true);
    try {
      const body = { ...form, materialIds: form.materials.map((material) => material.id), minutes: form.minutes === "" ? null : Number(form.minutes) };
      delete body.materials;
      await apiRequest(training ? `/api/v1/compliance/training/courses/${training.id}` : "/api/v1/compliance/training/courses", { method: training ? "PATCH" : "POST", body });
      toast.success(training ? "Training updated." : "Training created. Assign it from Bulk Assign Training.");
      onSaved?.();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-dark-black/45 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-training-title"
          className="w-full max-w-2xl bg-white rounded-3xl border border-light-gray shadow-2xl overflow-hidden my-auto"
        >
          <div className="p-6 sm:p-7 pb-5 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 id="create-training-title" className="text-xl sm:text-2xl font-bold text-dark-black font-secondary tracking-tight">{training ? "Edit Training" : "Create New Training"}</h2>
              <p className="text-xs sm:text-sm text-medium-black">Build a training course using materials from your Training Library.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded-xl hover:bg-light-gray text-medium-black cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={submit} className="flex flex-col">
            <div className="px-6 sm:px-7 pb-6 space-y-5 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="training-title" className={label}>Training Title <span className="text-red">*</span></label>
                  <input id="training-title" type="text" maxLength={255} value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="e.g. Data Privacy & Protection" className={input} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="training-category" className={label}>Category <span className="text-red">*</span></label>
                  <select id="training-category" value={form.categoryId} onChange={(event) => set("categoryId", event.target.value)} className={`${input} cursor-pointer`}>
                    {(library?.categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="training-description" className={label}>Description</label>
                <textarea id="training-description" rows={3} maxLength={2000} value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Enter description..." className={`${input} resize-none`} />
              </div>

              <div className="space-y-2">
                <span className={label}>Training Materials <span className="text-red">*</span></span>
                <div className="relative">
                  <Search className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search or select materials from library..." aria-label="Search the Training Library" className={`${input} pl-10`} />
                </div>
                {(search || !form.materials.length) && (
                  <div className="rounded-xl border border-light-gray divide-y divide-light-gray/60 max-h-48 overflow-y-auto">
                    {!library && <p className="p-3 text-xs text-light-black">Loading library...</p>}
                    {library && matches.length === 0 && <p className="p-3 text-xs text-light-black">{library.results.length ? "No other materials match." : "The Training Library is empty. Upload materials there first."}</p>}
                    {matches.map((material) => (
                      <button key={material.id} type="button" onClick={() => { set("materials", [...form.materials, { id: material.id, title: material.title, format: material.format }]); setSearch(""); }} className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-light-gray/40 cursor-pointer">
                        <MaterialIcon format={material.format} />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold text-dark-black truncate">{material.title}</span>
                          <span className="block text-[11px] text-light-black">{material.format} · {material.category}</span>
                        </span>
                        <Plus className="w-4 h-4 text-primary" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  {form.materials.map((material, index) => (
                    <div key={material.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-light-gray">
                      <span className="text-[11px] font-bold text-light-black w-4 text-center">{index + 1}</span>
                      <MaterialIcon format={material.format} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-dark-black truncate">{material.title}</span>
                        <span className="block text-[11px] text-light-black">{material.format}</span>
                      </span>
                      <button type="button" aria-label={`Remove ${material.title}`} onClick={() => set("materials", form.materials.filter((item) => item.id !== material.id))} className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="training-minutes" className={label}>Estimated Duration (minutes)</label>
                  <input id="training-minutes" type="number" min={1} max={2400} value={form.minutes} onChange={(event) => set("minutes", event.target.value)} placeholder="e.g. 40" className={input} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="training-requirement" className={label}>Requirement</label>
                  <select id="training-requirement" value={form.requirement} onChange={(event) => set("requirement", event.target.value)} className={`${input} cursor-pointer`}>
                    {TRAINING_REQUIREMENTS.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-light-gray p-4 space-y-3">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <span className="flex items-center gap-2 text-sm font-semibold text-dark-black"><Award className="w-4 h-4 text-primary" /> Issue certificate on completion</span>
                  <input type="checkbox" checked={form.issueCertificate} onChange={(event) => set("issueCertificate", event.target.checked)} className="w-4 h-4 accent-primary" />
                </label>
                {form.issueCertificate && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="certificate-validity" className={label}>Certificate Validity</label>
                      <select id="certificate-validity" value={form.certificateValidity} onChange={(event) => set("certificateValidity", event.target.value)} className={`${input} cursor-pointer`}>
                        {CERTIFICATE_VALIDITY.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </div>
                    {form.certificateValidity === "Custom" && (
                      <div className="space-y-1.5">
                        <label htmlFor="certificate-months" className={label}>Valid for (months)</label>
                        <input id="certificate-months" type="number" min={1} max={120} value={form.certificateMonths} onChange={(event) => set("certificateMonths", event.target.value)} className={input} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 sm:px-7 py-4 border-t border-light-gray flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-light-gray text-sm font-semibold text-dark-black hover:bg-light-gray/50 cursor-pointer">Cancel</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-primary hover:bg-[#0c9593] text-white text-sm font-semibold cursor-pointer disabled:opacity-50">{saving ? "Saving..." : training ? "Save Training" : "Create Training"}</button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
