"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, ChevronDown, FileCheck, Check, Info } from "lucide-react";
import DatePicker from "@/components/modals/date-picker";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";
import { POLICY_FILE_MAX_BYTES, POLICY_TOPICS, normalizeVersion } from "@/lib/compliance/policy-catalog";

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium";

// Starting values: empty for a new policy; for an edit, the version being prepared (if any) or the one in force
function initialForm(policy) {
  if (!policy) return { name: "", category: POLICY_TOPICS[0], version: "v1.0", effectiveDate: "", nextReviewDate: "", description: "", ownerId: "", requireAcknowledgment: true, changeNote: "", file: null };
  const pending = policy.pendingVersion ? policy.versions?.find((version) => version.id === policy.pendingVersion.id) : null;
  const source = pending ?? policy;
  return {
    name: pending?.title ?? policy.name,
    category: pending?.topic ?? policy.category,
    version: pending ? pending.versionLabel : policy.version,
    effectiveDate: source.effectiveDate ?? "",
    nextReviewDate: source.nextReviewDate ?? "",
    description: (pending ? pending.description : policy.description) ?? "",
    ownerId: policy.owner?.id ?? "",
    requireAcknowledgment: pending ? pending.required : policy.requireAcknowledgment,
    changeNote: pending?.changeNote ?? "",
    file: null,
  };
}

