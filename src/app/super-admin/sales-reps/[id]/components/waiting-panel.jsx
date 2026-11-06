import React from "react";
import { PhoneOff } from "lucide-react";

// Shown where a section is built from call data (calls, call reports, AI scores).
// The designed screens for these (calls-tab, reports-tab, performance-tab…) return in phase 7.
export default function WaitingPanel({ title, message = "This appears once calling and the AI provider are connected (client decision).", compact = false }) {
  return (
    <div className={`bg-white rounded-2xl border border-light-gray shadow-xs w-full flex flex-col items-center justify-center text-center gap-2 ${compact ? "p-5" : "p-10"}`}>
      <div className="w-10 h-10 rounded-xl bg-light-gray flex items-center justify-center text-light-black">
        <PhoneOff className="w-5 h-5" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-dark-black/90">{title}</h3>
      <p className="text-xs text-light-black max-w-md leading-relaxed">{message}</p>
    </div>
  );
}
