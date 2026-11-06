"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Settings, Info, Check } from "lucide-react";
import toast from "react-hot-toast";

export const TrialRulesModal = ({ isOpen, onClose, onSave, initial = null }) => {
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState(initial ?? {
    trialDuration: "7",
    durationUnit: "Days",
    newAccountsOnly: true,
    oneTrialPerOrg: true,
    requirePaymentMethod: false,
    aiCalls: "10",
    reports: "1",
    calibrations: "1",
    whenTrialEnds: "Restrict premium features",
    preserveDataFor: "30 days",
    autoConvertToPaid: false,
    allowAdminExtension: true,
    notify3DaysBefore: true,
    notify1DayBefore: true,
    notifyAtExpiration: true,
    sendEmailAndInApp: true,
  });

  if (!isOpen) return null;

  const handleResetToDefaults = () => {
    setRules({
      trialDuration: "7",
      durationUnit: "Days",
      newAccountsOnly: true,
      oneTrialPerOrg: true,
      requirePaymentMethod: false,
      aiCalls: "10",
      reports: "1",
      calibrations: "1",
      whenTrialEnds: "Restrict premium features",
      preserveDataFor: "30 days",
      autoConvertToPaid: false,
      allowAdminExtension: true,
      notify3DaysBefore: true,
      notify1DayBefore: true,
      notifyAtExpiration: true,
      sendEmailAndInApp: true,
    });
    toast.success("Trial rules reset to defaults");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave?.(rules);
      toast.success("Trial rules saved. New trials use them; the Free Trial plan's limits were updated.");
      onClose();
    } catch {
      /* reported by the caller */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center p-3 sm:p-4 bg-dark-black/50 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F8FAFC] w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray flex flex-col my-auto max-h-[92vh] overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 bg-white border-b border-light-gray/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-dark-black/85 font-secondary tracking-tight">
                Manage Trial Rules
              </h2>
              <p className="text-xs sm:text-sm text-medium-black mt-0.5">
                Configure eligibility, limits, expiration, and conversion behavior for the Free Trial plan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Top 2 Cards: 1. Trial Duration & Eligibility + 2. Included Usage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Trial Duration & Eligibility */}
            <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                1. Trial Duration & Eligibility
              </h3>

              {/* Trial Duration */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-dark-black/80">
                  Trial Duration
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rules.trialDuration}
                    onChange={(e) =>
                      setRules({ ...rules, trialDuration: e.target.value })
                    }
                    className="w-16 text-center px-2 py-1.5 border border-light-gray rounded-xl text-xs font-semibold text-dark-black/85 focus:outline-hidden focus:border-primary"
                  />
                  <select
                    value={rules.durationUnit}
                    onChange={(e) =>
                      setRules({ ...rules, durationUnit: e.target.value })
                    }
                    className="px-3 py-1.5 border border-light-gray rounded-xl text-xs font-medium text-dark-black/85 bg-white focus:outline-hidden focus:border-primary cursor-pointer"
                  >
                    <option value="Days">Days</option>
                    <option value="Weeks">Weeks</option>
                    <option value="Months">Months</option>
                  </select>
                </div>
              </div>

              {/* New accounts only */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-light-gray/40">
                <div>
                  <span className="text-xs font-semibold text-dark-black/80 block">
                    New accounts only
                  </span>
                  <span className="text-[11px] text-light-black">
                    Existing paid accounts cannot start a trial.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRules({ ...rules, newAccountsOnly: !rules.newAccountsOnly })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    rules.newAccountsOnly ? "bg-primary" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      rules.newAccountsOnly ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* One trial per organization */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-light-gray/40">
                <span className="text-xs font-semibold text-dark-black/80">
                  One trial per organization
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setRules({
                      ...rules,
                      oneTrialPerOrg: !rules.oneTrialPerOrg,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    rules.oneTrialPerOrg ? "bg-primary" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      rules.oneTrialPerOrg ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Require payment method */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-light-gray/40">
                <span className="text-xs font-semibold text-dark-black/80">
                  Require payment method
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setRules({
                      ...rules,
                      requirePaymentMethod: !rules.requirePaymentMethod,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    rules.requirePaymentMethod ? "bg-primary" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      rules.requirePaymentMethod ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 2. Included Usage Limits */}
            <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                  2. Included Usage Limits
                </h3>

                {/* AI Calls */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-dark-black/80">
                    AI Calls
                  </span>
                  <input
                    type="number"
                    value={rules.aiCalls}
                    onChange={(e) =>
                      setRules({ ...rules, aiCalls: e.target.value })
                    }
                    className="w-20 text-center px-3 py-1.5 border border-light-gray rounded-xl text-xs font-semibold text-dark-black/85 focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* Reports */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-light-gray/40">
                  <span className="text-xs font-semibold text-dark-black/80">
                    Reports
                  </span>
                  <input
                    type="number"
                    value={rules.reports}
                    onChange={(e) =>
                      setRules({ ...rules, reports: e.target.value })
                    }
                    className="w-20 text-center px-3 py-1.5 border border-light-gray rounded-xl text-xs font-semibold text-dark-black/85 focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* Calibrations */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-light-gray/40">
                  <span className="text-xs font-semibold text-dark-black/80">
                    Calibrations
                  </span>
                  <input
                    type="number"
                    value={rules.calibrations}
                    onChange={(e) =>
                      setRules({ ...rules, calibrations: e.target.value })
                    }
                    className="w-20 text-center px-3 py-1.5 border border-light-gray rounded-xl text-xs font-semibold text-dark-black/85 focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <span className="text-[11px] text-light-black mt-2 block">
                Limits reset only when a new eligible trial begins.
              </span>
            </div>
          </div>

          {/* Bottom 2 Cards: 3. Expiry & Conversion + 4. Trial Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 3. Expiry & Conversion */}
            <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs">
              <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                3. Expiry & Conversion
              </h3>

              {/* When Trial Ends */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                  When Trial Ends
                </label>
                <select
                  value={rules.whenTrialEnds}
                  onChange={(e) =>
                    setRules({ ...rules, whenTrialEnds: e.target.value })
                  }
                  className="w-full text-xs font-medium px-3.5 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                >
                  <option value="Restrict premium features">Restrict premium features</option>
                  <option value="Block account access">Block account access</option>
                  <option value="Downgrade to view-only">Downgrade to view-only</option>
                </select>
              </div>

              {/* Preserve Trial Data For */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-dark-black/80">
                  Preserve Trial Data For
                </span>
                <select
                  value={rules.preserveDataFor}
                  onChange={(e) =>
                    setRules({ ...rules, preserveDataFor: e.target.value })
                  }
                  className="px-3.5 py-1.5 border border-light-gray rounded-xl text-xs font-medium text-dark-black/85 bg-white focus:outline-hidden focus:border-primary cursor-pointer"
                >
                  <option value="14 days">14 days</option>
                  <option value="30 days">30 days</option>
                  <option value="60 days">60 days</option>
                  <option value="90 days">90 days</option>
                </select>
              </div>

              {/* Auto-convert to paid plan */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-light-gray/40">
                <div>
                  <span className="text-xs font-semibold text-dark-black/80 block">
                    Auto-convert to paid plan
                  </span>
                  <span className="text-[11px] text-light-black">
                    Customers must choose a plan manually.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRules({
                      ...rules,
                      autoConvertToPaid: !rules.autoConvertToPaid,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    rules.autoConvertToPaid ? "bg-primary" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      rules.autoConvertToPaid ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Allow Super Admin extension */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-light-gray/40">
                <div>
                  <span className="text-xs font-semibold text-dark-black/80 block">
                    Allow Super Admin extension
                  </span>
                  <span className="text-[11px] text-light-black">
                    Maximum extension: 7 days.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRules({
                      ...rules,
                      allowAdminExtension: !rules.allowAdminExtension,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    rules.allowAdminExtension ? "bg-primary" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      rules.allowAdminExtension ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 4. Trial Notifications */}
            <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                  4. Trial Notifications
                </h3>

                {/* Checkboxes */}
                <div className="mt-3.5 space-y-3">
                  <label className="flex items-center gap-2.5 text-xs text-dark-black/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.notify3DaysBefore}
                      onChange={(e) =>
                        setRules({
                          ...rules,
                          notify3DaysBefore: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="font-medium">3 days before</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-dark-black/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.notify1DayBefore}
                      onChange={(e) =>
                        setRules({
                          ...rules,
                          notify1DayBefore: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="font-medium">1 day before</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-dark-black/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.notifyAtExpiration}
                      onChange={(e) =>
                        setRules({
                          ...rules,
                          notifyAtExpiration: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-primary rounded focus:ring-primary"
                    />
                    <span className="font-medium">At expiration</span>
                  </label>
                </div>
              </div>

              {/* Send email and in-app reminders */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-light-gray/40">
                <span className="text-xs font-semibold text-dark-black/80">
                  Send email and in-app reminders
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setRules({
                      ...rules,
                      sendEmailAndInApp: !rules.sendEmailAndInApp,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    rules.sendEmailAndInApp ? "bg-primary" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      rules.sendEmailAndInApp ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Blue Info Alert Box */}
          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#1E40AF]">
            <Info className="w-4 h-4 shrink-0 text-[#3B82F6] mt-0.5" />
            <span>
              Rule changes apply to new trials only. Existing active trials keep their current limits.
            </span>
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-light-gray/80 bg-[#F8FAFC]">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="text-xs font-medium text-medium-black hover:text-dark-black transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Save Trial Rules
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TrialRulesModal;
