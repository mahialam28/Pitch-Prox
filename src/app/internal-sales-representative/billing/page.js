"use client";

import React from "react";
import BillingHeader from "./components/billing-header";
import BillingQueue from "./components/billing-queue";
import InvoiceManagement from "@/components/billing/invoice-management";
import PaymentActivity from "./components/payment-activity";
import CreditsAdjustments from "./components/credits-adjustments";
import SubscriptionControls from "./components/subscription-controls";
import BillingRulesSettings from "./components/billing-rules-settings";

export default function BillingPage() {
  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6 pb-12">
      {/* 1. Header with Title, Subtitle, and 6 KPI Cards */}
      <BillingHeader />

      {/* 2. First Content Grid: Billing Queue (Left) & Invoice Management (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Side: Billing Queue */}
        <div className="xl:col-span-7 2xl:col-span-7 w-full">
          <BillingQueue />
        </div>

        {/* Right Side: Invoice Management */}
        <div className="xl:col-span-5 2xl:col-span-5 w-full">
          <InvoiceManagement />
        </div>
      </div>

      {/* 3. Second Content Grid: Payment Activity (Left) & Credits & Adjustments (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Side: Payment Activity */}
        <div className="xl:col-span-7 2xl:col-span-7 w-full">
          <PaymentActivity />
        </div>

        {/* Right Side: Credits & Adjustments */}
        <div className="xl:col-span-5 2xl:col-span-5 w-full">
          <CreditsAdjustments />
        </div>
      </div>

      {/* 4. Third Content Section: Subscription Controls */}
      <div className="w-full">
        <SubscriptionControls />
      </div>

      {/* 5. Fourth Content Section: 6. Billing Rules / Settings & Danger Zone */}
      <div className="w-full">
        <BillingRulesSettings />
      </div>
    </div>
  );
}
