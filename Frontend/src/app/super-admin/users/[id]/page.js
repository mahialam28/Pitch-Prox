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
import IssueRefundModal from "./components/issue-refund-modal";
import { AddCreditsModal, ApplyDiscountModal, ActivityLogModal, ResetCalibrationModal, ImpersonationBanner, startImpersonation, endImpersonation, useStoredImpersonation } from "./components/account-dialogs";
import { useParams } from "next/navigation";
import { showSavedToast } from "@/lib/toast";

export default function UserDetailPage() {
  const [activeTab, setActiveTab] = useState("overview");
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
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  // Design only: credit/discount/activity dialogs and the impersonation banner are local state
  const [dialog, setDialog] = useState(null);
  const params = useParams();
  const [localImpersonation, setImpersonation] = useState(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // A session started from the Users list arrives through sessionStorage
  const stored = useStoredImpersonation();
  const storedSession = stored ? JSON.parse(stored) : null;
  const impersonation =
    localImpersonation ?? (!bannerDismissed && storedSession?.userId === String(params?.id) ? storedSession : null);

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
      setDialog("activity");
    } else if (actionId === "pause_subscription") {
      setIsPauseModalOpen(true);
    } else if (actionId === "extend_subscription") {
      setIsExtendModalOpen(true);
    } else if (actionId === "change_plan") {
      setIsChangePlanModalOpen(true);
    } else if (actionId === "issue_refund") {
      setIsRefundModalOpen(true);
    } else if (actionId === "add_calls_credits") {
      setDialog("calls");
    } else if (actionId === "add_report_credits") {
      setDialog("reports");
    } else if (actionId === "apply_discount") {
      setDialog("discount");
    }
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 pb-12">
      {impersonation && (
        <ImpersonationBanner
          name={userData.name}
          access={impersonation.accessLevel === "readonly" ? "Read Only" : "Full Access"}
          onExit={() => {
            setImpersonation(null);
            setBannerDismissed(true);
            endImpersonation();
            showSavedToast("Impersonation ended", `You're back in your own Super Admin session.`);
          }}
        />
      )}

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
          {/* ── Top Section: 3 Columns (Wider Account Info: 5 cols, Middle Stack: 4 cols, Right Quick Actions: 3 cols) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-w-0">
            {/* Left Column: Account Information (Wider 5-column span) */}
            <div className="lg:col-span-12 xl:col-span-5 flex w-full min-w-0">
              <AccountInfo />
            </div>

            {/* Middle Column: Account Health (Top) + Calibration Status (Bottom) */}
            <div className="lg:col-span-7 xl:col-span-4 flex flex-col gap-6 w-full min-w-0">
              <AccountHealth />
              <CalibrationStatus onReset={() => setIsResetCalibrationModalOpen(true)} />
            </div>

            {/* Right Column: Quick Actions */}
            <div className="lg:col-span-5 xl:col-span-3 flex w-full min-w-0">
              <QuickActions onActionClick={handleQuickAction} />
            </div>
          </div>

          {/* ── Bottom Metric Row: 3 Equal Columns (Subscription Plan, Current Usage, Billing Status) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch min-w-0">
            <div className="flex w-full min-w-0">
              <SubscriptionPlan onViewBillingDetails={() => openBilling(null)} />
            </div>
            <div className="flex w-full min-w-0">
              <CurrentUsage onManageLimits={() => openBilling("usage")} />
            </div>
            <div className="flex w-full min-w-0">
              <BillingStatus onViewBillingHistory={() => openBilling("invoices")} />
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
          startImpersonation(params?.id, options);
          setImpersonation(options);
        }}
      />

      <IssueRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        user={userData}
      />

      <ResetCalibrationModal isOpen={isResetCalibrationModalOpen} onClose={() => setIsResetCalibrationModalOpen(false)} />

      <AddCreditsModal key={`calls-${dialog === "calls"}`} kind="calls" isOpen={dialog === "calls"} onClose={() => setDialog(null)} />
      <AddCreditsModal key={`reports-${dialog === "reports"}`} kind="reports" isOpen={dialog === "reports"} onClose={() => setDialog(null)} />
      <ApplyDiscountModal key={`discount-${dialog === "discount"}`} isOpen={dialog === "discount"} onClose={() => setDialog(null)} />
      <ActivityLogModal isOpen={dialog === "activity"} onClose={() => setDialog(null)} />
    </div>
  );
}
