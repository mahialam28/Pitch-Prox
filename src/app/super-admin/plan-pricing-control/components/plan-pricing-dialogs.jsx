"use client";

import React, { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import ConfirmDialog from "@/components/modals/confirm-dialog";
import { Field, Select, Checkbox, fieldClass } from "@/app/super-admin/users/[id]/components/account-dialogs";
import { showSavedToast } from "@/lib/toast";

// Design-only dialogs for Plan & Pricing Control (local state, no API).

export const showBillingRulesSavedToast = () => showSavedToast("Billing rules saved", "Changes apply to all new billing cycles.");

const MoneyInput = ({ id, value, onChange }) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-medium-black">$</span>
    <input id={id} inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" className={`${fieldClass} pl-8`} />
  </div>
);

const NumberInput = ({ id, value, onChange }) => (
  <input id={id} inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))} placeholder="0" className={fieldClass} />
);

const EMPTY_PLAN = { name: "", price: "", cycle: "Monthly", calls: "", reports: "", calibrations: "", overage: "", popular: false, active: true };

// Returns a plan in the same shape as the subscription plan cards
const toPlanCard = (form) => {
  const price = Number(form.price || 0);
  const monthly = form.cycle === "Monthly";
  return {
    id: `plan-${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    name: form.name.trim(),
    status: form.active ? "Active" : "Draft",
    price: `$${price % 1 ? price.toFixed(2) : price}`,
    period: monthly ? "/month" : "/year",
    isCustom: false,
    isPopular: form.popular,
    annualPrice: monthly ? `$${(price * 12 * 0.8).toLocaleString("en-US", { maximumFractionDigits: 0 })} /year` : undefined,
    discountBadge: monthly ? "Save 20%" : undefined,
    features: [
      `${Number(form.calls || 0)} Calls / month`,
      `${Number(form.reports || 0)} Reports / month`,
      `${Number(form.calibrations || 0)} Calibrations`,
    ],
    overage: `$${Number(form.overage || 0).toFixed(2)} per additional call`,
    actionType: "edit-plan",
    actionLabel: "Edit Plan",
    actionIcon: Pencil,
    buttonStyle: "bg-primary hover:bg-primary/90 text-white shadow-2xs",
  };
};

export const AddNewPlanModal = ({ isOpen, onClose, onCreate }) => {
  const [form, setForm] = useState(EMPTY_PLAN);
  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));
  const valid = form.name.trim() && form.price !== "";

  const close = () => {
    setForm(EMPTY_PLAN);
    onClose();
  };

  const create = () => {
    onCreate?.(toPlanCard(form));
    showSavedToast("Plan created", `${form.name.trim()} is ${form.active ? "now visible to customers" : "saved as a draft"}.`);
    close();
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={close}
      title="Add New Plan"
      subtitle="Create a subscription plan customers can choose."
      size="lg"
      footer={
        <>
          <DialogButton onClick={close}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={create} disabled={!valid}>Create Plan</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="Plan name" htmlFor="plan-name">
          <input id="plan-name" value={form.name} onChange={(event) => set("name")(event.target.value)} placeholder="e.g., Growth" className={fieldClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Price" htmlFor="plan-price">
            <MoneyInput id="plan-price" value={form.price} onChange={set("price")} />
          </Field>
          <Field label="Billing cycle" htmlFor="plan-cycle">
            <Select id="plan-cycle" value={form.cycle} onChange={set("cycle")} options={["Monthly", "Yearly"]} />
          </Field>
          <Field label="Calls per month" htmlFor="plan-calls">
            <NumberInput id="plan-calls" value={form.calls} onChange={set("calls")} />
          </Field>
          <Field label="Reports per month" htmlFor="plan-reports">
            <NumberInput id="plan-reports" value={form.reports} onChange={set("reports")} />
          </Field>
          <Field label="Calibrations" htmlFor="plan-calibrations">
            <NumberInput id="plan-calibrations" value={form.calibrations} onChange={set("calibrations")} />
          </Field>
          <Field label="Overage per extra call" htmlFor="plan-overage">
            <MoneyInput id="plan-overage" value={form.overage} onChange={set("overage")} />
          </Field>
        </div>
        <div className="space-y-3">
          <Checkbox checked={form.popular} onChange={set("popular")}>Mark as &quot;Most popular&quot;</Checkbox>
          <Checkbox checked={form.active} onChange={set("active")}>Plan is active and visible to customers</Checkbox>
        </div>
      </div>
    </DialogModal>
  );
};

export const DeletePromoCodeModal = ({ promo, onClose, onConfirm }) => (
  <ConfirmDialog
    isOpen={Boolean(promo)}
    onClose={onClose}
    title="Delete promo code?"
    icon={Trash2}
    message={`${promo?.code ?? ""} (${promo?.value ?? ""}, ${(promo?.appliesTo ?? "").toLowerCase()}) will stop working immediately.`}
    note="Customers who already redeemed it keep their discount."
    confirmLabel="Delete Promo Code"
    onConfirm={() => {
      onConfirm?.(promo);
      showSavedToast("Promo code deleted", `${promo?.code} can no longer be redeemed.`);
    }}
  />
);
