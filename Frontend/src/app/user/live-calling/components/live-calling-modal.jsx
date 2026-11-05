"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Phone, MapPin, X } from "lucide-react";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import { leadTypeOptions } from "@/utils.js/lead-options";
import { formatPhoneNumber } from "@/utils.js/phone";

const LiveCallingModal = ({
  isOpen = false,
  onClose,
  setup = {},
  onSetupChange = () => {},
  onStartCall = () => {},
}) => {
  const [formData, setFormData] = useState({
    leadType: setup.leadType || "",
    leadName: setup.leadName || "",
    phoneNumber: setup.phoneNumber || "",
    address: setup.address || "",
  });
  const [error, setError] = useState("");

  // Reset the form whenever the modal opens so a previous submission never
  // leaks stale values into the next session. This is done as a render-phase
  // state adjustment (the documented pattern) rather than in an effect.
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setFormData({
        leadType: setup.leadType || "",
        leadName: setup.leadName || "",
        phoneNumber: setup.phoneNumber || "",
        address: setup.address || "",
      });
      setError("");
    }
  }

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phoneNumber" ? formatPhoneNumber(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.leadType || !formData.leadName || !formData.phoneNumber || !formData.address) {
      setError("Please fill in all required fields to start the call.");
      return;
    }
    setError("");
    onSetupChange({ ...setup, ...formData });
    onStartCall({ ...setup, ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-black/50 backdrop-blur-xs p-4 sm:p-6 transition-opacity">
      {/* ── Modal Dialog Card ── */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-light-gray overflow-hidden flex flex-col my-auto">

        {/* ── Header Section ── */}
        <div className="p-6 pb-5 flex items-start justify-between border-b border-light-gray">
          <div className="flex items-center gap-3.5">
            {/* Call Icon Badge */}
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-xs">
              <Phone className="w-5 h-5 fill-current" />
            </div>

            {/* Title & Description */}
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold text-dark-black tracking-tight">
                Start a Call
              </h2>
              <p className="text-xs text-light-black font-normal">
                Enter lead details to begin a manual call
              </p>
            </div>
          </div>

          {/* Close Control Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-light-black hover:text-medium-black p-1.5 rounded-lg hover:bg-light-gray transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Form Body ── */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">

            {/* Lead Type Select — themed dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-medium-black">
                Lead Type <span className="text-red-500">*</span>
              </label>
              <SettingsDropdown
                label="Select lead type"
                items={leadTypeOptions}
                selected={formData.leadType}
                onSelect={(val) =>
                  setFormData((prev) => ({ ...prev, leadType: val }))
                }
                className="w-full"
              />
            </div>

            {/* Lead Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-medium-black">
                Lead Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="leadName"
                required
                placeholder="Enter lead name"
                value={formData.leadName}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder-light-black transition-colors"
              />
            </div>

            {/* Phone Number Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-medium-black">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex rounded-xl border border-light-gray overflow-hidden focus-within:border-primary transition-colors">
                <div className="px-3.5 py-2.5 bg-light-gray border-r border-light-gray text-xs font-semibold text-medium-black flex items-center shrink-0">
                  +1
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  required
                  placeholder="(213) 555-1234"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs bg-white text-dark-black placeholder-light-black focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-light-black pt-0.5">
                The call will connect to this number.
              </p>
            </div>

            {/* Address Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-medium-black">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Enter street, city, state, ZIP"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder-light-black transition-colors"
                />
              </div>
            </div>

          </div>

          {/* Validation error */}
          {error && (
            <div className="px-6 pb-0">
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red/5 border border-red/20 text-red text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            </div>
          )}

          {/* ── Footer Actions ── */}
          <div className="px-6 py-4 border-t border-light-gray flex items-center justify-end gap-3 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-primary hover:text-medium-teal border border-primary/60 hover:border-primary rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Start Call</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default LiveCallingModal;
