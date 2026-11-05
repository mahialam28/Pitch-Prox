"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoCheckmarkSharp } from "react-icons/io5";
import { HiOutlineGift } from "react-icons/hi2";
import { FaArrowRight } from "react-icons/fa6";
import { cn } from "@/utils.js/cn";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Wrapper from "@/components/wrappers/wrapper";
import ActionButton from "@/components/buttons/action-button";
import Tooltip from "@/components/modals/tooltip";
import { Info } from "lucide-react";

const CALLS_INCLUDED_TOOLTIP =
  "Only live conversations count. Voicemails, unanswered calls, busy or disconnected numbers, fax machines, automated systems, and call-screening services do not count toward your monthly calls. A call is counted only after PitchProX detects a live person and activates real-time guidance.";

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: billingPeriod === "monthly" ? 99 : 89,
      description: "Core live call guidance for solo agents.",
      features: [
        "150 calls per month",
        "5 detailed call reports",
        "AI Teleprompter + Calibration",
        "Analytics, AI Training + CRM",
        "App Integrations + Playbook Store",
        "Email Support",
        "Extra calls billed at $0.45/call",
      ],
      cta: "Start Calling Smarter",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: billingPeriod === "monthly" ? 199 : 179,
      description: "More volume, more reports, and more control.",
      subHeader: "Everything in Basic, plus:",
      features: [
        "400 calls per month",
        "20 detailed call reports",
        "Create custom playbooks",
        "Priority support",
        "Extra calls billed at $0.45/call",
      ],
      cta: "Build Your Call System",
      popular: true,
    },
    {
      id: "elite",
      name: "Elite",
      price: billingPeriod === "monthly" ? 349 : 314,
      description: "Built for high-volume closers and teams.",
      subHeader: "Everything in Pro, plus:",
      features: [
        "750 calls per month",
        "50 detailed call reports",
        "Dedicated account manager",
        "Early access to new features",
        "Custom volume pathway",
        "Extra calls billed at $0.35/call",
      ],
      cta: "Scale With PitchProX",
      popular: false,
    },
  ];

  // Animation variants for card hover (safe - only used via whileHover)
  const cardHoverTransition = {
    type: "spring",
    stiffness: 400,
    damping: 25,
    duration: 0.3,
  };

  return (
    <section id="pricing" className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden bg-light-gray select-none scroll-mt-[100px]">
      {/* Background Glow Elements - Full width */}
      <div className="absolute inset-0 pointer-events-none w-full h-full">
        <motion.div 
          initial={false}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          style={{ opacity: 0, transform: "scale(0.8)" }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#6DDEBF]/10 to-transparent blur-3xl"
        />
        <motion.div 
          initial={false}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          style={{ opacity: 0 }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-radial from-[#0EADAB]/5 to-transparent blur-3xl"
        />
        <motion.div 
          initial={false}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ opacity: 0 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-radial from-[#6DDEBF]/5 to-transparent blur-3xl"
        />
      </div>

      {/* Content Container with padding */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 w-full">
        <Wrapper variant="bottomSmall" className="py-12 sm:py-16 md:py-20 lg:py-24 flex flex-col items-center">
          {/* Badge Indicator */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            style={{ opacity: 0, transform: "translateY(-20px) scale(0.9)" }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-5 text-[11px] sm:text-xs font-semibold tracking-wide text-primary uppercase rounded-full bg-primary/10 border border-primary/20"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Simple, Transparent Pricing
          </motion.div>

          {/* Headings */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring",
              stiffness: 100,
              damping: 20,
              delay: 0.1 
            }}
            style={{ opacity: 0, transform: "translateY(30px)" }}
            className="w-full text-center max-w-2xl mx-auto mb-10 sm:mb-12"
          >
            <Title
              variant="large"
              className="text-[#0B1B2B] font-extrabold tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight"
            >
              Choose the Plan That Fits Your Goals
            </Title>
            <Text variant="regular" className="text-gray-500 mt-3 text-sm sm:text-base max-w-md mx-auto">
              Start free, upgrade anytime, and only pay for what you use.
            </Text>
          </motion.div>

          {/* Toggle Selector - Premium Pill Design */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 25,
              delay: 0.2 
            }}
            style={{ opacity: 0, transform: "translateY(20px) scale(0.95)" }}
            className="relative p-1.5 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-full shadow-lg flex items-center gap-1 mb-12 sm:mb-14 lg:mb-16"
          >
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn(
                "relative px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 z-10 cursor-pointer",
                billingPeriod === "monthly"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {billingPeriod === "monthly" && (
                <motion.div
                  layoutId="activePeriod"
                  className="absolute inset-0 bg-gradient-to-r from-medium-teal to-primary rounded-full -z-10 shadow-md"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">Monthly</span>
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={cn(
                "relative px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 z-10 flex items-center gap-2 cursor-pointer",
                billingPeriod === "annual"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {billingPeriod === "annual" && (
                <motion.div
                  layoutId="activePeriod"
                  className="absolute inset-0 bg-gradient-to-r from-dark-teal to-primary rounded-full -z-10 shadow-md"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">Annual</span>
              <span className={cn(
                "relative z-10 px-2 py-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase rounded-full transition-all duration-300",
                billingPeriod === "annual"
                  ? "bg-white/25 text-white"
                  : "bg-primary/10 text-primary"
              )}>
                Save 10%
              </span>
            </button>
          </motion.div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:w-full md:w-[80%] w-full mx-auto ">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={false}
                whileInView={{ opacity: 1, y: 0, scale: plan.popular ? 1.05 : 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                  delay: index * 0.15,
                }}
                style={{ opacity: 0, transform: "translateY(60px) scale(0.95)" }}
                whileHover={{ y: -12, transition: cardHoverTransition }}
                className={cn(
                  "relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 md:p-8 border cursor-default",
                  plan.popular
                    ? "bg-dark-black border-dark-teal text-white shadow-2xl lg:scale-105 z-20 pt-14 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:to-transparent before:pointer-events-none"
                    : "bg-white border-gray-100 text-gray-900 shadow-md hover:shadow-2xl z-10"
                )}
              >
                {/* Glow border effect for popular card */}
                {plan.popular && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 -z-10"
                  />
                )}

                {/* Pro "Most Popular" Ribbon */}
                {plan.popular && (
                  <motion.div 
                    initial={false}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    style={{ opacity: 0, transform: "translateY(-30px) scale(0.9)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
                    className="absolute top-0 inset-x-0 bg-gradient-to-r from-primary to-secondary text-dark-black py-1.5 text-center text-[10px] tracking-widest font-black uppercase flex items-center justify-center gap-2"
                  >
                    <span className="inline-block animate-pulse">✦</span>
                    MOST POPULAR
                    <span className="inline-block animate-pulse">✦</span>
                  </motion.div>
                )}

                {/* Core Header Content */}
                <div>
                  <motion.span 
                    initial={false}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ opacity: 0, transform: "translateX(-10px)" }}
                    className="text-lg font-bold tracking-tight block mb-4 text-primary"
                  >
                    {plan.name}
                  </motion.span>

                  <div className="flex items-baseline gap-1 mb-2">
                    <motion.span 
                      key={plan.price}
                      initial={false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      style={{ opacity: 0, transform: "translateY(-20px) scale(0.6)" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        duration: 0.6,
                      }}
                      className="text-3xl sm:text-4xl tracking-tight font-bold"
                    >
                      ${plan.price}
                    </motion.span>
                    <span className="text-xs font-medium text-gray-400">/month</span>
                  </div>

                  <p className={cn("text-xs leading-relaxed mb-6", plan.popular ? "text-gray-400" : "text-gray-500")}>
                    {plan.description}
                  </p>

                  <hr className={cn("my-6 border-t", plan.popular ? "border-gray-800" : "border-gray-100")} />

                  {/* Internal section subtitle */}
                  {plan.subHeader && (
                    <p className={cn("text-xs font-bold mb-4", plan.popular ? "text-white" : "text-gray-900")}>
                      {plan.subHeader}
                    </p>
                  )}

                  {/* Checklist Features with staggered animation */}
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature, idx) => (
                      <motion.li 
                        key={idx}
                        initial={false}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        viewport={{ once: true }}
                        style={{ opacity: 0, transform: "translateX(-15px) scale(0.95)" }}
                        transition={{
                          delay: idx * 0.06 + 0.2,
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                          duration: 0.4,
                        }}
                        className="flex items-start gap-3 text-xs leading-tight"
                      >
                        <motion.div
                          initial={false}
                          whileInView={{ scale: 1 }}
                          style={{ transform: "scale(0)" }}
                          transition={{ 
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            delay: idx * 0.05 + 0.2
                          }}
                        >
                          <IoCheckmarkSharp
                            className="w-4 h-4 shrink-0 text-primary mt-0.5"
                            style={{ strokeWidth: "12" }}
                          />
                        </motion.div>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5",
                            plan.popular ? "text-gray-300" : "text-gray-700"
                          )}
                        >
                          <span>{feature}</span>
                          {/^\d+ calls per month$/.test(feature) && (
                            <Tooltip text={CALLS_INCLUDED_TOOLTIP}>
                              <Info
                                tabIndex={0}
                                aria-label="What counts toward my monthly calls"
                                className={cn(
                                  "w-3.5 h-3.5 shrink-0 transition-colors duration-200 hover:text-primary outline-none",
                                  plan.popular ? "text-white/40" : "text-medium-black/70"
                                )}
                              />
                            </Tooltip>
                          )}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ActionButton
                    type="button"
                    text={plan.cta}
                    variant={plan.popular ? "primary" : "outline"}
                    size="small"
                    className={cn(
                      "text-[11px] font-bold tracking-wide transition-all duration-300",
                      plan.popular
                        ? "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-dark-black shadow-lg hover:shadow-xl"
                        : "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white hover:border-primary"
                    )}
                    icon={FaArrowRight}
                    iconPosition="right"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Callout Banner */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ 
              type: "spring",
              stiffness: 150,
              damping: 25,
              delay: 0.4 
            }}
            style={{ opacity: 0, transform: "translateY(30px) scale(0.95)" }}
            className="w-full max-w-3xl mt-12"
          >
            <div className="flex items-center justify-center gap-2.5 py-4 px-6 bg-white border border-gray-100 rounded-2xl shadow-sm text-center hover:shadow-md hover:scale-[1.02] transition-all duration-300">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-primary/10 text-primary text-base"
              >
                <HiOutlineGift />
              </motion.div>
              <p className="text-xs font-extrabold text-[#0B1B2B] tracking-wide">
                Free Trial: <span className="text-primary">10 calls</span> + 1 detailed call report
              </p>
            </div>
          </motion.div>
        </Wrapper>
      </div>
    </section>
  );
};

export default Pricing;