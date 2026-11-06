"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Receipt,
  RotateCcw,
  CreditCard,
  Wallet,
  Info,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 32, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

const REFUND_REASON_OPTIONS = [
  { value: "Customer Satisfaction / Goodwill", label: "Customer Satisfaction / Goodwill" },
  { value: "Accidental Overcharge / Duplicate", label: "Accidental Overcharge / Duplicate" },
  { value: "Service Outage / Technical Issue", label: "Service Outage / Technical Issue" },
  { value: "Subscription Cancellation / Downgrade", label: "Subscription Cancellation / Downgrade" },
  { value: "Billing Dispute Resolution", label: "Billing Dispute Resolution" },
  { value: "Other", label: "Other" },
];

export const IssueRefundModal = ({
  isOpen = false,
  onClose = () => {},
  user = {
    name: "Jennifer Smith",
    company: "Acme Inc.",
    accountId: "ACC-001234",
    plan: "Premium Plan",
    status: "Active",
    price: "$499.00",
    currentPrice: 499,
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160",
    initials: "JS",
  },
  onConfirm = () => {},
}) => {
  const maxRefundable = user.currentPrice || 499.0;
  const [refundType, setRefundType] = useState("full"); // "full" | "partial"
  const [refundAmount, setRefundAmount] = useState(maxRefundable.toFixed(2));
  const [refundMethod, setRefundMethod] = useState("original"); // "original" | "credit"
  const [reason, setReason] = useState("Customer Satisfaction / Goodwill");
  const [internalNote, setInternalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The parent remounts this modal (key) each time it opens, so the form starts fresh

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Body scroll lock
  const lockScroll = useCallback(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, []);

  useEffect(() => {
    if (isOpen) {
      lockScroll();
      return () => unlockScroll();
    } else {
      unlockScroll();
    }
  }, [isOpen, lockScroll, unlockScroll]);

  const handleRefundTypeChange = (type) => {
    setRefundType(type);
    if (type === "full") {
      setRefundAmount(maxRefundable.toFixed(2));
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setRefundAmount("");
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return;
    if (num > maxRefundable) {
      setRefundAmount(maxRefundable.toFixed(2));
      return;
    }
    setRefundAmount(val);
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const amountNum = parseFloat(refundAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid refund amount greater than $0.00.");
      return;
    }
    if (amountNum > maxRefundable) {
      toast.error(`Refund amount cannot exceed $${maxRefundable.toFixed(2)}.`);
      return;
    }

    setIsSubmitting(true);
    const destinationText = refundMethod === "original" ? "the original payment method" : "the account credit balance";
    Promise.resolve(onConfirm?.({ type: refundType, amount: amountNum, method: refundMethod, reason, internalNote }))
      .then(() => {
        toast.success(`Refund of $${amountNum.toFixed(2)} recorded for ${user.name} (to ${destinationText}).`);
        onClose();
      })
      .catch(() => {
        /* reported by the caller */
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="refund-modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            key="refund-modal-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[540px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
          >
            {/* ── Modal Header ── */}
            <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-light-gray/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200/60 flex items-center justify-center shadow-xs">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-dark-black tracking-tight">
                    Issue Refund
                  </h2>
                  <p className="text-xs text-light-black mt-0.5">
                    Process a full or partial refund for {user.name || "Jennifer Smith"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-light-black hover:text-dark-black hover:bg-light-gray/60 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Modal Body (Scrollable) ── */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4.5 scrollbar-thin">
              {/* 1. User & Recent Transaction Card */}
              <div className="p-4 rounded-2xl bg-[#F8FAFB] border border-light-gray/80 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-light-gray bg-primary/10 flex items-center justify-center">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || "User Avatar"}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="font-bold text-xs text-primary">
                          {user.initials || "JS"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-dark-black truncate">
                        {user.name || "Jennifer Smith"}
                      </p>
                      <p className="text-[11px] text-light-black truncate">
                        {user.company || "Acme Inc."} • {user.accountId || "ACC-001234"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 shrink-0">
                    Active
                  </span>
                </div>

                <div className="pt-2.5 border-t border-light-gray/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-light-black tracking-wider block">
                      Last Invoice
                    </span>
                    <span className="font-bold text-dark-black">#INV-2025-0515</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-light-black tracking-wider block">
                      Charge Amount
                    </span>
                    <span className="font-bold text-dark-black">${maxRefundable.toFixed(2)}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-light-black tracking-wider block">
                      Payment Method
                    </span>
                    <span className="font-medium text-dark-black flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-light-black" />
                      VISA •••• 4242
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Refund Type Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase block">
                  REFUND TYPE
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRefundTypeChange("full")}
                    className={`py-3 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                      refundType === "full"
                        ? "border-2 border-primary bg-primary/5 text-primary shadow-2xs"
                        : "border-light-gray bg-white text-dark-black/80 hover:border-primary/40 hover:bg-light-gray/20"
                    }`}
                  >
                    <span>Full Refund</span>
                    <span className="text-sm font-bold text-dark-black">
                      ${maxRefundable.toFixed(2)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRefundTypeChange("partial")}
                    className={`py-3 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                      refundType === "partial"
                        ? "border-2 border-primary bg-primary/5 text-primary shadow-2xs"
                        : "border-light-gray bg-white text-dark-black/80 hover:border-primary/40 hover:bg-light-gray/20"
                    }`}
                  >
                    <span>Partial Refund</span>
                    <span className="text-xs font-normal text-light-black">
                      Custom Amount
                    </span>
                  </button>
                </div>
              </div>

              {/* 3. Refund Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase">
                    REFUND AMOUNT ($)
                  </label>
                  <span className="text-[11px] text-light-black">
                    Max refundable: <strong>${maxRefundable.toFixed(2)}</strong>
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-light-black">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={maxRefundable}
                    disabled={refundType === "full"}
                    value={refundAmount}
                    onChange={handleAmountChange}
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold text-dark-black outline-none transition-colors ${
                      refundType === "full"
                        ? "bg-light-gray/30 border-light-gray text-dark-black cursor-not-allowed"
                        : "bg-white border-light-gray focus:border-primary"
                    }`}
                  />
                </div>
              </div>

              {/* 4. Refund Destination / Method */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase block">
                  REFUND DESTINATION
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRefundMethod("original")}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 text-left ${
                      refundMethod === "original"
                        ? "border-2 border-primary bg-primary/5 text-primary shadow-2xs"
                        : "border-light-gray bg-white text-dark-black/80 hover:border-primary/40 hover:bg-light-gray/20"
                    }`}
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-bold text-dark-black text-xs leading-tight">
                        Original Card
                      </p>
                      <p className="text-[10px] text-light-black mt-0.5">
                        VISA •••• 4242
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRefundMethod("credit")}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 text-left ${
                      refundMethod === "credit"
                        ? "border-2 border-primary bg-primary/5 text-primary shadow-2xs"
                        : "border-light-gray bg-white text-dark-black/80 hover:border-primary/40 hover:bg-light-gray/20"
                    }`}
                  >
                    <Wallet className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-bold text-dark-black text-xs leading-tight">
                        Account Credit
                      </p>
                      <p className="text-[10px] text-light-black mt-0.5">
                        Apply to balance
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 5. Reason for Refund */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase block">
                  REASON FOR REFUND
                </label>
                <Dropdown
                  items={REFUND_REASON_OPTIONS}
                  selected={reason}
                  onSelect={(val) => setReason(val)}
                  variant="small"
                  className="w-full"
                />
              </div>

              {/* 6. Administrative Internal Note */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase block">
                  INTERNAL NOTE (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add context or ticket reference for this refund..."
                  className="w-full p-3 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black/60 outline-none focus:border-primary transition-colors resize-none font-medium"
                />
              </div>

              {/* 7. Timeline Info Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {refundMethod === "original"
                    ? "Refunds issued to original payment methods take 5-10 business days to appear on the customer's bank statement."
                    : "Account credits are applied immediately and will be deducted from the user's next scheduled invoice."}
                </p>
              </div>

              {/* ── Modal Footer ── */}
              <div className="pt-2 border-t border-light-gray/60 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-semibold text-dark-black hover:bg-light-gray/40 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing Refund...</span>
                    </>
                  ) : (
                    <span>
                      Issue Refund of ${parseFloat(refundAmount || "0").toFixed(2)}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IssueRefundModal;
