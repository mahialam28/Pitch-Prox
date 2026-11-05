"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShieldCheck } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const reportPlans = [
  {
    id: "bundle-10",
    name: "10 Call Reports",
    description: "Best for light calling volume",
    price: "$19",
    perReport: "$1.90 / report",
  },
  {
    id: "bundle-25",
    name: "25 Call Reports",
    description: "Most popular for active reps",
    price: "$39",
    perReport: "$1.56 / report",
    isPopular: true,
  },
  {
    id: "bundle-50",
    name: "50 Call Reports",
    description: "Best value for high volume teams",
    price: "$69",
    perReport: "$1.38 / report",
  },
  {
    id: "bundle-100",
    name: "100 Call Reports",
    description: "Maximum savings for power dialers",
    price: "$119",
    perReport: "$1.19 / report",
  },
];

const PurchaseMoreModal = ({ isOpen, onClose }) => {
  const [selectedId, setSelectedId] = useState("bundle-25");

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
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-dark-black/40 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 32, mass: 0.65 }}
          >
            <div
              className="relative w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-2xl pointer-events-auto border border-light-gray max-h-[90vh] flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-1.5 rounded-lg hover:bg-light-gray text-light-black hover:text-dark-black transition-colors z-20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="shrink-0 pr-6">
                <Title variant="small" className="!text-2xl !font-bold !text-dark-black">
                  Purchase More Reports
                </Title>
                <Text variant="small" className="!text-[13px] text-medium-black mt-2 leading-relaxed max-w-md">
                  Unlock detailed AI call analysis, sentiment breakdowns, and advanced coaching insights.
                </Text>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden pt-5 space-y-5">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-dark-black">
                        You&apos;ve used 5 of 10 included reports
                      </span>
                      <span className="text-xs text-light-black font-medium mt-0.5">
                        5 reports remaining this billing cycle
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-light-black font-medium whitespace-nowrap mt-0.5">
                    Reset on July 1, 2026
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[11px] font-bold text-dark-black uppercase tracking-wider">
                    Choose A Bundle
                  </h3>

                  <div className="rounded-2xl border border-light-gray overflow-hidden divide-y divide-light-gray">
                    {reportPlans.map((plan) => {
                      const isSelected = selectedId === plan.id;

                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedId(plan.id)}
                          className={`w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer ${
                            isSelected ? "bg-primary/10" : "bg-white hover:bg-light-gray/60"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                isSelected
                                  ? "border-primary bg-transparent"
                                  : "border-light-gray bg-white"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>

                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-dark-black">
                                {plan.name}
                              </span>
                              <span className="text-xs text-light-black font-normal mt-0.5">
                                {plan.description}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span className="text-sm font-bold text-dark-black">
                              {plan.price}
                            </span>
                            <span className="text-[11px] text-light-black font-medium mt-0.5">
                              {plan.perReport}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-light-black font-medium pt-1">
                  <ShieldCheck className="w-4 h-4 text-light-black shrink-0" />
                  <span>Secure payment • Cancel anytime • Reports never expire</span>
                </div>
              </div>

              <div className="shrink-0 pt-6 mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-full bg-primary hover:bg-medium-teal text-xs font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Continue To Checkout
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PurchaseMoreModal;