"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Compass } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

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

const ChangePlaybookModal = ({ isOpen = false, onClose = () => {}, onSelect = () => {}, playbooks = [], activeId }) => {
  // null = nothing picked yet in this opening, so the active playbook shows as selected
  const [pickedId, setPickedId] = useState(null);
  const selectedId = pickedId ?? activeId;
  // Usable playbooks first; premium ones not yet bought are listed but locked
  const options = [...playbooks].sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));

  const close = useCallback(() => {
    setPickedId(null);
    onClose();
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

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

  const handleConfirm = () => {
    const selected = options.find((p) => p.id === selectedId);
    if (selected && selected.id !== activeId) {
      onSelect(selected);
    }
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="change-backdrop"
            className="fixed inset-0 z-999 bg-dark-black/50 backdrop-blur-sm h-screen"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            key="change-modal"
            className="fixed inset-0 z-[999] flex items-center justify-center p-5 sm:p-6 pointer-events-none"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl pointer-events-auto flex flex-col max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={close}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-light-black hover:text-dark-black hover:bg-white transition-colors z-20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="shrink-0 px-6 pt-6 pb-4 border-b border-light-gray">
                <Title variant="small" className="!text-lg !font-bold !text-dark-black">
                  Change Playbook
                </Title>
                <Text variant="small" className="text-light-black mt-0.5">
                  Select a playbook to change your AI&apos;s prompting style and conversation approach.
                </Text>
              </div>

              {/* Scrollable Playbook List */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-2">
                {options.map((pb) => {
                  const isSelected = selectedId === pb.id;

                  return (
                    <button
                      key={pb.id}
                      type="button"
                      disabled={!pb.isAvailable}
                      onClick={() => setPickedId(pb.id)}
                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center gap-4 disabled:cursor-not-allowed disabled:opacity-55 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-light-gray bg-white hover:border-medium-black/20 hover:shadow-sm"
                      }`}
                    >
                      {/* Avatar / Icon */}
                      {pb.avatarUrl ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-light-gray shrink-0">
                          <Image src={pb.avatarUrl} alt={pb.title} fill className="object-cover" />
                        </div>
                      ) : pb.iconLetter ? (
                        <div className="w-12 h-12 rounded-xl bg-dark-black flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {pb.iconLetter}
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                          <Compass className="w-5 h-5" />
                        </div>
                      )}

                      {/* Text Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Text variant="small" className="!font-bold !text-dark-black">
                            {pb.title}
                          </Text>
                          {pb.isActive && (
                            <span className="px-1.5 py-0.5 bg-light-teal text-primary text-[9px] font-bold rounded tracking-wide">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <Text variant="smaller" className="text-light-black mt-0.5">
                          {pb.isAvailable ? (pb.subtitle || pb.author || "") : pb.kind === "premium" ? `Premium · ${pb.price} · purchase required` : "Draft · publish it to use"}
                        </Text>
                      </div>

                      {/* Radio Indicator */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? "border-primary bg-primary" : "border-light-gray bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-4 border-t border-light-gray flex items-center justify-end gap-3 bg-white">
                <button
                  type="button"
                  onClick={close}
                  className="px-5 py-2 rounded-xl border-2 border-light-gray text-medium-black font-semibold text-xs hover:bg-light-gray transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  Apply Playbook
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChangePlaybookModal;
