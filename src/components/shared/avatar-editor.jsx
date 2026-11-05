"use client";

import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { FiTrash2, FiUpload } from "react-icons/fi";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { showError } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

// Profile photo with Upload / Delete actions. Frontend only for now: the chosen image is
// previewed in the browser; onChange(file | null) is where the upload API will plug in.
export const ProfileAvatar = ({ src, name, className = "w-16 h-16" }) =>
  src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Profile photo" className={`${className} rounded-full object-cover border-2 border-light-gray`} />
  ) : (
    <span className={`${className} rounded-full bg-light-teal text-primary font-semibold text-lg flex items-center justify-center border-2 border-light-gray`}>
      {initialsOf(name)}
    </span>
  );

export const AvatarActions = ({ hasPhoto, onUpload, onDelete }) => {
  const inputRef = useRef(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const pick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!TYPES.includes(file.type)) return showError("Unsupported file", "Choose a JPG, PNG, WEBP or GIF image.");
    if (file.size > MAX_BYTES) return showError("File too large", "Profile photos can be up to 5 MB.");
    onUpload(file);
  };

  return (
    <div className="flex items-center gap-2.5">
      <input ref={inputRef} type="file" accept={TYPES.join(",")} onChange={pick} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs md:font-semibold font-medium rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap"
      >
        <FiUpload className="w-4 h-4" /> Upload Photo
      </button>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={!hasPhoto}
        className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs md:font-semibold font-medium rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiTrash2 className="w-4 h-4" /> Delete Photo
      </button>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove profile photo?"
        icon={ImageIcon}
        message="Your profile photo will be removed and replaced with your initials."
        confirmLabel="Delete Photo"
        onConfirm={() => {
          onDelete();
          showSavedToast("Photo removed", "Your initials are shown instead.");
        }}
      />
    </div>
  );
};

// Local photo state: previews an uploaded file and cleans up its object URL
export const useAvatar = (initialSrc) => {
  const [src, setSrc] = useState(initialSrc);
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => () => objectUrl && URL.revokeObjectURL(objectUrl), [objectUrl]);

  const upload = (file) => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setSrc(url);
    showSavedToast("Photo updated", "Your new profile photo is shown across PitchProX.");
  };
  const remove = () => {
    setObjectUrl(null);
    setSrc(null);
  };
  return { src, upload, remove };
};
