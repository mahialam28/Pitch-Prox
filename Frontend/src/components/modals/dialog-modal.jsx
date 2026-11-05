"use client";

import React, { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Shared shell for the settings-style dialogs in the design:
// a header with title + subtitle, a padded body and a grey footer for the actions.

const WIDTHS = {
  sm: "max-w-[480px]",
  md: "max-w-[560px]",
  lg: "max-w-[640px]",
  xl: "max-w-[720px]",
  "2xl": "max-w-[900px]",
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 32, mass: 0.65 } },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.12, ease: "easeIn" } },
};

export const DialogButton = ({ variant = "secondary", className = "", disabled, children, ...props }) => {
  const styles = {
    primary: "bg-primary text-white hover:bg-medium-teal border border-primary",
    danger: "bg-red-600 text-white hover:bg-red-700 border border-red-600",
    secondary: "bg-white text-dark-black/80 border border-gray-400 hover:bg-light-gray",
  };
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// True only in the browser, so the portal never renders during SSR
const subscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(subscribe, () => true, () => false);

const DialogModal = ({ isOpen, onClose, title, subtitle, size = "md", footer, children, bodyClassName = "" }) => {
  const isClient = useIsClient();
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen, onClose]);

  // Rendered into <body> so animated (transformed) parents can't shift the fixed overlay
  if (!isClient) return null;
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="dialog-backdrop"
            className="fixed inset-0 z-999 bg-dark-black/50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(event) => {
              // Portal events still bubble to React parents; keep backdrop clicks inside the dialog
              event.stopPropagation();
              onClose?.();
            }}
          />
          <motion.div
            key="dialog-panel"
            className="fixed inset-0 z-999 flex items-center justify-center p-4 pointer-events-none"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={typeof title === "string" ? title : undefined}
              className={`w-full ${WIDTHS[size] ?? WIDTHS.md} max-h-[calc(100vh-2rem)] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto font-secondary`}
              onClick={(event) => event.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 p-6 border-b border-gray-200 shrink-0">
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-semibold leading-8 text-dark-black">{title}</h2>
                  {subtitle && <p className="text-sm leading-5 text-medium-black mt-1">{subtitle}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1 -m-1 rounded-lg text-dark-black/70 hover:text-dark-black hover:bg-light-gray transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className={`p-6 overflow-y-auto ${bodyClassName}`}>{children}</div>

              {/* Footer */}
              {footer && (
                <div className="flex flex-wrap items-center justify-end gap-4 px-6 py-5 bg-[#f2f4f6] border-t border-gray-200 shrink-0">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default DialogModal;
