"use client";

import React from "react";
import { Plus, Check, Settings, Pencil, HelpCircle } from "lucide-react";

export const initialPlansData = [
  {
    id: "free-trial",
    name: "Free Trial",
    status: "Active",
    price: "$0",
    period: "7 Days",
    isCustom: false,
    isPopular: false,
    annualPrice: null,
    discountBadge: null,
    features: [
      "10 Calls",
      "1 Report",
      "1 Calibration",
      "Limited Playbook Access",
    ],
    overage: null,
    actionType: "trial-rules",
    actionLabel: "Manage Trial Rules",
    actionIcon: Settings,
    buttonStyle:
      "border border-light-gray hover:bg-light-gray/40 text-dark-black/80",
  },
  {
    id: "basic",
    name: "Basic",
    status: "Active",
    price: "$99",
    period: "/month",
    isCustom: false,
    isPopular: false,
    annualPrice: "$948 /year",
    discountBadge: "Save 20%",
    features: [
      "150 Calls / month",
      "1 Report / month",
      "1 Calibration",
      "Standard Support",
    ],
    overage: "$0.35 per additional call",
    actionType: "edit-plan",
    actionLabel: "Edit Plan",
    actionIcon: Pencil,
    buttonStyle:
      "border border-light-gray hover:bg-light-gray/40 text-dark-black/80",
  },
  {
    id: "pro",
    name: "Pro",
    status: "Active",
    price: "$199",
    period: "/month",
    isCustom: false,
    isPopular: true,
    annualPrice: "$1,908 /year",
    discountBadge: "Save 20%",
    features: [
      "400 Calls / month",
      "5 Reports / month",
      "3 Calibrations",
      "Priority Support",
    ],
    overage: "$0.30 per additional call",
    actionType: "edit-plan",
    actionLabel: "Edit Plan",
    actionIcon: Pencil,
    buttonStyle:
      "bg-primary hover:bg-primary/90 text-white shadow-2xs",
  },
  {
    id: "prox",
    name: "ProX",
    status: "Active",
    price: "$349",
    period: "/month",
    isCustom: false,
    isPopular: false,
    annualPrice: "$3,348 /year",
    discountBadge: "Save 20%",
    features: [
      "750 Calls / month",
      "15 Reports / month",
      "10 Calibrations",
      "Priority+ Support",
    ],
    overage: "$0.25 per additional call",
    actionType: "edit-plan",
    actionLabel: "Edit Plan",
    actionIcon: Pencil,
    buttonStyle:
      "border border-light-gray hover:bg-light-gray/40 text-dark-black/80",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    status: "Active",
    price: "Custom Pricing",
    period: null,
    isCustom: true,
    isPopular: false,
    annualPrice: null,
    discountBadge: null,
    features: [
      "Custom Call Limits",
      "Custom Reports",
      "Unlimited Team Members",
      "Dedicated Onboarding",
      "SLA Support",
    ],
    overage: null,
    actionType: "configure-enterprise",
    actionLabel: "Configure Enterprise",
    actionIcon: Settings,
    buttonStyle:
      "border border-light-gray hover:bg-light-gray/40 text-dark-black/80",
  },
];

export const SubscriptionPlans = ({
  plans = initialPlansData,
  onAddNewPlan,
  onEditPlan,
  onManageTrialRules,
  onConfigureEnterprise,
}) => {
  const handleAction = (plan) => {
    if (plan.actionType === "trial-rules") {
      onManageTrialRules(plan);
    } else if (plan.actionType === "configure-enterprise") {
      onConfigureEnterprise(plan);
    } else {
      onEditPlan(plan);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight font-secondary">
            Subscription Plans
          </h2>
          <p className="text-xs sm:text-sm text-medium-black mt-0.5">
            Manage and configure all subscription plans and their limits.
          </p>
        </div>

        {/* Add New Plan Button */}
        <button
          type="button"
          onClick={onAddNewPlan}
          className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Plan</span>
        </button>
      </div>

      {/* 5 Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 items-stretch">
        {plans.map((plan) => {
          const ActionIcon = plan.actionIcon;
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 relative group ${
                plan.isPopular
                  ? "border-2 border-primary shadow-sm hover:shadow-md"
                  : "border border-light-gray shadow-xs hover:shadow-sm"
              }`}
            >
              {/* Most Popular Top Pill Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}

              {/* Card Top & Body */}
              <div className="flex flex-col">
                {/* Plan Header: Name + Active Badge */}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-dark-black/80 font-secondary">
                    {plan.name}
                  </h3>
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full leading-tight">
                    {plan.status}
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-3.5 mb-2">
                  {plan.isCustom ? (
                    <div className="text-xl sm:text-2xl font-extrabold text-dark-black/85 font-secondary tracking-tight min-h-[48px] flex items-center">
                      {plan.price}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-[32px] font-extrabold text-dark-black/85 font-secondary tracking-tight">
                          {plan.price}
                        </span>
                        <span className="text-xs text-medium-black font-medium">
                          {plan.period}
                        </span>
                      </div>

                      {/* Annual Price & Save % */}
                      {plan.annualPrice ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-light-black font-medium">
                            {plan.annualPrice}
                          </span>
                          {plan.discountBadge && (
                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-1.5 py-0.2 rounded">
                              {plan.discountBadge}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="h-4 mt-1" />
                      )}
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="mt-4 pt-4 border-t border-light-gray/60 space-y-2.5">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                      <span className="text-medium-black font-medium truncate">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Overage Section */}
                {plan.overage && (
                  <div className="mt-5 pt-3 border-t border-light-gray/40">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-light-black">
                      <span>Overage</span>
                      <HelpCircle className="w-3 h-3 text-light-black" />
                    </div>
                    <p className="text-xs text-medium-black font-semibold mt-0.5">
                      {plan.overage}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Action Button */}
              <div className="mt-6 pt-3">
                <button
                  type="button"
                  onClick={() => handleAction(plan)}
                  className={`w-full py-2.5 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${plan.buttonStyle}`}
                >
                  <ActionIcon className="w-3.5 h-3.5" />
                  <span>{plan.actionLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
