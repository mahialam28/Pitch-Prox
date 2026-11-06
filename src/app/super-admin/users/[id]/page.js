"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
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
import ChangePlanModal from "./components/change-plan-modal";
import ImpersonateUserModal from "./components/impersonate-user-modal";
import IssueRefundModal from "./components/issue-refund-modal";
import { AddCreditsModal, ApplyDiscountModal, ActivityLogModal } from "./components/account-dialogs";
import { accountApi, loadAccount, money } from "../account-api";
import { usePortal } from "@/components/shared/use-portal";
import { formatDate, formatDateTime } from "@/lib/client-api";
import { showSavedToast } from "@/lib/toast";

// Customer detail: one shared page for Super Admin / Support (/super-admin/users/:id) and
// sales reps (/internal-sales-representative/users/:id, their own accounts). What each role
// can do comes from the server (`account.permissions`).
const TABS = ["overview", "call-history", "usage", "subscription", "reports", "calibration", "settings", "support", "notes"];

const statusLabel = (account) => {
  if (account.status === "suspended") return "Suspended";
  if (account.status === "deleted") return "Deleted";
  if (!account.owner?.activated) return "Invited";
  return { trialing: "Trial", paused: "Paused", pending_payment: "Pending payment", canceled: "Canceled" }[account.subscription.status] ?? "Active";
};

const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

// When the current period ends: the stored end, or one cycle after it started
const periodEnd = (subscription) => {
  if (subscription.currentPeriodEnd) return new Date(subscription.currentPeriodEnd);
  const end = new Date(subscription.currentPeriodStart ?? Date.now());
  if (subscription.billingCycle === "annual") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  return end;
};

