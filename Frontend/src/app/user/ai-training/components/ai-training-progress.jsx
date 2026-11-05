"use client";

import React, { useEffect, useState } from "react";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";
import Text from "@/components/texts/text";

export const AiTrainingProgress = ({
  progressPercentage = 46,
  lastUpdated = "July 18, 2026",
  subtitle = "Your AI is learning from your content to deliver personalized guidance.",
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 40;
    const increment = progressPercentage / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= progressPercentage) {
        setAnimatedProgress(progressPercentage);
        clearInterval(interval);
      } else {
        setAnimatedProgress(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [progressPercentage]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm space-y-4"
    >
      {/* Top Row */}
      <motion.div
        custom={0}
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
            className="w-10 h-10 rounded-xl bg-light-teal text-primary flex items-center justify-center shrink-0"
          >
            <Brain className="w-5 h-5" />
          </motion.div>
          <div>
            <h3 className="font-bold text-dark-black/80 text-base">
              Training Progress
            </h3>
            <Text variant="smaller" className="mt-0.5">
              {subtitle}
            </Text>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-right"
        >
          <motion.span
            key={animatedProgress}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-bold text-primary"
          >
            {animatedProgress}%
          </motion.span>
          <span className="text-xs text-light-black font-medium ml-1">
            Complete
          </span>
        </motion.div>
      </motion.div>

      {/* Progress Bar Container */}
      <motion.div
        custom={1}
        variants={itemVariants}
        className="w-full h-8 bg-light-gray rounded-full overflow-hidden p-1 relative"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
          className="h-full bg-primary rounded-full flex items-center justify-center relative overflow-hidden"
        >
          {/* Shimmer effect overlay */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              repeat: Infinity,
              repeatDelay: 3,
              duration: 1.2,
              ease: "easeInOut",
              delay: 1.5,
            }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[20deg]"
          />
          <span className="text-white text-xs font-bold px-2 relative z-10">
            {animatedProgress}%
          </span>
        </motion.div>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        custom={2}
        variants={itemVariants}
        className="text-right"
      >
        <span className="text-xs text-light-black font-medium">
          Last updated: {lastUpdated}
        </span>
      </motion.div>
    </motion.div>
  );
};

export default AiTrainingProgress;