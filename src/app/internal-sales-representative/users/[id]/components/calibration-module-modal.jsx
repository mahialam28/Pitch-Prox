"use client";

import React from "react";
import { X, Sparkles, Play, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function CalibrationModuleModal({
  isOpen = false,
  onClose = () => {},
  module = null,
}) {
  if (!isOpen || !module) return null;

  const Icon = module.icon || Sparkles;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-light-gray flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-2xl border shrink-0 ${module.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-dark-black">
                  {module.name}
                </h3>
                <p className="text-xs text-light-black">
                  {module.description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-xs">
            {/* Score Strip */}
            <div className="p-4 rounded-2xl bg-light-gray/30 border border-light-gray flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-light-black tracking-wider block">
                  Module Score
                </span>
                <span className="text-2xl font-bold text-emerald-600 font-secondary">
                  {module.score}/100
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-light-black tracking-wider block">
                  Completed On
                </span>
                <span className="font-semibold text-dark-black">
                  {module.completedDate} • {module.completedTime}
                </span>
              </div>
            </div>

            {/* AI Coaching Insights */}
            <div className="p-4 rounded-2xl border border-light-gray bg-white space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-dark-black">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Coach Evaluation & Feedback</span>
              </div>
              <p className="text-medium-black leading-relaxed">
                {module.details?.feedback || "Demonstrated excellent command over the script and cadence."}
              </p>
            </div>

            {/* Sub-Metrics Breakdown */}
            <div className="p-4 rounded-2xl border border-light-gray bg-light-gray/10 space-y-2">
              <span className="text-[10px] font-bold uppercase text-light-black tracking-wider block mb-1">
                Sub-Evaluation Metrics
              </span>
              <div className="divide-y divide-light-gray/60">
                {module.details &&
                  Object.entries(module.details)
                    .filter(([k]) => k !== "feedback")
                    .map(([key, val]) => (
                      <div key={key} className="py-2 flex items-center justify-between">
                        <span className="text-light-black capitalize font-medium">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="font-bold text-dark-black">{val}</span>
                      </div>
                    ))}
              </div>
            </div>

            {/* Audio Snippet */}
            <div className="p-3.5 rounded-xl border border-light-gray bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={() => toast.success("Playing calibration audio recording...")}
                className="p-2 rounded-lg bg-primary text-white hover:bg-medium-teal transition-colors cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <div className="h-1.5 bg-light-gray rounded-full overflow-hidden">
                  <div className="w-1/2 bg-primary h-full rounded-full" />
                </div>
              </div>
              <span className="text-[11px] text-light-black font-mono">01:45 / 03:30</span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:px-6 border-t border-light-gray bg-light-gray/20 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
