"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FiCreditCard, FiFileText, FiChevronRight } from "react-icons/fi";
import Text from "@/components/texts/text";
import { PaymentMethodModal } from "./billing-modals";

const Billing = () => {
  const [paymentOpen, setPaymentOpen] = useState(false);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Payment Method Card */}
      <button
        type="button"
        onClick={() => setPaymentOpen(true)}
        className="w-full text-left bg-white rounded-2xl border border-light-gray p-6 shadow-sm hover:border-primary/50 transition-all duration-300 flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-light-gray border border-light-gray text-light-black group-hover:text-primary transition-all duration-300 flex-shrink-0">
            <FiCreditCard className="w-5 h-5" />
          </div>
          <div>
            <Text variant="small" className="font-bold text-dark-black">
              Payment Method
            </Text>
            <Text variant="smaller" className="mt-0.5 text-light-black">
              Manage your card
            </Text>
          </div>
        </div>
        <FiChevronRight className="w-4 h-4 text-light-black group-hover:text-primary transition-colors duration-300" />
      </button>

      {/* Invoice History Card */}
      <Link
        href="/user/settings/billing/history"
        className="w-full text-left bg-white rounded-2xl border border-light-gray p-6 shadow-sm hover:border-primary/50 transition-all duration-300 flex items-center justify-between group cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-light-gray border border-light-gray text-light-black group-hover:text-primary transition-all duration-300 flex-shrink-0">
            <FiFileText className="w-5 h-5" />
          </div>
          <div>
            <Text variant="small" className="font-bold text-dark-black">
              Invoice History
            </Text>
            <Text variant="smaller" className="mt-0.5 text-light-black">
              View past invoices
            </Text>
          </div>
        </div>
        <FiChevronRight className="w-4 h-4 text-light-black group-hover:text-primary transition-colors duration-300" />
      </Link>

      <PaymentMethodModal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} />
    </div>
  );
};

export default Billing;