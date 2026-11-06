"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Briefcase, Mail, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

// initial: the saved enterprise defaults. Payment links are created once Stripe is connected.
export const EnterpriseConfigModal = ({ isOpen, onClose, onSave, initial = null }) => {
  const [price, setPrice] = useState(initial?.price ?? "5,000");
  const [billingCycle, setBillingCycle] = useState(initial?.billingCycle ?? "Annual");
  const [contractTerm, setContractTerm] = useState(initial?.contractTerm ?? "12 months");
  const [onboardingFee, setOnboardingFee] = useState(initial?.onboardingFee ?? "500");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const money = (value) => Number(String(value).replace(/[^0-9.]/g, "")) || 0;
  const recurring = money(price);
  const oneTime = money(onboardingFee);

  // Usage & seats
  const [customCallLimits, setCustomCallLimits] = useState(initial?.customCallLimits ?? true);
  const [callLimitsValue, setCallLimitsValue] = useState(initial?.callLimitsValue ?? "2,000");
  const [customReportLimits, setCustomReportLimits] = useState(initial?.customReportLimits ?? true);
  const [reportLimitsValue, setReportLimitsValue] = useState(initial?.reportLimitsValue ?? "50");
  const [unlimitedMembers, setUnlimitedMembers] = useState(initial?.unlimitedMembers ?? true);
  const [overagePricing, setOveragePricing] = useState(initial?.overagePricing ?? "Defined per contract");

  // Payment link & email
  const [customerEmail, setCustomerEmail] = useState("billing@acmeinc.com");
  const [agreedAmount, setAgreedAmount] = useState("5,000.00");
  const [paymentBillingCycle, setPaymentBillingCycle] = useState("Annual");
  const [linkExpires, setLinkExpires] = useState("7 days");
  const [sendDirectlyByEmail, setSendDirectlyByEmail] = useState(true);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    toast("Payment links are created once Stripe is connected.");
  };

  // Saves the enterprise defaults (price, term, limits). Emailing a payment link needs Stripe and email.
  const handleCreateAndEmail = async (e) => {
    e.preventDefault();
    try {
      await onSave?.({ price, billingCycle, contractTerm, onboardingFee, currency, customCallLimits, callLimitsValue, customReportLimits, reportLimitsValue, unlimitedMembers, overagePricing });
      toast.success("Enterprise defaults saved. Payment links are sent once Stripe and email are connected.");
      onClose();
    } catch {
      /* reported by the caller */
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
        className="bg-[#F8FAFC] w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray flex flex-col my-auto max-h-[92vh] overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 bg-white border-b border-light-gray/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0 shadow-2xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-dark-black/85 font-secondary tracking-tight">
                Configure Enterprise
              </h2>
              <p className="text-xs sm:text-sm text-medium-black mt-0.5">
                Define custom pricing, limits, features, and approval rules for enterprise contracts.
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

        {/* Modal Content Grid (Left 2/3 and Right 1/3) */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 Columns (Cards 1, 2, 3) */}
            <div className="lg:col-span-7 space-y-4">
              {/* 1. Pricing & Contract */}
              <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                  1. Pricing & Contract
                </h3>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Price
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-medium-black">
                      $
                    </span>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full text-xs font-semibold pl-8 pr-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    />
                  </div>
                </div>

                {/* Billing Cycle & Contract Term */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                      Billing Cycle
                    </label>
                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value)}
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                    >
                      <option value="Annual">Annual</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                      Minimum Contract Term
                    </label>
                    <select
                      value={contractTerm}
                      onChange={(e) => setContractTerm(e.target.value)}
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                    >
                      <option value="12 months">12 months</option>
                      <option value="24 months">24 months</option>
                      <option value="36 months">36 months</option>
                    </select>
                  </div>
                </div>

                {/* Onboarding Fee & Currency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                      Onboarding Fee
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-medium-black">
                        $
                      </span>
                      <input
                        type="text"
                        value={onboardingFee}
                        onChange={(e) => setOnboardingFee(e.target.value)}
                        className="w-full text-xs font-semibold pl-8 pr-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Usage & Seats */}
              <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                  2. Usage & Seats
                </h3>

                {/* Custom Call Limits */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCustomCallLimits(!customCallLimits)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        customCallLimits ? "bg-primary" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          customCallLimits ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-dark-black/80">
                      Custom Call Limits
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={callLimitsValue}
                      onChange={(e) => setCallLimitsValue(e.target.value)}
                      className="w-24 text-center text-xs font-semibold px-2 py-1.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    />
                    <span className="text-xs text-medium-black">/ month</span>
                  </div>
                </div>

                {/* Custom Report Limits */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-light-gray/40">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        setCustomReportLimits(!customReportLimits)
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        customReportLimits ? "bg-primary" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          customReportLimits ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-xs font-semibold text-dark-black/80">
                      Custom Report Limits
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={reportLimitsValue}
                      onChange={(e) => setReportLimitsValue(e.target.value)}
                      className="w-24 text-center text-xs font-semibold px-2 py-1.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    />
                    <span className="text-xs text-medium-black">/ month</span>
                  </div>
                </div>

                {/* Unlimited Team Members */}
                <div className="flex items-center gap-2.5 pt-2 border-t border-light-gray/40">
                  <button
                    type="button"
                    onClick={() => setUnlimitedMembers(!unlimitedMembers)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      unlimitedMembers ? "bg-primary" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        unlimitedMembers ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-semibold text-dark-black/80">
                    Unlimited Team Members
                  </span>
                </div>

                {/* Overage Pricing */}
                <div className="pt-2 border-t border-light-gray/40">
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Overage Pricing
                  </label>
                  <select
                    value={overagePricing}
                    onChange={(e) => setOveragePricing(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                  >
                    <option value="Defined per contract">Defined per contract</option>
                    <option value="$0.20 per call / $3 per report">$0.20 per call / $3 per report</option>
                    <option value="No overage allowed">No overage allowed</option>
                  </select>
                </div>
              </div>

              {/* 3. Payment Link & Email */}
              <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs">
                <div>
                  <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                    3. Payment Link & Email
                  </h3>
                  <p className="text-xs text-medium-black mt-0.5">
                    Create a secure checkout link for this enterprise quote.
                  </p>
                </div>

                {/* Customer Email */}
                <div>
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Customer Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-light-black absolute left-3.5" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full text-xs font-medium pl-9 pr-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    />
                  </div>
                </div>

                {/* Agreed Amount */}
                <div>
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Agreed Amount
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-medium-black">
                      $
                    </span>
                    <input
                      type="text"
                      value={agreedAmount}
                      onChange={(e) => setAgreedAmount(e.target.value)}
                      className="w-full text-xs font-semibold pl-8 pr-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    />
                  </div>
                </div>

                {/* Billing Cycle Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Billing Cycle
                  </label>
                  <select
                    value={paymentBillingCycle}
                    onChange={(e) => setPaymentBillingCycle(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                {/* Payment Link Expires */}
                <div>
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Payment Link Expires
                  </label>
                  <select
                    value={linkExpires}
                    onChange={(e) => setLinkExpires(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                  >
                    <option value="7 days">7 days</option>
                    <option value="14 days">14 days</option>
                    <option value="30 days">30 days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right 5 Columns (Summary Box & Email Action) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Send directly by email toggle card */}
              <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 flex items-start gap-3 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSendDirectlyByEmail(!sendDirectlyByEmail)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out mt-0.5 ${
                    sendDirectlyByEmail ? "bg-primary" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      sendDirectlyByEmail ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <div>
                  <span className="text-xs font-bold text-dark-black/85 block">
                    Send directly by email
                  </span>
                  <span className="text-[11px] text-light-black">
                    The customer receives the secure checkout link immediately.
                  </span>
                </div>
              </div>

              {/* Order Summary Box */}
              <div className="bg-[#F0FDF4]/60 border border-[#DCFCE7] rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xs">
                <div>
                  <h4 className="text-base font-bold text-dark-black/85 font-secondary">
                    Enterprise Plan
                  </h4>
                  <p className="text-xs text-medium-black mt-0.5">
                    {billingCycle} contract • Custom limits
                  </p>
                </div>

                {/* Recurring vs one-time vs due today, so "total" is never ambiguous */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-medium-black">{billingCycle === "Annual" ? "Annual Recurring" : "Monthly Recurring"}</span>
                    <span className="font-bold text-dark-black">
                      ${recurring.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      <span className="text-xs font-normal text-light-black"> / {billingCycle === "Annual" ? "year" : "month"}</span>
                    </span>
                  </div>
                  {billingCycle === "Annual" && (
                    <div className="flex items-center justify-between gap-3 text-xs text-light-black">
                      <span>Monthly equivalent</span>
                      <span>${(recurring / 12).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / month</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-medium-black">One-Time (onboarding fee)</span>
                    <span className="font-bold text-dark-black">${oneTime.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#DCFCE7]">
                    <span className="font-bold text-dark-black">Due Today</span>
                    <span className="text-2xl font-extrabold text-dark-black/85 font-secondary">${(recurring + oneTime).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <p className="text-[11px] text-light-black">First {billingCycle === "Annual" ? "year" : "month"} + one-time fee. Renews at ${recurring.toLocaleString("en-US")} per {billingCycle === "Annual" ? "year" : "month"} for a {contractTerm} minimum term.</p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#DCFCE7]/80">
                  <span className="text-xs font-bold text-dark-black/80 block">
                    Customer Will Receive
                  </span>
                  <div className="space-y-2 text-xs text-medium-black">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Secure payment link via email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Enterprise plan and order summary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span>Receipt after successful payment</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-3">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full py-2.5 px-4 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer bg-white"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateAndEmail}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Save Enterprise Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EnterpriseConfigModal;
