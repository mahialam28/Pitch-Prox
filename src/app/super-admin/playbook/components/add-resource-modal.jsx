"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Phone,
  ShieldCheck,
  Mail,
  BookOpen,
  Sparkles,
  Upload,
  Layers,
  Pin,
  Paperclip,
  Loader2,
} from "lucide-react";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import { showError } from "@/lib/alerts";
import { uploadBuilderFile } from "../builder-files";
import { FOLLOW_UP_KINDS, TEMPLATE_PLACEHOLDERS, TEMPLATE_PURPOSES } from "@/utils.js/follow-up";

const PURPOSE_ITEMS = TEMPLATE_PURPOSES.map((value) => ({ value, label: value }));
const KIND_ITEMS = FOLLOW_UP_KINDS.map((kind) => ({ value: kind.value, label: kind.value }));

export const RESOURCE_TYPES = [
  { value: "Script", label: "Script" },
  { value: "Call Openers", label: "Call Openers" },
  { value: "Email Template", label: "Email Template" },
  { value: "Objection Script", label: "Objection Script" },
  { value: "Follow Up", label: "Follow Up" },
  { value: "Guide", label: "Guide" },
  { value: "Other", label: "Other" },
];

// How each kind of resource is used (shown under the type picker)
export const RESOURCE_TYPE_HINTS = {
  "Email Template": "How the follow-up email is written. After the call, \"Send an email\" turns it into an editable draft in Mail. Never shown on the teleprompter; buyers can use it but not edit it.",
  "Follow Up": "How this playbook wants follow-up handled. Used after the call, not as a live prompt.",
};

