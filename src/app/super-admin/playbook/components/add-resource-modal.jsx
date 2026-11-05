"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";

export const RESOURCE_TYPES = [
  { value: "Script", label: "Script" },
  { value: "Call Openers", label: "Call Openers" },
  { value: "Email Template", label: "Email Template" },
  { value: "Objection Script", label: "Objection Script" },
  { value: "Follow Up", label: "Follow Up" },
  { value: "Guide", label: "Guide" },
  { value: "Other", label: "Other" },
];

export const RESOURCE_ICONS = [
  { id: "rose", color: "text-rose-500 bg-rose-50 border-rose-200" },
  { id: "sky", color: "text-sky-500 bg-sky-50 border-sky-200" },
  { id: "emerald", color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
  { id: "amber", color: "text-amber-500 bg-amber-50 border-amber-200" },
  { id: "purple", color: "text-purple-500 bg-purple-50 border-purple-200" },
  { id: "teal", color: "text-teal-500 bg-teal-50 border-teal-200" },
];

const AddResourceModal = ({
  isOpen = false,
  onClose = () => {},
  onSave = () => {},
  editResource = null,
  initialType = "Script",
}) => {
  const isEditing = Boolean(editResource);

  const [name, setName] = useState("");
  const [type, setType] = useState(initialType || "Script");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("emerald");
  const [addedBy, setAddedBy] = useState("Daniel Miller");

  useEffect(() => {
    if (editResource) {
      setName(editResource.name || "");
      setType(editResource.type || "Script");
      setDescription(editResource.description || "");
      setContent(editResource.content || "");
      setSelectedColor(editResource.iconColor || "emerald");
      setAddedBy(editResource.addedBy || "Daniel Miller");
    } else {
      setName("");
      setType(initialType || "Script");
      setDescription("");
      setContent("");
      setSelectedColor("emerald");
      setAddedBy("Daniel Miller");
    }
  }, [editResource, initialType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const resourceData = {
      ...(editResource ? { id: editResource.id } : {}),
      name: name.trim(),
      type,
      description: description.trim(),
      content: content.trim(),
      addedBy: addedBy.trim() || "Daniel Miller",
      addedDate: editResource?.addedDate || "May 10, 2024",
      iconColor: selectedColor,
    };

    onSave(resourceData);
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
                <input
                  type="text"
                  value={addedBy}
                  onChange={(e) => setAddedBy(e.target.value)}
                  placeholder="e.g. Daniel Miller"
                  className="w-full px-3.5 py-2 rounded-xl border border-light-gray text-xs sm:text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black"
                />
              </div>
            </div>

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
                Script / Guide Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Paste talking points, full script content, or key guidelines here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-dark-black/80 placeholder:text-light-black resize-none"
              />
            </div>

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
                disabled={!name.trim()}
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
