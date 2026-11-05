import React from "react";
import { PhoneOff } from "lucide-react";

// Neutral placeholder for widgets that need call data, which arrives once
// calling is live. Keeps a new workspace looking intentional, not broken.
const NoCallData = ({ message = "Metrics appear here after your first calls.", className = "" }) => (
  <div className={`flex flex-col items-center justify-center text-center gap-2 py-8 ${className}`}>
    <div className="h-10 w-10 rounded-xl bg-light-gray flex items-center justify-center text-light-black">
      <PhoneOff className="h-5 w-5" />
    </div>
    <p className="text-sm font-semibold text-dark-black/70">No call data yet</p>
    <p className="text-xs text-light-black max-w-[260px]">{message}</p>
  </div>
);

export default NoCallData;
