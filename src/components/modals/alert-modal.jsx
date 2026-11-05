"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

// ── Type Config ─────────────────────────────────────────────────────────────

const typeConfig = {
  success: {
    icon: CheckCircle,
    iconBg: "bg-green/10",
    iconColor: "text-green",
    accentBorder: "border-l-green",
    title: "Success",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    accentBorder: "border-l-rose-400",
    title: "Warning",
  },
  error: {
    icon: XCircle,
    iconBg: "bg-red/10",
    iconColor: "text-red",
    accentBorder: "border-l-red",
    title: "Error",
  },
  info: {
    icon: Info,
    iconBg: "bg-light-teal",
    iconColor: "text-primary",
    accentBorder: "border-l-primary",
    title: "Info",
  },
};

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

const AlertModal = ({
  isOpen = false,
  onClose = () => {},
  type = "info",
  title,
  message = "",
  confirmLabel = "Got it",
  onConfirm,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Smooth body scroll lock — compensates for scrollbar removal
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
      // Re-calculate scrollbar width in case it changed
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

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — appears instantly */}
          <motion.div
            key="alert-backdrop"
            className="fixed inset-0 z-999 bg-dark-black/50 h-screen"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Modal — springs in smoothly */}
          <motion.div
            key="alert-modal"
            className="fixed inset-0 z-999 flex items-center justify-center p-4 pointer-events-none"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className={`relative w-full max-w-sm rounded-2xl bg-white shadow-lg shadow-dark-black/10 border border-light-gray pointer-events-auto ${config.accentBorder} border-l-2`}
              onClick={(e) => e.stopPropagation()}
            >

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg text-light-black hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer z-10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="flex flex-col items-center text-center gap-4 px-6 pb-6 pt-5">
                {/* Icon with modern ring */}
                <div className={`relative flex h-14 w-14 items-center justify-center rounded-full ${config.iconBg} ${config.iconColor} ring-4 ring-white`}>
                  <Icon className="h-7 w-7" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-dark-black font-secondary leading-snug">
                  {title || config?.title || ""}
                </h3>

                {/* Message */}
                <p className="text-sm text-medium-black leading-relaxed max-w-xs">
                  {message}
                </p>

                {/* Confirm Button */}
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className="mt-2 w-full px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-medium-teal active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