function Message({ title, text, back }) {
  return (
    <div className="bg-white rounded-2xl p-10 border border-light-gray shadow-xs text-center">
      <h3 className="text-base font-bold text-dark-black">{title}</h3>
      {text && <p className="text-xs text-light-black mt-1">{text}</p>}
      {back && (
        <Link href={back} className="inline-block mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-medium-teal">
          Back to Users
        </Link>
      )}
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const portal = usePortal();
  // ?tab=subscription (from Billing) opens that tab directly
  const initialTab = useSearchParams()?.get("tab");
  const [activeTab, setActiveTab] = useState(TABS.includes(initialTab) ? initialTab : "overview");
  // Which Subscription & Billing section an Overview card points to ("usage" | "invoices")
  const [billingFocus, setBillingFocus] = useState(null);
  const openBilling = (section) => {
    setBillingFocus(section);
    setActiveTab("subscription");
  };
  const [dialog, setDialog] = useState(null);

  // ── Live account ──
  const [account, setAccount] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    let cancelled = false;
    loadAccount(id)
      .then((result) => !cancelled && setAccount(result))
      .catch((error) => !cancelled && setLoadError(error.message));
    return () => {
      cancelled = true;
    };
  }, [id, version]);

  const api = accountApi(id);
  // Run an API call, then reload the page's data; errors are already shown by accountApi
  const run = async (promise) => {
    const result = await promise;
    reload();
    return result;
  };
  const previewChange = useCallback((body) => accountApi(id).previewChange(body), [id]);

  if (loadError) return <Message title="Customer not available" text={loadError} back={`${portal.base}/users`} />;
  if (!account) return <Message title="Loading customer…" />;

  const { permissions, subscription, balances } = account;
  const plan = subscription.plan;
  const ownerName = account.owner?.name ?? account.company;
  const annual = subscription.billingCycle === "annual";
  const periodPriceCents = (annual ? plan.priceAnnualCents * 12 : plan.priceMonthlyCents) * (account.profile.seats || 1);
  const renewal = periodEnd(subscription);
  const daysRemaining = Math.max(0, Math.ceil((renewal - new Date()) / 86400000));
  const status = statusLabel(account);
  const canWrite = permissions.canWrite && account.status !== "deleted";
  const healthStatus = account.healthScore >= 70 ? "Healthy" : account.healthScore >= 40 ? "At Risk" : "Inactive";

  const userData = {
    name: ownerName,
    status,
    company: account.company,
    accountId: account.accountNumber,
    userId: account.owner ? `USR-${account.owner.id.slice(-6).toUpperCase()}` : "—",
    customerSince: formatDate(account.customerSince),
    initials: initialsOf(ownerName),
    plan: `${plan.name} Plan`,
    currentPlan: plan.name,
    price: money(periodPriceCents),
    currentPrice: periodPriceCents / 100,
    currentExpiration: formatDate(renewal),
    daysRemaining,
    email: account.owner?.email,
    phone: account.profile.phone,
    industry: account.profile.industry,
    timeZone: account.profile.timezone,
    members: account.members,
  };

  // Quick actions this role can't use: refunds are Super Admin only; there's no "extend" until Stripe is connected
  const hiddenActions = ["extend_subscription", ...(permissions.isSuperAdmin ? [] : ["issue_refund"]), ...(canWrite ? [] : ["add_calls_credits", "add_report_credits", "apply_discount", "issue_refund", "change_plan", "pause_subscription"])];
  const handleQuickAction = (actionId) => {
    if (actionId === "view_call_history") setActiveTab("call-history");
    else if (actionId === "view_activity_log") setDialog("activity");
    else if (actionId === "pause_subscription") setDialog(subscription.status === "paused" ? "resume" : "pause");
    else if (actionId === "change_plan") setDialog("plan");
    else if (actionId === "issue_refund") setDialog("refund");
    else if (actionId === "add_calls_credits") setDialog("calls");
    else if (actionId === "add_report_credits") setDialog("reports");
    else if (actionId === "apply_discount") setDialog("discount");
  };
  const close = () => setDialog(null);
  const needsApproval = !permissions.applyDirectly;
  const lastLogin = account.members.reduce((latest, member) => (member.lastLoginAt && (!latest || new Date(member.lastLoginAt) > new Date(latest)) ? member.lastLoginAt : latest), null);
  const lastChange = account.activity[0];
  const created = [...account.activity].reverse().find((entry) => entry.action === "customer.created");

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 pb-12">
      <UserHeader user={userData} activeTab={activeTab} onTabChange={setActiveTab} onImpersonate={permissions.canImpersonate && account.status === "active" ? () => setDialog("impersonate") : null} />

      {activeTab === "overview" && (
        <div className="w-full min-w-0 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-w-0">
            <div className="lg:col-span-12 xl:col-span-5 flex w-full min-w-0">
              <AccountInfo
                account={account}
                canEdit={canWrite}
                onSave={async (owner, profile) => {
                  if (owner) await api.updateOwner(owner);
                  if (profile) await api.updateProfile(profile);
                  if (owner || profile) showSavedToast("Account updated", `${account.company}'s details were saved.`);
                  reload();
                }}
              />
            </div>
            <div className="lg:col-span-7 xl:col-span-4 flex flex-col gap-6 w-full min-w-0">
              <AccountHealth
                score={account.healthScore}
                status={healthStatus}
                lastCalculated={formatDateTime(new Date())}
                metrics={[
                  { id: "billing", label: "Subscription", score: ["active", "trialing"].includes(subscription.status) ? 40 : subscription.status === "pending_payment" ? 20 : 0, max: 40 },
                  { id: "calibration", label: "Calibration", score: account.calibration.completed ? 30 : 0, max: 30 },
                  { id: "engagement", label: "Active (7 days)", score: account.activeRecently ? 30 : 0, max: 30 },
                ]}
              />
              <CalibrationStatus
                status={account.calibration.completed ? "Completed" : "Not Started"}
                completedDate={formatDate(account.calibration.lastCompletedAt)}
                nextCalibration={account.calibration.completed ? null : "Live calling unlocks once they finish calibration."}
                canReset={canWrite}
                onEdit={() => setActiveTab("calibration")}
                onReset={() => run(api.resetCalibration())}
              />
            </div>
            <div className="lg:col-span-5 xl:col-span-3 flex w-full min-w-0">
              <QuickActions onActionClick={handleQuickAction} hidden={hiddenActions} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch min-w-0">
            <div className="flex w-full min-w-0">
              <SubscriptionPlan
                planName={`${plan.name} Plan`}
                status={subscription.cancelAtPeriodEnd ? "Cancels at period end" : status}
                price={`${money(periodPriceCents)} / ${annual ? "year" : "month"}`}
                renewalDate={subscription.status === "paused" && subscription.pausedUntil ? `${formatDate(subscription.pausedUntil)} (paused)` : formatDate(renewal)}
                onViewBillingDetails={() => openBilling(null)}
              />
            </div>
            <div className="flex w-full min-w-0">
              <CurrentUsage callsUsed={balances.calls.used} callsMax={balances.calls.total || 1} reportsUsed={balances.reports.used} reportsMax={balances.reports.total || 1} onManageLimits={() => openBilling("usage")} />
            </div>
            <div className="flex w-full min-w-0">
              <BillingStatus
                status={subscription.status === "pending_payment" ? "Payment pending" : "Up to date"}
                statusSubtext={balances.creditCents > 0 ? `${balances.credit} account credit` : "No payments due"}
                nextInvoice={subscription.cancelAtPeriodEnd ? "None (cancelling)" : formatDate(renewal)}
                amount={money(Math.max(0, periodPriceCents - balances.creditCents))}
                onViewBillingHistory={() => openBilling("invoices")}
              />
            </div>
          </div>

          <AccountActions
            name={ownerName}
            status={account.status}
            cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
            calibrated={account.calibration.completed}
            canSuspend={permissions.canSuspend}
            canWrite={canWrite || (permissions.canSuspend && account.status !== "active")}
            onSuspend={(reason) => run(api.setStatus("suspended", reason))}
            onReactivate={() => run(api.setStatus("active"))}
            onCancel={(reason) => run(api.cancel({ reason }))}
            onUndoCancel={async () => {
              await run(api.cancel({ undo: true }));
              showSavedToast("Subscription kept", "The cancellation was undone.");
            }}
            onResetCalibration={() => run(api.resetCalibration())}
          />

          <AuditInfo
            createdDate={formatDateTime(account.customerSince)}
            createdBy={created?.actor ?? (account.source === "sales" ? account.rep?.name ?? "Sales rep" : "Self sign-up")}
            lastUpdated={lastChange ? formatDateTime(lastChange.createdAt) : "—"}
            updatedBy={lastChange?.actor ?? "—"}
            lastLogin={lastLogin ? formatDateTime(lastLogin) : "Never"}
            loginCount={account.members.length}
            loginCountLabel="Members"
          />
        </div>
      )}

      {activeTab === "call-history" && <UserCallHistory onBack={() => setActiveTab("overview")} />}
      {activeTab === "usage" && <UserUsageActivity onBack={() => setActiveTab("overview")} />}
      {activeTab === "subscription" && (
        <UserBillingSubscription
          focus={billingFocus}
          onBack={() => setActiveTab("overview")}
          account={account}
          api={api}
          onAction={handleQuickAction}
          onChanged={reload}
        />
      )}
      {activeTab === "reports" && <UserReports />}
      {activeTab === "calibration" && <UserCalibration />}
      {activeTab === "settings" && <UserAccountSettings onNavigateTab={setActiveTab} account={account} api={api} onChanged={reload} />}
      {activeTab === "notes" && <UserNotes account={account} api={api} onChanged={reload} />}
      {activeTab === "support" && <UserSupportHistory account={account} />}

      {/* ── Modals (remounted on open so each starts fresh) ── */}
      {dialog === "pause" && (
        <PauseSubscriptionModal
          isOpen
          onClose={close}
          user={userData}
          onConfirm={async ({ until }) => run(api.pause({ until }))}
        />
      )}
      {dialog === "resume" && (
        <ResumeDialog
          name={ownerName}
          until={subscription.pausedUntil}
          onClose={close}
          onConfirm={async () => {
            await run(api.pause({ resume: true }));
            showSavedToast("Subscription resumed", "Billing and calling are back on.");
          }}
        />
      )}
      {dialog === "plan" && (
        <ChangePlanModal
          isOpen
          onClose={close}
          user={userData}
          currentPlanId={plan.id}
          currentCycle={subscription.billingCycle ?? "monthly"}
          onPreview={previewChange}
          onConfirm={({ planId, billingCycle, when }) => run(api.changePlan({ planId, billingCycle, when }))}
        />
      )}
      {dialog === "impersonate" && <ImpersonateUserModal isOpen onClose={close} user={userData} onConfirm={(options) => api.impersonate(options)} />}
      {dialog === "refund" && (
        <IssueRefundModal
          isOpen
          onClose={close}
          user={userData}
          onConfirm={({ amount, method, reason, internalNote }) =>
            run(api.adjust({ kind: "refund", amount, reason: [reason, method === "credit" ? "to account credit" : null, internalNote].filter(Boolean).join(" · ") }))
          }
        />
      )}
      {(dialog === "calls" || dialog === "reports") && (
        <AddCreditsModal
          key={dialog}
          isOpen
          kind={dialog}
          onClose={close}
          limit={permissions.limits?.[dialog] ?? null}
          needsApproval={needsApproval}
          onConfirm={({ quantity, reason }) => run(api.adjust({ kind: dialog, quantity, reason }))}
        />
      )}
      {dialog === "discount" && (
        <ApplyDiscountModal
          isOpen
          onClose={close}
          basePriceCents={periodPriceCents}
          limitCents={permissions.limits?.discount ?? null}
          needsApproval={needsApproval}
          onConfirm={(body) => run(api.adjust(body))}
        />
      )}
      <ActivityLogModal
        isOpen={dialog === "activity"}
        onClose={close}
        rows={account.activity.map((entry) => ({ when: formatDateTime(entry.createdAt), action: entry.summary, by: entry.actor }))}
      />
    </div>
  );
}

function ResumeDialog({ name, until, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="resume-title">
        <h3 id="resume-title" className="text-base font-bold text-dark-black">Resume subscription?</h3>
        <p className="text-xs text-medium-black mt-2">
          {name}&apos;s subscription is paused{until ? ` until ${formatDate(until)}` : ""}. Resuming turns billing and calling back on now.
        </p>
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold cursor-pointer">Cancel</button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onClose();
              } catch {
                /* reported by the caller */
              } finally {
                setBusy(false);
              }
            }}
            className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
          >
            Resume Now
          </button>
        </div>
      </div>
    </div>
  );
}
