"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const defaultOptions = [
  { value: "Hot Lead", dotClass: "bg-red" },
  { value: "Warm Lead", dotClass: "bg-amber-400" },
  { value: "Cold Lead", dotClass: "bg-light-blue" },
  { value: "Not Interested", dotClass: "bg-medium-black" },
];

const UpdateStatusModal = ({
  isOpen,
  onClose,
  value,
  onSelect,
  options = defaultOptions,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-light-gray max-h-[90vh] overflow-y-auto my-auto"
          >
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer absolute top-5 right-5"
            >
              <X className="w-4 h-4" />
            </button>

            <Title variant="small" className="!text-dark-black/80 font-bold">
              Update Status
            </Title>
            <Text variant="small" className="text-light-black font-medium mt-1">
              Select the lead&apos;s temperature for follow-up.
            </Text>

            <div className="space-y-2.5 mt-5">
              {options.map((option) => {
                const isActive = value === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSelect(option.value);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-light-gray bg-white hover:bg-light-gray/60"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        option.dotClass || "bg-light-black"
                      }`}
                    />
                    <span className="flex-1 text-sm font-semibold text-dark-black">
                      {option.value}
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpdateStatusModal;
