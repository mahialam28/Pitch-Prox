"use client";

import React, { useState } from "react";
import { Layers, Clock, Calendar, RefreshCw, RotateCw, Sparkles, Check } from "lucide-react";
import ConfirmDialog from "@/components/modals/confirm-dialog";

const ResultsOverview = () => {
  const [resetOpen, setResetOpen] = useState(false);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      {/* Left: Overall Circular Score */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm lg:col-span-7 flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
        <div className="relative flex items-center justify-center h-28 w-28 sm:h-40 sm:w-40 shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="8" fill="transparent" />
            <circle cx="50" cy="50" r="40" stroke="#0EADAB" strokeWidth="8" fill="transparent" 
                    strokeDasharray="251.2" strokeDashoffset="35.1" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6">
            <span className="text-[9px] sm:text-xs font-semibold text-light-black uppercase tracking-wider leading-tight flex flex-col">
              <span>Overall</span>
              <span>Score</span>
            </span>
            <span className="text-lg sm:text-3xl font-bold text-dark-black/80 leading-none mt-0.5">86%</span>
          </div>
        </div>

        {/* Overview List Metrics */}
        <div className="flex-1 w-full flex flex-col gap-3 min-w-0">
          <div>
            <h3 className="font-bold text-dark-black/80 text-base sm:text-lg">Great job!</h3>
            <p className="text-xs text-light-black mt-0.5 leading-relaxed">Your calibration is complete and your AI coach is ready to guide you on calls.</p>
          </div>
          <div className="border-t border-light-gray pt-3 flex flex-col gap-2.5 text-xs text-dark-black/80">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 sm:gap-2 text-light-black font-medium"><Layers className="h-4 w-4 text-primary shrink-0" /> Rounds completed</span>
              <span className="font-bold text-dark-black/80 shrink-0">7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 sm:gap-2 text-light-black font-medium"><Clock className="h-4 w-4 text-primary shrink-0" /> Total time</span>
              <span className="font-bold text-dark-black/80 shrink-0">8m 24s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 sm:gap-2 text-light-black font-medium"><Calendar className="h-4 w-4 text-primary shrink-0" /> Completed on</span>
              <span className="font-bold text-dark-black/80 shrink-0">May 16, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: What This Means Segment */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm lg:col-span-5 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5 fill-primary/20" />
            <h4 className="font-bold text-dark-black/80 text-sm">What this means</h4>
          </div>
          <ul className="flex flex-col gap-3 text-xs text-dark-black/80 font-medium">
            <li className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-primary stroke-[3] shrink-0 mt-0.5" />
              <span>Your responses have been analyzed for pace, tone, and delivery.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-primary stroke-[3] shrink-0 mt-0.5" />
              <span>AI prompts will be personalized to your natural style.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-primary stroke-[3] shrink-0 mt-0.5" />
              <span>You&apos;ll receive more accurate, real-time guidance on every call.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4 w-4 text-primary stroke-[3] shrink-0 mt-0.5" />
              <span>You can recalibrate anytime if you want to fine tune your experience.</span>
            </li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          className="flex items-center justify-center gap-2 w-full sm:w-auto self-start px-4 py-2 border border-light-gray text-dark-black/80 hover:bg-light-gray font-semibold text-xs rounded-xl transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-primary" /> Recalibrate
        </button>
      </div>

      {/* Design only: confirming just closes the dialog */}
      <ConfirmDialog
        isOpen={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset calibration?"
        icon={RotateCw}
        iconTone="warning"
        message="You'll go through all 7 calibration rounds again so PitchProX can re-learn your reading speed and style."
        note="Until you finish, AI prompts use default pacing and live calling stays locked."
        confirmLabel="Reset Calibration"
        confirmVariant="primary"
      />
    </div>
  );
};

export default ResultsOverview;