// Upload Document (policy = null) and Edit Document (policy = the detail record).
// onSaved(result) receives the API response ({ policy, ... }).
export default function UploadDocumentModal({ isOpen, onClose, onSaved, policy = null, owners = [] }) {
  const [formData, setFormData] = useState(() => initialForm(policy));
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const set = (key, value) => setFormData((current) => ({ ...current, [key]: value }));

  if (!isOpen) return null;

  const editing = Boolean(policy);
  const approved = policy?.statusKey === "published";
  const preparing = Boolean(policy?.pendingVersion);
  // On an approved policy with nothing in preparation, a new number or file starts a new version
  const startsNewVersion = approved && !preparing && (normalizeVersion(formData.version) !== normalizeVersion(policy.version) || Boolean(formData.file));
  const detailsOnly = approved && !preparing && !startsNewVersion;

  const pickFile = (file) => {
    if (!file) return;
    if (!/\.(pdf|docx?)$/i.test(file.name)) return toast.error("Upload a PDF or Word document.");
    if (file.size > POLICY_FILE_MAX_BYTES) return toast.error("Files must be 20 MB or smaller.");
    setFormData((current) => ({ ...current, file, name: current.name || file.name.replace(/\.[^/.]+$/, "") }));
  };

  const save = async (action) => {
    if (!formData.name.trim()) return toast.error("Enter a document name.");
    if (!normalizeVersion(formData.version)) return toast.error("Enter a version number like v1.0.");
    const body = new FormData();
    for (const key of ["name", "category", "version", "effectiveDate", "nextReviewDate", "description", "ownerId", "changeNote"]) body.append(key, formData[key] ?? "");
    body.append("requireAcknowledgment", formData.requireAcknowledgment ? "true" : "false");
    if (action) body.append("action", action);
    if (formData.file) body.append("file", formData.file);
    setIsSubmitting(true);
    try {
      const result = await apiRequest(editing ? `/api/v1/compliance/policies/${policy.id}` : "/api/v1/compliance/policies", { method: editing ? "PATCH" : "POST", body });
      toast.success(action === "submit" ? "Sent to a Super Admin for approval." : action === "draft" ? "Draft saved." : "Policy details saved.");
      onSaved?.(result);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
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
          aria-labelledby="policy-form-title"
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          <div className="p-5 sm:p-6 pb-4 border-b border-light-gray flex items-center justify-between">
            <div>
              <h3 id="policy-form-title" className="text-lg font-bold text-dark-black/85 font-secondary">{editing ? "Edit Policy Document" : "Upload Document"}</h3>
              {editing && <p className="text-xs text-light-black mt-0.5">{preparing ? `Editing ${policy.pendingVersion.version} (${policy.pendingVersion.statusLabel.toLowerCase()}).` : approved ? `${policy.version} is in force.` : "This policy hasn't been approved yet."}</p>}
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-lg text-light-black hover:text-dark-black/80 hover:bg-light-gray/70 flex items-center justify-center transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); save(detailsOnly ? undefined : "submit"); }} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
            {approved && !preparing && (
              <div className="flex gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-dark-black/80">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  {startsNewVersion
                    ? `This creates ${normalizeVersion(formData.version) ? `v${normalizeVersion(formData.version)}` : "a new version"} for approval. ${policy.version} stays in force until a Super Admin approves it, then employees are asked to acknowledge the new version.`
                    : "Change the version number or upload a new file to start a new version. Otherwise only the details below are updated."}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="policy-name" className="font-semibold text-dark-black/80 block">Document Name <span className="text-red">*</span></label>
              <input id="policy-name" type="text" required maxLength={255} value={formData.name} onChange={(event) => set("name", event.target.value)} placeholder="e.g. Information Security Policy" className={inputClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 relative">
                <span className="font-semibold text-dark-black/80 block">Category <span className="text-red">*</span></span>
                <button type="button" onClick={() => setIsCategoryOpen(!isCategoryOpen)} aria-expanded={isCategoryOpen} className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black/80 bg-white flex items-center justify-between hover:border-primary/50 transition-all font-medium cursor-pointer">
                  <span>{formData.category}</span>
                  <ChevronDown className="w-4 h-4 text-light-black" />
                </button>
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-light-gray rounded-xl shadow-lg py-1 z-20 max-h-48 overflow-y-auto">
                    {POLICY_TOPICS.map((topic) => (
                      <button key={topic} type="button" onClick={() => { set("category", topic); setIsCategoryOpen(false); }} className={`w-full px-3 py-2 text-left text-xs hover:bg-light-gray/60 font-medium transition-colors cursor-pointer ${formData.category === topic ? "text-primary" : "text-dark-black/80"}`}>
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="policy-version" className="font-semibold text-dark-black/80 block">Version <span className="text-red">*</span></label>
                <input id="policy-version" type="text" required value={formData.version} onChange={(event) => set("version", event.target.value)} placeholder="e.g. v1.0" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="font-semibold text-dark-black/80 block">Effective Date <span className="text-red">*</span></span>
                {detailsOnly ? (
                  <div className={`${inputClass} bg-light-gray/30 text-light-black`}>{formData.effectiveDate || "—"}</div>
                ) : (
                  <DatePicker value={formData.effectiveDate} onChange={(value) => set("effectiveDate", value)} placeholder="Select effective date" placement="top" />
                )}
              </div>
              <div className="space-y-1.5">
                <span className="font-semibold text-dark-black/80 block">Next Review Date <span className="text-red">*</span></span>
                <DatePicker value={formData.nextReviewDate} onChange={(value) => set("nextReviewDate", value)} placeholder="Select review date" placement="top" />
              </div>
            </div>

            {owners.length > 0 && (
              <div className="space-y-1.5">
                <label htmlFor="policy-owner" className="font-semibold text-dark-black/80 block">Policy Owner</label>
                <select id="policy-owner" value={formData.ownerId} onChange={(event) => set("ownerId", event.target.value)} className={`${inputClass} cursor-pointer`}>
                  <option value="">{editing ? "Keep the current owner" : "Me"}</option>
                  {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="policy-description" className="font-semibold text-dark-black/80 block">Description / Purpose</label>
              <textarea id="policy-description" rows={3} maxLength={500} value={formData.description} onChange={(event) => set("description", event.target.value)} placeholder="Brief summary of policy requirements and scope..." className={`${inputClass} resize-none`} />
            </div>

            {editing && !detailsOnly && (
              <div className="space-y-1.5">
                <label htmlFor="policy-change-note" className="font-semibold text-dark-black/80 block">What changed in this version</label>
                <input id="policy-change-note" type="text" maxLength={500} value={formData.changeNote} onChange={(event) => set("changeNote", event.target.value)} placeholder="e.g. Annual review; added MFA requirement" className={inputClass} />
              </div>
            )}

            <div className="space-y-1.5">
              <span className="font-semibold text-dark-black/80 block">{editing ? "Upload New File (PDF or DOCX)" : "Upload File (PDF or DOCX)"}</span>
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && fileInputRef.current?.click()}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => { event.preventDefault(); setIsDragging(false); pickFile(event.dataTransfer.files?.[0]); }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all group ${isDragging ? "border-primary bg-primary/5" : "border-light-gray hover:border-primary/60 bg-light-gray/20 hover:bg-primary/5"}`}
              >
                <input type="file" ref={fileInputRef} onChange={(event) => pickFile(event.target.files?.[0])} accept=".pdf,.docx,.doc" className="hidden" />
                {formData.file ? (
                  <div className="flex items-center justify-center gap-2 text-primary font-medium">
                    <FileCheck className="w-5 h-5" />
                    <span>{formData.file.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-light-black group-hover:text-dark-black/80">
                    <div className="w-10 h-10 rounded-xl bg-white border border-light-gray flex items-center justify-center shadow-xs">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div><span className="font-semibold text-dark-black/80">Click to upload</span> or drag and drop</div>
                    <span className="text-[11px] text-light-black">PDF, DOCX up to 20MB{editing && policy.file ? ` · current file: ${policy.file.name}` : ""}</span>
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={() => set("requireAcknowledgment", !formData.requireAcknowledgment)} aria-pressed={formData.requireAcknowledgment} className="flex items-center gap-3 pt-1 cursor-pointer select-none group text-left">
              <span className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${formData.requireAcknowledgment ? "bg-primary border-primary text-white" : "border-[#D1D5DB] bg-white group-hover:border-primary/60"}`}>
                {formData.requireAcknowledgment && <Check className="w-3 h-3 stroke-[3]" />}
              </span>
              <span className="text-xs font-semibold text-dark-black/85">Require employee acknowledgment upon publishing</span>
            </button>

            <div className="pt-4 border-t border-light-gray flex flex-wrap items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-dark-black/70 hover:bg-light-gray rounded-xl transition-colors cursor-pointer">Cancel</button>
              {detailsOnly ? (
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-[#0c9593] rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              ) : (
                <>
                  <button type="button" disabled={isSubmitting} onClick={() => save("draft")} className="px-4 py-2 text-xs font-semibold text-primary border border-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer disabled:opacity-50">Save as Draft</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-[#0c9593] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50">
                    <Upload className="w-4 h-4" />
                    {isSubmitting ? "Saving..." : "Submit for Approval"}
                  </button>
                </>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
