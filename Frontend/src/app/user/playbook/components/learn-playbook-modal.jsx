"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Users,
  Rocket,
} from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

// ── Animation Variants ──────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.65 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

// ── Component ───────────────────────────────────────────────────────────────

const LearnPlaybookModal = ({ isOpen = false, onClose = () => {} }) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Scroll lock
  const lockScroll = useCallback(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
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
      const handleResize = () => {
        const w = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${w}px`;
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        unlockScroll();
      };
    } else {
      unlockScroll();
    }
    return () => unlockScroll();
  }, [isOpen, lockScroll, unlockScroll]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="learn-backdrop"
            className="fixed inset-0 z-999 bg-dark-black/50 backdrop-blur-sm h-screen"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="learn-modal"
            className="fixed inset-0 z-[999] flex items-center justify-center p-5 sm:p-6 pointer-events-none"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl pointer-events-auto flex flex-col max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 sm:right-6 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-light-black hover:text-dark-black hover:bg-white transition-colors z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ── Header ── */}
              <div className="shrink-0 bg-gradient-to-br from-primary/5 via-white to-light-teal/50 px-6 pt-14 sm:pt-16 pb-5 border-b border-light-gray">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-light-teal text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <Title variant="small" className="!text-dark-black">
                      About PitchProX Playbooks
                    </Title>
                    <Text variant="smaller" className="text-light-black mt-0.5">
                      Intelligent Frameworks for Modern Sales Mastery
                    </Text>
                  </div>
                </div>
              </div>

              {/* ── Scrollable Body ── */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 sm:px-8 pt-7 pb-6">
                {/* AI-Driven Frameworks Section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-6">
                  <div className="md:col-span-8 space-y-3">
                    <Title variant="small" className="!text-dark-black">
                      AI-Driven Frameworks
                    </Title>
                    <Text variant="small" className="text-medium-black leading-relaxed">
                      Playbooks are the DNA of PitchProX AI. They represent specialized frameworks
                      built on battle-tested sales methodologies like SPIN Selling, Challenger Sale,
                      and Sandler. By activating a playbook, you infuse your AI assistant with the
                      specific tone, questioning strategy, and psychological triggers of that methodology.
                    </Text>
                  </div>

                  {/* Graphic / Icon Container */}
                  <div className="md:col-span-4 flex justify-center">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-light-teal/60 border-4 border-light-teal">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-light-teal/80">
                        <HelpCircle className="h-10 w-10 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Benefits Dark Banner */}
                <div className="rounded-2xl bg-dark-black p-6 shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <Text variant="small" className="!font-semibold !text-primary">
                      Key Benefits
                    </Text>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Benefit 1 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                        <Text variant="small" className="!font-bold !text-primary">
                          Higher Conversions
                        </Text>
                      </div>
                      <Text variant="smaller" className="text-white/50 leading-relaxed">
                        Consistency in high-performance dialogue directly impacts your win rates.
                      </Text>
                    </div>

                    {/* Benefit 2 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary shrink-0" />
                        <Text variant="small" className="!font-bold !text-primary">
                          Team Alignment
                        </Text>
                      </div>
                      <Text variant="smaller" className="text-white/50 leading-relaxed">
                        Ensure every rep is speaking the same professional language and following the same path.
                      </Text>
                    </div>

                    {/* Benefit 3 */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Rocket className="w-4 h-4 text-primary shrink-0" />
                        <Text variant="small" className="!font-bold !text-primary">
                          Rapid Onboarding
                        </Text>
                      </div>
                      <Text variant="smaller" className="text-white/50 leading-relaxed">
                        Get new hires closing faster with an AI coach that teaches them the methodology on the job.
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-light-gray bg-white px-6 sm:px-8 py-4">
                <button
                  type="button"
                  onClick={() => console.log("View Store Clicked")}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl border-2 border-light-gray text-medium-black font-semibold text-xs hover:bg-light-gray transition cursor-pointer"
                >
                  View Play book Store
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-medium-teal shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  Got It Thanks
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LearnPlaybookModal;
