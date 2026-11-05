"use client";

import React from "react";
import { Sparkles, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

const ResultsBanner = () => {
  const router = useRouter();

  return (
    <div className="relative w-full bg-light-teal/50 border border-primary/30 rounded-2xl p-4 sm:p-5 transition-all duration-200">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Side: Icon and Copy */}
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
            <Sparkles className="h-5 w-5 fill-primary/30" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-sm font-bold text-dark-teal sm:text-base">
              Calibration complete
            </h3>
            <p className="text-xs text-medium-black sm:text-sm leading-relaxed">
              Your AI coach profile is ready. You can now make calls with real-time guidance.
            </p>
          </div>
        </div>

        {/* Right Side: CTA Button */}
        <div className="flex items-center gap-4 border-t border-primary/20 pt-3 sm:border-none sm:pt-0 sm:ml-auto">
          <button
            onClick={() => router.push("/user/live-calling")}
            className="w-full sm:w-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-medium-teal transition-colors cursor-pointer shadow-sm"
          >
            <Phone className="h-4 w-4 fill-white shrink-0" />
            Start Making Calls
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsBanner;
