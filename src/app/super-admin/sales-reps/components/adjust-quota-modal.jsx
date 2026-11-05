"use client";

import React, { useState } from "react";
import {
  X,
  Users,
  Search,
  ArrowRight,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";

const initialReps = [
  {
    id: "rep-1",
    name: "Sarah Jenkins",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100",
    currentQuota: 150000,
    newQuota: 157500,
    change: "+5.0%",
    isPositive: true,
  },
  {
    id: "rep-2",
    name: "Michael Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    currentQuota: 150000,
    newQuota: 157500,
    change: "+5.0%",
    isPositive: true,
  },
  {
    id: "rep-3",
    name: "Elena Rodriguez",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
    currentQuota: 120000,
    newQuota: 120000,
    change: "0.0%",
    isPositive: null,
  },
  {
    id: "rep-4",
    name: "Ryan Anderson",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    currentQuota: 180000,
    newQuota: 189000,
    change: "+5.0%",
    isPositive: true,
  },
  {
    id: "rep-5",
    name: "David Martinez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
    currentQuota: 130000,
    newQuota: 136500,
    change: "+5.0%",
    isPositive: true,
  },
];

const adjustmentTypeOptions = [
  { value: "Percentage Increase (+)", label: "Percentage Increase (+)" },
  { value: "Percentage Decrease (-)", label: "Percentage Decrease (-)" },
  { value: "Fixed Target Set", label: "Fixed Target Set" },
];

export default function AdjustQuotaModal({ isOpen, onClose }) {
  const [bulkEnabled, setBulkEnabled] = useState(true);
  const [adjustmentType, setAdjustmentType] = useState("Percentage Increase (+)");
  const [percentageValue, setPercentageValue] = useState("5");
  const [searchTerm, setSearchTerm] = useState("");
  const [repsList, setRepsList] = useState(initialReps);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handlePercentageChange = (val) => {
    setPercentageValue(val);
    const num = parseFloat(val) || 0;
    if (bulkEnabled) {
      setRepsList((prev) =>
        prev.map((rep) => {
          const factor = adjustmentType.includes("Decrease") ? 1 - num / 100 : 1 + num / 100;
          const updated = Math.round(rep.currentQuota * factor);
          const diff = ((updated - rep.currentQuota) / rep.currentQuota) * 100;
          return {
            ...rep,
            newQuota: updated,
            change: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
            isPositive: diff > 0 ? true : diff < 0 ? false : null,
          };
        })
      );
    }
  };

  const handleAdjustmentTypeSelect = (type) => {
    setAdjustmentType(type);
    const num = parseFloat(percentageValue) || 0;
    if (bulkEnabled) {
      setRepsList((prev) =>
        prev.map((rep) => {
          const factor = type.includes("Decrease") ? 1 - num / 100 : 1 + num / 100;
          const updated = Math.round(rep.currentQuota * factor);
          const diff = ((updated - rep.currentQuota) / rep.currentQuota) * 100;
          return {
            ...rep,
            newQuota: updated,
            change: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
            isPositive: diff > 0 ? true : diff < 0 ? false : null,
          };
        })
      );
    }
  };

  const handleIndividualQuotaChange = (id, val) => {
    const rawVal = val.replace(/[^0-9]/g, "");
    const num = parseInt(rawVal, 10) || 0;
    setRepsList((prev) =>
      prev.map((rep) => {
        if (rep.id === id) {
          const diff = ((num - rep.currentQuota) / rep.currentQuota) * 100;
          return {
            ...rep,
            newQuota: num,
            change: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
            isPositive: diff > 0 ? true : diff < 0 ? false : null,
          };
        }
        return rep;
      })
    );
  };

  const filteredReps = repsList.filter((rep) =>
    rep.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Totals compare the proposed quotas with the last saved quotas
  const currentTotal = repsList.reduce((sum, rep) => sum + rep.currentQuota, 0);
  const proposedTotal = repsList.reduce((sum, rep) => sum + rep.newQuota, 0);
  const variance = proposedTotal - currentTotal;
  const variancePercent = `${variance >= 0 ? "+" : ""}${currentTotal ? ((variance / currentTotal) * 100).toFixed(1) : "0.0"}%`;

  const handleApplyChanges = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // The saved quotas become the new baseline for the next change
      setRepsList((prev) => prev.map((rep) => ({ ...rep, currentQuota: rep.newQuota, change: "0.0%", isPositive: null })));
      setPercentageValue("0");
      toast.success("Sales quota adjustments applied successfully!");
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-light-gray shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-7 pb-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-dark-black/90 text-xl sm:text-2xl font-secondary">
              Adjust Quotas
            </h2>
            <p className="text-xs sm:text-sm text-light-black font-normal">
              Modify sales targets for individual representatives or the entire team.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 py-2 overflow-y-auto space-y-6">
          {/* Bulk Adjustments Card */}
          <div className="bg-light-gray/40 rounded-2xl border border-light-gray p-5">
            {/* Header + Toggle */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-dark-black/85 text-sm sm:text-base">
                  Bulk Adjustments
                </h3>
              </div>

              {/* Enable Bulk Mode Toggle */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setBulkEnabled(!bulkEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    bulkEnabled ? "bg-primary" : "bg-light-gray border border-light-black/30"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                      bulkEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-xs font-semibold text-dark-black/75 select-none">
                  Enable Bulk Mode
                </span>
              </div>
            </div>

            {/* Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Adjustment Type Dropdown using shared Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                  ADJUSTMENT TYPE
                </label>
                {/* Adjustment Type only applies in bulk mode */}
                <div className={bulkEnabled ? "" : "opacity-50 pointer-events-none"} aria-disabled={!bulkEnabled}>
                  <Dropdown
                    items={adjustmentTypeOptions}
                    selected={adjustmentType}
                    onSelect={handleAdjustmentTypeSelect}
                    variant="small"
                    className="w-full"
                  />
                </div>
              </div>

              {/* Percentage Value Input */}
              <div>
                <label className="block text-[10px] font-bold text-light-black uppercase tracking-wider mb-1.5">
                  PERCENTAGE VALUE
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentageValue}
                    onChange={(e) => handlePercentageChange(e.target.value)}
                    disabled={!bulkEnabled}
                    placeholder="5"
                    className="w-full bg-white px-3.5 py-2 rounded-xl border border-light-gray text-xs font-semibold text-dark-black/85 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 disabled:bg-light-gray/60 pr-8 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-light-black pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Rep Quotas */}
          <div>
            {/* Title + Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <h3 className="font-bold text-dark-black/85 text-sm sm:text-base">
                Individual Rep Quotas
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-light-black absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find sales rep..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Reps Table */}
            <div className="rounded-2xl border border-light-gray overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-light-gray/50 border-b border-light-gray text-[10px] sm:text-[11px] font-bold text-light-black uppercase tracking-wider">
                    <th className="py-3 px-4 text-left">REPRESENTATIVE</th>
                    <th className="py-3 px-4 text-left">CURRENT QUOTA</th>
                    <th className="py-3 px-4 text-left">NEW QUOTA</th>
                    <th className="py-3 px-4 text-center">CHANGE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-gray/60 text-xs">
                  {filteredReps.map((rep) => (
                    <tr
                      key={rep.id}
                      className="hover:bg-light-gray/30 transition-colors"
                    >
                      {/* Representative */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-light-gray bg-slate-100">
                            <img
                              src={rep.avatar}
                              alt={rep.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-bold text-dark-black/85 text-xs">
                            {rep.name}
                          </span>
                        </div>
                      </td>

                      {/* Current Quota */}
                      <td className="py-3.5 px-4 font-secondary font-semibold text-dark-black/80 text-xs">
                        ${rep.currentQuota.toLocaleString()}
                      </td>

                      {/* New Quota Input */}
                      <td className="py-3.5 px-4">
                        <div className="relative max-w-[150px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-light-black">
                            $
                          </span>
                          <input
                            type="text"
                            value={rep.newQuota.toLocaleString()}
                            onChange={(e) =>
                              handleIndividualQuotaChange(rep.id, e.target.value)
                            }
                            className="w-full bg-white pl-6 pr-3 py-1.5 rounded-xl border border-light-gray text-xs font-bold text-dark-black/85 font-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </td>

                      {/* Change Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${
                            rep.isPositive === true
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200/60"
                              : rep.isPositive === false
                              ? "bg-rose-50 text-rose-600 border-rose-200/60"
                              : "bg-light-gray text-medium-black border-light-gray"
                          }`}
                        >
                          {rep.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Current & Proposed Total Quota Summary Card */}
          <div className="bg-light-gray/40 rounded-2xl border border-light-gray p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Current Total */}
            <div>
              <span className="block text-[10px] font-bold text-light-black uppercase tracking-wider mb-0.5">
                CURRENT TOTAL QUOTA
              </span>
              <span className="text-xl sm:text-2xl font-bold text-dark-black/90 font-secondary">
                ${currentTotal.toLocaleString()}
              </span>
            </div>

            {/* Primary Teal Arrow */}
            <div className="text-primary hidden sm:block">
              <ArrowRight className="w-5 h-5" />
            </div>

            {/* Proposed Total */}
            <div>
              <span className="block text-[10px] font-bold text-light-black uppercase tracking-wider mb-0.5">
                PROPOSED TOTAL QUOTA
              </span>
              <span className="text-xl sm:text-2xl font-bold text-primary font-secondary">
                ${proposedTotal.toLocaleString()}
              </span>
            </div>

            {/* Team Variance */}
            <div className="text-right">
              <span className="block text-[10px] font-bold text-light-black uppercase tracking-wider mb-0.5">
                TEAM VARIANCE
              </span>
              <span className="text-base sm:text-lg font-bold text-primary font-secondary">
                +${variance.toLocaleString()}{" "}
                <span className="text-xs font-semibold">({variancePercent})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-light-gray flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2 text-xs text-light-black">
            <Info className="w-4 h-4 text-light-black shrink-0" />
            <span>Changes will take effect starting next billing cycle.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-dark-black/70 hover:text-dark-black transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyChanges}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {saving ? "Applying..." : "Apply Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
