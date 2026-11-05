"use client";

import React, { useState, useEffect } from "react";
import { Building2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function EditCompanyProfileModal({
  isOpen = false,
  onClose = () => {},
  company = {},
  onSave = () => {},
}) {
  const [formData, setFormData] = useState(company);

  useEffect(() => {
    setFormData(company);
  }, [company, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-light-gray flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-teal-50 text-primary border border-teal-100">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark-black">
                  Edit Company Profile
                </h3>
                <p className="text-xs text-light-black">
                  Update corporate details and regional settings
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                  Website
                </label>
                <input
                  type="text"
                  value={formData.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                  Industry
                </label>
                <input
                  type="text"
                  value={formData.industry || ""}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                  Company Size
                </label>
                <input
                  type="text"
                  value={formData.size || ""}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                  Phone
                </label>
                <input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                  Time Zone
                </label>
                <input
                  type="text"
                  value={formData.timeZone || ""}
                  onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                Address
              </label>
              <textarea
                rows={2}
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-medium bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-light-gray flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-light-black hover:bg-light-gray transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
