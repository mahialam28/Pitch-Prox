"use client";

import React, { useState } from "react";
import UserHeader from "./components/user-header";
import AccountInfo from "./components/account-info";
import AccountHealth from "./components/account-health";
import CalibrationStatus from "./components/calibration-status";
import QuickActions from "./components/quick-actions";
import SubscriptionPlan from "./components/subscription-plan";
import CurrentUsage from "./components/current-usage";
import BillingStatus from "./components/billing-status";
import AccountActions from "./components/account-actions";
import AuditInfo from "./components/audit-info";
import UserCallHistory from "./components/user-call-history";
import UserNotes from "./components/user-notes";
import UserSupportHistory from "./components/user-support-history";
import UserBillingSubscription from "./components/user-billing-subscription";
import UserUsageActivity from "./components/user-usage-activity";
import UserReports from "./components/user-reports";
import UserCalibration from "./components/user-calibration";
import UserAccountSettings from "./components/user-account-settings";
import PauseSubscriptionModal from "./components/pause-subscription-modal";
import ExtendSubscriptionModal from "./components/extend-subscription-modal";
import ChangePlanModal from "./components/change-plan-modal";
import ImpersonateUserModal from "./components/impersonate-user-modal";
import AlertModal from "@/components/modals/alert-modal";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function UserDetailPage() {
  // ?tab=subscription (from Billing) opens that tab directly
  const initialTab = useSearchParams()?.get("tab");
  const [activeTab, setActiveTab] = useState(["overview", "call-history", "usage", "subscription", "reports", "calibration", "settings"].includes(initialTab) ? initialTab : "overview");
  // Which Subscription & Billing section an Overview card points to ("usage" | "invoices")
  const [billingFocus, setBillingFocus] = useState(null);
  const openBilling = (section) => {
    setBillingFocus(section);
    setActiveTab("subscription");
  };
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false);
  const [isResetCalibrationModalOpen, setIsResetCalibrationModalOpen] = useState(false);

  const userData = {
    name: "Jennifer Smith",
    status: "Active",
    company: "Acme Inc.",
    accountId: "ACC-001234",
    userId: "USR-78234",
    customerSince: "Jan 15, 2024",
    initials: "JS",
    plan: "Premium Plan",
    currentPlan: "Premium",
    price: "$499.00",
    currentPrice: 499,
    currentExpiration: "June 15, 2025",
    daysRemaining: 30,
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160",
  };

  const handleQuickAction = (actionId) => {
    if (actionId === "view_call_history") {
      setActiveTab("call-history");
    } else if (actionId === "view_activity_log") {
      setActiveTab("usage");
    } else if (actionId === "pause_subscription") {
      setIsPauseModalOpen(true);
    } else if (actionId === "extend_subscription") {
      setIsExtendModalOpen(true);
    } else if (actionId === "change_plan") {
      setIsChangePlanModalOpen(true);
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 pb-12">
      {/* ── Top Header & Tab Navigation ── */}
      <UserHeader
        user={userData}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onImpersonate={() => setIsImpersonateModalOpen(true)}
      />

      {/* ── Tab Content: Overview ── */}
      {activeTab === "overview" && (
        <div className="w-full min-w-0 flex flex-col gap-6">
          {/* ── Screen < 2xl: 2-Section Per Row Layout ── */}
          <div className="flex flex-col gap-6 2xl:hidden min-w-0">
            {/* Row 1 (2 Columns): Account Information & Account Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-w-0">
              <div className="flex w-full min-w-0">
                <AccountInfo />
              </div>
              <div className="flex w-full min-w-0">
                <AccountHealth />
              </div>
            </div>

            {/* Row 2 (2 Columns): Subscription Plan & Billing Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-w-0">
              <div className="flex w-full min-w-0">
                <SubscriptionPlan onViewBillingDetails={() => openBilling(null)} />
              </div>
              <div className="flex w-full min-w-0">
                <BillingStatus onViewBillingHistory={() => openBilling("invoices")} />
              </div>
            </div>

            {/* Row 3 (2 Columns): Current Usage & Calibration Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-w-0">
              <div className="flex w-full min-w-0">
                <CurrentUsage onManageLimits={() => openBilling("usage")} />
              </div>
              <div className="flex w-full min-w-0">
                <CalibrationStatus onReset={() => setIsResetCalibrationModalOpen(true)} />
              </div>
            </div>

            {/* Row 4 (Full Width): Quick Actions */}
            <div className="flex w-full min-w-0">
              <QuickActions onActionClick={handleQuickAction} />
            </div>
          </div>

          {/* ── Screen >= 2xl: Perfectly Balanced 2-Tier Dashboard Layout ── */}
          <div className="hidden 2xl:flex flex-col gap-6 min-w-0">
            {/* Top Row: Account Information (6 cols / 50%) + Account Health (3 cols / 25%) + Quick Actions (3 cols / 25%) */}
            <div className="grid grid-cols-12 gap-6 items-stretch min-w-0">
              <div className="col-span-6 flex w-full min-w-0">
                <AccountInfo />
              </div>
              <div className="col-span-3 flex w-full min-w-0">
                <AccountHealth />
              </div>
              <div className="col-span-3 flex w-full min-w-0">
                <QuickActions onActionClick={handleQuickAction} />
              </div>
            </div>

            {/* Bottom Row: 4 Equal Metric & Status Cards (25% each / 3 cols each) */}
            <div className="grid grid-cols-12 gap-6 items-stretch min-w-0">
              <div className="col-span-3 flex w-full min-w-0">
                <SubscriptionPlan onViewBillingDetails={() => openBilling(null)} />
              </div>
              <div className="col-span-3 flex w-full min-w-0">
                <CurrentUsage onManageLimits={() => openBilling("usage")} />
              </div>
              <div className="col-span-3 flex w-full min-w-0">
                <BillingStatus onViewBillingHistory={() => openBilling("invoices")} />
              </div>
              <div className="col-span-3 flex w-full min-w-0">
                <CalibrationStatus onReset={() => setIsResetCalibrationModalOpen(true)} />
              </div>
            </div>
          </div>

          {/* ── Bottom Full-Width Section: Account Actions ── */}
          <AccountActions />

          {/* ── Footer Audit Info ── */}
          <AuditInfo />
        </div>
      )}

      {/* ── Tab Content: Call History ── */}
      {activeTab === "call-history" && (
        <UserCallHistory onBack={() => setActiveTab("overview")} />
      )}

      {/* ── Tab Content: Usage & Activity ── */}
      {activeTab === "usage" && (
        <UserUsageActivity onBack={() => setActiveTab("overview")} />
      )}

      {/* ── Tab Content: Subscription & Billing ── */}
      {activeTab === "subscription" && (
        <UserBillingSubscription focus={billingFocus} onBack={() => setActiveTab("overview")} />
      )}

      {/* ── Tab Content: Reports ── */}
      {activeTab === "reports" && <UserReports />}

      {/* ── Tab Content: Calibration ── */}
      {activeTab === "calibration" && <UserCalibration />}

      {/* ── Tab Content: Account Settings ── */}
      {activeTab === "settings" && (
        <UserAccountSettings onNavigateTab={(tab) => setActiveTab(tab)} />
      )}

      {/* ── Tab Content: Notes ── */}
      {activeTab === "notes" && <UserNotes />}

      {/* ── Tab Content: Support History ── */}
      {activeTab === "support" && <UserSupportHistory />}

      {/* Placeholder content for other sub-tabs */}
      {activeTab !== "overview" &&
        activeTab !== "call-history" &&
        activeTab !== "usage" &&
        activeTab !== "subscription" &&
        activeTab !== "reports" &&
        activeTab !== "calibration" &&
        activeTab !== "settings" &&
        activeTab !== "notes" &&
        activeTab !== "support" && (
          <div className="bg-white rounded-2xl p-10 border border-light-gray shadow-xs text-center">
            <h3 className="text-base font-bold text-dark-black capitalize">
              {activeTab.replace("-", " ")} Details
            </h3>
            <p className="text-xs text-light-black mt-1">
              Detailed information and configurations for this tab are loaded here.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-medium-teal transition-colors cursor-pointer"
            >
              Back to Overview
            </button>
          </div>
        )}

      {/* ── Modals ── */}
      <PauseSubscriptionModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
        user={userData}
      />

      <ExtendSubscriptionModal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        user={userData}
      />

      <ChangePlanModal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        user={userData}
      />

      <ImpersonateUserModal
        isOpen={isImpersonateModalOpen}
        onClose={() => setIsImpersonateModalOpen(false)}
        user={userData}
        onConfirm={(options) => {
          // Confirmed impersonation
        }}
      />

      <AlertModal
        isOpen={isResetCalibrationModalOpen}
        onClose={() => setIsResetCalibrationModalOpen(false)}
        type="warning"
        title="Reset Calibration?"
        message="Are you sure you want to reset this user's voice calibration? They will be prompted to re-complete all calibration modules."
        confirmLabel="Reset Calibration"
        onConfirm={() => {
          setIsResetCalibrationModalOpen(false);
          toast.success("Calibration reset initiated. User will be notified to re-calibrate.");
        }}
      />
    </div>
  );
}
