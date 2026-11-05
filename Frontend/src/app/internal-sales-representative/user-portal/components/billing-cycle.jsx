"use client";

import React, { useState } from "react";
import {
  Minus,
  Plus,
  CreditCard,
  Check,
  CheckCircle,
  ChevronRight,
  Send,
} from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import toast from "react-hot-toast";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";

const plansPriceMap = {
  basic: { name: "Basic", monthly: 99, annual: 89 },
  pro: { name: "Pro", monthly: 199, annual: 179 },
  elite: { name: "Elite", monthly: 349, annual: 314 },
};

const BillingCycle = ({
  billingCycle = "monthly",
  onBillingCycleChange = () => {},
  selectedPlan = "pro",
  seats = 1,
  onSeatsChange = () => {},
  customerEmail = "",
  onAddAnother = () => {},
  // Live mode: plans from the API and onSendLink() creates the account, returning { invite }
  plans,
  onSendLink,
}) => {
  const [linkSentOpen, setLinkSentOpen] = useState(false);
  const [invite, setInvite] = useState(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);

  const livePlan = plans?.find((plan) => plan.id === selectedPlan);
  const planInfo = livePlan
    ? { name: livePlan.name, monthly: livePlan.priceMonthlyCents / 100, annual: livePlan.priceAnnualCents / 100 }
    : plansPriceMap[selectedPlan] || plansPriceMap.pro;
  const unitPrice =
    billingCycle === "monthly" ? planInfo.monthly : planInfo.annual;

  const discountMultiplier = appliedPromo ? 0.9 : 1; // 10% discount on valid promo
  const totalPrice = unitPrice * seats * discountMultiplier;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code.");
      return;
    }
    if (
      promoCode.trim().toUpperCase() === "SAVE10" ||
      promoCode.trim().length > 2
    ) {
      setAppliedPromo(promoCode.trim().toUpperCase());
      toast.success(
        `Promo code "${promoCode.trim().toUpperCase()}" applied! (10% OFF)`
      );
    } else {
      toast.error("Invalid promo code.");
    }
  };

  // Live: creates the customer account and shows its activation link (copied by the rep
  // until email and Stripe are connected). Without onSendLink it's the design preview.
  const handleSendLink = async () => {
    if (!onSendLink) return setLinkSentOpen(true);
    setSending(true);
    try {
      const result = await onSendLink();
      if (!result) return;
      setInvite(result.invite);
      setLinkSentOpen(true);
    } finally {
      setSending(false);
    }
  };
  const activationLink = invite && typeof window !== "undefined" ? `${window.location.origin}/activate?token=${invite.token}` : "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(activationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Select the link and copy it manually.");
    }
  };


  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 sm:p-8 shadow-xs space-y-6">
      {/* ── 1. Billing Cycle Toggle ── */}
      <div>
        <Text
          variant="smaller"
          className="font-bold text-light-black uppercase tracking-wider block mb-2"
        >
          BILLING CYCLE
        </Text>
        <div className="bg-light-gray p-1 rounded-xl grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => onBillingCycleChange("monthly")}
            className={`py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer text-center ${
              billingCycle === "monthly"
                ? "bg-primary text-white shadow-xs"
                : "text-medium-black hover:text-dark-black"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => onBillingCycleChange("annual")}
            className={`py-2.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer text-center ${
              billingCycle === "annual"
                ? "bg-primary text-white shadow-xs"
                : "text-medium-black hover:text-dark-black"
            }`}
          >
            Annual (Save 10%)
          </button>
        </div>
      </div>

      {/* ── 2. Seats Stepper ── */}
      <div>
        <Text
          variant="smaller"
          className="font-bold text-light-black uppercase tracking-wider block mb-2"
        >
          SEATS
        </Text>
        <div className="flex items-center justify-between rounded-xl border border-light-gray p-1 w-32 bg-white">
          <button
            type="button"
            onClick={() => onSeatsChange(Math.max(1, seats - 1))}
            disabled={seats <= 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-medium-black hover:bg-light-gray transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm text-dark-black font-secondary">
            {seats}
          </span>
          <button
            type="button"
            onClick={() => onSeatsChange(seats + 1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 3. Order Summary & Totals ── */}
      <div className="pt-4 border-t border-light-gray space-y-3">
        <div className="flex justify-between items-center text-sm font-bold text-dark-black font-secondary">
          <span>Order Summary</span>
          <span>{planInfo.name} Plan</span>
        </div>

        <div className="flex justify-between items-center text-xs text-medium-black">
          <Text variant="smaller" className="text-light-black">
            ${unitPrice.toFixed(2)} / month × {seats} seat{seats > 1 ? "s" : ""}
          </Text>
          <span className="font-semibold text-dark-black font-secondary">
            ${(unitPrice * seats).toFixed(2)}
          </span>
        </div>

        {appliedPromo && (
          <div className="flex justify-between items-center text-xs text-primary">
            <span className="font-medium">Promo ({appliedPromo} - 10%)</span>
            <span className="font-semibold font-secondary">
              -${(unitPrice * seats * 0.1).toFixed(2)}
            </span>
          </div>
        )}

        {/* Total Due Today */}
        <div className="flex justify-between items-center pt-2">
          <Title variant="small" className="!text-dark-black font-bold">
            Total Due Today
          </Title>
          <span className="text-xl sm:text-2xl font-bold text-primary font-secondary">
            ${totalPrice.toFixed(2)} / month
          </span>
        </div>
      </div>

      {/* ── 4. Promo Code ── */}
      <div>
        <Text
          variant="smaller"
          className="font-bold text-light-black uppercase tracking-wider block mb-2"
        >
          PROMO CODE (OPTIONAL)
        </Text>
        <form onSubmit={handleApplyPromo} className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            placeholder="Enter promo code"
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-light-gray text-dark-black text-xs placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-light-gray hover:bg-light-gray/80 text-dark-black font-semibold text-xs transition-colors cursor-pointer border border-light-gray"
          >
            Apply
          </button>
        </form>

        <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-2">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>
            {appliedPromo
              ? `Promo code "${appliedPromo}" applied`
              : "No promo code applied"}
          </span>
        </div>
      </div>

      {/* ── 5. Payment Method ── */}
      <div className="flex items-center gap-3.5 pt-4 border-t border-light-gray">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5" />
        </div>
        <div>
          <Text variant="small" className="font-bold text-dark-black">
            Payment Method
          </Text>
          <Text variant="smaller" className="text-light-black mt-0.5">
            Choose how you&apos;d like to collect payment.
          </Text>
        </div>
      </div>

      {/* ── 6. Customer Will Receive ── */}
      <div className="space-y-2.5">
        <Text
          variant="smaller"
          className="font-bold text-light-black uppercase tracking-wider block"
        >
          CUSTOMER WILL RECEIVE
        </Text>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <Text variant="smaller" className="text-medium-black">
              Secure payment link via email
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <Text variant="smaller" className="text-medium-black">
              Plan details and order summary
            </Text>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <Text variant="smaller" className="text-medium-black">
              Receipts after successful payment
            </Text>
          </div>
        </div>
      </div>

      {/* ── 7. Send Link CTA Button ── */}
      <button
        type="button"
        onClick={handleSendLink}
        disabled={sending}
        className="w-full disabled:opacity-60 py-3.5 px-6 bg-primary hover:bg-medium-teal text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer active:scale-[0.98]"
      >
        <span>{sending ? "Creating account..." : "Send Link"}</span>
        <ChevronRight className="w-4 h-4" />
      </button>

      <DialogModal
        isOpen={linkSentOpen}
        onClose={() => setLinkSentOpen(false)}
        title={invite ? "Account created" : "Payment link sent"}
        size="sm"
        footer={
          <>
            <DialogButton
              onClick={() => {
                setLinkSentOpen(false);
                setInvite(null);
                onAddAnother();
              }}
            >
              Add Another User
            </DialogButton>
            <DialogButton variant="primary" onClick={() => setLinkSentOpen(false)}>Done</DialogButton>
          </>
        }
      >
        <div className="flex flex-col items-center text-center gap-3 py-1">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </div>
          <p className="text-base font-semibold text-dark-black">{invite ? `Account created for ${customerEmail}` : `Sent to ${customerEmail || "the customer"}`}</p>
          {invite ? (
            <>
              <p className="text-sm leading-5 text-medium-black max-w-sm">
                {planInfo.name} plan, ${unitPrice.toFixed(2)} / {billingCycle === "monthly" ? "month" : "month, billed annually"}. Send this activation link to the customer; online payment is added once Stripe is connected.
              </p>
              <div className="flex w-full gap-2">
                <input readOnly value={activationLink} aria-label="Activation link" onFocus={(event) => event.target.select()} className="flex-1 min-w-0 h-10 px-3 rounded-lg border border-gray-300 bg-light-gray/60 text-xs text-medium-black" />
                <button type="button" onClick={copyLink} className="px-3 rounded-lg border border-primary text-primary text-xs font-semibold hover:bg-primary/5 cursor-pointer whitespace-nowrap">
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm leading-5 text-medium-black max-w-sm">
              The customer receives a secure link to complete payment for the {planInfo.name} plan, ${unitPrice.toFixed(2)} / {billingCycle === "monthly" ? "month" : "month, billed annually"}.
            </p>
          )}
        </div>
      </DialogModal>
    </div>
  );
};

export default BillingCycle;
