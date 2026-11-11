"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Phone, MapPin, X, GraduationCap, Info } from "lucide-react";
import { apiRequest } from "@/lib/client-api";
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
  // Phone calls need Twilio (AI-3); until then the practice call shows the live AI coaching
  const [options, setOptions] = useState(null);
  const [mode, setMode] = useState(setup.mode === "live" ? "live" : "practice");
  const [scriptId, setScriptId] = useState(setup.scriptId || "");

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

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    apiRequest("/api/v1/calls/options")
      .then((result) => {
        if (cancelled) return;
        setOptions(result);
        setScriptId((current) => current || result.practiceScripts[0]?.id || "roleplay");
      })
      .catch(() => !cancelled && setOptions({ liveAvailable: false, practiceScripts: [], usage: null }));
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

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
    if (mode === "practice") {
      if (!scriptId) {
        setError("Choose a practice scenario.");
        return;
      }
      setError("");
      const next = { ...setup, mode: "practice", scriptId: scriptId === "roleplay" ? null : scriptId, roleplay: scriptId === "roleplay" };
      onSetupChange(next);
      onStartCall(next);
      return;
    }
    if (options && !options.liveAvailable) {
      setError("Phone calls aren't connected yet. Use a practice call to see the AI coaching.");
      return;
    }
    if (!formData.leadType || !formData.leadName || !formData.phoneNumber || !formData.address) {
      setError("Please fill in all required fields to start the call.");
      return;
    }
    setError("");
    // A call typed in by hand isn't the CRM contact from before unless the name and number are unchanged
    const digits = (value) => String(value ?? "").replace(/\D/g, "");
    const sameContact = setup.contactId && formData.leadName === setup.leadName && digits(formData.phoneNumber) === digits(setup.phoneNumber);
    const next = { ...setup, ...formData, mode: "live", ...(sameContact ? {} : { contactKind: null, contactId: null, phoneId: null }) };
    onSetupChange(next);
    onStartCall(next);
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
                {mode === "practice" ? "Practice with a simulated prospect and real AI coaching" : "Enter lead details to begin a call"}
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
          {/* Phone call or practice call */}
          <div className="px-6 pt-5">
            <div role="tablist" aria-label="Call type" className="grid grid-cols-2 gap-1 rounded-xl bg-light-gray p-1">
              {[
                { key: "live", label: "Phone call", icon: Phone },
                { key: "practice", label: "Practice call", icon: GraduationCap },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} type="button" role="tab" aria-selected={mode === key} onClick={() => { setMode(key); setError(""); }} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${mode === key ? "bg-white text-primary shadow-xs" : "text-medium-black hover:text-dark-black"}`}>
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          {mode === "practice" ? (
            <div className="p-6 space-y-3">
              <p className="text-xs text-medium-black">The prospect is simulated; the coaching is the real PitchProX AI. Practice calls don&apos;t use your plan&apos;s calls.</p>
              <fieldset className="space-y-2">
                <legend className="text-xs font-semibold text-medium-black mb-1.5">Scenario</legend>
                {(options?.practiceScripts ?? []).map((script) => (
                  <label key={script.id} className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors ${scriptId === script.id ? "border-primary bg-primary/5" : "border-light-gray hover:border-primary/40"}`}>
                    <input type="radio" name="practice-script" value={script.id} checked={scriptId === script.id} onChange={() => setScriptId(script.id)} className="mt-0.5 accent-primary" />
                    <span>
                      <span className="block text-xs font-semibold text-dark-black">{script.title}</span>
                      <span className="block text-[11px] text-light-black">{script.leadType} · {script.prospectName}</span>
                    </span>
                  </label>
                ))}
                <label className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-colors ${scriptId === "roleplay" ? "border-primary bg-primary/5" : "border-light-gray hover:border-primary/40"}`}>
                  <input type="radio" name="practice-script" value="roleplay" checked={scriptId === "roleplay"} onChange={() => setScriptId("roleplay")} className="mt-0.5 accent-primary" />
                  <span>
                    <span className="block text-xs font-semibold text-dark-black">Role-play</span>
                    <span className="block text-[11px] text-light-black">You (or a colleague) type the prospect&apos;s side.</span>
                  </span>
                </label>
                {!options && <p className="text-[11px] text-light-black">Loading scenarios…</p>}
              </fieldset>
            </div>
          ) : (
          <div className="p-6 space-y-4">
            {options && !options.liveAvailable && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[11px] text-amber-950">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Phone calls connect once the calling service (Twilio) is set up. Until then, use a <button type="button" onClick={() => setMode("practice")} className="font-semibold underline cursor-pointer">practice call</button> to see the AI coaching.</span>
              </div>
            )}

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
          )}

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
              {mode === "practice" ? <GraduationCap className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5 fill-current" />}
              <span>{mode === "practice" ? "Start Practice Call" : "Start Call"}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default LiveCallingModal;
