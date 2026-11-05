"use client";

import React from "react";
import { Slash, Trash2 } from "lucide-react";

export default function DangerZone({
  onSuspendAccount = () => {},
  onDeleteAccount = () => {},
}) {
  return (
    <div className="bg-red-50/40 border border-red-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      {/* Left Title & Subtitle */}
      <div className="flex flex-col">
        <h4 className="text-sm sm:text-base font-bold text-red-600 tracking-tight">
          Danger Zone
        </h4>
        <p className="text-xs text-red-500 font-normal mt-0.5">
          Irreversible and sensitive actions.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onSuspendAccount}
          className="px-4 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Slash className="w-3.5 h-3.5 text-red-500" />
          <span>Suspend Account</span>
        </button>

        <button
          type="button"
          onClick={onDeleteAccount}
          className="px-4 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );
}
