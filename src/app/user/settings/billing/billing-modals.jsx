"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ChevronDown, CreditCard, Lock } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { formatDate } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

const STRIPE_PENDING = "This needs online payments (Stripe), which the client hasn't connected yet.";

const fieldLabel = "block text-xs font-medium leading-4 text-medium-black mb-2";
const fieldInput =
  "w-full min-h-[44px] px-4 py-3 rounded-xl border border-gray-300 bg-white text-base text-dark-black placeholder:text-gray-500 outline-none focus:border-primary transition-colors disabled:bg-light-gray disabled:cursor-not-allowed";

// ── Cancel Subscription ──────────────────────────────────────────────────────

const CANCEL_REASONS = ["Too expensive", "Not using it enough", "Missing features I need", "Switching to another tool", "Other"];

export const CancelSubscriptionModal = ({ isOpen, onClose, subscription }) => {
  const [reason, setReason] = useState("");
  const planName = subscription?.plan ? `PitchProX ${subscription.plan.name}` : "your plan";
  const endDate = subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : null;

  const cancel = () => {
    onClose();
    showError("Not available yet", `Subscriptions can be canceled once payments are connected. ${STRIPE_PENDING}`);
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel Subscription"
      subtitle="We're sorry to see you go."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Keep Plan</DialogButton>
          <DialogButton variant="danger" onClick={cancel}>Cancel Subscription</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <p className="text-base font-semibold leading-6 text-dark-black">Cancel {planName}?</p>
            <p className="text-sm leading-5 text-medium-black">
              {endDate
                ? `You will keep full access until ${endDate}. After that your account moves to the free plan.`
                : "You will keep full access until the end of your current billing period. After that your account moves to the free plan."}
            </p>
          </div>
        </div>

        <ul className="bg-[#f2f4f6] rounded-xl p-4 space-y-2 text-sm leading-5 text-medium-black">
          <li>•&nbsp; Your usage data is kept for 30 days after cancelling</li>
          <li>•&nbsp; Scheduled calls and follow-ups after {endDate ?? "your billing date"} will be paused</li>
          <li>•&nbsp; You can reactivate any time from Settings / Billing</li>
        </ul>

        <div>
          <label htmlFor="cancel-reason" className={fieldLabel}>Reason for cancelling (optional)</label>
          <div className="relative">
            <select
              id="cancel-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className={`${fieldInput} appearance-none pr-10 cursor-pointer ${reason ? "" : "text-gray-500"}`}
            >
              <option value="">Select a reason</option>
              {CANCEL_REASONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="w-[18px] h-[18px] text-dark-black/70 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </DialogModal>
  );
};

// ── Upgrade Plan ─────────────────────────────────────────────────────────────

const PlanFeature = ({ children }) => (
  <li className="flex items-center gap-2 text-sm leading-5 text-medium-black">
    <Check className="w-4 h-4 text-primary shrink-0" />
    {children}
  </li>
);

export const UpgradePlanModal = ({ isOpen, onClose, subscription }) => {
  const router = useRouter();
  const plan = subscription?.plan;
  const price = subscription?.billingCycle === "annual" ? plan?.priceAnnual : plan?.priceMonthly;
  const endDate = subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : null;

  const contactSales = () => {
    onClose();
    router.push("/user/settings/support-ticket");
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upgrade Plan"
      subtitle="Choose the plan that fits your team."
      size="xl"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={contactSales}>Contact Sales</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current plan */}
          <div className="bg-light-teal/50 border-2 border-primary rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-lg font-semibold leading-7 text-dark-black">{plan?.name ?? "Current plan"}</p>
              <span className="bg-white text-primary text-xs font-medium leading-4 px-2.5 py-0.5 rounded-full">Current plan</span>
            </div>
            <p className="text-2xl font-semibold leading-8 text-dark-black">{price ? `${price} / month` : "—"}</p>
            <ul className="space-y-2">
              {plan?.callsPerMonth != null && <PlanFeature>{plan.callsPerMonth} calls / month</PlanFeature>}
              {plan?.reportsPerMonth != null && <PlanFeature>{plan.reportsPerMonth} reports / month</PlanFeature>}
              <PlanFeature>All core playbooks</PlanFeature>
            </ul>
          </div>

          {/* Enterprise */}
          <div className="bg-white border border-gray-300 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-lg font-semibold leading-7 text-dark-black">Enterprise</p>
            <p className="text-2xl font-semibold leading-8 text-dark-black">Custom pricing</p>
            <ul className="space-y-2">
              <PlanFeature>Unlimited calls and reports</PlanFeature>
              <PlanFeature>Dedicated success manager</PlanFeature>
              <PlanFeature>Custom playbooks and SSO</PlanFeature>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs leading-4 text-medium-black">
            {endDate ? `Changes apply on your next billing date, ${endDate}.` : "Changes apply on your next billing date."}
          </p>
          <Link href="/user/settings/billing/upgrade" onClick={onClose} className="text-xs font-semibold text-primary hover:text-medium-teal">
            Compare all plans
          </Link>
        </div>
      </div>
    </DialogModal>
  );
};

// ── Payment Method ───────────────────────────────────────────────────────────
// Card numbers are never stored by PitchProX. These fields become Stripe's
// secure card inputs once the client connects Stripe; until then they are disabled.

export const PaymentMethodModal = ({ isOpen, onClose, card }) => {
  const saveCard = () => {
    onClose();
    showError("Not available yet", `Cards are added through Stripe's secure form. ${STRIPE_PENDING}`);
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Method"
      subtitle="Manage the card used for your subscription."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={saveCard}>Save Card</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4 border border-gray-300 rounded-xl p-4">
          <div className="w-12 h-12 rounded-full bg-light-teal/60 text-primary flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold leading-6 text-dark-black">
              {card ? `${card.brand} ending in ${card.last4}` : "No card on file"}
            </p>
            <p className="text-sm leading-5 text-medium-black">
              {card ? `Expires ${card.expiry}` : "Add a card to pay for your subscription."}
            </p>
          </div>
          {card && <span className="bg-emerald-50 text-emerald-700 text-xs font-medium leading-4 px-2.5 py-0.5 rounded-full">Default</span>}
        </div>

        <p className="text-sm font-semibold leading-5 text-dark-black">{card ? "Update card details" : "Add a card"}</p>

        <fieldset disabled className="space-y-5">
          <div>
            <label htmlFor="card-name" className={fieldLabel}>Name on card</label>
            <input id="card-name" className={fieldInput} placeholder="Full name" />
          </div>
          <div>
            <label htmlFor="card-number" className={fieldLabel}>Card number</label>
            <input id="card-number" className={fieldInput} placeholder="1234 1234 1234 1234" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="card-expiry" className={fieldLabel}>Expiry date</label>
              <input id="card-expiry" className={fieldInput} placeholder="MM / YY" />
            </div>
            <div>
              <label htmlFor="card-cvc" className={fieldLabel}>CVC</label>
              <input id="card-cvc" className={fieldInput} placeholder="•••" />
            </div>
          </div>
        </fieldset>

        <p className="flex items-center gap-2 text-xs leading-4 text-medium-black">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          Your card details are encrypted and secure. Card entry opens once payments (Stripe) are connected.
        </p>
      </div>
    </DialogModal>
  );
};
