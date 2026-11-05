"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

export const AI_FRAMEWORK_TABS = [
  { id: "framework-builder", label: "Framework Builder" },
  { id: "prompt-variables", label: "Playbook Prompt DNA" },
  { id: "logic-rules", label: "Logic & Rules" },
  { id: "prompt-length", label: "Prompt Length" },
  { id: "safety-guardrails", label: "Safety & Guardrails" },
  { id: "advanced", label: "Advanced" },
];

const AiPromptFrameworkHeader = ({
  activeTab = "framework-builder",
  onTabChange = () => {},
}) => {
  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateTabArrows = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollTabs = useCallback(
    (direction) => {
      const el = tabsRef.current;
      if (!el) return;
      el.scrollBy({
        left: direction === "left" ? -180 : 180,
        behavior: "smooth",
      });
      setTimeout(updateTabArrows, 350);
    },
    [updateTabArrows]
  );

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    updateTabArrows();
    const observer = new ResizeObserver(() => updateTabArrows());
    observer.observe(el);
    el.addEventListener("scroll", updateTabArrows, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateTabArrows);
    };
  }, [updateTabArrows]);

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const activeIdx = AI_FRAMEWORK_TABS.findIndex((t) => t.id === activeTab);
    if (activeIdx !== -1 && el.children[activeIdx]) {
      el.children[activeIdx].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
    setTimeout(updateTabArrows, 400);
  }, [activeTab, updateTabArrows]);

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-5">
      {/* Title Banner */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
          <Sparkles className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-dark-black font-secondary leading-tight">
            AI Prompt Framework
          </h2>
          <p className="text-xs text-medium-black mt-1 font-normal leading-relaxed">
            {activeTab === "prompt-variables"
              ? "Configure the strategic personality layer that shapes how PitchProx AI generates live prompts."
              : activeTab === "logic-rules"
              ? "Define smart condition-action rules that trigger high-converting prompt sequences."
              : activeTab === "prompt-length"
              ? "Control the character limits, pacing, and word counts for real-time prompt delivery."
              : activeTab === "safety-guardrails"
              ? "Protect compliance, filter restricted phrases, and enforce deal guardrails."
              : activeTab === "advanced"
              ? "Fine-tune AI latency, threshold triggers, and real-time behavioral sensitivity."
              : "Configure how PitchProX builds and delivers prompts in real time."}
          </p>
        </div>
      </div>

      {/* Subtabs Bar with Swiper Controls */}
      <div className="relative border-b border-light-gray -mx-5 sm:-mx-6 px-5 sm:px-6">
        {/* Scroll Left Arrow */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollTabs("left")}
            className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 shadow-md border border-light-gray flex items-center justify-center cursor-pointer group hover:bg-white transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors" />
          </button>
        )}

        {/* Scroll Right Arrow */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollTabs("right")}
            className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/95 shadow-md border border-light-gray flex items-center justify-center cursor-pointer group hover:bg-white transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors" />
          </button>
        )}

        <div
          ref={tabsRef}
          className="flex items-center gap-6 sm:gap-8 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth snap-x px-2"
        >
          {AI_FRAMEWORK_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`relative py-3 text-xs sm:text-[13px] font-semibold transition-colors duration-150 whitespace-nowrap cursor-pointer shrink-0 snap-center ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-medium-black hover:text-dark-black"
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="ai-framework-active-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AiPromptFrameworkHeader;

