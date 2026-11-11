"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiCheck } from "react-icons/fi";
import Text from "@/components/texts/text";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Plans come from the database (seeded from the public pricing section).
// Choosing one needs Stripe checkout, which the client hasn't connected yet.
function UpgradePlanContent() {
  // ?plan= from sign-up ("Your Video Is Ready" → Continue with a plan) is highlighted
  const wanted = useSearchParams()?.get("plan") ?? null;
  const [billing, setBilling] = useState(null);
  const [cycle, setCycle] = useState("monthly");

  useEffect(() => {
    apiRequest("/api/v1/billing")
      .then(setBilling)
      .catch((error) => showError("Plans not loaded", error.message));
  }, []);

  const currentPlanId = billing?.subscription?.plan.id;
  const plans = (billing?.plans ?? []).filter((plan) => !plan.isTrial);

  const choosePlan = (plan) =>
    showError("Upgrades aren't available yet", `Switching to ${plan.name} needs online payments (Stripe), which the client hasn't connected yet.`);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-light-gray p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/user/settings/billing" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal mb-2">
            <FiArrowLeft className="w-3.5 h-3.5" /> Back to billing
          </Link>
          <Text variant="regular" className="font-bold text-dark-black">Upgrade your plan</Text>
          <Text variant="smaller" className="mt-0.5 text-medium-black">More calls and detailed reports every month.</Text>
        </div>
        <div className="inline-flex rounded-xl border border-light-gray p-1 bg-light-gray/60 self-start sm:self-auto">
          {["monthly", "annual"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCycle(option)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize cursor-pointer transition-colors ${cycle === option ? "bg-white text-primary shadow-sm" : "text-medium-black"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {!billing && <Text variant="small" className="text-light-black">Loading plans…</Text>}
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isWanted = plan.id === wanted && !isCurrent;
          return (
            <div key={plan.id} className={`bg-white rounded-2xl border p-6 shadow-sm flex flex-col gap-4 ${isCurrent ? "border-primary" : isWanted ? "border-2 border-primary ring-4 ring-primary/10" : "border-light-gray"}`}>
              {isWanted && <span className="self-start px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-md">THE PLAN YOU CHOSE</span>}
              <div className="flex items-center justify-between">
                <Text variant="regular" className="font-bold text-dark-black">{plan.name}</Text>
                {isCurrent && <span className="px-2 py-0.5 bg-light-teal text-primary text-[10px] font-bold rounded-md">CURRENT</span>}
              </div>
              <Text variant="smaller" className="text-medium-black">{plan.description}</Text>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-dark-black">{cycle === "annual" ? plan.priceAnnual : plan.priceMonthly}</span>
                <span className="text-xs text-medium-black font-medium">/ month{cycle === "annual" ? ", billed yearly" : ""}</span>
              </div>
              <ul className="space-y-2 text-xs text-medium-black">
                {[`${plan.callsPerMonth} calls per month`, `${plan.reportsPerMonth} detailed call reports`, `Extra calls billed at ${plan.overagePerCall}/call`].map((feature) => (
                  <li key={feature} className="flex items-center gap-2"><FiCheck className="w-3.5 h-3.5 text-primary shrink-0" />{feature}</li>
                ))}
              </ul>
              <button
                type="button"
                disabled={isCurrent}
                onClick={() => choosePlan(plan)}
                className="mt-auto w-full px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors cursor-pointer disabled:bg-light-gray disabled:text-light-black disabled:cursor-default"
              >
                {isCurrent ? "Your current plan" : `Choose ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function UpgradePlanPage() {
  return (
    <Suspense fallback={null}>
      <UpgradePlanContent />
    </Suspense>
  );
}
