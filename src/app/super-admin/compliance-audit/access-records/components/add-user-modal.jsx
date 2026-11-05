"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  Smartphone,
  PhoneCall,
  Search,
  Headphones,
  Check,
  ChevronDown,
  Clock,
  Globe,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

const systemRoles = [
  {
    id: "admin",
    name: "Admin",
    icon: Shield,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
  },
  {
    id: "manager",
    name: "Manager",
    icon: Smartphone,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    id: "sales-rep",
    name: "Sales Rep",
    icon: PhoneCall,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-50",
  },
  {
    id: "auditor",
    name: "Auditor",
    icon: Search,
    iconColor: "text-purple-500",
    iconBg: "bg-purple-50",
  },
  {
    id: "support-manager",
    name: "Support Manager",
    icon: Headphones,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-50",
  },
];

const timezoneOptions = [
  "EST (UTC-5)",
  "PST (UTC-8)",
  "CST (UTC-6)",
  "GMT (UTC+0)",
  "CET (UTC+1)",
  "BST (UTC+6)",
];

const languageOptions = [
  "English US",
  "English UK",
  "Spanish",
  "French",
  "German",
];

export default function AddUserModal({ isOpen, onClose, onUserCreated }) {
  const [step, setStep] = useState(1); // 1 | 2 | 3 | 4
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "Manager",
    timezone: "EST (UTC-5)",
    language: "English US",
    governingManager: "",
    managerId: "",
    credentialEmail: "",
  });
  // Active employees for the "Governing Manager" picker
  const [managers, setManagers] = useState([]);

  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const step3Ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    let cancelled = false;
    apiRequest("/api/v1/admin/managers")
      .then((data) => !cancelled && setManagers(data.results))
      .catch(() => !cancelled && setManagers([]));
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (step3Ref.current && !step3Ref.current.contains(event.target)) {
        setIsTimezoneOpen(false);
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        toast.error("Please enter the user's full name");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Please enter an email address");
        return;
      }
      if (!formData.credentialEmail) {
        setFormData((prev) => ({ ...prev, credentialEmail: prev.email }));
      }
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      fullName: "",
      email: "",
      role: "Manager",
      timezone: "EST (UTC-5)",
      language: "English US",
      governingManager: "",
      managerId: "",
      credentialEmail: "",
    });
  };

  // Creates the employee account and its one-time activation link
  const handleSendInvite = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await apiRequest("/api/v1/admin/employees", {
        method: "POST",
        body: {
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
          timezone: formData.timezone,
          language: formData.language,
          managerId: formData.managerId || null,
        },
      });
      onUserCreated?.(result);
      resetForm();
      onClose();
    } catch (error) {
      showError("Invite not sent", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/45 backdrop-blur-xs"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-light-gray w-full max-w-xl max-h-[92vh] flex flex-col z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 sm:px-8 pt-7 pb-4">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-dark-black font-secondary tracking-tight">
                Add New User
              </h3>
              <p className="text-xs text-medium-black">
                Invite a professional to the sales intelligence platform.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-light-gray flex items-center justify-center text-light-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Navigation */}
          <div className="px-6 sm:px-8 border-b border-light-gray flex items-center justify-between gap-2 overflow-x-auto text-xs pb-3">
            {[
              { num: 1, label: "Basic Info" },
              { num: 2, label: "Role & Permissions" },
              { num: 3, label: "Configuration" },
              { num: 4, label: "Review" },
            ].map((s) => {
              const isActive = step === s.num;
              const isPast = step > s.num;

              return (
                <div
                  key={s.num}
                  onClick={() => {
                    if (isPast) setStep(s.num);
                  }}
                  className={`flex items-center gap-2 pb-1 border-b-2 transition-all select-none ${
                    isActive
                      ? "border-primary text-primary font-semibold"
                      : isPast
                      ? "border-transparent text-dark-black/80 font-medium cursor-pointer"
                      : "border-transparent text-light-black cursor-default"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold shrink-0 ${
                      isActive || isPast
                        ? "bg-primary text-white"
                        : "bg-light-gray text-light-black"
                    }`}
                  >
                    {s.num}
                  </span>
                  <span className="whitespace-nowrap">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Modal Body Wizard Content */}
          <div
            className={`px-6 sm:px-8 py-5 flex-1 ${
              step === 3 ? "overflow-visible" : "overflow-y-auto"
            }`}
          >
            {/* ── STEP 1: Basic Info ── */}
            {step === 1 && (
              <div className="space-y-4 text-xs">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-dark-black/75 uppercase tracking-wider block">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-3 rounded-xl border border-light-gray text-xs text-dark-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium shadow-2xs"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-dark-black/75 uppercase tracking-wider block">
                    EMAIL ADDRESS
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="sarah.j@pitchprox.com"
                    className="w-full px-4 py-3 rounded-xl border border-light-gray text-xs text-dark-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* ── STEP 2: Role & Permissions ── */}
            {step === 2 && (
              <div className="space-y-3 text-xs">
                <label className="text-[11px] font-bold text-dark-black/75 uppercase tracking-wider block mb-2">
                  SELECT SYSTEM ROLE
                </label>

                <div className="space-y-2.5">
                  {systemRoles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = formData.role === r.name;

                    return (
                      <div
                        key={r.id}
                        onClick={() =>
                          setFormData({ ...formData, role: r.name })
                        }
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-2xs"
                            : "border-light-gray hover:border-primary/50 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${r.iconBg} ${r.iconColor} flex items-center justify-center shrink-0`}
                          >
                            <Icon className="w-4.5 h-4.5 stroke-[2]" />
                          </div>
                          <span className="font-semibold text-dark-black text-xs sm:text-sm">
                            {r.name}
                          </span>
                        </div>

                        {/* Radio indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-light-black/40 bg-white"
                          }`}
                        >
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 3: Configuration ── */}
            {step === 3 && (
              <div ref={step3Ref} className="space-y-4 text-xs min-h-[260px]">
                <h4 className="font-bold text-dark-black text-sm font-secondary">
                  Platform Settings
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Timezone */}
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-semibold text-dark-black/80 block">
                      Timezone
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimezoneOpen(!isTimezoneOpen);
                        setIsLanguageOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs font-medium text-dark-black bg-white flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="truncate">{formData.timezone}</span>
                      <ChevronDown className="w-4 h-4 text-light-black shrink-0 ml-2" />
                    </button>

                    {isTimezoneOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-50 max-h-48 overflow-y-auto">
                        {timezoneOptions.map((tz) => (
                          <button
                            key={tz}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, timezone: tz });
                              setIsTimezoneOpen(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                              formData.timezone === tz
                                ? "text-primary font-semibold bg-primary/5"
                                : "text-medium-black hover:bg-light-gray/50"
                            }`}
                          >
                            {tz}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-semibold text-dark-black/80 block">
                      Language
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLanguageOpen(!isLanguageOpen);
                        setIsTimezoneOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs font-medium text-dark-black bg-white flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="truncate">{formData.language}</span>
                      <ChevronDown className="w-4 h-4 text-light-black shrink-0 ml-2" />
                    </button>

                    {isLanguageOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-light-gray rounded-xl shadow-xl py-1 z-50 max-h-48 overflow-y-auto">
                        {languageOptions.map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, language: lang });
                              setIsLanguageOpen(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                              formData.language === lang
                                ? "text-primary font-semibold bg-primary/5"
                                : "text-medium-black hover:bg-light-gray/50"
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: Review ── */}
            {step === 4 && (
              <div className="space-y-4 text-xs">
                {/* 1. User Profile Summary */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-dark-black text-xs font-secondary">
                      User Profile Summary
                    </h4>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="p-3.5 bg-light-gray/40 rounded-xl border border-light-gray/70 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-light-black uppercase font-bold block">
                        FULL NAME
                      </span>
                      <span className="font-semibold text-dark-black text-xs">
                        {formData.fullName || "Sarah Jenkins"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-light-black uppercase font-bold block">
                        EMAIL ADDRESS
                      </span>
                      <span className="font-semibold text-dark-black text-xs truncate block">
                        {formData.email || "sarah.j@pitchprox.com"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Role & Permissions */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-dark-black text-xs font-secondary">
                      Role &amp; Permissions
                    </h4>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="p-3.5 bg-light-gray/40 rounded-xl border border-light-gray/70">
                    <span className="inline-block px-3 py-1 bg-white border border-primary/40 text-primary font-semibold text-xs rounded-lg shadow-2xs">
                      Primary Role: {formData.role}
                    </span>
                  </div>
                </div>

                {/* 3. Governing Manager */}
                <div className="space-y-1.5">
                  <h4 className="font-bold text-dark-black text-xs font-secondary">
                    Governing Manager
                  </h4>
                  <p className="text-[11px] text-light-black">
                    Select the employee responsible for this new hire
                  </p>
                  <div className="rounded-xl border border-light-gray overflow-hidden">
                    <div className="relative border-b border-light-gray">
                      <Search className="w-3.5 h-3.5 text-light-black absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.governingManager}
                        onChange={(e) => setFormData({ ...formData, governingManager: e.target.value })}
                        placeholder="Search employee by name, email, or ID"
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs text-dark-black placeholder:text-light-black bg-white focus:outline-none"
                      />
                    </div>
                    <div role="radiogroup" aria-label="Governing manager" className="max-h-44 overflow-y-auto divide-y divide-light-gray/60">
                      {managers
                        .filter((manager) => `${manager.name} ${manager.email} ${manager.jobTitle ?? ""}`.toLowerCase().includes(formData.governingManager.trim().toLowerCase()))
                        .map((manager) => {
                          const selected = formData.managerId === manager.id;
                          return (
                            <button
                              key={manager.id}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => setFormData({ ...formData, managerId: selected ? "" : manager.id })}
                              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left cursor-pointer ${selected ? "bg-primary/5" : "hover:bg-light-gray/40"}`}
                            >
                              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                                {manager.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-xs font-semibold text-dark-black truncate">{manager.name}</span>
                                <span className="block text-[11px] text-light-black truncate">{[manager.jobTitle, manager.department].filter(Boolean).join(" • ") || manager.email}</span>
                              </span>
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? "border-primary bg-primary" : "border-light-black/40"}`}>
                                {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </span>
                            </button>
                          );
                        })}
                      {!managers.length && <p className="px-3.5 py-3 text-[11px] text-light-black">No active employees yet.</p>}
                    </div>
                  </div>
                </div>

                {/* 4. Configuration & Preferences */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-dark-black text-xs font-secondary">
                      Configuration &amp; Preferences
                    </h4>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="p-3.5 bg-light-gray/40 rounded-xl border border-light-gray/70 space-y-1.5">
                    <span className="text-[10px] text-light-black uppercase font-bold block mb-1">
                      PLATFORM SETTINGS
                    </span>
                    <div className="flex items-center gap-2 text-medium-black text-xs">
                      <Clock className="w-3.5 h-3.5 text-light-black" />
                      <span>{formData.timezone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-medium-black text-xs">
                      <Globe className="w-3.5 h-3.5 text-light-black" />
                      <span>{formData.language}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Email Address For Sending Credential */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-dark-black/85 block">
                    Email Address For Sending Credential
                  </label>
                  <input
                    type="email"
                    value={formData.credentialEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credentialEmail: e.target.value,
                      })
                    }
                    placeholder="sarah.j@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray text-xs text-dark-black placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-normal shadow-2xs"
                  />
                </div>

                {/* Information Callout */}
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs text-medium-black">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Send Invite creates the account and a one-time activation link (valid 7 days) for {formData.fullName || "the new employee"}. Until email sending is connected, you&apos;ll copy the link and send it yourself.{" "}
                    They then complete the onboarding flow.{" "}
                    <a
                      href={formData.role === "Sales Rep" ? "/onboarding" : "/onboarding/team"}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      Preview onboarding
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-light-gray/80 bg-white">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-dark-black/80 hover:bg-light-gray/60 border border-light-gray transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSendInvite}
                className="px-5 py-2.5 bg-primary hover:bg-[#0c9593] text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send Invite"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
