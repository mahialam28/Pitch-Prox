"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const dollars = (cents) => (cents / 100).toFixed(2).replace(/\.00$/, "");

// plan: a plan from /api/v1/admin/pricing. onSave(body) / onDelete(plan) save on the server and
// may refuse (the modal stays open). The parent remounts this modal (key) for each plan.
export const EditPlanModal = ({ isOpen, plan, onClose, onSave, onDelete }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(() => ({
    name: plan?.name ?? "",
    description: plan?.description ?? "",
    status: plan?.status ?? "Active",
    badge: plan?.badge ?? "",
    displayOrder: String(plan?.displayOrder ?? 1),
    callsIncluded: String(plan?.callsIncluded ?? 100),
    reportsIncluded: String(plan?.reportsIncluded ?? 1),
    calibrationsIncluded: String(plan?.calibrationsIncluded ?? 1),
    monthlyPrice: plan ? dollars(plan.priceMonthlyCents) : "49",
    annualPrice: plan ? dollars(plan.priceAnnualCents) : "470",
    callOverageFee: plan ? (plan.callOverageCents / 100).toFixed(2) : "0.35",
    reportOverageFee: plan ? (plan.reportOverageCents / 100).toFixed(2) : "5.00",
  }));
  const isTrial = Boolean(plan?.isTrial);

  if (!isOpen) return null;

  const handleMonthlyPriceChange = (val) => {
    const num = parseFloat(val);
    const autoAnnual = isNaN(num) ? "" : Math.round(num * 12 * 0.8).toString();
    setFormData((prev) => ({
      ...prev,
      monthlyPrice: val,
      annualPrice: autoAnnual,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    setSaving(true);
    try {
      await onSave(formData);
      toast.success(plan?.subscribers ? `Plan updated. ${plan.subscribers} existing customer${plan.subscribers === 1 ? " keeps" : "s keep"} their current price until they change plan.` : "Plan updated.");
      onClose();
    } catch {
      /* reported by the caller */
    } finally {
      setSaving(false);
    }
  };

  // Plans customers have used can only be archived
  const handleDelete = async () => {
    if (!onDelete || !plan) return;
    try {
      await onDelete(plan);
      toast.success(`Plan "${plan.name}" deleted.`);
      onClose();
    } catch {
      /* reported by the caller */
    }
  };

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center p-3 sm:p-4 bg-dark-black/50 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F8FAFC] w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray flex flex-col my-auto max-h-[92vh] overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 bg-white border-b border-light-gray/80 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-dark-black/85 font-secondary tracking-tight">
              Edit Plan
            </h2>
            <p className="text-xs sm:text-sm text-medium-black mt-0.5">
              Update the plan details, limits, pricing, and overage fee.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 sm:space-y-5">
          {/* 1. Plan Details Box */}
          <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
              Plan Details
            </h3>

            {/* Plan Name */}
            <div>
              <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                Plan Name <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Basic"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                required
              />
            </div>

            {/* Plan Description & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                  Plan Description
                </label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Essential plan for individual agents to start using PitchProX and improve their calls."
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 resize-none leading-relaxed"
                />
                <div className="text-right text-[11px] text-light-black mt-1">
                  {formData.description.length} / 200
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                  Plan Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Archived" disabled={isTrial}>Archived</option>
                </select>
                <span className="text-[11px] text-light-black mt-1.5 block">
                  Archived plans aren&apos;t offered to new customers. Plans with customers on them can&apos;t be archived.
                </span>
              </div>
            </div>

            {/* Plan Badge & Display Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                  Plan Badge <span className="text-light-black font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) =>
                    setFormData({ ...formData, badge: e.target.value })
                  }
                  placeholder="e.g. Most Popular"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                />
                <span className="text-[11px] text-light-black mt-1.5 block">
                  Shown on pricing cards
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: e.target.value })
                  }
                  placeholder="1"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                />
                <span className="text-[11px] text-light-black mt-1.5 block">
                  Lower numbers appear first.
                </span>
              </div>
            </div>
          </div>

          {/* 2. Usage Limits (Included in plan) */}
          <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                Usage Limits
              </h3>
              <span className="text-xs text-medium-black font-normal">
                (Included in plan)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                  Calls Included <span className="text-light-black font-normal">(per month)</span> <span className="text-red">*</span>
                </label>
                <input
                  type="number"
                  value={formData.callsIncluded}
                  onChange={(e) =>
                    setFormData({ ...formData, callsIncluded: e.target.value })
                  }
                  placeholder="150"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                  required
                />
                <span className="text-[11px] text-light-black mt-1.5 block">
                  Number of calls included each month.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                  Reports Included <span className="text-light-black font-normal">(per month)</span> <span className="text-red">*</span>
                </label>
                <input
                  type="number"
                  value={formData.reportsIncluded}
                  onChange={(e) =>
                    setFormData({ ...formData, reportsIncluded: e.target.value })
                  }
                  placeholder="1"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                  required
                />
                <span className="text-[11px] text-light-black mt-1.5 block">
                  Number of reports included each month.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                  Calibrations Included <span className="text-light-black font-normal">(per month)</span>
                </label>
                <input
                  type="number"
                  value={formData.calibrationsIncluded}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      calibrationsIncluded: e.target.value,
                    })
                  }
                  placeholder="1"
                  className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                />
                <span className="text-[11px] text-light-black mt-1.5 block">
                  Number of calibrations included each month.
                </span>
              </div>
            </div>
          </div>

          {/* 3. Pricing & Overage Pricing (Two Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pricing Card */}
            <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                  Pricing
                </h3>
                <p className="text-xs text-medium-black mt-0.5">
                  Set the subscription price for this plan.
                </p>

                {/* Monthly Price */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Monthly Price (USD) <span className="text-red">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-medium-black">
                      $
                    </span>
                    <input
                      type="text"
                      value={formData.monthlyPrice}
                      onChange={(e) => handleMonthlyPriceChange(e.target.value)}
                      placeholder="99"
                      className="w-full text-xs font-medium pl-8 pr-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-light-black mt-1.5 block">
                    Price charged every month.
                  </span>
                </div>

                {/* Annual Price */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Annual Price (USD)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-medium-black">
                      $
                    </span>
                    <input
                      type="text"
                      value={formData.annualPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, annualPrice: e.target.value })
                      }
                      placeholder="948"
                      className="w-full text-xs font-medium pl-8 pr-20 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    />
                    <span className="absolute right-3 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      20% OFF
                    </span>
                  </div>
                  <span className="text-[11px] text-light-black mt-1.5 block">
                    Leave empty to auto-calculate (Monthly × 12 × 0.80)
                  </span>
                </div>
              </div>
            </div>

            {/* Overage Pricing Card */}
            <div className="bg-white rounded-2xl border border-light-gray/80 p-4 sm:p-5 space-y-4 shadow-2xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
                  Overage Pricing
                </h3>
                <p className="text-xs text-medium-black mt-0.5">
                  Set the price for usage beyond the included limits.
                </p>

                {/* Call Overage Fee */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Call Overage Fee <span className="text-light-black font-normal">(per additional call)</span> <span className="text-red">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-medium-black">
                      $
                    </span>
                    <input
                      type="text"
                      value={formData.callOverageFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          callOverageFee: e.target.value,
                        })
                      }
                      placeholder="0.35"
                      className="w-full text-xs font-medium pl-8 pr-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                      required
                    />
                  </div>
                  <span className="text-[11px] text-light-black mt-1.5 block">
                    Charge applied for each call beyond the monthly limit.
                  </span>
                </div>

                {/* Report Overage Fee */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                    Report Overage Fee <span className="text-light-black font-normal">(per additional report)</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-medium-black">
                      $
                    </span>
                    <input
                      type="text"
                      value={formData.reportOverageFee}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reportOverageFee: e.target.value,
                        })
                      }
                      placeholder="5.00"
                      className="w-full text-xs font-medium pl-8 pr-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    />
                  </div>
                  <span className="text-[11px] text-light-black mt-1.5 block">
                    Charge applied for each report beyond the monthly limit.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-light-gray/80 bg-[#F8FAFC]">
            {plan && !isTrial ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-xl border border-red/40 bg-white hover:bg-red/5 text-xs font-semibold text-red transition-all shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Plan</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditPlanModal;
