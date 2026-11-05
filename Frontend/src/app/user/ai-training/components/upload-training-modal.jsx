"use client";

import React, { useRef, useState } from "react";
import { ChevronDown, FileText, Upload, X } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { TRAINING_CATEGORIES, TRAINING_FILE_TYPES, TRAINING_MAX_BYTES } from "@/utils.js/ai-training";

const EXTENSIONS = Object.values(TRAINING_FILE_TYPES).flat();
const ACCEPT = EXTENSIONS.map((extension) => `.${extension}`).join(",");
const MAX_MB = Math.round(TRAINING_MAX_BYTES / 1024 / 1024);

// POST one file with upload progress (fetch can't report it)
const uploadWithProgress = (form, onProgress) =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/v1/ai-training/assets");
    request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round((event.loaded / event.total) * 100));
    request.onload = () => {
      let data = {};
      try { data = JSON.parse(request.responseText); } catch { /* not JSON */ }
      if (request.status === 401) window.location.assign("/sign-in");
      if (request.status >= 200 && request.status < 300) resolve(data);
      else reject(new Error(data.error || "Upload failed. Please try again."));
    };
    request.onerror = () => reject(new Error("Network error. Check your connection and try again."));
    request.send(form);
  });

const checkFile = (file) => {
  const extension = file.name.split(".").pop().toLowerCase();
  if (!EXTENSIONS.includes(extension)) return "File type not supported";
  if (file.size > TRAINING_MAX_BYTES) return `Larger than ${MAX_MB} MB`;
  return null;
};

let nextId = 0;

// uploadFile(form, onProgress) defaults to the real API; design-only pages pass a local stand-in.
// onUploaded(count, results) gets each successful upload's response.
const UploadTrainingModal = ({ isOpen, onClose, initialCategory, onUploaded, uploadFile = uploadWithProgress }) => {
  const [category, setCategory] = useState(initialCategory || TRAINING_CATEGORIES[0].id);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  // Reset when reopened for another category card
  const [openedFor, setOpenedFor] = useState(null);
  if (isOpen && openedFor !== initialCategory) {
    setOpenedFor(initialCategory);
    setCategory(initialCategory || TRAINING_CATEGORIES[0].id);
    setFiles([]);
  }
  if (!isOpen && openedFor !== null) setOpenedFor(null);

  const addFiles = (list) => {
    const added = Array.from(list).map((file) => {
      const error = checkFile(file);
      return { id: ++nextId, file, progress: 0, state: error ? "error" : "queued", error };
    });
    setFiles((current) => [...current, ...added]);
  };

  const update = (id, changes) => setFiles((current) => current.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const close = () => {
    if (uploading) return;
    onClose();
  };

  const uploadAll = async () => {
    const queued = files.filter((item) => item.state === "queued");
    if (!queued.length) return;
    setUploading(true);
    const hadErrors = files.some((item) => item.state === "error");
    let succeeded = 0;
    let failed = 0;
    const results = [];
    for (const item of queued) {
      update(item.id, { state: "uploading", progress: 0 });
      const form = new FormData();
      form.append("category", category);
      form.append("file", item.file);
      try {
        results.push(await uploadFile(form, (progress) => update(item.id, { progress })));
        update(item.id, { state: "done", progress: 100 });
        succeeded += 1;
      } catch (error) {
        update(item.id, { state: "error", error: error.message });
        failed += 1;
      }
    }
    setUploading(false);
    if (succeeded) await onUploaded?.(succeeded, results);
    // Close once everything went through; keep it open to show any failures
    if (!failed && !hadErrors) onClose();
  };

  const queuedCount = files.filter((item) => item.state === "queued").length;

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={close}
      title="Upload Training Content"
      subtitle="Add files for PitchProX AI to learn from."
      size="lg"
      footer={
        <>
          <DialogButton onClick={close} disabled={uploading}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={uploadAll} disabled={uploading || !queuedCount}>
            {uploading ? "Uploading…" : "Upload"}
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="training-category" className="block text-xs font-medium leading-4 text-medium-black mb-2">Content type</label>
          <div className="relative">
            <select
              id="training-category"
              value={category}
              disabled={uploading}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full min-h-[44px] appearance-none pl-4 pr-10 py-3 rounded-xl border border-gray-300 bg-white text-base text-dark-black outline-none focus:border-primary cursor-pointer"
            >
              {TRAINING_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>{item.title}</option>
              ))}
            </select>
            <ChevronDown className="w-[18px] h-[18px] text-dark-black/70 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!uploading) addFiles(event.dataTransfer.files);
          }}
          className={`w-full flex flex-col items-center justify-center gap-2 px-6 py-8 rounded-xl border border-dashed transition-colors cursor-pointer ${
            dragging ? "border-primary bg-light-teal/40" : "border-gray-300 bg-[#f2f4f6] hover:border-primary/60"
          }`}
        >
          <Upload className="w-6 h-6 text-primary" />
          <span className="text-sm font-medium text-dark-black">
            Drag and drop files here, or <span className="text-primary">browse</span>
          </span>
          <span className="text-xs text-medium-black">
            PDF, DOCX, PPTX, XLSX, MP4, MP3, JPG, PNG · up to {MAX_MB} MB
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((item) => (
              <li key={item.id} className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3">
                <FileText className="w-5 h-5 text-dark-black/70 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-black truncate">{item.file.name}</p>
                  {item.state === "error" ? (
                    <p className="text-xs text-red-600 mt-0.5">{item.error}</p>
                  ) : (
                    <div className="h-1.5 rounded-full bg-light-gray mt-1.5 overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                </div>
                <span className="text-xs text-medium-black w-14 text-right shrink-0">
                  {item.state === "done" ? "Done" : item.state === "queued" ? "Ready" : item.state === "error" ? "" : `${item.progress}%`}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${item.file.name}`}
                  disabled={item.state === "uploading"}
                  onClick={() => setFiles((current) => current.filter((file) => file.id !== item.id))}
                  className="p-1 rounded-md text-dark-black/70 hover:text-dark-black hover:bg-light-gray cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs leading-4 text-medium-black">Your content is secure, private and only used to train your AI.</p>
      </div>
    </DialogModal>
  );
};

export default UploadTrainingModal;
