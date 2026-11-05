"use client";

import React from "react";
import { User, Sparkles, CheckCircle2 } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import Dropdown from "@/components/shared/dropdown/dropdown";

const plansData = [
  {
    id: "basic",
    name: "Basic",
    monthlyPrice: 99,
    annualPrice: 89,
    calls: "150 calls / month",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 199,
    annualPrice: 179,
    calls: "400 calls / month",
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    monthlyPrice: 349,
    annualPrice: 314,
    calls: "750 calls / month",
    popular: false,
  },
];

const countryOptions = [
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Australia", label: "Australia" },
  { value: "Germany", label: "Germany" },
  { value: "France", label: "France" },
  { value: "Singapore", label: "Singapore" },
];

const CustomerInformation = ({
  formData = {},
  onFormChange = () => {},
  selectedPlan = "pro",
  onPlanChange = () => {},
  billingCycle = "monthly",
  // Live plans from /api/v1/plans (paid plans only); falls back to the sample list
  plans,
}) => {
  const planCards = plans?.length
    ? plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        monthlyPrice: plan.priceMonthlyCents / 100,
        annualPrice: plan.priceAnnualCents / 100,
        calls: `${plan.callsPerMonth} calls / month`,
        popular: plan.id === "pro",
      }))
    : plansData;
  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-8 shadow-xs space-y-8">
      {/* ── Section 1: Customer Information ── */}
      <div className="space-y-6">
        <div className="flex items-center gap-3.5 pb-4 border-b border-light-gray">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <Title variant="small" className="!text-dark-black font-bold">
              Customer Information
            </Title>
            <Text variant="smaller" className="text-light-black mt-0.5">
              Enter the primary contact details.
            </Text>
          </div>
        </div>

        <div className="space-y-4">
          {/* First Name */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-medium-black font-primary">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName ?? "John"}
              onChange={(e) => onFormChange("firstName", e.target.value)}
              placeholder="e.g. John"
              className="w-full px-4 py-3 rounded-xl border border-light-gray text-dark-black text-sm placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Company / Brokerage */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-medium-black font-primary">
              Company / Brokerage
            </label>
            <input
              type="text"
              name="company"
              value={formData.company ?? "ABC Realty Group"}
              onChange={(e) => onFormChange("company", e.target.value)}
              placeholder="e.g. ABC Realty Group"
              className="w-full px-4 py-3 rounded-xl border border-light-gray text-dark-black text-sm placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-medium-black font-primary">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email ?? "john.smith@abcrealty.com"}
              onChange={(e) => onFormChange("email", e.target.value)}
              placeholder="e.g. john.smith@abcrealty.com"
              className="w-full px-4 py-3 rounded-xl border border-light-gray text-dark-black text-sm placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-medium-black font-primary">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone ?? "+1 (310) 555-1234"}
              onChange={(e) => onFormChange("phone", e.target.value)}
              placeholder="e.g. +1 (310) 555-1234"
              className="w-full px-4 py-3 rounded-xl border border-light-gray text-dark-black text-sm placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>

          {/* Country Dropdown */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-medium-black font-primary">
              Country
            </label>
            <Dropdown
              items={countryOptions}
              selected={formData.country || "United States"}
              onSelect={(val) => onFormChange("country", val)}
              className="w-full block"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Select Plan ── */}
      <div className="space-y-6 pt-6 border-t border-light-gray">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <Title variant="small" className="!text-dark-black font-bold">
              Select Plan
            </Title>
            <Text variant="smaller" className="text-light-black mt-0.5">
              Choose the plan and billing cycle.
            </Text>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {planCards.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const price =
              billingCycle === "monthly"
                ? plan.monthlyPrice
                : plan.annualPrice;

            return (
              <div
                key={plan.id}
                onClick={() => onPlanChange(plan.id)}
                className={`relative rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-2 border-primary bg-primary/5 shadow-xs"
                    : "border border-light-gray bg-white hover:border-primary/50 hover:shadow-xs"
                }`}
              >
                {/* Popular Pill Tag */}
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-xs tracking-wider uppercase whitespace-nowrap">
                    MOST POPULAR
                  </span>
                )}

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 text-primary">
                    <CheckCircle2 className="w-5 h-5 fill-primary text-white" />
                  </div>
                )}

                <h4 className="text-base font-bold text-dark-black mb-2 mt-1 font-secondary">
                  {plan.name}
                </h4>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-extrabold text-dark-black tracking-tight font-secondary">
                    ${price}
                  </span>
                  <Text variant="smaller" className="text-light-black font-medium">
                    /mo
                  </Text>
                </div>

                <Text variant="smaller" className="text-light-black font-medium mt-3">
                  {plan.calls}
                </Text>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomerInformation;
