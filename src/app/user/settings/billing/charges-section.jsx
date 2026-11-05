"use client";

import React from "react";
import { FiPhoneCall } from "react-icons/fi";
import Text from "@/components/texts/text";

const Charges = ({ subscription }) => {
  const plan = subscription?.plan;
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm space-y-5">
      {/* Header */}
      <div>
        <Text variant="regular" className="font-bold text-dark-black">
          Overages & Charges
        </Text>
        <Text variant="smaller" className="mt-0.5 text-medium-black">
          What happens when you exceed your plan limits.
        </Text>
      </div>

      {/* Charge Item Box */}
      <div className="p-4 rounded-xl bg-light-gray/60 border border-light-gray flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary flex-shrink-0">
            <FiPhoneCall className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-dark-black">
            Calls Overage
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs font-extrabold text-dark-black">
            {plan ? (plan.isTrial ? "Not available" : plan.overagePerCall) : "—"}
          </span>
          <span className="text-xs text-medium-black font-medium"> / per call</span>
        </div>
      </div>

      {/* Info Notice */}
      <p className="text-[11px] text-light-black italic">
        Overages are billed at the end of each billing cycle.
      </p>
    </div>
  );
};

export default Charges;