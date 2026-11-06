"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Pencil, Settings, Building2 } from "lucide-react";
import PricingKpiCards from "./components/pricing-kpi-cards";
import SubscriptionPlans from "./components/subscription-plans";
import ReportAddOns from "./components/report-add-ons";
import PlaybookAddOns from "./components/playbook-add-ons";
import BillingRules from "./components/billing-rules";
import PromotionalCodes from "./components/promotional-codes";
import EditPlanModal from "./components/edit-plan-modal";
import TrialRulesModal from "./components/trial-rules-modal";
import EnterpriseConfigModal from "./components/enterprise-config-modal";
import AddPromoCodeModal from "./components/add-promo-code-modal";
import EditReportAddOnsModal from "./components/edit-report-add-ons-modal";
import { AddNewPlanModal, DeletePromoCodeModal } from "./components/plan-pricing-dialogs";
import { apiRequest } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Plan & Pricing Control: live plans, promo codes and pricing settings. Super Admin changes them;
// Support can view. Charging customers with these prices starts once Stripe is connected.

const dollars = (cents) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const day = (value) => (value ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No expiry");
const PROMO_TONE = {
  Active: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  Scheduled: "bg-sky-50 text-sky-600 border border-sky-100",
  Paused: "bg-amber-50 text-amber-600 border border-amber-100",
  Expired: "bg-slate-50 text-slate-500 border border-slate-200",
  "Used Up": "bg-slate-50 text-slate-500 border border-slate-200",
};

// A plan from the API as a card on this page
const toCard = (plan, canEdit) => {
  const annualSaving = plan.priceMonthlyCents ? Math.round(100 - (plan.priceAnnualCents / (plan.priceMonthlyCents * 12)) * 100) : 0;
  const popular = /popular/i.test(plan.badge ?? "");
  return {
    id: plan.id,
    raw: plan,
    name: plan.name,
    status: plan.status,
    price: dollars(plan.priceMonthlyCents),
    period: plan.isTrial ? "Free" : "/month",
    isCustom: false,
    isPopular: popular,
    annualPrice: plan.isTrial ? null : `${dollars(plan.priceAnnualCents)} /year`,
    discountBadge: annualSaving > 0 ? `Save ${annualSaving}%` : null,
    features: [
      `${plan.callsIncluded} Calls${plan.isTrial ? "" : " / month"}`,
      `${plan.reportsIncluded} Report${plan.reportsIncluded === 1 ? "" : "s"}${plan.isTrial ? "" : " / month"}`,
      `${plan.calibrationsIncluded} Calibration${plan.calibrationsIncluded === 1 ? "" : "s"}`,
      `${plan.subscribers} customer${plan.subscribers === 1 ? "" : "s"}`,
    ],
    overage: plan.isTrial ? null : `${dollars(plan.callOverageCents)} per additional call`,
    actionType: plan.isTrial ? "trial-rules" : "edit-plan",
    actionLabel: plan.isTrial ? "Manage Trial Rules" : canEdit ? "Edit Plan" : "View Plan",
    actionIcon: plan.isTrial ? Settings : Pencil,
    buttonStyle: popular ? "bg-primary hover:bg-primary/90 text-white shadow-2xs" : "border border-light-gray hover:bg-light-gray/40 text-dark-black/80",
  };
};

const enterpriseCard = (settings) => ({
  id: "enterprise",
  name: "Enterprise",
  status: "Custom",
  price: "Custom Pricing",
  period: "",
  isCustom: true,
  isPopular: false,
  annualPrice: null,
  discountBadge: null,
  features: [`From $${settings.price} / ${settings.billingCycle.toLowerCase()}`, `${settings.callLimitsValue} calls`, `${settings.reportLimitsValue} reports`, settings.unlimitedMembers ? "Unlimited members" : "Members per contract"],
  overage: settings.overagePricing,
  actionType: "configure-enterprise",
  actionLabel: "Configure Enterprise",
  actionIcon: Building2,
  buttonStyle: "border border-light-gray hover:bg-light-gray/40 text-dark-black/80",
});

const toPromoRow = (promo) => ({
  ...promo,
  maxUses: promo.maxUses === null ? "∞" : promo.maxUses,
  expiration: day(promo.expiresAt),
  statusStyle: PROMO_TONE[promo.status] ?? PROMO_TONE.Expired,
});

// Body for the plan API from the Edit Plan dialog
const planBody = (form) => ({
  name: form.name,
  description: form.description,
  status: form.status,
  badge: form.badge,
  displayOrder: form.displayOrder,
  monthlyPrice: form.monthlyPrice,
  annualPrice: form.annualPrice,
  callsIncluded: form.callsIncluded,
  reportsIncluded: form.reportsIncluded,
  calibrationsIncluded: form.calibrationsIncluded,
  callOverageFee: form.callOverageFee,
  reportOverageFee: form.reportOverageFee,
});

export default function PlanPricingControlPage() {
  const [data, setData] = useState(null);
  const [me, setMe] = useState(null);
  const [version, setVersion] = useState(0);
  const [dialog, setDialog] = useState(null); // { type, item }
  const reload = useCallback(() => setVersion((value) => value + 1), []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiRequest("/api/v1/admin/pricing"), apiRequest("/api/v1/me")])
      .then(([result, session]) => {
        if (cancelled) return;
        setData(result);
        setMe(session.user);
      })
      .catch((error) => showError("Pricing not loaded", error.message));
    return () => {
      cancelled = true;
    };
  }, [version]);

  const canEdit = me?.role === "super_admin";
  const close = () => setDialog(null);
  // Every change: call the API, report a refusal (the dialog stays open), then reload
  const save = async (title, url, method, body) => {
    try {
      const result = await apiRequest(url, { method, body });
      reload();
      return result;
    } catch (error) {
      showError(title, error.message);
      throw error;
    }
  };
  const readOnly = () => showError("View only", "Only a Super Admin can change plans and pricing.");

  if (!data) {
    return <div className="bg-white rounded-2xl p-10 border border-light-gray text-center text-sm text-light-black">Loading plans and pricing…</div>;
  }
  const { plans, promoCodes, settings, stats } = data;
  const cards = [...plans.filter((plan) => plan.status === "Active").map((plan) => toCard(plan, canEdit)), enterpriseCard(settings.enterprise)];
  const paidPlans = plans.filter((plan) => !plan.isTrial && plan.status === "Active");
  const archived = plans.filter((plan) => plan.status === "Archived");

  return (
    <div className="w-full flex flex-col gap-6 sm:gap-8 pb-12 max-w-full overflow-hidden">
      <PricingKpiCards stats={stats} onOpenPromoCodes={() => document.getElementById("promotional-codes-section")?.scrollIntoView({ behavior: "smooth" })} />

      <SubscriptionPlans
        plans={cards}
        onAddNewPlan={() => (canEdit ? setDialog({ type: "new-plan" }) : readOnly())}
        onEditPlan={(card) => (canEdit ? setDialog({ type: "plan", item: card.raw }) : readOnly())}
        onManageTrialRules={() => (canEdit ? setDialog({ type: "trial" }) : readOnly())}
        onConfigureEnterprise={() => (canEdit ? setDialog({ type: "enterprise" }) : readOnly())}
      />
      {archived.length > 0 && (
        <p className="text-xs text-light-black -mt-4">
          Archived (not offered to new customers):{" "}
          {archived.map((plan, index) => (
            <span key={plan.id}>
              {index > 0 && ", "}
              <button type="button" onClick={() => canEdit && setDialog({ type: "plan", item: plan })} className="font-semibold text-dark-black/80 hover:text-primary hover:underline cursor-pointer">
                {plan.name}
              </button>
            </span>
          ))}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 items-stretch">
        <ReportAddOns tiers={settings.reportAddOns.tiers} onEditPlan={() => (canEdit ? setDialog({ type: "addons" }) : readOnly())} />
        <PlaybookAddOns />
        <BillingRules key={JSON.stringify(settings.billingRules)} initial={settings.billingRules} onSave={canEdit ? (rules) => save("Billing rules not saved", "/api/v1/admin/pricing-settings/billingRules", "PUT", rules) : null} />
      </div>

      <div id="promotional-codes-section" className="w-full">
        <PromotionalCodes
          promoCodes={promoCodes.map(toPromoRow)}
          onAddNewCode={() => (canEdit ? setDialog({ type: "promo", item: null }) : readOnly())}
          onEditCode={(row) => (canEdit ? setDialog({ type: "promo", item: promoCodes.find((promo) => promo.id === row.id) }) : readOnly())}
          onDeleteCode={(id) => (canEdit ? setDialog({ type: "delete-promo", item: promoCodes.map(toPromoRow).find((promo) => promo.id === id) }) : readOnly())}
        />
      </div>

      {/* ── Dialogs (mounted when open, so each starts from the saved values) ── */}
      <AddNewPlanModal
        isOpen={dialog?.type === "new-plan"}
        onClose={close}
        onCreate={(form) => {
          const price = Number(form.price) || 0;
          const monthly = form.cycle === "Yearly" ? price / 12 : price;
          const discount = (100 - Number(settings.billingRules.annualDiscount || 0)) / 100;
          return save("Plan not created", "/api/v1/admin/plans", "POST", {
            name: form.name,
            status: form.active ? "Active" : "Archived",
            badge: form.popular ? "Most Popular" : "",
            displayOrder: plans.length,
            monthlyPrice: monthly.toFixed(2),
            annualPrice: (form.cycle === "Yearly" ? price : monthly * 12 * discount).toFixed(2),
            callsIncluded: form.calls,
            reportsIncluded: form.reports,
            calibrationsIncluded: form.calibrations,
            callOverageFee: form.overage || 0,
            reportOverageFee: 5,
          });
        }}
      />
      {dialog?.type === "plan" && (
        <EditPlanModal
          isOpen
          plan={dialog.item}
          onClose={close}
          onSave={(form) => save("Plan not saved", `/api/v1/admin/plans/${dialog.item.id}`, "PATCH", planBody(form))}
          onDelete={(plan) => save("Plan not deleted", `/api/v1/admin/plans/${plan.id}`, "DELETE")}
        />
      )}
      {dialog?.type === "trial" && <TrialRulesModal isOpen initial={settings.trial} onClose={close} onSave={(rules) => save("Trial rules not saved", "/api/v1/admin/pricing-settings/trial", "PUT", rules)} />}
      {dialog?.type === "addons" && <EditReportAddOnsModal isOpen initial={settings.reportAddOns} onClose={close} onSave={(value) => save("Add-ons not saved", "/api/v1/admin/pricing-settings/reportAddOns", "PUT", value)} />}
      {dialog?.type === "enterprise" && <EnterpriseConfigModal isOpen initial={settings.enterprise} onClose={close} onSave={(value) => save("Enterprise defaults not saved", "/api/v1/admin/pricing-settings/enterprise", "PUT", value)} />}
      {dialog?.type === "promo" && (
        <AddPromoCodeModal
          isOpen
          promoCode={dialog.item}
          plans={paidPlans}
          onClose={close}
          onSave={async (body) => {
            const result = dialog.item
              ? await save("Promo code not saved", `/api/v1/admin/promo-codes/${dialog.item.id}`, "PATCH", body)
              : await save("Promo code not created", "/api/v1/admin/promo-codes", "POST", body);
            return result.promoCode;
          }}
        />
      )}
      <DeletePromoCodeModal
        promo={dialog?.type === "delete-promo" ? dialog.item : null}
        onClose={close}
        onConfirm={(promo) => save("Promo code not deleted", `/api/v1/admin/promo-codes/${promo?.id}`, "DELETE")}
      />
    </div>
  );
}
