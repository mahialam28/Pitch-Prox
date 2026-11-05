"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const EditPlanModal = ({ isOpen, plan, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    name: "Basic",
    description:
      "Essential plan for individual agents to start using PitchProX and improve their calls.",
    status: "Active",
    badge: "",
    displayOrder: "1",
    callsIncluded: "150",
    reportsIncluded: "1",
    calibrationsIncluded: "1",
    monthlyPrice: "99",
    annualPrice: "948",
    callOverageFee: "0.35",
    reportOverageFee: "5.00",
  });

  useEffect(() => {
    if (plan) {
      const isPro = plan.id === "pro";
      const isProX = plan.id === "prox";
      const isEnterprise = plan.id === "enterprise";
      const isFree = plan.id === "free-trial";

      setFormData({
        name: plan.name || "Basic",
        description:
          plan.description ||
          (isFree
            ? "Free 7-day trial for agents to experience PitchProX AI capabilities."
            : isPro
            ? "High-performance plan for active agents needing higher call quotas and priority support."
            : isProX
            ? "Ultimate powerhouse tier for top producers and high-volume closers."
            : isEnterprise
            ? "Custom enterprise tier for large brokerage teams with SLA guarantees."
            : "Essential plan for individual agents to start using PitchProX and improve their calls."),
        status: plan.status || "Active",
        badge: plan.isPopular ? "Most Popular" : plan.badge || "",
        displayOrder: isFree ? "0" : isPro ? "2" : isProX ? "3" : isEnterprise ? "4" : "1",
        callsIncluded: isFree ? "10" : isPro ? "400" : isProX ? "750" : isEnterprise ? "2500" : "150",
        reportsIncluded: isFree ? "1" : isPro ? "5" : isProX ? "15" : isEnterprise ? "50" : "1",
        calibrationsIncluded: isFree ? "1" : isPro ? "3" : isProX ? "10" : isEnterprise ? "25" : "1",
        monthlyPrice: plan.price ? plan.price.replace("$", "").replace("Custom Pricing", "999") : "99",
        annualPrice: plan.annualPrice ? plan.annualPrice.replace("$", "").split(" ")[0] : "948",
        callOverageFee: plan.overage ? plan.overage.replace("$", "").split(" ")[0] : "0.35",
        reportOverageFee: "5.00",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "Active",
        badge: "",
        displayOrder: "1",
        callsIncluded: "100",
        reportsIncluded: "1",
        calibrationsIncluded: "1",
        monthlyPrice: "49",
        annualPrice: "470",
        callOverageFee: "0.35",
        reportOverageFee: "5.00",
      });
    }
  }, [plan, isOpen]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    const isPopular =
      formData.badge.toLowerCase().includes("popular") ||
      formData.badge.toLowerCase().includes("most popular");

    const savedPlan = {
      id: plan ? plan.id : `plan-${Date.now()}`,
      name: formData.name,
      status: formData.status,
      description: formData.description,
      badge: formData.badge,
      displayOrder: formData.displayOrder,
      price: `$${formData.monthlyPrice}`,
      period: "/month",
      annualPrice: formData.annualPrice ? `$${formData.annualPrice} /year` : null,
      discountBadge: "Save 20%",
      isCustom: formData.name.toLowerCase() === "enterprise",
      isPopular: isPopular,
      features: [
        `${formData.callsIncluded} Calls / month`,
        `${formData.reportsIncluded} Reports / month`,
        `${formData.calibrationsIncluded} Calibrations`,
        isPopular ? "Priority Support" : "Standard Support",
      ],
      overage: `$${formData.callOverageFee} per additional call`,
      actionType: "edit-plan",
      actionLabel: "Edit Plan",
      buttonStyle: isPopular
        ? "bg-primary hover:bg-primary/90 text-white shadow-2xs"
        : "border border-light-gray hover:bg-light-gray/40 text-dark-black/80",
    };

    onSave(savedPlan);
    toast.success("Plan updated successfully");
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && plan) {
      onDelete(plan.id);
      toast.error(`Plan "${plan.name}" deleted.`);
      onClose();
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
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
                <span className="text-[11px] text-light-black mt-1.5 block">
                  Inactive plans won&apos;t be available for new users.
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
            {plan ? (
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
