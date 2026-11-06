"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Info,
  Calendar as CalendarIcon,
  Receipt,
  Check,
} from "lucide-react";
import Image from "next/image";
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

// A date `months` from today: { iso: "YYYY-MM-DD", label: "July 15, 2026" }
const monthsAhead = (months) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { iso, label: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) };
};

const DURATION_OPTIONS = [
  { id: "1_month", label: "1 Month", months: 1 },
  { id: "2_months", label: "2 Months", months: 2 },
  { id: "3_months", label: "3 Months", months: 3 },
  { id: "custom", label: "Custom", months: 0 },
];

export const PauseSubscriptionModal = ({
  isOpen = false,
  onClose = () => {},
  user = {
    name: "Jennifer Smith",
    company: "Acme Inc.",
    plan: "Premium Plan",
    status: "Active",
    price: "$499.00",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160",
  },
  onConfirm = () => {},
}) => {
  const [selectedDuration, setSelectedDuration] = useState("1_month");
  const [autoResume, setAutoResume] = useState(true);
  const [resumeDate, setResumeDate] = useState(() => monthsAhead(1).label);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(() => monthsAhead(1).iso);
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

  // Compute calculated resume date
  const handleDurationSelect = (option) => {
    setSelectedDuration(option.id);
    if (option.id === "custom") {
      setIsCustomDateOpen(true);
      return;
    }
    const date = monthsAhead(option.months);
    setResumeDate(date.label);
    setCustomDateInput(date.iso);
    setIsCustomDateOpen(false);
  };

  const handleCustomDateChange = (e) => {
    const val = e.target.value;
    setCustomDateInput(val);
    if (val) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const formatted = d.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        setResumeDate(formatted);
      }
    }
  };

  // The caller saves it (live page) and reports its own errors; the modal stays open on failure
  const handlePauseSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm?.({ duration: selectedDuration, resumeDate, until: customDateInput, autoResume });
      toast.success(`Subscription for ${user.name} paused until ${resumeDate}.`);
      onClose();
    } catch {
      /* reported by the caller */
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            key="pause-modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            key="pause-modal-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[480px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray overflow-hidden z-10 my-auto"
          >
            {/* ── Modal Header ── */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-dark-black tracking-tight">
                Pause Subscription
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-light-black hover:text-dark-black hover:bg-light-gray/60 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Modal Body Content ── */}
            <div className="px-6 pb-6 flex flex-col gap-5">
              {/* 1. User Info Card */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-light-gray/25 border border-light-gray/80 flex items-center justify-between gap-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar image / initials */}
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-light-gray bg-primary/10 flex items-center justify-center">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name || "User Avatar"}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="font-bold text-sm text-primary">
                        {user.initials || "JS"}
                      </span>
                    )}
                  </div>

                  {/* Name, Company & Plan */}
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-dark-black tracking-tight truncate">
                      {user.name || "Jennifer Smith"}
                    </h3>
                    <p className="text-xs text-light-black truncate mt-0.5">
                      <span>{user.company || "Acme Inc."}</span>
                      <span className="mx-1.5 font-bold text-light-gray">•</span>
                      <span className="text-primary font-medium">
                        {user.plan || "Premium Plan"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Active status pill */}
                <span className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  {user.status || "Active"}
                </span>
              </div>

              {/* 2. Pause Duration Segment */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase">
                  PAUSE DURATION
                </label>
                <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
                  {DURATION_OPTIONS.map((opt) => {
                    const isSelected = selectedDuration === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleDurationSelect(opt)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer text-center ${
                          isSelected
                            ? "border-2 border-primary bg-primary/5 text-primary shadow-2xs font-bold"
                            : "border border-light-gray bg-white text-dark-black/80 hover:border-primary/40 hover:bg-light-gray/20"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Info Notice Callout */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#EDF7FA] border border-[#D0EEF4] flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-dark-black/80 leading-relaxed">
                  Pausing your subscription will temporarily stop billing. Your data
                  remains safe, but call functionality will be disabled during the
                  pause period.
                </p>
              </div>

              {/* 4. Resume Date & Auto-Resume Toggle */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[11px] font-bold text-medium-black tracking-wider uppercase">
                  RESUME DATE
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Left: Resume Date Picker / Display */}
                  <div className="relative flex-1">
                    {isCustomDateOpen || selectedDuration === "custom" ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-primary bg-white shadow-2xs">
                        <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                        <input
                          type="date"
                          value={customDateInput}
                          onChange={handleCustomDateChange}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full text-xs font-semibold text-dark-black outline-none bg-transparent cursor-pointer"
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDuration("custom");
                          setIsCustomDateOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-light-gray bg-light-gray/20 hover:bg-light-gray/40 text-xs font-semibold text-dark-black transition-colors text-left cursor-pointer"
                      >
                        <CalendarIcon className="w-4 h-4 text-light-black shrink-0" />
                        <span>{resumeDate}</span>
                      </button>
                    )}
                  </div>

                  {/* Right: Auto-resume toggle */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-1 sm:pl-2 shrink-0">
                    <span className="text-xs font-semibold text-dark-black/90 select-none">
                      Auto-resume billing
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoResume}
                      onClick={() => setAutoResume(!autoResume)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                        autoResume ? "bg-primary" : "bg-light-gray"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5 ${
                          autoResume ? "translate-x-5.5 ml-0" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. Next Invoice Text Note */}
              <div className="pt-2 border-t border-light-gray/60 flex items-center gap-2 text-xs text-medium-black">
                <Receipt className="w-4 h-4 text-light-black shrink-0" />
                <span>
                  Your next invoice will be issued on{" "}
                  <strong className="font-bold text-dark-black">
                    {resumeDate}
                  </strong>{" "}
                  for{" "}
                  <strong className="font-bold text-dark-black">
                    {user.price || "$499.00"}
                  </strong>
                  .
                </span>
              </div>
            </div>

            {/* ── Modal Footer ── */}
            <div className="px-6 py-4 bg-light-gray/20 border-t border-light-gray/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-medium-black hover:text-dark-black transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePauseSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-medium-teal active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Pausing...</span>
                  </>
                ) : (
                  <span>Pause Subscription</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PauseSubscriptionModal;