// "Nov 8, 2026"
export const formatResourceDate = (value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const RESOURCE_ICONS = [
  { id: "rose", color: "text-rose-500 bg-rose-50 border-rose-200" },
  { id: "sky", color: "text-sky-500 bg-sky-50 border-sky-200" },
  { id: "emerald", color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
  { id: "amber", color: "text-amber-500 bg-amber-50 border-amber-200" },
  { id: "purple", color: "text-purple-500 bg-purple-50 border-purple-200" },
  { id: "teal", color: "text-teal-500 bg-teal-50 border-teal-200" },
];

// Render it only while open, with a key per resource: its fields start from the resource.
// onSave(resource, { pin, updateLibrary }); currentUserName stamps new resources.
const AddResourceModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  editResource = null,
  initialType = "Script",
  currentUserName = "",
}) => {
  const isEditing = Boolean(editResource);
  const isPinned = Boolean(editResource?.libraryId);

  const [name, setName] = useState(editResource?.name || "");
  const [type, setType] = useState(editResource?.type || initialType || "Script");
  const [description, setDescription] = useState(editResource?.description || "");
  const [content, setContent] = useState(editResource?.content || "");
  const [purpose, setPurpose] = useState(editResource?.purpose || TEMPLATE_PURPOSES[0]);
  const [subject, setSubject] = useState(editResource?.subject || "");
  const [followUpKind, setFollowUpKind] = useState(editResource?.followUpKind || FOLLOW_UP_KINDS[0].value);
  const [templatePurpose, setTemplatePurpose] = useState(editResource?.templatePurpose || FOLLOW_UP_KINDS[0].template);
  const [selectedColor, setSelectedColor] = useState(editResource?.iconColor || "emerald");
  const [file, setFile] = useState(editResource?.file || null);
  const [uploading, setUploading] = useState(false);
  const [pin, setPin] = useState(false);
  const [updateLibrary, setUpdateLibrary] = useState(false);
  const addedBy = editResource?.addedBy || currentUserName || "You";

  if (!isOpen) return null;

  const handleFile = async (event) => {
    const chosen = event.target.files?.[0];
    event.target.value = "";
    if (!chosen) return;
    setUploading(true);
    try {
      const saved = await uploadBuilderFile(chosen, "resource");
      setFile(saved);
      if (!name.trim()) setName(chosen.name.replace(/\.[^.]+$/, ""));
    } catch (error) {
      showError("Upload failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || uploading) return;

    const resourceData = {
      ...(editResource ? { id: editResource.id, libraryId: editResource.libraryId } : {}),
      name: name.trim(),
      type,
      description: description.trim(),
      content: content.trim(),
      file,
      ...(type === "Email Template" && { purpose, subject: subject.trim() }),
      ...(type === "Follow Up" && { followUpKind, templatePurpose }),
      addedBy,
      addedDate: editResource?.addedDate || formatResourceDate(Date.now()),
      iconColor: selectedColor,
    };

    onSave(resourceData, { pin: !isPinned && pin, updateLibrary: isPinned && updateLibrary });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white rounded-2xl border border-light-gray shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dark-black/80 font-secondary">
                  {isEditing ? "Edit Resource" : "Add New Resource"}
                </h3>
                <p className="text-[11px] text-light-black font-normal mt-0.5">
                  Create or update script materials and coaching documents.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-light-black hover:text-dark-black p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Resource Name */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                Resource Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Call Flow Overview, Objection Response Script"
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
                autoFocus
              />
            </div>

            {/* Type & Added By Dropdown/Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-medium-black mb-1.5">
                  Resource Type
                </label>
                <SettingsDropdown
                  label="Select Type"
                  items={RESOURCE_TYPES}
                  selected={type}
                  onSelect={(val) => setType(val)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-medium-black mb-1.5">
                  Added By
                </label>
                <div className="w-full px-3.5 py-2 rounded-xl border border-light-gray bg-light-gray/40 text-xs sm:text-sm text-dark-black/70">
                  {addedBy}
                </div>
              </div>
            </div>
            {RESOURCE_TYPE_HINTS[type] && (
              <p className="-mt-2 text-[11px] text-light-black">{RESOURCE_TYPE_HINTS[type]}</p>
            )}

            {type === "Email Template" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-medium-black mb-1.5">Template Purpose</label>
                  <SettingsDropdown label="Select Purpose" items={PURPOSE_ITEMS} selected={purpose} onSelect={setPurpose} className="w-full" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-medium-black mb-1.5">Email Subject</label>
                  <input
                    type="text"
                    value={subject}
                    maxLength={200}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Confirming our appointment on {Appointment Date}"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
                  />
                </div>
              </div>
            )}

            {type === "Follow Up" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-medium-black mb-1.5">Follow-Up Kind</label>
                  <SettingsDropdown
                    label="Select Kind"
                    items={KIND_ITEMS}
                    selected={followUpKind}
                    onSelect={(value) => {
                      setFollowUpKind(value);
                      setTemplatePurpose(FOLLOW_UP_KINDS.find((kind) => kind.value === value)?.template || templatePurpose);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-medium-black mb-1.5">Uses Email Template</label>
                  <SettingsDropdown label="Select Template" items={PURPOSE_ITEMS} selected={templatePurpose} onSelect={setTemplatePurpose} className="w-full" />
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                Short Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Complete call structure with key talking points and transitions"
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
              />
            </div>

            {/* Script / Content Body */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                {type === "Email Template" ? "Email Body" : type === "Follow Up" ? "Follow-Up Guidance" : "Script / Guide Content"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Paste talking points, full script content, or key guidelines here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black resize-none"
              />
              {type === "Email Template" && (
                <p className="mt-1.5 text-[11px] text-light-black leading-relaxed">
                  Placeholders: {TEMPLATE_PLACEHOLDERS.map((item) => `{${item.key}}`).join(" ")}. Each is filled only with a real fact; a line whose
                  placeholder has no value is left out of the draft. Files aren&apos;t attached automatically.
                </p>
              )}
            </div>

            {/* Attached file */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-1.5">
                Attached File <span className="text-light-black font-normal">(optional: PDF, Word, PowerPoint, audio…)</span>
              </label>
              {file ? (
                <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border border-light-gray text-xs">
                  <a href={file.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 min-w-0 text-dark-black/80 hover:text-primary">
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-light-black shrink-0">{file.size}</span>
                  </a>
                  <button type="button" onClick={() => setFile(null)} className="text-light-black hover:text-rose-500 cursor-pointer" title="Remove file">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-light-black/30 text-xs text-medium-black hover:border-primary hover:text-primary cursor-pointer ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploading ? "Uploading…" : "Upload a file"}</span>
                  <input type="file" className="hidden" onChange={handleFile} accept=".pdf,.docx,.doc,.txt,.pptx,.ppt,.xlsx,.csv,.png,.jpg,.jpeg,.mp3,.wav,.m4a,.mp4,.mov" />
                </label>
              )}
            </div>

            {/* Resource Library */}
            {isPinned ? (
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs cursor-pointer">
                <input type="checkbox" checked={updateLibrary} onChange={(e) => setUpdateLibrary(e.target.checked)} className="mt-0.5 accent-primary" />
                <span>
                  <span className="font-semibold text-dark-black/80 flex items-center gap-1"><Pin className="w-3 h-3 text-primary" /> Pinned in the Resource Library</span>
                  <span className="block text-light-black mt-0.5">Changes apply to this playbook. Tick to update the library copy too (playbooks that already imported it keep theirs).</span>
                </span>
              </label>
            ) : (
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-light-gray text-xs cursor-pointer">
                <input type="checkbox" checked={pin} onChange={(e) => setPin(e.target.checked)} className="mt-0.5 accent-primary" />
                <span>
                  <span className="font-semibold text-dark-black/80 flex items-center gap-1"><Pin className="w-3 h-3 text-primary" /> Pin to Resource Library</span>
                  <span className="block text-light-black mt-0.5">Reuse it in other playbooks without re-uploading.</span>
                </span>
              </label>
            )}

            {/* Color Tag / Icon Accent */}
            <div>
              <label className="block text-xs font-medium text-medium-black mb-2">
                Icon Color Theme
              </label>
              <div className="grid grid-cols-6 gap-2">
                {RESOURCE_ICONS.map((opt) => {
                  const isSelected = selectedColor === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedColor(opt.id)}
                      className={`flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-2xs"
                          : "border-light-gray hover:border-light-black/30 bg-white"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${opt.color}`}>
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-gray">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || uploading}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                {isEditing ? "Save Changes" : "Add Resource"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddResourceModal;
