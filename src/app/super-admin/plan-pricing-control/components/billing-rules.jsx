"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { showBillingRulesSavedToast } from "./plan-pricing-dialogs";

const retryOptions = [
  "3 attempts (1, 3, 7 days)",
  "4 attempts (1, 3, 5, 7 days)",
  "2 attempts (1, 3 days)",
  "Custom Schedule",
];

// initial: the saved billing rules; onSave(rules) stores them (Super Admin). Read-only without onSave.
export const BillingRules = ({ initial = {}, onSave = null }) => {
  const [annualDiscount, setAnnualDiscount] = useState(initial.annualDiscount ?? "20");
  const [gracePeriod, setGracePeriod] = useState(initial.gracePeriod ?? "3");
  const [retrySchedule, setRetrySchedule] = useState(initial.retrySchedule ?? "3 attempts (1, 3, 7 days)");
  const [isRetryOpen, setIsRetryOpen] = useState(false);

  // Toggle switch states
  const [autoRenew, setAutoRenew] = useState(initial.autoRenew ?? true);
  const [trialAutoConvert, setTrialAutoConvert] = useState(initial.trialAutoConvert ?? true);
  const [reportRollover, setReportRollover] = useState(initial.reportRollover ?? false);
  const [callRollover, setCallRollover] = useState(initial.callRollover ?? false);
  const rules = { annualDiscount, gracePeriod, retrySchedule, autoRenew, trialAutoConvert, reportRollover, callRollover };

  // Saves the whole set with one change applied
  const persist = async (changes) => {
    if (!onSave) return;
    try {
      await onSave({ ...rules, ...changes });
      showBillingRulesSavedToast();
    } catch {
      /* reported by the caller */
    }
  };

  const TOGGLE_KEYS = { "Auto-Renew": "autoRenew", "Trial Auto-Convert": "trialAutoConvert", "Report Rollover": "reportRollover", "Call Rollover": "callRollover" };
  const handleToggle = (setter, current, name) => {
    if (!onSave) return;
    setter(!current);
    persist({ [TOGGLE_KEYS[name]]: !current });
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs hover:shadow-sm transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Top Header & Settings */}
      <div className="flex flex-col">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-dark-black/80 font-secondary">
            Billing Rules
          </h3>
          <p className="text-xs text-medium-black mt-0.5">
            Configure global billing and subscription behavior.
          </p>
        </div>

        {/* Rules Rows */}
        <div className="mt-5 space-y-3.5">
          {/* 1. Annual Discount */}
          <div className="flex items-center justify-between gap-3 text-xs py-1 border-b border-light-gray/40 pb-2">
            <div className="flex items-center gap-1.5 text-medium-black font-medium">
              <span>Annual Discount</span>
              <HelpCircle className="w-3.5 h-3.5 text-light-black" />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="number"
                value={annualDiscount}
                onChange={(e) => setAnnualDiscount(e.target.value)}
                onBlur={() => persist({ annualDiscount })}
                className="w-14 text-center px-2 py-1 border border-light-gray rounded-lg text-xs font-semibold text-dark-black/85 focus:outline-hidden focus:border-primary"
              />
              <span className="text-xs font-semibold text-medium-black">%</span>
            </div>
          </div>

          {/* 2. Grace Period (Days) */}
          <div className="flex items-center justify-between gap-3 text-xs py-1 border-b border-light-gray/40 pb-2">
            <div className="flex items-center gap-1.5 text-medium-black font-medium">
              <span>Grace Period (Days)</span>
              <HelpCircle className="w-3.5 h-3.5 text-light-black" />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="number"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(e.target.value)}
                onBlur={() => persist({ gracePeriod })}
                className="w-14 text-center px-2 py-1 border border-light-gray rounded-lg text-xs font-semibold text-dark-black/85 focus:outline-hidden focus:border-primary"
              />
              <span className="text-xs font-semibold text-medium-black">days</span>
            </div>
          </div>

          {/* 3. Auto-Renew */}
          <div className="flex items-center justify-between gap-3 text-xs py-1 border-b border-light-gray/40 pb-2">
            <div className="flex items-center gap-1.5 text-medium-black font-medium">
              <span>Auto-Renew</span>
              <HelpCircle className="w-3.5 h-3.5 text-light-black" />
            </div>

            {/* Switch */}
            <button
              type="button"
              onClick={() => handleToggle(setAutoRenew, autoRenew, "Auto-Renew")}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                autoRenew ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  autoRenew ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 4. Failed Payment Retry */}
          <div className="flex items-center justify-between gap-3 text-xs py-1 border-b border-light-gray/40 pb-2 relative">
            <div className="flex items-center gap-1.5 text-medium-black font-medium">
              <span>Failed Payment Retry</span>
              <HelpCircle className="w-3.5 h-3.5 text-light-black" />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRetryOpen(!isRetryOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 border border-light-gray rounded-lg text-xs font-medium text-dark-black/80 hover:bg-light-gray/30 transition-colors cursor-pointer"
              >
                <span>{retrySchedule}</span>
                <ChevronDown className="w-3.5 h-3.5 text-light-black" />
              </button>

              {isRetryOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs">
                  {retryOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setRetrySchedule(opt);
                        setIsRetryOpen(false);
                        persist({ retrySchedule: opt });
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        retrySchedule === opt
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-dark-black/70 hover:bg-light-gray"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 5. Trial Auto-Convert */}
          <div className="flex items-center justify-between gap-3 text-xs py-1 border-b border-light-gray/40 pb-2">
            <div className="flex items-center gap-1.5 text-medium-black font-medium">
              <span>Trial Auto-Convert</span>
              <HelpCircle className="w-3.5 h-3.5 text-light-black" />
            </div>

            <button
              type="button"
              onClick={() =>
                handleToggle(
                  setTrialAutoConvert,
                  trialAutoConvert,
                  "Trial Auto-Convert"
                )
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                trialAutoConvert ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  trialAutoConvert ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 6. Report Rollover */}
          <div className="flex items-center justify-between gap-3 text-xs py-1 border-b border-light-gray/40 pb-2">
            <div className="flex items-center gap-1.5 text-medium-black font-medium">
              <span>Report Rollover</span>
              <HelpCircle className="w-3.5 h-3.5 text-light-black" />
            </div>

            <button
              type="button"
              onClick={() =>
                handleToggle(setReportRollover, reportRollover, "Report Rollover")
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                reportRollover ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  reportRollover ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* 7. Call Rollover */}
          <div className="flex items-center justify-between gap-3 text-xs py-1">
            <div className="flex items-center gap-1.5 text-medium-black font-medium">
              <span>Call Rollover</span>
              <HelpCircle className="w-3.5 h-3.5 text-light-black" />
            </div>

            <button
              type="button"
              onClick={() =>
                handleToggle(setCallRollover, callRollover, "Call Rollover")
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                callRollover ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  callRollover ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingRules;
