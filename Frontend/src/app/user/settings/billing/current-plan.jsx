"use client";

import React, { useState } from "react";
import { FiStar, FiCalendar, FiRepeat, FiArrowUpRight } from "react-icons/fi";
import Text from "@/components/texts/text";
import { formatDate } from "@/lib/client-api";
import { CancelSubscriptionModal, UpgradePlanModal } from "./billing-modals";

const STATUS_LABELS = { trialing: "FREE TRIAL", active: "ACTIVE", canceled: "CANCELED", past_due: "PAST DUE" };

const CurrentPlan = ({ subscription }) => {
  const plan = subscription?.plan;
  const price = subscription?.billingCycle === "annual" ? plan?.priceAnnual : plan?.priceMonthly;
  const [openModal, setOpenModal] = useState(null);
  const closeModal = () => setOpenModal(null);
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-6">
      {/* Plan Details */}
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-md shadow-indigo-200 flex-shrink-0">
          <FiStar className="w-6 h-6 fill-white/20" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-light-black">
              Current Plan
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md">
              {STATUS_LABELS[subscription?.status] ?? "…"}
            </span>
          </div>
          <Text variant="regular" className="font-bold text-dark-black mt-0.5">
            {plan ? `PitchProX ${plan.name}` : "Loading…"}
          </Text>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-extrabold text-dark-black">{price ?? "—"}</span>
            <span className="text-xs text-medium-black font-medium">/ month</span>
          </div>
        </div>
      </div>

      {/* Dates & Cycle Info */}
      <div className="flex items-center gap-8 py-2 2xl:py-0 border-y 2xl:border-y-0 2xl:border-x border-light-gray 2xl:px-8 w-full 2xl:w-auto justify-between 2xl:justify-start">
        <div className="flex items-center gap-3">
          <FiCalendar className="w-5 h-5 text-light-black" />
          <div>
            <span className="text-[10px] font-medium text-light-black block">
              Next billing date
            </span>
            <span className="text-xs font-bold text-dark-black">
              {subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : plan?.isTrial ? "No charge during trial" : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FiRepeat className="w-5 h-5 text-light-black" />
          <div>
            <span className="text-[10px] font-medium text-light-black block">
              Billing cycle
            </span>
            <span className="text-xs font-bold text-dark-black">{subscription?.billingCycle === "annual" ? "Annual" : "Monthly"}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row 2xl:flex-col 2xl:flex-row gap-2.5 w-full 2xl:w-auto sm:justify-end">
        <button
          type="button"
          onClick={() => setOpenModal("upgrade")}
          className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-purple-200 transition-all duration-300 cursor-pointer"
        >
          Upgrade Plan <FiArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setOpenModal("cancel")}
          className="px-6 py-2.5 border border-rose-200 text-rose-500 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-all duration-300 cursor-pointer"
        >
          Cancel Subscription
        </button>
      </div>

      <UpgradePlanModal isOpen={openModal === "upgrade"} onClose={closeModal} subscription={subscription} />
      <CancelSubscriptionModal isOpen={openModal === "cancel"} onClose={closeModal} subscription={subscription} />
    </div>
  );
};

export default CurrentPlan;