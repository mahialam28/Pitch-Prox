"use client";

import React, { useState } from "react";
import { FiShield, FiAlertTriangle } from "react-icons/fi";
import Text from "@/components/texts/text";
import { EnableTwoFactorModal } from "./security-modals";

const TwoFactor = () => {
  const [enableOpen, setEnableOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary flex-shrink-0">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <Text variant="regular" className="font-bold">
              Two-Factor Authentication (2FA)
            </Text>
            <Text variant="smaller" className="mt-0.5">
              Add an extra layer of security to protect your account.
            </Text>
          </div>
        </div>

        {/* Status Badge — left-aligned on mobile */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-500 text-xs font-semibold rounded-full w-fit">
          <FiAlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>2FA is OFF</span>
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <p className="text-xs italic text-medium-black">
          Secure your account with two-factor authentication.
        </p>
        <button
          type="button"
          onClick={() => setEnableOpen(true)}
          className="px-5 py-2.5 bg-primary hover:bg-medium-teal text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          Enable 2FA
        </button>
      </div>

      <EnableTwoFactorModal isOpen={enableOpen} onClose={() => setEnableOpen(false)} />
    </div>
  );
};

export default TwoFactor;