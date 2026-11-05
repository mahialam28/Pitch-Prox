"use client";

import React, { useState } from "react";
import { Check, FlaskConical, X, CheckCircle2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const CHECKLIST_ITEMS = [
  "Context inputs configured",
  "Instruction set defined",
  "Response structure set",
  "Example generated",
  "Safety rules enabled",
];

export default function QualityScoreCard() {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const handleRunTest = () => {
    setIsTestModalOpen(true);
    setIsTesting(true);
    setTestResults(null);

    setTimeout(() => {
      setIsTesting(false);
      setTestResults({
        latency: "142ms",
        accuracy: "98.4%",
        safetyScore: "100%",
        adherence: "High",
      });
      toast.success("AI framework benchmark test completed!");
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-5 sm:p-6 shadow-sm space-y-4">
      {/* ── Header ── */}
      <div>
        <h3 className="text-sm sm:text-base font-bold text-dark-black font-secondary">
          Quality Score
        </h3>
      </div>

      {/* ── Score Ring & Label ── */}
      <div className="flex items-center gap-4">
        {/* Radial Circular Badge */}
        <div className="relative w-14 h-14 rounded-full border-4 border-primary/20 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent -rotate-45" />
          <span className="text-xs sm:text-sm font-bold text-dark-black font-secondary">
            90%
          </span>
        </div>

        <div>
          <span className="text-sm sm:text-base font-bold text-primary font-secondary">
            Excellent
          </span>
          <p className="text-[11px] text-light-black">
            Ready for live teleprompter delivery.
          </p>
        </div>
      </div>

      {/* ── Checklist ── */}
      <div className="space-y-2.5 pt-1">
        {CHECKLIST_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-dark-black/85">
            <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span className="text-xs font-medium text-dark-black/80">{item}</span>
          </div>
        ))}
      </div>

      {/* ── Run AI Test Button ── */}
      <button
        type="button"
        onClick={handleRunTest}
        className="w-full py-2.5 rounded-xl border border-light-gray hover:border-primary/50 bg-white hover:bg-teal-50/20 text-medium-black hover:text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer pt-2"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        <span>Run AI Test</span>
      </button>

      {/* ── Test Modal ── */}
      <AnimatePresence>
        {isTestModalOpen && (
          <div
            className="fixed inset-0 z-999 flex items-center justify-center p-4 sm:p-6 bg-dark-black/50 backdrop-blur-xs"
            onClick={() => setIsTestModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-light-gray overflow-hidden relative my-auto p-5 sm:p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-light-gray">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark-black font-secondary">
                      AI Framework Benchmark
                    </h3>
                    <p className="text-xs text-medium-black">
                      Simulated inference execution test.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="p-1 rounded-lg text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isTesting ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 rounded-full border-3 border-primary/20 border-t-primary"
                  />
                  <p className="text-xs text-medium-black font-medium">
                    Testing inference latency and response consistency...
                  </p>
                </div>
              ) : (
                testResults && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>All 5 validation benchmarks passed!</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-xl border border-light-gray bg-light-gray/20">
                        <div className="text-light-black text-[10px]">P95 Latency</div>
                        <div className="font-bold text-dark-black text-sm mt-0.5">
                          {testResults.latency}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-light-gray bg-light-gray/20">
                        <div className="text-light-black text-[10px]">Factual Accuracy</div>
                        <div className="font-bold text-dark-black text-sm mt-0.5">
                          {testResults.accuracy}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-light-gray bg-light-gray/20">
                        <div className="text-light-black text-[10px]">Safety Guardrail</div>
                        <div className="font-bold text-emerald-600 text-sm mt-0.5">
                          {testResults.safetyScore}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-light-gray bg-light-gray/20">
                        <div className="text-light-black text-[10px]">Playbook Adherence</div>
                        <div className="font-bold text-primary text-sm mt-0.5">
                          {testResults.adherence}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
