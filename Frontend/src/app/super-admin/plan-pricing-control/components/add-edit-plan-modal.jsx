"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, Plus, Trash2, Check } from "lucide-react";
import toast from "react-hot-toast";

export const AddEditPlanModal = ({ isOpen, plan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    period: "/month",
    annualPrice: "",
    discountBadge: "Save 20%",
    callsQuota: "",
    reportsQuota: "",
    calibrationsQuota: "",
    supportTier: "Standard Support",
    overage: "",
    isPopular: false,
    status: "Active",
    features: [""],
  });

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || "",
        price: plan.price ? plan.price.replace("$", "") : "",
        period: plan.period || "/month",
        annualPrice: plan.annualPrice || "",
        discountBadge: plan.discountBadge || "Save 20%",
        callsQuota: "",
        reportsQuota: "",
        calibrationsQuota: "",
        supportTier: "Standard Support",
        overage: plan.overage || "",
        isPopular: plan.isPopular || false,
        status: plan.status || "Active",
        features: plan.features && plan.features.length ? [...plan.features] : [""],
      });
    } else {
      setFormData({
        name: "",
        price: "",
        period: "/month",
        annualPrice: "",
        discountBadge: "Save 20%",
        callsQuota: "200",
        reportsQuota: "3",
        calibrationsQuota: "2",
        supportTier: "Standard Support",
        overage: "$0.30 per additional call",
        isPopular: false,
        status: "Active",
        features: [
          "200 Calls / month",
          "3 Reports / month",
          "2 Calibrations",
          "Standard Support",
        ],
      });
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }));
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleFeatureChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.features];
      updated[index] = value;
      return { ...prev, features: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    const savedPlan = {
      id: plan ? plan.id : `plan-${Date.now()}`,
      name: formData.name,
      status: formData.status,
      price: formData.price.startsWith("$") ? formData.price : `$${formData.price}`,
      period: formData.period,
      isCustom: false,
      isPopular: formData.isPopular,
      annualPrice: formData.annualPrice,
      discountBadge: formData.discountBadge,
      features: formData.features.filter((f) => f.trim() !== ""),
      overage: formData.overage,
      actionType: "edit-plan",
      actionLabel: "Edit Plan",
      buttonStyle: formData.isPopular
        ? "bg-primary hover:bg-primary/90 text-white shadow-2xs"
        : "border border-light-gray hover:bg-light-gray/40 text-dark-black/80",
    };

    onSave(savedPlan);
    toast.success(plan ? "Plan updated successfully" : "New plan created successfully");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-dark-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-light-gray flex flex-col max-h-[90vh] overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-light-gray shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark-black/80 font-secondary">
                {plan ? `Edit Plan: ${plan.name}` : "Add New Subscription Plan"}
              </h3>
              <p className="text-xs text-medium-black mt-0.5">
                Configure plan parameters, quotas, and pricing limits.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {/* Plan Name & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Growth Pro"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-light-gray focus:outline-hidden focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-light-gray focus:outline-hidden focus:border-primary bg-white"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                Monthly Price ($)
              </label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="99"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-light-gray focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                Annual Price Label
              </label>
              <input
                type="text"
                value={formData.annualPrice}
                onChange={(e) =>
                  setFormData({ ...formData, annualPrice: e.target.value })
                }
                placeholder="$948 /year"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-light-gray focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                Overage Rate
              </label>
              <input
                type="text"
                value={formData.overage}
                onChange={(e) =>
                  setFormData({ ...formData, overage: e.target.value })
                }
                placeholder="$0.30 per additional call"
                className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-light-gray focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          {/* Most Popular Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-light-gray bg-light-gray/10">
            <div>
              <span className="text-xs font-bold text-dark-black/80 block">
                Feature as &quot;Most Popular&quot;
              </span>
              <span className="text-[11px] text-medium-black">
                Applies highlighted border and badge on the pricing grid
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.isPopular}
              onChange={(e) =>
                setFormData({ ...formData, isPopular: e.target.checked })
              }
              className="w-4 h-4 text-primary focus:ring-primary rounded"
            />
          </div>

          {/* Features Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-dark-black/80">
                Included Features & Limits
              </label>
              <button
                type="button"
                onClick={handleAddFeature}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Feature</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(idx, e.target.value)}
                    placeholder="e.g. 500 Calls / month"
                    className="flex-1 text-xs font-medium px-3 py-2 rounded-xl border border-light-gray focus:outline-hidden focus:border-primary"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1.5 text-medium-black hover:text-red transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-light-gray">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {plan ? "Save Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddEditPlanModal;
