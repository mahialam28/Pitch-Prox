"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  RotateCcw,
  RefreshCw,
  FileText,
  Phone,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Search,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import AlertModal from "@/components/modals/alert-modal";
import toast from "react-hot-toast";

const customerOptions = [
  {
    value: "jennifer-smith",
    label: "Jennifer Smith (Acme Inc.)",
    desc: "Pro Plan • Active",
  },
  {
    value: "john-smith",
    label: "John Smith (Smith Realty Group)",
    desc: "Pro Plan • Past Due",
  },
  {
    value: "sarah-johnson",
    label: "Sarah Johnson (Johnson Properties)",
    desc: "ProX Plan • Failed Payment",
  },
  {
    value: "mike-davis",
    label: "Mike Davis (Davis Investments)",
    desc: "Basic Plan • Active",
  },
  {
    value: "emily-wilson",
    label: "Emily Wilson (Wilson & Co Real Estate)",
    desc: "Pro Plan • Active",
  },
  {
    value: "robert-chen",
    label: "Robert Chen (Chen Capital Properties)",
    desc: "ProX Plan • Active",
  },
];

export const BillingRulesSettings = () => {
  const [selectedCustomer, setSelectedCustomer] = useState("jennifer-smith");
  const [rules, setRules] = useState({
    gracePeriod: "3 days",
    retrySchedule: "1, 3, 7 days",
    autoRenew: true,
    reportRollover: false,
    callRollover: false,
    taxSettings: true,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const currentCustomerLabel =
    customerOptions.find((c) => c.value === selectedCustomer)?.label ||
    "Jennifer Smith (Acme Inc.)";

  const handleToggleSetting = (key, name) => {
    setRules((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      toast.success(`${name} ${updated[key] ? "Enabled" : "Disabled"} for ${currentCustomerLabel}`);
      return updated;
    });
  };

  const handleConfirmDelete = () => {
    toast.error(`Account deletion process initiated for ${currentCustomerLabel}`);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* ── 6. BILLING RULES / SETTINGS (Left 7 Cols) ── */}
        <div className="xl:col-span-7 2xl:col-span-7 w-full bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6 flex flex-col justify-between gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-light-gray/60">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight font-secondary">
                6. Billing Rules / Settings
              </h2>
              <p className="text-xs text-medium-black mt-0.5">
                Manage global billing and payment settings.
              </p>
            </div>

            {/* Customer Dropdown */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <span className="text-[11px] font-medium text-medium-black">
                Search and select a customer
              </span>
              <Dropdown
                label="Search and select a customer"
                items={customerOptions}
                selected={selectedCustomer}
                onSelect={(val) => setSelectedCustomer(val)}
                icon={<Search className="w-4 h-4 text-light-black" />}
                placement="top"
                className="w-full sm:w-[270px]"
              />
            </div>
          </div>

          {/* Settings Grid (2 Subcolumns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 my-auto">
            {/* Left Subcolumn */}
            <div className="space-y-4">
              {/* Grace Period */}
              <div className="flex items-center justify-between py-1.5 border-b border-light-gray/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-light-gray/50 flex items-center justify-center text-medium-black">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-dark-black/80">
                    Grace Period (Days)
                  </span>
                </div>
                <span className="text-xs font-semibold text-dark-black/85">
                  {rules.gracePeriod}
                </span>
              </div>

              {/* Retry Schedule */}
              <div className="flex items-center justify-between py-1.5 border-b border-light-gray/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-light-gray/50 flex items-center justify-center text-medium-black">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-dark-black/80">
                    Retry Schedule
                  </span>
                </div>
                <span className="text-xs font-semibold text-dark-black/85">
                  {rules.retrySchedule}
                </span>
              </div>

              {/* Auto-Renew */}
              <div
                onClick={() => handleToggleSetting("autoRenew", "Auto-Renew")}
                className="flex items-center justify-between py-1.5 border-b border-light-gray/40 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                    Auto-Renew
                  </span>
                </div>
                <span
                  className={`text-xs font-bold ${
                    rules.autoRenew ? "text-emerald-600" : "text-red"
                  }`}
                >
                  {rules.autoRenew ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>

            {/* Right Subcolumn */}
            <div className="space-y-4">
              {/* Report Rollover */}
              <div
                onClick={() => handleToggleSetting("reportRollover", "Report Rollover")}
                className="flex items-center justify-between py-1.5 border-b border-light-gray/40 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-light-gray/50 flex items-center justify-center text-medium-black">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                    Report Rollover
                  </span>
                </div>
                <span
                  className={`text-xs font-bold ${
                    rules.reportRollover ? "text-emerald-600" : "text-red"
                  }`}
                >
                  {rules.reportRollover ? "Enabled" : "Disabled"}
                </span>
              </div>

              {/* Call Rollover */}
              <div
                onClick={() => handleToggleSetting("callRollover", "Call Rollover")}
                className="flex items-center justify-between py-1.5 border-b border-light-gray/40 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-light-gray/50 flex items-center justify-center text-medium-black">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                    Call Rollover
                  </span>
                </div>
                <span
                  className={`text-xs font-bold ${
                    rules.callRollover ? "text-emerald-600" : "text-red"
                  }`}
                >
                  {rules.callRollover ? "Enabled" : "Disabled"}
                </span>
              </div>

              {/* Tax Settings */}
              <div
                onClick={() => handleToggleSetting("taxSettings", "Tax Settings")}
                className="flex items-center justify-between py-1.5 border-b border-light-gray/40 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-dark-black/80 group-hover:text-primary transition-colors">
                    Tax Settings
                  </span>
                </div>
                <span
                  className={`text-xs font-bold ${
                    rules.taxSettings ? "text-emerald-600" : "text-red"
                  }`}
                >
                  {rules.taxSettings ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── DANGER ZONE (Right 5 Cols) ── */}
        <div className="xl:col-span-5 2xl:col-span-5 w-full bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6 flex flex-col justify-between gap-6">
          {/* Header */}
          <div className="flex items-start gap-3 pb-4 border-b border-light-gray/60">
            <div className="w-10 h-10 rounded-xl bg-red/10 text-red flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight font-secondary">
                Danger Zone
              </h2>
              <p className="text-xs text-medium-black mt-0.5">
                Irreversible actions that affect your account.
              </p>
            </div>
          </div>

          {/* Red Bordered Danger Box */}
          <div className="border border-red/30 bg-red/[0.02] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 my-auto">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red">
                Delete Your Account
              </h3>
              <p className="text-xs text-medium-black leading-relaxed">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red/40 bg-white hover:bg-red/5 text-xs font-semibold text-red transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Alert Modal */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        type="error"
        title="Delete Customer Account"
        message={`Are you sure you want to permanently delete the account for ${currentCustomerLabel}? This action will cancel all active subscriptions, remove credit cards, and purge customer records permanently.`}
        confirmLabel="Yes, Delete Account"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default BillingRulesSettings;
