"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Info,
  Gift,
  Sparkles,
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
    transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 99,
    annualPrice: 89,
    description: "Core live call guidance for solo agents.",
    buttonLabel: "Start Calling Smarter",
    theme: "light",
    features: [
      "150 calls per month",
      "5 detailed call reports",
      "AI Teleprompter + Calibration",
      "Analytics, AI Training + CRM",
      "App Integrations + Playbook Store",
      "Email Support",
      "Extra calls billed at $0.45/call",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 199,
    annualPrice: 179,
    description: "More volume, more reports, and more control.",
    buttonLabel: "Current Plan",
    theme: "dark",
    badge: "★ MOST POPULAR",
    isPopular: true,
    featuresHeadline: "Everything in Basic, plus:",
    features: [
      "400 calls per month",
      "20 detailed call reports",
      "Create custom playbooks",
      "Priority support",
      "Extra calls billed at $0.45/call",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    monthlyPrice: 349,
    annualPrice: 314,
    description: "Built for high-volume closers and teams.",
    buttonLabel: "Scale With PitchProX",
    theme: "light",
    featuresHeadline: "Everything in Pro, plus:",
    features: [
      "750 calls per month",
      "50 detailed call reports",
      "Dedicated account manager",
      "Early access to new features",
      "Custom volume pathway",
      "Extra calls billed at $0.35/call",
    ],
  },
];

