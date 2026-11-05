"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CreditCard,
  Phone,
  FileText,
  Search,
  Calendar,
  Check,
  CheckCircle,
  Sparkles,
  User,
  Star,
  ShieldCheck,
  CircleDollarSign,
  Send,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import DatePicker from "@/components/modals/date-picker";
import AlertModal from "@/components/modals/alert-modal";
import toast from "react-hot-toast";

const CUSTOMER_DATA_MAP = {
  "jennifer-smith": {
    value: "jennifer-smith",
    label: "Jennifer Smith (Acme Inc.)",
    name: "Jennifer Smith",
    company: "Acme Inc.",
    plan: "Premium Plan",
    status: "Active",
    statusText: "Up to Date",
    accountId: "ACC-001234",
    nextInvoice: "Jun 10, 2025",
    billingCycle: "Monthly",
    initials: "JS",
  },
  "john-smith": {
    value: "john-smith",
    label: "John Smith (Smith Realty Group)",
    name: "John Smith",
    company: "Smith Realty Group",
    plan: "Pro Plan",
    status: "Past Due",
    statusText: "Past Due ($199.00)",
    accountId: "ACC-001235",
    nextInvoice: "May 2, 2024",
    billingCycle: "Monthly",
    initials: "JS",
  },
  "sarah-johnson": {
    value: "sarah-johnson",
    label: "Sarah Johnson (Johnson Properties)",
    name: "Sarah Johnson",
    company: "Johnson Properties",
    plan: "ProX Plan",
    status: "Failed Payment",
    statusText: "Failed Payment",
    accountId: "ACC-001236",
    nextInvoice: "Apr 30, 2024",
    billingCycle: "Monthly",
    initials: "SJ",
  },
  "mike-davis": {
    value: "mike-davis",
    label: "Mike Davis (Davis Investments)",
    name: "Mike Davis",
    company: "Davis Investments",
    plan: "Basic Plan",
    status: "Active",
    statusText: "Up to Date",
    accountId: "ACC-001237",
    nextInvoice: "May 15, 2024",
    billingCycle: "Monthly",
    initials: "MD",
  },
  "emily-wilson": {
    value: "emily-wilson",
    label: "Emily Wilson (Wilson & Co Real Estate)",
    name: "Emily Wilson",
    company: "Wilson & Co Real Estate",
    plan: "Pro Plan",
    status: "Active",
    statusText: "Up to Date",
    accountId: "ACC-001238",
    nextInvoice: "Jun 15, 2025",
    billingCycle: "Monthly",
    initials: "EW",
  },
  "robert-chen": {
    value: "robert-chen",
    label: "Robert Chen (Chen Capital Properties)",
    name: "Robert Chen",
    company: "Chen Capital Properties",
    plan: "ProX Plan",
    status: "Active",
    statusText: "Up to Date",
    accountId: "ACC-001239",
    nextInvoice: "Jun 20, 2025",
    billingCycle: "Annual",
    initials: "RC",
  },
};

const customerDropdownOptions = Object.values(CUSTOMER_DATA_MAP).map((c) => ({
  value: c.value,
  label: c.label,
  desc: `${c.plan} • ${c.status}`,
}));

const ADJUSTMENT_TYPE_OPTIONS = [
  { value: "Call Credit", label: "Call Credit" },
  { value: "Dollar Credit", label: "Dollar Credit" },
  { value: "Report Credit", label: "Report Credit" },
  { value: "Discount", label: "Discount (Percentage)" },
  { value: "Refund", label: "Refund" },
  { value: "Fee Waiver", label: "Fee Waiver" },
];

const APPLIES_TO_OPTIONS = [
  { value: "Next Invoice", label: "Next Invoice" },
  { value: "Current Balance", label: "Current Balance" },
  { value: "Usage Ledger", label: "Usage Ledger" },
];

export const ApplyCreditAdjustmentModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedCustomerKey, setSelectedCustomerKey] = useState("jennifer-smith");
  const [adjustmentType, setAdjustmentType] = useState("Dollar Credit");
  const [amount, setAmount] = useState("50.00");
  const [appliesTo, setAppliesTo] = useState("Next Invoice");
  const [expirationDate, setExpirationDate] = useState("");
  const [internalReason, setInternalReason] = useState(
    "Customer requested courtesy credit for service interruption."
  );
  const [customerNote, setCustomerNote] = useState(
    "A $50 credit has been applied to your account."
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isConfirmOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isConfirmOpen, onClose]);

  if (!isOpen) return null;

  const currentCustomer =
    CUSTOMER_DATA_MAP[selectedCustomerKey] || CUSTOMER_DATA_MAP["jennifer-smith"];

  const getAmountDisplay = () => {
    if (adjustmentType === "Call Credit") {
      return `${amount} calls`;
    }
    if (adjustmentType === "Report Credit") {
      return `${amount} reports`;
    }
    if (adjustmentType === "Discount") {
      return `${amount}%`;
    }
    const num = parseFloat(amount || "0");
    return `$${num.toFixed(2)}`;
  };

  const handleApplyClick = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleSaveDraft = () => {
    toast.success(`Draft saved for ${currentCustomer.name} adjustment request.`);
    onClose();
  };

  const handleFinalConfirmApply = () => {
    const newAdjustment = {
      id: `ADJ-2024-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: `${currentCustomer.name}, ${currentCustomer.company}`,
      type: adjustmentType,
      value: getAmountDisplay(),
      reason: internalReason.slice(0, 40) || "Courtesy credit",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      applyTo: appliesTo,
      customerNote,
    };

    toast.success(
      `Successfully applied ${getAmountDisplay()} ${adjustmentType} to ${currentCustomer.name}`
    );

    if (onSuccess) {
      onSuccess(newAdjustment);
    }

    setIsConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl bg-white rounded-3xl border border-light-gray shadow-2xl overflow-hidden z-10 flex flex-col my-auto max-h-[92vh]"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-light-gray flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-primary border border-teal-100 flex items-center justify-center shrink-0 shadow-2xs">
                  <CircleDollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-dark-black/85 tracking-tight font-secondary">
                    Apply Credit / Adjustment
                  </h3>
                  <p className="text-xs text-medium-black mt-0.5">
                    Apply credits, refunds, discounts, or manual adjustments to a customer account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-light-gray/60 hover:bg-light-gray text-medium-black hover:text-dark-black/85 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - 2 Columns */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ══════ LEFT COLUMN: Input Forms (7 Cols) ══════ */}
                <div className="lg:col-span-7 space-y-6">
                  {/* 1. SELECT CUSTOMER */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-dark-black/80 uppercase tracking-wider font-secondary">
                      1. SELECT CUSTOMER
                    </h4>

                    <div className="space-y-1.5">
                      <span className="text-xs text-medium-black font-medium">
                        Search and select a customer
                      </span>
                      <Dropdown
                        items={customerDropdownOptions}
                        selected={selectedCustomerKey}
                        onSelect={(val) => setSelectedCustomerKey(val)}
                        icon={<Search className="w-4 h-4 text-light-black" />}
                        className="w-full"
                      />
                    </div>

                    {/* Customer Preview Card */}
                    <div className="bg-white border border-light-gray rounded-2xl p-4 shadow-2xs space-y-3.5">
                      {/* Top Row: Avatar, Name, Badge, Company, Plan, Account ID */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-teal-50 text-primary font-bold text-sm flex items-center justify-center border border-teal-100 shadow-2xs">
                            {currentCustomer.initials}
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-dark-black/85 font-secondary">
                                {currentCustomer.name}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">
                                {currentCustomer.status}
                              </span>
                            </div>
                            <p className="text-xs text-medium-black">
                              {currentCustomer.company}
                            </p>
                            <p className="text-xs font-semibold text-primary flex items-center gap-1">
                              <span>★</span>
                              <span>{currentCustomer.plan}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block">
                            ACCOUNT ID
                          </span>
                          <span className="text-xs font-semibold font-mono text-dark-black/80 mt-0.5 block">
                            {currentCustomer.accountId}
                          </span>
                        </div>
                      </div>

                      {/* Bottom 3-Metric Strip */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-light-gray/60 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block">
                            STATUS
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="font-semibold text-dark-black/80 text-xs">
                              {currentCustomer.statusText}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block">
                            NEXT INVOICE
                          </span>
                          <span className="font-semibold text-dark-black/80 text-xs mt-0.5 block">
                            {currentCustomer.nextInvoice}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block">
                            BILLING CYCLE
                          </span>
                          <span className="font-semibold text-dark-black/80 text-xs mt-0.5 block">
                            {currentCustomer.billingCycle}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. ADJUSTMENT DETAILS */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold text-dark-black/80 uppercase tracking-wider font-secondary">
                      2. ADJUSTMENT DETAILS
                    </h4>

                    {/* Row 1: Adjustment Type & Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark-black/80">
                          Adjustment Type <span className="text-red">*</span>
                        </label>
                        <Dropdown
                          items={ADJUSTMENT_TYPE_OPTIONS}
                          selected={adjustmentType}
                          onSelect={(val) => setAdjustmentType(val)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark-black/80">
                          Amount <span className="text-red">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-medium-black">
                            {adjustmentType === "Call Credit" || adjustmentType === "Report Credit"
                              ? "#"
                              : "$"}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-8 pr-3.5 py-2 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black/85 focus:outline-none focus:border-primary shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Applies To & Expiration Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark-black/80">
                          Applies To <span className="text-red">*</span>
                        </label>
                        <Dropdown
                          items={APPLIES_TO_OPTIONS}
                          selected={appliesTo}
                          onSelect={(val) => setAppliesTo(val)}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark-black/80">
                          Expiration Date (Optional)
                        </label>
                        <DatePicker
                          value={expirationDate}
                          onChange={setExpirationDate}
                          placeholder="Select date"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Row 3: Internal Reason */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-dark-black/80">
                        Internal Reason <span className="text-red">*</span>
                      </label>
                      <textarea
                        rows={2}
                        maxLength={250}
                        value={internalReason}
                        onChange={(e) => setInternalReason(e.target.value)}
                        placeholder="State reason for credit or adjustment..."
                        className="w-full px-3.5 py-2 text-xs bg-white border border-light-gray rounded-xl text-dark-black/85 placeholder:text-light-black focus:outline-none focus:border-primary shadow-2xs resize-none"
                      />
                      <div className="flex items-center justify-between text-[11px] text-light-black">
                        <span>This note is for internal use only.</span>
                        <span>{internalReason.length} / 250</span>
                      </div>
                    </div>

                    {/* Row 4: Customer Visible Note */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-dark-black/80">
                        Customer Visible Note (Optional)
                      </label>
                      <textarea
                        rows={2}
                        maxLength={250}
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        placeholder="Note displayed on customer invoice or receipt..."
                        className="w-full px-3.5 py-2 text-xs bg-white border border-light-gray rounded-xl text-dark-black/85 placeholder:text-light-black focus:outline-none focus:border-primary shadow-2xs resize-none"
                      />
                      <div className="flex items-center justify-between text-[11px] text-light-black">
                        <span>This note will be visible to the customer.</span>
                        <span>{customerNote.length} / 250</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ══════ RIGHT COLUMN: Preview & Super Admin Approval (5 Cols) ══════ */}
                <div className="lg:col-span-5 space-y-6">
                  {/* 3. Adjustment Preview */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-dark-black/80 uppercase tracking-wider font-secondary">
                        3. Adjustment Preview
                      </h4>
                      <p className="text-xs text-medium-black mt-0.5">
                        Review the details before applying this adjustment.
                      </p>
                    </div>

                    {/* Preview Key-Value Card */}
                    <div className="bg-white border border-light-gray rounded-2xl p-4 shadow-2xs divide-y divide-light-gray/50 space-y-2.5">
                      <div className="flex items-center justify-between text-xs pt-0 first:pt-0">
                        <span className="text-medium-black">Customer</span>
                        <span className="font-semibold text-dark-black/85">
                          {currentCustomer.name} ({currentCustomer.company})
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2.5">
                        <span className="text-medium-black">Adjustment Type</span>
                        <span className="font-semibold text-dark-black/85">
                          {adjustmentType}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2.5">
                        <span className="text-medium-black">Amount</span>
                        <span className="font-bold text-emerald-600 text-sm">
                          {getAmountDisplay()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2.5">
                        <span className="text-medium-black">Applies To</span>
                        <span className="font-medium text-dark-black/80">
                          {appliesTo}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2.5">
                        <span className="text-medium-black">Effective Date</span>
                        <span className="font-medium text-dark-black/80">
                          Immediately
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2.5">
                        <span className="text-medium-black">Created By</span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-teal-50 text-primary text-[10px] font-bold flex items-center justify-center border border-teal-100">
                            DM
                          </div>
                          <span className="font-medium text-dark-black/80">
                            Daniel Miller
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2.5">
                        <span className="text-medium-black">Date</span>
                        <span className="font-medium text-dark-black/80">
                          May 2, 2024 10:42 AM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. SUPER ADMIN APPROVAL */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-dark-black/80 uppercase tracking-wider font-secondary">
                        4. SUPER ADMIN APPROVAL
                      </h4>
                      <p className="text-xs text-medium-black mt-0.5">
                        Review and approve this adjustment before it is applied.
                      </p>
                    </div>

                    {/* Teal Approval Request Card */}
                    <div className="border border-teal-200/90 bg-teal-50/40 rounded-2xl p-4 shadow-2xs space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-primary block font-secondary">
                            Adjustment Request
                          </span>
                          <p className="text-xs text-medium-black mt-0.5">
                            Please review and approve this {getAmountDisplay()} credit.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-teal-100 flex items-center gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-teal-50 text-primary text-[9px] font-bold flex items-center justify-center border border-teal-100">
                          DM
                        </div>
                        <span className="text-medium-black font-medium">Sender:</span>
                        <span className="font-semibold text-dark-black/80">
                          Daniel Miller
                        </span>
                      </div>
                    </div>

                    {/* Audit Log Strip */}
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-light-gray/40 border border-light-gray/60">
                      <FileText className="w-4 h-4 text-light-black shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-dark-black/80 block font-secondary">
                          Audit Log
                        </span>
                        <p className="text-[11px] text-medium-black mt-0.5">
                          Approval identity, amount, reason, and time will be recorded.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-light-gray bg-white flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-light-gray text-medium-black hover:text-dark-black/90 hover:bg-light-gray transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-light-gray bg-white text-medium-black hover:text-dark-black/90 hover:bg-light-gray transition-colors cursor-pointer"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={handleApplyClick}
                  className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-primary hover:bg-medium-teal text-white transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply Credit</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Confirmation AlertModal */}
      <AlertModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        type="info"
        title="Confirm Applying Adjustment"
        message={`Are you sure you want to apply ${getAmountDisplay()} (${adjustmentType}) to ${currentCustomer.name} (${currentCustomer.company})?`}
        confirmLabel="Confirm & Apply"
        onConfirm={handleFinalConfirmApply}
      />
    </>
  );
};

export default ApplyCreditAdjustmentModal;
