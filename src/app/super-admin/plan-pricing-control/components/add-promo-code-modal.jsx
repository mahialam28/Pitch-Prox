"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Tag, Calendar, Clock, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

const iso = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");
const TYPE_BY_VALUE = { percent: "Percentage Discount", fixed: "Fixed Amount", free_reports: "Free Reports", free_calls: "Free Calls", trial_days: "Trial Extension" };

// promoCode: a saved code from the API (edit) or null (new). plans: paid plans for "Applies To".
// onSave(body) saves it; the parent remounts this modal (key) for each code.
export const AddPromoCodeModal = ({ isOpen, promoCode, onClose, onSave, plans = [] }) => {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(() =>
    promoCode
      ? {
          code: promoCode.code,
          name: promoCode.name ?? "",
          description: promoCode.description ?? "",
          discountType: TYPE_BY_VALUE[promoCode.discountType] ?? "Percentage Discount",
          discountValue: promoCode.discountType === "fixed" ? String(promoCode.discountValue / 100) : String(promoCode.discountValue),
          appliesTo: promoCode.planIds ? promoCode.planIds.join(",") : "All Plans",
          minPurchase: (promoCode.minPurchaseCents / 100).toFixed(2),
          maxUses: promoCode.maxUses === null ? "" : String(promoCode.maxUses),
          perUserLimit: String(promoCode.perCustomerLimit),
          unlimitedUses: promoCode.maxUses === null,
          stackableWithOthers: promoCode.stackable,
          startDate: iso(promoCode.startsAt),
          expirationDate: iso(promoCode.expiresAt),
          timeZone: "(GMT-05:00) Eastern Time (US & Canada)",
          status: promoCode.status === "Paused" ? "Paused" : "Active",
        }
      : {
          code: "",
          name: "",
          description: "",
          discountType: "Percentage Discount",
          discountValue: "20",
          appliesTo: "All Plans",
          minPurchase: "0.00",
          maxUses: "500",
          perUserLimit: "1",
          unlimitedUses: false,
          stackableWithOthers: false,
          startDate: iso(new Date()),
          expirationDate: "",
          timeZone: "(GMT-05:00) Eastern Time (US & Canada)",
          status: "Active",
        }
  );

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Promo code is required.");
      return;
    }
    setSaving(true);
    try {
      const saved = await onSave({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        planIds: formData.appliesTo === "All Plans" ? null : formData.appliesTo.split(","),
        minPurchase: formData.minPurchase || 0,
        maxUses: formData.unlimitedUses ? null : formData.maxUses,
        unlimitedUses: formData.unlimitedUses,
        perCustomerLimit: formData.perUserLimit,
        stackable: formData.stackableWithOthers,
        startsAt: formData.startDate || null,
        expiresAt: formData.expirationDate || null,
        status: formData.status,
      });
      toast.success(promoCode ? `Promo code "${saved.code}" updated.` : `Promo code "${saved.code}" created.`);
      onClose();
    } catch {
      /* reported by the caller */
    } finally {
      setSaving(false);
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
        className="bg-white w-full max-w-6xl rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray flex flex-col my-auto max-h-[92vh] overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 bg-white border-b border-light-gray/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0 shadow-2xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-dark-black/85 font-secondary tracking-tight">
                {promoCode ? `Edit Promo Code: ${promoCode.code}` : "Add Promo Code"}
              </h2>
              <p className="text-xs sm:text-sm text-medium-black mt-0.5">
                Create a new promotional code to offer discounts or credits.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Column Responsive Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-start">
            {/* 1. Code Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-black/85 uppercase tracking-wider font-secondary">
                Code Information
              </h3>

              {/* Promo Code */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Promo Code <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="SUMMER20"
                  className="w-full text-xs font-bold uppercase px-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                  required
                />
                <span className="text-[10px] text-light-black mt-1 block">
                  Customers will enter this code at checkout.
                </span>
              </div>

              {/* Promo Name */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Promo Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Summer 20% Off"
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                  required
                />
                <span className="text-[10px] text-light-black mt-1 block">
                  Internal name for reference only.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="20% discount on all monthly and annual plans."
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 resize-none leading-relaxed"
                />
                <div className="text-right text-[10px] text-light-black mt-0.5">
                  {formData.description.length} / 200
                </div>
              </div>
            </div>

            {/* 2. Discount Configuration */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-black/85 uppercase tracking-wider font-secondary">
                Discount Configuration
              </h3>

              {/* Discount Type */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Discount Type <span className="text-red">*</span>
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) =>
                    setFormData({ ...formData, discountType: e.target.value })
                  }
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                >
                  <option value="Percentage Discount">Percentage Discount</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Free Reports">Free Reports</option>
                  <option value="Trial Extension">Trial Extension</option>
                  <option value="Free Calls">Free Calls</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Discount Value <span className="text-red">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    placeholder="20"
                    className="w-full text-xs font-semibold px-3 py-2 pr-8 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    required
                  />
                  <span className="absolute right-3 text-xs font-bold text-medium-black">
                    {formData.discountType === "Percentage Discount"
                      ? "%"
                      : formData.discountType === "Fixed Amount"
                      ? "$"
                      : "Units"}
                  </span>
                </div>
                <span className="text-[10px] text-light-black mt-1 block">
                  Enter a percentage value.
                </span>
              </div>

              {/* Applies To */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Applies To <span className="text-red">*</span>
                </label>
                <select
                  value={formData.appliesTo}
                  onChange={(e) =>
                    setFormData({ ...formData, appliesTo: e.target.value })
                  }
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                >
                  <option value="All Plans">All Plans</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name} only</option>
                  ))}
                  {formData.appliesTo.includes(",") && <option value={formData.appliesTo}>{promoCode?.appliesTo}</option>}
                </select>
              </div>

              {/* Minimum Purchase */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Minimum Purchase <span className="text-light-black font-normal">(Optional)</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-medium-black">
                    $
                  </span>
                  <input
                    type="text"
                    value={formData.minPurchase}
                    onChange={(e) =>
                      setFormData({ ...formData, minPurchase: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full text-xs font-semibold pl-7 pr-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                  />
                </div>
                <span className="text-[10px] text-light-black mt-1 block">
                  Minimum amount required to use this code.
                </span>
              </div>
            </div>

            {/* 3. Usage Limits */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-black/85 uppercase tracking-wider font-secondary">
                Usage Limits
              </h3>

              {/* Max Uses */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Max Uses <span className="text-light-black font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  disabled={formData.unlimitedUses}
                  value={formData.maxUses}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUses: e.target.value })
                  }
                  placeholder="500"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 disabled:opacity-50"
                />
                <span className="text-[10px] text-light-black mt-1 block">
                  Total number of times this code can be used.
                </span>
              </div>

              {/* Per User Limit */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Per User Limit <span className="text-light-black font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, perUserLimit: e.target.value })
                  }
                  placeholder="1"
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                />
                <span className="text-[10px] text-light-black mt-1 block">
                  How many times each user can use this code.
                </span>
              </div>

              {/* Unlimited Uses Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-dark-black/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.unlimitedUses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unlimitedUses: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-primary rounded focus:ring-primary mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-primary block">
                      Unlimited Uses
                    </span>
                    <span className="text-[10px] text-light-black">
                      Check if this code has no usage limit.
                    </span>
                  </div>
                </label>
              </div>

              {/* Stackable with other codes */}
              <div>
                <label className="flex items-start gap-2.5 text-xs text-dark-black/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.stackableWithOthers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stackableWithOthers: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-primary rounded focus:ring-primary mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-dark-black/80 block">
                      Stackable with other codes
                    </span>
                    <span className="text-[10px] text-light-black">
                      Allow this code to be used with others.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Validity */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-black/85 uppercase tracking-wider font-secondary">
                Validity
              </h3>

              {/* Start Date */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Start Date <span className="text-red">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full text-xs font-medium px-3 py-2 pr-9 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    required
                  />
                  <Calendar className="w-4 h-4 text-light-black absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Expiration Date <span className="text-light-black font-normal">(Optional, empty = never expires)</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expirationDate: e.target.value,
                      })
                    }
                    className="w-full text-xs font-medium px-3 py-2 pr-9 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                  />
                  <Calendar className="w-4 h-4 text-light-black absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* Time Zone */}
              <div>
                <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                  Time Zone
                </label>
                <div className="relative flex items-center">
                  <select
                    value={formData.timeZone}
                    onChange={(e) =>
                      setFormData({ ...formData, timeZone: e.target.value })
                    }
                    className="w-full text-[11px] font-medium px-2.5 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer truncate"
                  >
                    <option value="(GMT-05:00) Eastern Time (US & Canada)">
                      (GMT-05:00) Eastern Time (US & Canada)
                    </option>
                    <option value="(GMT-08:00) Pacific Time (US & Canada)">
                      (GMT-08:00) Pacific Time (US & Canada)
                    </option>
                    <option value="(GMT+00:00) UTC">
                      (GMT+00:00) UTC
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. Status & Code Preview */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-dark-black/85 uppercase tracking-wider font-secondary">
                Status
              </h3>

              {/* Status Select */}
              <div>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Expired">Expired</option>
                </select>
                <span className="text-[10px] text-light-black mt-1 block">
                  Inactive codes cannot be used.
                </span>
              </div>

              {/* Code Preview Card */}
              <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-4 space-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E40AF]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Code Preview</span>
                </div>
                <p className="text-xs text-[#1E40AF] leading-relaxed">
                  Users will enter <span className="font-bold">{formData.code || "CODE"}</span> at checkout to receive{" "}
                  <span className="font-bold">
                    {formData.discountType === "Percentage Discount"
                      ? `${formData.discountValue}% off`
                      : `$${formData.discountValue} off`}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-light-gray/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              {promoCode ? "Save Changes" : "Create Promo Code"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddPromoCodeModal;
