"use client";

import React, { useState } from "react";
import { Bell, X } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

// ── Animation Variants ──────────────────────────────────────────────────────

const ctaVariants = {
  hover: {
    scale: 1.04,
    transition: { type: "spring", stiffness: 400, damping: 10 },
  },
  tap: { scale: 0.96 },
};

const dismissVariants = {
  hover: { scale: 1.1, rotate: 4 },
  tap: { scale: 0.9 },
};

const Calibration = () => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleStartCalibration = () => {
    router.push("/user/calibration");
  };

  return (
    <div className="relative w-full bg-[#FFF9F2] border border-[#FFD9B3] rounded-2xl p-4 sm:p-5 transition-all duration-200">
      
      {/* Dismiss X — top-right on mobile only */}
      <motion.button
        onClick={() => setIsVisible(false)}
        variants={dismissVariants}
        whileHover="hover"
        whileTap="tap"
        className="absolute top-3 right-3 p-1 rounded-lg text-light-black hover:bg-slate-200/50 hover:text-medium-black transition-colors cursor-pointer sm:hidden"
        aria-label="Dismiss alert"
      >
        <X className="h-5 w-5 stroke-[2.5]" />
      </motion.button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Left Side: Icon and Copy */}
        <div className="flex items-start gap-4 sm:items-center">
          {/* Bell Icon Wrapper */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFEAD4] text-[#FF8000]">
            <Bell className="h-6 w-6 fill-[#FF8000]" />
          </div>
          
          {/* Text Container */}
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-dark-teal sm:text-base">
              Calibration required to unlock calling
            </h3>
            <p className="text-xs text-medium-black sm:text-sm">
              Complete calibration before your first live call. Calling remains locked until calibration is completed successfully.
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button + Dismiss (desktop only) */}
        <div className="flex items-center justify-between gap-4 border-t border-[#FFEAD4] pt-3 sm:border-none sm:pt-0 sm:justify-end">
          <motion.button
            onClick={handleStartCalibration}
            variants={ctaVariants}
            whileHover="hover"
            whileTap="tap"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FF8000] text-sm font-semibold text-white hover:bg-[#E67300] whitespace-nowrap shadow-sm cursor-pointer"
          >
            Start Calibration
          </motion.button>

          {/* Dismiss X — inline on desktop only */}
          <motion.button
            onClick={() => setIsVisible(false)}
            variants={dismissVariants}
            whileHover="hover"
            whileTap="tap"
            className="hidden sm:flex p-1 rounded-lg text-light-black hover:bg-slate-200/50 hover:text-medium-black transition-colors cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </motion.button>
        </div>

      </div>
    </div>
  );
};

export default Calibration;