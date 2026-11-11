"use client";

import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { apiRequest } from "@/lib/client-api";
import { MATERIAL_FILE_TYPES } from "@/lib/compliance/training-catalog";

const fileUrl = (material) => `/api/v1/compliance/training/materials/${material.id}/file`;

// Preview a library material: PDFs and uploaded videos play in the page; Word files and video
// links open from a link.
export function MaterialViewer({ material, onClose }) {
  if (!material) return null;
  const inline = `${fileUrl(material)}?inline=1`;
  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title={material.title}
      subtitle={`${material.format} · ${material.category}${material.file ? ` · ${material.file.size}` : ""}`}
      size="2xl"
      footer={
        <>
          {material.file && <a href={fileUrl(material)} className="px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-dark-black hover:bg-light-gray">Download</a>}
          <DialogButton onClick={onClose}>Close</DialogButton>
        </>
      }
    >
      {material.format === "PDF" && material.file && <iframe title={material.title} src={inline} className="w-full h-[60vh] rounded-xl border border-gray-200" />}
      {material.format === "Video" && material.file && (
        <video controls preload="metadata" src={inline} className="w-full max-h-[60vh] rounded-xl bg-black">
          <track kind="captions" />
        </video>
      )}
      {material.format === "Video" && !material.file && material.videoUrl && (
        <a href={material.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-4 rounded-xl border border-light-gray text-sm font-semibold text-primary hover:bg-primary/5">
          <ExternalLink className="w-4 h-4" /> Open the video ({new URL(material.videoUrl).hostname})
        </a>
      )}
      {material.format === "Doc" && (
        <p className="text-sm text-medium-black p-4 rounded-xl bg-light-gray/50">Word documents open after downloading. {material.description}</p>
      )}
      {material.description && material.format !== "Doc" && <p className="text-sm text-medium-black mt-3">{material.description}</p>}
    </DialogModal>
  );
}

const input = "w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-dark-black focus:outline-none focus:border-primary";
const ACCEPT = Object.values(MATERIAL_FILE_TYPES).flat().map((extension) => `.${extension}`).join(",");

// Upload Material: a PDF, Word document or video file, or a link to a video
export function UploadMaterialModal({ categories, onClose, onSaved }) {
  const [form, setForm] = useState({ title: "", description: "", categoryId: categories[0]?.id ?? "", minutes: "", videoUrl: "", file: null });
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!form.title.trim()) return toast.error("Enter a title.");
    if (!form.file && !form.videoUrl.trim()) return toast.error("Choose a file or add a video link.");
    const body = new FormData();
    for (const key of ["title", "description", "categoryId", "minutes", "videoUrl"]) body.append(key, form[key]);
    if (form.file) body.append("file", form.file);
    setSaving(true);
    try {
      await apiRequest("/api/v1/compliance/training/materials", { method: "POST", body });
      toast.success("Material added to the library.");
      onSaved();
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
      title="Upload Material"
      subtitle="PDF, Doc (Word) or Video. Up to 25 MB for documents and 300 MB for videos."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={save} disabled={saving}>{saving ? "Uploading..." : "Upload"}</DialogButton>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="material-title" className="block text-xs font-medium text-medium-black mb-1.5">Title</label>
          <input id="material-title" value={form.title} maxLength={255} onChange={(event) => set("title", event.target.value)} className={input} placeholder="e.g. Phishing Awareness Guide" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="material-category" className="block text-xs font-medium text-medium-black mb-1.5">Category</label>
            <select id="material-category" value={form.categoryId} onChange={(event) => set("categoryId", event.target.value)} className={`${input} cursor-pointer`}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="material-minutes" className="block text-xs font-medium text-medium-black mb-1.5">Duration (minutes, optional)</label>
            <input id="material-minutes" type="number" min={1} max={1440} value={form.minutes} onChange={(event) => set("minutes", event.target.value)} className={input} />
          </div>
        </div>
        <div>
          <label htmlFor="material-file" className="block text-xs font-medium text-medium-black mb-1.5">File</label>
          <input id="material-file" type="file" accept={ACCEPT} onChange={(event) => set("file", event.target.files?.[0] ?? null)} className="block w-full text-sm text-medium-black file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold" />
        </div>
        {!form.file && (
          <div>
            <label htmlFor="material-video" className="block text-xs font-medium text-medium-black mb-1.5">…or a video link</label>
            <input id="material-video" type="url" value={form.videoUrl} onChange={(event) => set("videoUrl", event.target.value)} className={input} placeholder="https://" />
          </div>
        )}
        <div>
          <label htmlFor="material-description" className="block text-xs font-medium text-medium-black mb-1.5">Description (optional)</label>
          <textarea id="material-description" rows={2} maxLength={500} value={form.description} onChange={(event) => set("description", event.target.value)} className={`${input} resize-none`} />
        </div>
      </div>
    </DialogModal>
  );
}
