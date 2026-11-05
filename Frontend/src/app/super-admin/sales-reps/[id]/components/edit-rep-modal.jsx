"use client";

import React, { useState, useRef } from "react";
import { X } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const timeZoneOptions = [
  { value: "(GMT-05:00) Eastern Time", label: "(GMT-05:00) Eastern Time" },
  { value: "(GMT-06:00) Central Time", label: "(GMT-06:00) Central Time" },
  { value: "(GMT-07:00) Mountain Time", label: "(GMT-07:00) Mountain Time" },
  { value: "(GMT-08:00) Pacific Time", label: "(GMT-08:00) Pacific Time" },
  { value: "(GMT+00:00) UTC", label: "(GMT+00:00) UTC" },
];

const managerOptions = [
  { value: "John smith", label: "John smith" },
  { value: "Sarah Johnson", label: "Sarah Johnson" },
  { value: "Alex Johnson", label: "Alex Johnson" },
  { value: "Emily Smith", label: "Emily Smith" },
  { value: "Michael Brown", label: "Michael Brown" },
];

export default function EditRepModal({ isOpen, onClose, rep, onSave }) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: rep?.name || "Ryan Anderson",
    role: rep?.role || "Senior Account Executive",
    email: rep?.email || "ryan.anderson@pitchprox.com",
    phone: rep?.phone || "(512) 555-0198",
    timeZone: rep?.timeZone || "(GMT-05:00) Eastern Time",
    manager: rep?.manager || "John smith",
    avatar:
      rep?.avatar ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: url }));
      toast.success("Profile picture updated!");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile details saved successfully!");
      if (onSave) onSave(formData);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-dark-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-light-gray shadow-2xl max-w-xl w-full my-auto overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-light-gray">
          <div>
            <h2 className="text-xl font-bold text-dark-black/90 font-secondary tracking-tight">
              Edit Profile
            </h2>
            <p className="text-xs text-light-black mt-0.5">
              Manage your account details and professional identity.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:thin]">
            {/* Avatar & Info Row */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Circular Avatar */}
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0 shadow-2xs">
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name, Email, & Change Picture button */}
              <div className="flex flex-col min-w-0">
                <h3 className="text-base font-bold text-dark-black/90 font-secondary truncate">
                  {formData.name}
                </h3>
                <p className="text-xs text-light-black truncate mt-0.5">
                  {formData.email}
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors text-left cursor-pointer w-fit"
                >
                  Change Profile Picture
                </button>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
              {/* Field 1: Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Field 2: Professional Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">
                  Professional Title
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Field 3: Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Field 4: Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black/90 bg-white placeholder:text-light-black focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Field 5: Time Zone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">
                  Time Zone
                </label>
                <Dropdown
                  items={timeZoneOptions}
                  selected={formData.timeZone}
                  onSelect={(val) =>
                    setFormData({ ...formData, timeZone: val })
                  }
                  variant="default"
                  placement="bottom"
                  className="w-full"
                />
              </div>

              {/* Field 6: Manager */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-dark-black/80">
                  Manager
                </label>
                <Dropdown
                  items={managerOptions}
                  selected={formData.manager}
                  onSelect={(val) =>
                    setFormData({ ...formData, manager: val })
                  }
                  variant="default"
                  placement="bottom"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 sm:px-8 py-4 border-t border-light-gray flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-dark-black/70 hover:text-dark-black hover:bg-light-gray/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
