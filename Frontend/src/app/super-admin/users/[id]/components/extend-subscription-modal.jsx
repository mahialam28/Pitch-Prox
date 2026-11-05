"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar as CalendarIcon,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

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

const DURATION_PRESETS = [
  { id: "30", label: "+30 Days", days: 30 },
  { id: "60", label: "+60 Days", days: 60 },
  { id: "90", label: "+90 Days", days: 90 },
];

const EXTENSION_HISTORY = [
  {
    date: "May 10, 2025",
    duration: "+30 Days",
    extendedBy: "Daniel Miller",
    internalNote: "Promotional extension",
  },
  {
    date: "Feb 15, 2025",
    duration: "+15 Days",
    extendedBy: "System",
    internalNote: "Service outage credit",
  },
];

export const ExtendSubscriptionModal = ({
  isOpen = false,
  onClose = () => {},
  user = {
    name: "Jennifer Smith",
    company: "Acme Inc.",
    plan: "Premium Plan",
    initials: "JS",
    currentExpiration: "June 15, 2025",
    daysRemaining: 30,
  },
  onConfirm = () => {},
}) => {
  const [selectedDuration, setSelectedDuration] = useState("30");
  const [customDays, setCustomDays] = useState(30);
  const [generatePaymentLink, setGeneratePaymentLink] = useState(true);
  const [amountToCharge, setAmountToCharge] = useState("0.00");
  const [internalNote, setInternalNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Calculate new expiration date based on current expiration (June 15, 2025) + customDays
  const getCalculatedExpiration = () => {
    const baseDate = new Date("2025-06-15T00:00:00");
    const addedDays = parseInt(customDays, 10) || 0;
    const newDate = new Date(baseDate.getTime() + addedDays * 24 * 60 * 60 * 1000);
    return newDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePresetSelect = (preset) => {
    setSelectedDuration(preset.id);
    setCustomDays(preset.days);
  };

  const handleCustomDaysChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    const num = parseInt(val, 10) || 0;
    setCustomDays(num);
    const match = DURATION_PRESETS.find((p) => p.days === num);
    setSelectedDuration(match ? match.id : "custom");
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newExp = getCalculatedExpiration();
      if (generatePaymentLink) {
        toast.success(
          `Payment link generated & sent to ${user.name || "Jennifer Smith"}. Expiration extended to ${newExp}.`
        );
      } else {
        toast.success(
          `Subscription extended by ${customDays} days to ${newExp}.`
        );
      }
      if (onConfirm) {
        onConfirm({
          days: customDays,
          newExpiration: newExp,
          generatePaymentLink,
          amountToCharge,
          internalNote,
        });
      }
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="extend-modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            key="extend-modal-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[540px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
          >
            {/* ── Modal Header: User Info & Close ── */}
            <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-light-gray/60 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Initials Circle */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0EADAB] text-white font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-sm">
                  {user.initials || "JS"}
                </div>

                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-dark-black tracking-tight truncate">
                    {user.name || "Jennifer Smith"}
                  </h2>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="text-xs text-light-black">
                      {user.company || "Acme Inc."}
                    </span>
                    <span className="text-light-gray">•</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-primary border border-teal-200/60">
                      {user.plan || "Premium Plan"}
                    </span>
                  </div>
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

            {/* ── Modal Scrollable Body ── */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin">
              {/* 1. Current Expiration & Days Remaining Card */}
              <div className="p-4 rounded-2xl bg-[#F4F9FA] border border-[#D5EBF0] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase">
                    CURRENT EXPIRATION
                  </label>
                  <p className="text-sm sm:text-base font-bold text-dark-black">
                    {user.currentExpiration || "June 15, 2025"}
                  </p>
                </div>

                <div className="h-9 w-px bg-light-gray/80" />

                <div className="space-y-0.5 text-right">
                  <label className="text-[11px] font-bold text-primary tracking-wider uppercase">
                    DAYS REMAINING
                  </label>
                  <p className="text-sm sm:text-base font-bold text-primary">
                    {user.daysRemaining || 30} Days
                  </p>
                </div>
              </div>

              {/* 2. Select Extension Duration Presets */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-dark-black block">
                  Select Extension Duration
                </label>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {DURATION_PRESETS.map((preset) => {
                    const isSelected =
                      selectedDuration === preset.id ||
                      customDays === preset.days;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer text-center ${
                          isSelected
                            ? "border-2 border-primary bg-primary/10 text-primary shadow-2xs"
                            : "border border-teal-300/80 bg-white text-primary hover:bg-teal-50/50"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Custom Duration Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-dark-black block">
                  Custom Duration (Days)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={customDays}
                    onChange={handleCustomDaysChange}
                    className="w-full px-3.5 py-2.5 pr-14 rounded-xl border border-light-gray bg-white text-xs sm:text-sm font-semibold text-dark-black outline-none focus:border-primary transition-colors"
                  />
                  <span className="absolute right-3.5 text-xs font-semibold text-light-black pointer-events-none">
                    Days
                  </span>
                </div>
              </div>

              {/* 4. New Expiration Date Box */}
              <div className="p-4 rounded-2xl bg-[#F0F9FA] border border-[#D5F0F5] flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-[11px] font-bold text-primary tracking-wider uppercase">
                    NEW EXPIRATION DATE
                  </label>
                  <p className="text-sm sm:text-base font-bold text-dark-black">
                    {getCalculatedExpiration()}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white border border-teal-200/60 flex items-center justify-center text-primary shadow-2xs">
                  <CalendarIcon className="w-5 h-5" />
                </div>
              </div>

              {/* 5. Optional Payment Section */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-dark-black block">
                  Optional Payment
                </label>
                <div className="p-4 rounded-2xl border border-light-gray bg-white space-y-3.5">
                  {/* Checkbox row */}
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={generatePaymentLink}
                        onChange={(e) => setGeneratePaymentLink(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          generatePaymentLink
                            ? "bg-primary border-primary text-white"
                            : "border-light-gray bg-white"
                        }`}
                      >
                        {generatePaymentLink && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-dark-black">
                        Generate & Send Payment Link
                      </p>
                      <p className="text-[11px] text-light-black mt-0.5">
                        Send a secure payment link to the user for this extension.
                      </p>
                    </div>
                  </label>

                  {/* Amount to Charge Input */}
                  {generatePaymentLink && (
                    <div className="pt-2 border-t border-light-gray/60 space-y-1.5">
                      <label className="text-xs font-semibold text-medium-black block">
                        Amount to Charge
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-xs font-semibold text-light-black">
                          $
                        </span>
                        <input
                          type="text"
                          value={amountToCharge}
                          onChange={(e) => setAmountToCharge(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3.5 py-2 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 6. Administrative Context */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-bold text-dark-black block">
                  Administrative Context
                </label>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-medium-black block">
                    Internal Note
                  </span>
                  <textarea
                    rows={2}
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Explain the reason for this extension (e.g., Promotional offer, Support compensation)..."
                    className="w-full p-3 rounded-xl border border-light-gray bg-white text-xs text-dark-black placeholder:text-light-black/60 outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>
              </div>

              {/* 7. Extension History Table */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-dark-black block">
                  Extension History
                </label>
                <div className="border border-light-gray rounded-2xl overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-light-gray/30 border-b border-light-gray text-medium-black font-semibold">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3">Extended By</th>
                          <th className="py-2.5 px-3">Internal Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-light-gray/60">
                        {EXTENSION_HISTORY.map((item, idx) => (
                          <tr key={idx} className="hover:bg-light-gray/15">
                            <td className="py-2.5 px-3 font-medium text-dark-black whitespace-nowrap">
                              {item.date}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-50 text-primary border border-teal-200/60">
                                {item.duration}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-medium-black whitespace-nowrap">
                              {item.extendedBy}
                            </td>
                            <td className="py-2.5 px-3 text-light-black text-[11px]">
                              {item.internalNote}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Modal Footer ── */}
            <div className="p-4 sm:p-5 bg-light-gray/20 border-t border-light-gray/60 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-light-gray text-xs sm:text-sm font-semibold text-dark-black hover:bg-light-gray/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-medium-teal active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : generatePaymentLink ? (
                  <span>Send Payment Link</span>
                ) : (
                  <span>Extend Subscription</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ExtendSubscriptionModal;
