"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, FileText, Plus, Trash2, Info } from "lucide-react";
import toast from "react-hot-toast";

const defaultTiers = [
  { id: 1, reports: "5", price: "25.00", unitPrice: "$5.00", active: true },
  { id: 2, reports: "15", price: "60.00", unitPrice: "$4.00", active: true },
  { id: 3, reports: "30", price: "99.00", unitPrice: "$3.30", active: true },
  { id: 4, reports: "50", price: "149.00", unitPrice: "$2.98", active: true },
];

export const EditReportAddOnsModal = ({ isOpen, onClose, onSave }) => {
  const [addOnStatus, setAddOnStatus] = useState(true);
  const [tiers, setTiers] = useState(defaultTiers);
  const [allowStacking, setAllowStacking] = useState(true);
  const [reportRollover, setReportRollover] = useState(false);
  const [maxBundlesPerCycle, setMaxBundlesPerCycle] = useState("10");

  if (!isOpen) return null;

  const handleTierChange = (id, field, value) => {
    setTiers((prev) =>
      prev.map((tier) => {
        if (tier.id === id) {
          const updated = { ...tier, [field]: value };
          if (field === "reports" || field === "price") {
            const r = parseFloat(field === "reports" ? value : tier.reports);
            const p = parseFloat(field === "price" ? value : tier.price);
            if (!isNaN(r) && !isNaN(p) && r > 0) {
              updated.unitPrice = `$${(p / r).toFixed(2)}`;
            }
          }
          return updated;
        }
        return tier;
      })
    );
  };

  const handleAddTier = () => {
    const newId = Date.now();
    setTiers([
      ...tiers,
      {
        id: newId,
        reports: "100",
        price: "249.00",
        unitPrice: "$2.49",
        active: true,
      },
    ]);
  };

  const handleDeleteTier = (id) => {
    if (tiers.length <= 1) {
      toast.error("At least one bundle tier is required.");
      return;
    }
    setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleResetChanges = () => {
    setAddOnStatus(true);
    setTiers(defaultTiers);
    setAllowStacking(true);
    setReportRollover(false);
    setMaxBundlesPerCycle("10");
    toast.success("Changes reset");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        addOnStatus,
        tiers,
        allowStacking,
        reportRollover,
        maxBundlesPerCycle,
      });
    }
    toast.success("Report Add-Ons updated successfully!");
    onClose();
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
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-light-gray flex flex-col my-auto max-h-[92vh] overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 bg-white border-b border-light-gray/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-dark-black/85 font-secondary tracking-tight">
                Edit Report Add-Ons
              </h2>
              <p className="text-xs sm:text-sm text-medium-black mt-0.5">
                Configure individual report pricing, bundle tiers, and purchasing rules.
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

        {/* Modal Form Scrollable Area */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {/* Add-On Status */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-dark-black/80">
              Add-On Status
            </span>
            <button
              type="button"
              onClick={() => setAddOnStatus(!addOnStatus)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                addOnStatus ? "bg-primary" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  addOnStatus ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                addOnStatus
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
            >
              {addOnStatus ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Report Bundle Tiers Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
              Report Bundle Tiers
            </h3>

            <div className="border border-light-gray/80 rounded-2xl overflow-hidden p-3 sm:p-4 space-y-2.5 bg-white shadow-2xs">
              {/* Table Headers */}
              <div className="grid grid-cols-12 gap-2 text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider px-2 pb-1">
                <div className="col-span-3">REPORTS</div>
                <div className="col-span-4">BUNDLE PRICE</div>
                <div className="col-span-2">PRICE / REPORT</div>
                <div className="col-span-2 text-center">STATUS</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {/* Rows */}
              {tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="grid grid-cols-12 gap-2 items-center px-2 py-1.5 rounded-xl hover:bg-light-gray/20 transition-colors"
                >
                  {/* Reports */}
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={tier.reports}
                      onChange={(e) =>
                        handleTierChange(tier.id, "reports", e.target.value)
                      }
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                    />
                  </div>

                  {/* Bundle Price */}
                  <div className="col-span-4">
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-medium-black">
                        $
                      </span>
                      <input
                        type="text"
                        value={tier.price}
                        onChange={(e) =>
                          handleTierChange(tier.id, "price", e.target.value)
                        }
                        className="w-full text-xs font-semibold pl-7 pr-3 py-2 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                      />
                    </div>
                  </div>

                  {/* Price / Report */}
                  <div className="col-span-2 text-xs font-semibold text-medium-black">
                    {tier.unitPrice}
                  </div>

                  {/* Status Switch */}
                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleTierChange(tier.id, "active", !tier.active)
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        tier.active ? "bg-primary" : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          tier.active ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-[11px] font-medium text-dark-black/70 hidden sm:inline">
                      {tier.active ? "Active" : "Off"}
                    </span>
                  </div>

                  {/* Trash Action */}
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteTier(tier.id)}
                      className="p-1 rounded-md text-light-black hover:text-red hover:bg-red/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Bundle Tier Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary text-primary hover:bg-primary/5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Bundle Tier</span>
                </button>
              </div>
            </div>
          </div>

          {/* Availability & Billing Rules */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-dark-black/85 font-secondary">
              Availability & Billing Rules
            </h3>

            <div className="border border-light-gray/80 rounded-2xl p-4 sm:p-5 space-y-4 bg-white shadow-2xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Allow bundle stacking */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-dark-black/80 block">
                      Allow bundle stacking
                    </span>
                    <span className="text-[11px] text-light-black">
                      Customers can purchase multiple bundles.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAllowStacking(!allowStacking)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      allowStacking ? "bg-primary" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        allowStacking ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Report rollover */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-dark-black/80 block">
                      Report rollover
                    </span>
                    <span className="text-[11px] text-light-black">
                      Unused reports do not carry into the next billing cycle.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReportRollover(!reportRollover)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      reportRollover ? "bg-primary" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        reportRollover ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Maximum Bundles per Cycle */}
              <div className="pt-3 border-t border-light-gray/40">
                <label className="block text-xs font-semibold text-dark-black/80 mb-1.5">
                  Maximum Bundles per Cycle
                </label>
                <input
                  type="number"
                  value={maxBundlesPerCycle}
                  onChange={(e) => setMaxBundlesPerCycle(e.target.value)}
                  className="w-full sm:w-64 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-light-gray bg-white focus:outline-hidden focus:border-primary text-dark-black/85"
                />
              </div>
            </div>
          </div>

          {/* Blue Info Alert Box */}
          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-[#1E40AF]">
            <Info className="w-4 h-4 shrink-0 text-[#3B82F6] mt-0.5" />
            <span>
              Pricing changes apply to future purchases only. Existing report balances are not affected.
            </span>
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-light-gray/80">
            <button
              type="button"
              onClick={handleResetChanges}
              className="text-xs font-medium text-medium-black hover:text-dark-black transition-colors cursor-pointer"
            >
              Reset Changes
            </button>

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
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditReportAddOnsModal;
