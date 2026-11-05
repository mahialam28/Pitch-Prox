"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

export const PLAYBOOK_STEPS = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Style & Voice" },
  { id: 3, name: "Conversation Flow" },
  { id: 4, name: "Objection Handling" },
  { id: 5, name: "Resources & Scripts" },
  { id: 6, name: "AI Prompt Framework" },
  { id: 7, name: "Review & Publish" },
];

const PlaybookStepper = ({ currentStep = 1, onStepClick = () => {} }) => {
  const stepperRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateStepperArrows = useCallback(() => {
    const el = stepperRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollStepper = useCallback(
    (direction) => {
      const el = stepperRef.current;
      if (!el) return;
      el.scrollBy({
        left: direction === "left" ? -240 : 240,
        behavior: "smooth",
      });
      setTimeout(updateStepperArrows, 350);
    },
    [updateStepperArrows]
  );

  useEffect(() => {
    const el = stepperRef.current;
    if (!el) return;
    updateStepperArrows();
    const observer = new ResizeObserver(() => updateStepperArrows());
    observer.observe(el);
    el.addEventListener("scroll", updateStepperArrows, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateStepperArrows);
    };
  }, [updateStepperArrows]);

  useEffect(() => {
    const el = stepperRef.current;
    if (!el || currentStep < 1) return;
    const child = el.children?.[0]?.children?.[(currentStep - 1) * 2];
    if (child) {
      child.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    setTimeout(updateStepperArrows, 400);
  }, [currentStep, updateStepperArrows]);

  return (
    <div className="relative w-full bg-white rounded-2xl border border-light-gray p-4 sm:p-5 shadow-sm">
      {/* Scroll Left Arrow */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollStepper("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 shadow-md border border-light-gray flex items-center justify-center cursor-pointer group"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
        </button>
      )}

      {/* Scroll Right Arrow */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollStepper("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/95 shadow-md border border-light-gray flex items-center justify-center cursor-pointer group"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
        </button>
      )}

      <div
        ref={stepperRef}
        className="w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x snap-mandatory"
      >
        <div className="flex items-center w-full min-w-max px-2 py-1 justify-between gap-1 sm:gap-2">
          {PLAYBOOK_STEPS.map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <motion.div
                  className="flex flex-col items-center gap-2 cursor-pointer group shrink-0 snap-center min-w-[90px] sm:min-w-[110px]"
                  onClick={() => onStepClick(step.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="relative">
                    <motion.div
                      animate={
                        isCompleted || isCurrent
                          ? { backgroundColor: "#0EADAB", color: "#FFFFFF" }
                          : { backgroundColor: "#F5F5F5", color: "#8E9E9D" }
                      }
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "ring-4 ring-primary/20 shadow-sm"
                          : "group-hover:bg-light-gray"
                      }`}
                    >
                      <span>{step.id}</span>
                    </motion.div>

                    {/* Small Checkmark Badge */}
                    {(isCompleted || isCurrent) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border border-primary text-primary flex items-center justify-center shadow-2xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-xs text-center leading-tight transition-colors ${
                      isCurrent
                        ? "text-primary font-bold"
                        : isCompleted
                        ? "text-primary font-semibold"
                        : "text-light-black font-normal group-hover:text-medium-black"
                    }`}
                  >
                    {step.name}
                  </span>
                </motion.div>

                {/* Connector Line */}
                {idx < PLAYBOOK_STEPS.length - 1 && (
                  <div className="flex-1 min-w-[20px] sm:min-w-[36px] max-w-[80px] h-[2px] self-center -mt-6 bg-light-gray relative overflow-hidden rounded-full">
                    <motion.div
                      className="absolute inset-0 bg-primary"
                      initial={false}
                      animate={{
                        width: step.id < currentStep ? "100%" : "0%",
                      }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlaybookStepper;
