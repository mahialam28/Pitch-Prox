"use client";

import React from "react";
import Link from "next/link";
import { Phone, Sliders, RefreshCw, Rocket } from "lucide-react";

// Plain link: leaving the page needs no state reset (resetting first could cancel the navigation)
const WhatsNextCard = () => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-light-gray shadow-sm w-full h-full flex flex-col justify-between gap-4 sm:gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-primary">
          <Rocket className="h-5 w-5" />
          <h4 className="font-bold text-dark-black/80 text-sm">What&apos;s next?</h4>
        </div>
        
        <ul className="flex flex-col gap-4 text-xs text-dark-black/80 font-medium">
          <li className="flex gap-3">
            <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>You can now make calls with real-time AI guidance.</span>
          </li>
          <li className="flex gap-3">
            <Sliders className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Your prompts will adapt to your style automatically.</span>
          </li>
          <li className="flex gap-3">
            <RefreshCw className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>Recalibrate anytime to fine tune your experience.</span>
          </li>
        </ul>
      </div>

      <Link 
        href="/user/dashboard"
        className="w-full py-2.5 text-center border border-primary text-primary font-semibold text-xs rounded-xl hover:bg-primary/5 transition-colors shadow-sm cursor-pointer block"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default WhatsNextCard;