export const ChangePlanModal = ({
  isOpen = false,
  onClose = () => {},
  user = {
    name: "Jennifer Smith",
    company: "Acme Inc.",
    currentPlan: "Premium",
    currentPrice: 499,
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160",
  },
  onConfirm = () => {},
}) => {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "annual"
  const [selectedPlanId, setSelectedPlanId] = useState("pro");
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

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
  const newPrice =
    billingCycle === "monthly"
      ? selectedPlan.monthlyPrice
      : selectedPlan.annualPrice;
  const currentMonthlyPrice = user.currentPrice || 499;
  const priceDiff = currentMonthlyPrice - newPrice;

  const handleConfirmChange = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Plan updated to ${selectedPlan.name} (${billingCycle}) for ${
          user.name || "Jennifer Smith"
        }.`
      );
      if (onConfirm) {
        onConfirm({
          planId: selectedPlanId,
          planName: selectedPlan.name,
          billingCycle,
          price: newPrice,
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
            key="change-plan-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            key="change-plan-card"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[960px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray overflow-hidden z-10 my-auto max-h-[95vh] flex flex-col"
          >
            {/* ── Modal Header: Titles, User Chip, Close ── */}
            <div className="p-5 sm:p-6 pb-4 border-b border-light-gray/60 shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  {/* Category breadcrumb pill */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">
                      CONFIGURATION
                    </span>
                    <span className="text-xs text-light-black font-medium">
                      • Subscription Management
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="text-xl sm:text-2xl font-bold text-dark-black tracking-tight">
                    Change Subscription Plan
                  </h2>
                  <p className="text-xs sm:text-sm text-light-black">
                    Upgrade, downgrade, or switch the billing cycle for{" "}
                    {user.name || "Jennifer Smith"}.
                  </p>

                  {/* User Badge Chip */}
                  <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-light-gray bg-light-gray/25 mt-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-light-gray bg-primary/10 flex items-center justify-center">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name || "User Avatar"}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-primary">
                          {user.initials || "JS"}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-dark-black">
                      {user.name || "Jennifer Smith"}{" "}
                      <span className="font-normal text-light-black">
                        ({user.company || "Acme Inc."})
                      </span>
                    </span>
                    <span className="text-xs text-light-gray font-bold">•</span>
                    <span className="flex items-center gap-1 text-xs text-light-black font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Current Plan:{" "}
                      <strong className="text-dark-black font-semibold">
                        {user.currentPlan || "Premium"}
                      </strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-light-black hover:text-dark-black hover:bg-light-gray/60 transition-colors cursor-pointer shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── Modal Scrollable Body ── */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin">
              {/* 1. Monthly / Annual Billing Toggle */}
              <div className="flex justify-center">
                <div className="p-1 rounded-full bg-light-gray/40 border border-light-gray/60 flex items-center gap-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      billingCycle === "monthly"
                        ? "bg-white text-dark-black shadow-xs"
                        : "text-medium-black hover:text-dark-black"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle("annual")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === "annual"
                        ? "bg-white text-dark-black shadow-xs"
                        : "text-medium-black hover:text-dark-black"
                    }`}
                  >
                    <span>Annual</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-primary/15 text-primary">
                      SAVE 10%
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Three Pricing Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-stretch">
                {PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  const price =
                    billingCycle === "monthly"
                      ? plan.monthlyPrice
                      : plan.annualPrice;

                  if (plan.theme === "dark") {
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`relative rounded-3xl bg-[#0B1E28] text-white flex flex-col justify-between shadow-xl transition-all cursor-pointer hover:ring-2 hover:ring-primary ${
                          isSelected
                            ? "ring-2 ring-primary shadow-primary/20"
                            : "border border-dark-black/40"
                        }`}
                      >
                        {/* Top Most Popular Ribbon */}
                        <div className="bg-primary text-white text-[10px] font-extrabold tracking-widest uppercase py-1.5 text-center rounded-t-3xl shrink-0 flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>MOST POPULAR</span>
                        </div>

                        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                          <div className="space-y-4">
                            {/* Title & Price */}
                            <div>
                              <h3 className="text-base font-bold text-primary">
                                {plan.name}
                              </h3>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                                  ${price}
                                </span>
                                <span className="text-xs text-light-gray/70">
                                  /month
                                </span>
                              </div>
                              <p className="text-xs text-light-gray/80 mt-1 leading-relaxed">
                                {plan.description}
                              </p>
                            </div>

                            {/* Features list */}
                            <div className="space-y-2 pt-2 border-t border-white/10">
                              {plan.featuresHeadline && (
                                <p className="text-xs font-bold text-white/90">
                                  {plan.featuresHeadline}
                                </p>
                              )}
                              <ul className="space-y-2 text-xs">
                                {plan.features.map((feat, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5 stroke-[2.5]" />
                                    <span className="text-white/90 leading-snug">
                                      {feat}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* CTA Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlanId(plan.id);
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                          >
                            {isSelected ? "Current Plan" : "Select Pro Plan"}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // Light Theme Plan Cards (Basic / Elite)
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`rounded-3xl bg-white border flex flex-col justify-between transition-all cursor-pointer hover:border-primary/60 hover:shadow-md ${
                        isSelected
                          ? "border-2 border-primary ring-2 ring-primary/20 shadow-md"
                          : "border-light-gray shadow-xs"
                      }`}
                    >
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                        <div className="space-y-4">
                          {/* Title & Price */}
                          <div>
                            <h3 className="text-base font-bold text-primary">
                              {plan.name}
                            </h3>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-3xl sm:text-4xl font-extrabold text-dark-black tracking-tight">
                                ${price}
                              </span>
                              <span className="text-xs text-light-black">
                                /month
                              </span>
                            </div>
                            <p className="text-xs text-light-black mt-1 leading-relaxed">
                              {plan.description}
                            </p>
                          </div>

                          {/* Features list */}
                          <div className="space-y-2 pt-2 border-t border-light-gray/60">
                            {plan.featuresHeadline && (
                              <p className="text-xs font-bold text-dark-black">
                                {plan.featuresHeadline}
                              </p>
                            )}
                            <ul className="space-y-2 text-xs">
                              {plan.features.map((feat, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-dark-black/70 shrink-0 mt-0.5 stroke-[2.2]" />
                                  <span className="text-dark-black/85 leading-snug">
                                    {feat}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlanId(plan.id);
                          }}
                          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                            isSelected
                              ? "bg-primary text-white shadow-xs"
                              : "border border-primary text-primary hover:bg-light-teal/20"
                          }`}
                        >
                          {plan.buttonLabel}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. Change Summary Box */}
              <div className="p-4 sm:p-4.5 rounded-2xl border border-light-gray bg-light-gray/25 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-dark-black">
                    Change Summary
                  </h4>
                  <p className="text-xs text-dark-black/85 leading-relaxed">
                    You are switching from{" "}
                    <strong className="font-bold text-dark-black">
                      {user.currentPlan || "Premium"}
                    </strong>{" "}
                    to{" "}
                    <strong className="font-bold text-dark-black">
                      {selectedPlan.name}
                    </strong>
                    . Your monthly billing will{" "}
                    {priceDiff >= 0 ? (
                      <>
                        decrease by{" "}
                        <strong className="font-bold text-primary">
                          ${Math.abs(priceDiff).toFixed(2)}
                        </strong>
                      </>
                    ) : (
                      <>
                        increase by{" "}
                        <strong className="font-bold text-rose-600">
                          ${Math.abs(priceDiff).toFixed(2)}
                        </strong>
                      </>
                    )}
                    .
                  </p>
                  <p className="text-[11px] text-light-black">
                    Effective immediately: Your next invoice on Jun 15, 2025 will be
                    updated to the new rate.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Modal Footer ── */}
            <div className="p-4 sm:p-5 bg-light-gray/20 border-t border-light-gray/60 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl border border-light-gray text-xs sm:text-sm font-semibold text-dark-black hover:bg-light-gray/40 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmChange}
                disabled={isSubmitting}
                className="px-6 py-2 rounded-xl bg-primary hover:bg-medium-teal active:scale-[0.98] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating Plan...</span>
                  </>
                ) : (
                  <span>Confirm Change</span>
                )}
              </button>
            </div>

            {/* ── Bottom Promotional Bar ── */}
            <div className="py-2.5 px-4 bg-[#E8F3F5] border-t border-[#D5EAEF] flex items-center justify-center gap-2 text-xs font-medium text-dark-black/85 text-center shrink-0">
              <Gift className="w-4 h-4 text-primary shrink-0" />
              <span>
                <strong>Free Trial:</strong> 10 calls + 1 detailed call report
                included for all new modules.
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChangePlanModal;
