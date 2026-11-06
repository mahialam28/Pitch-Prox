"use client";

import React, { useState } from "react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { showError } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";
import { apiRequest } from "@/lib/client-api";

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-dark-black outline-none focus:border-primary";

// New template, edit one of yours, or save a copy of any template (copyOf).
// Mounted only while open. Placeholders like {First Name} and {Your Name} are kept as written.
export default function TemplateFormModal({ template = null, copyOf = null, categories = [], canShare = false, onClose, onSaved }) {
  const source = template ?? copyOf;
  const [title, setTitle] = useState(template ? template.title : copyOf ? `${copyOf.title} (copy)` : "");
  const [category, setCategory] = useState(source?.category && categories.includes(source.category) ? source.category : categories[0] ?? "Other");
  const [subject, setSubject] = useState(source?.subject ?? "");
  const [body, setBody] = useState(source?.body ?? "Hi {First Name},\n\n\n\nBest regards,\n{Your Name}");
  const [shared, setShared] = useState(template?.scope === "team");
  const [saving, setSaving] = useState(false);
  const valid = title.trim() && subject.trim() && body.trim();

  const save = async () => {
    setSaving(true);
    try {
      const payload = { title, category, subject, body, ...(canShare && { scope: shared ? "team" : "personal" }) };
      const result = template
        ? await apiRequest(`/api/v1/mail/templates/${template.id}`, { method: "PATCH", body: payload })
        : await apiRequest("/api/v1/mail/templates", { method: "POST", body: payload });
      showSavedToast(template ? "Template saved" : "Template created", shared ? "Everyone on the team can use it." : "Only you can see it.");
      onSaved?.(result.template);
      onClose();
    } catch (error) {
      showError("Template not saved", error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title={template ? "Edit Template" : copyOf ? "Save a Copy" : "New Template"}
      subtitle="Use {First Name}, {Company} and {Your Name} as placeholders."
      size="lg"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={save} disabled={!valid || saving}>{saving ? "Saving…" : "Save Template"}</DialogButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-xs font-medium text-medium-black">
            Template name
            <input className={inputClass} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-medium text-medium-black">
            Category
            <select className={`${inputClass} cursor-pointer`} value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-medium-black">
          Subject
          <input className={inputClass} maxLength={255} value={subject} onChange={(event) => setSubject(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-medium-black">
          Message
          <textarea className={`${inputClass} resize-y min-h-[220px]`} maxLength={20000} value={body} onChange={(event) => setBody(event.target.value)} />
        </label>
        {canShare && (
          <label className="flex items-center gap-2.5 text-sm text-dark-black cursor-pointer select-none">
            <input type="checkbox" checked={shared} onChange={(event) => setShared(event.target.checked)} className="w-4 h-4 accent-primary" />
            Share with the whole team
          </label>
        )}
      </div>
    </DialogModal>
  );
}
