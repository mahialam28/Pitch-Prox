"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  X,
  FileUp,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Lightbulb,
  Lock,
} from "lucide-react";
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

export const AiGuidelineModal = ({ isOpen = false, onClose = () => {} }) => {
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
            key="guideline-backdrop"
            className="fixed inset-0 z-999 bg-dark-black/50 backdrop-blur-sm h-screen"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="guideline-modal"
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl pointer-events-auto max-h-[85vh] overflow-y-auto p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 sm:right-6 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-light-black hover:text-dark-black hover:bg-white transition-colors z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* ── Content wraps as one scrollable flow ── */}
              <div className="pt-8 sm:pt-10">
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-light-teal text-primary">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-dark-black">
                      AI Training Guidelines
                    </h2>
                    <Text variant="smaller" className="!text-light-black mt-0.5 !tracking-normal">
                      Follow these guidelines to get the best results from your AI training content.
                    </Text>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* 4 Pillars Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Pillar 1 */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-2.5 rounded-2xl bg-light-teal text-primary">
                        <FileUp className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-dark-black/80 text-xs">Be Relevant</h4>
                      <Text variant="extraSmall" className="!text-light-black leading-relaxed !tracking-normal">
                        Upload content that reflects your business, voice, sales methods, offers, and proven strategies.
                      </Text>
                    </div>

                    {/* Pillar 2 */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-2.5 rounded-2xl bg-light-teal text-primary">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-dark-black/80 text-xs">Be Specific</h4>
                      <Text variant="extraSmall" className="!text-light-black leading-relaxed !tracking-normal">
                        The more specific your content, the better the AI can mirror your style and guide conversations.
                      </Text>
                    </div>

                    {/* Pillar 3 */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-2.5 rounded-2xl bg-light-teal text-primary">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-dark-black/80 text-xs">Respect Privacy</h4>
                      <Text variant="extraSmall" className="!text-light-black leading-relaxed !tracking-normal">
                        Do not upload sensitive client information or anything you would not want stored securely.
                      </Text>
                    </div>

                    {/* Pillar 4 */}
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-2.5 rounded-2xl bg-light-teal text-primary">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-dark-black/80 text-xs">Keep It Updated</h4>
                      <Text variant="extraSmall" className="!text-light-black leading-relaxed !tracking-normal">
                        Review and update your content regularly to keep the AI aligned with your current approach.
                      </Text>
                    </div>
                  </div>

                  {/* Content Box Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Best Practices */}
                    <div className="border border-light-gray rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-bold text-dark-black/80 text-sm">
                          Best Practices
                        </h3>
                        <ul className="space-y-2 text-light-black text-xs leading-relaxed list-disc list-inside">
                          <li>Upload high-quality documents, presentations, and call scripts.</li>
                          <li>Share your best performing messages, responses, and offers.</li>
                          <li>Include real call transcripts and objections you commonly handle.</li>
                          <li>Provide past sales data to help the AI learn what works for you.</li>
                          <li>Use a mix of formats: docs, PDFs, videos, spreadsheets, and more.</li>
                        </ul>
                      </div>

                      <div className="p-3 bg-light-teal/80 rounded-xl flex items-center gap-2.5 text-primary text-xs font-semibold mt-2">
                        <Lightbulb className="w-4 h-4 shrink-0" />
                        <span>Your files are analyzed and converted into knowledge the AI can learn from.</span>
                      </div>
                    </div>

                    {/* What Happens Next? */}
                    <div className="bg-light-gray/60 border border-light-gray rounded-2xl p-4 space-y-3">
                      <h3 className="font-bold text-dark-black/80 text-sm">
                        What Happens Next?
                      </h3>
                      <div className="space-y-3 text-xs">
                        <div>
                          <h4 className="font-bold text-dark-black/80">
                            1. We securely process your content
                          </h4>
                          <Text variant="extraSmall" className="!text-light-black mt-0.5 leading-relaxed !tracking-normal">
                            Your files are analyzed and converted into knowledge the AI can learn from.
                          </Text>
                        </div>

                        <div>
                          <h4 className="font-bold text-dark-black/80">
                            2. AI learns your voice and strategies
                          </h4>
                          <Text variant="extraSmall" className="!text-light-black mt-0.5 leading-relaxed !tracking-normal">
                            PitchProX AI identifies patterns, language, and techniques that make you successful.
                          </Text>
                        </div>

                        <div>
                          <h4 className="font-bold text-dark-black/80">
                            3. Real-time personalized guidance
                          </h4>
                          <Text variant="extraSmall" className="!text-light-black mt-0.5 leading-relaxed !tracking-normal">
                            The AI uses what it learned to prompt better responses and help you close more deals.
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Footer ── */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-light-gray pt-6 mt-6">
                <div className="flex items-center gap-2 text-medium-black text-xs font-semibold">
                  <Lock className="w-4 h-4 text-light-black shrink-0" />
                  <span>Secure &amp; private. Your content is only used to train your AI and is never shared.</span>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-medium-teal shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer shrink-0"
                >
                  Got It
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AiGuidelineModal;
