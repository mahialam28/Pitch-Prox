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
import { ProfileAvatar } from "@/components/shared/avatar-editor";
import { saveQuotas } from "../team-api";

// Quotas are monthly booked-revenue targets in whole dollars (lib/sales-team)
const toRow = (rep) => {
  const current = rep.quotaCents == null ? 0 : Math.round(rep.quotaCents / 100);
  return { id: rep.id, name: rep.name, hasQuota: rep.quotaCents != null, currentQuota: current, newQuota: current, change: "0.0%", isPositive: null };
};
const withChange = (row, newQuota) => {
  const diff = row.currentQuota ? ((newQuota - row.currentQuota) / row.currentQuota) * 100 : newQuota ? 100 : 0;
  return { ...row, newQuota, change: row.currentQuota ? `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%` : newQuota ? "New" : "0.0%", isPositive: diff > 0 ? true : diff < 0 ? false : null };
};
const nextMonthKey = (key) => {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

const adjustmentTypeOptions = [
  { value: "Percentage Increase (+)", label: "Percentage Increase (+)" },
  { value: "Percentage Decrease (-)", label: "Percentage Decrease (-)" },
  { value: "Fixed Target Set", label: "Fixed Target Set" },
];

// Mounted only while open. `reps` are the current reps with this month's quota; `focusRep` pre-filters to one rep.
export default function AdjustQuotaModal({ isOpen, onClose, reps = [], month, focusRep, onSaved }) {
  const [bulkEnabled, setBulkEnabled] = useState(!focusRep);
  const [adjustmentType, setAdjustmentType] = useState("Percentage Increase (+)");
  const [percentageValue, setPercentageValue] = useState("0");
  const [searchTerm, setSearchTerm] = useState(focusRep?.name ?? "");
  const [repsList, setRepsList] = useState(() => reps.filter((rep) => rep.status !== "deactivated").map(toRow));
  const [starting, setStarting] = useState("this");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Bulk mode applies the percentage (or a fixed target) to every rep in the list
  const applyBulk = (type, value) => {
    const num = parseFloat(value) || 0;
    setRepsList((prev) =>
      prev.map((row) => {
        if (type === "Fixed Target Set") return withChange(row, Math.max(0, Math.round(num)));
        const factor = type.includes("Decrease") ? 1 - num / 100 : 1 + num / 100;
        return withChange(row, Math.max(0, Math.round(row.currentQuota * factor)));
      })
    );
  };

  const handlePercentageChange = (val) => {
    setPercentageValue(val);
    if (bulkEnabled) applyBulk(adjustmentType, val);
  };

  const handleAdjustmentTypeSelect = (type) => {
    setAdjustmentType(type);
    if (bulkEnabled) applyBulk(type, percentageValue);
  };

  const handleIndividualQuotaChange = (id, val) => {
    const num = parseInt(val.replace(/[^0-9]/g, ""), 10) || 0;
    setRepsList((prev) => prev.map((row) => (row.id === id ? withChange(row, num) : row)));
  };

  const filteredReps = repsList.filter((rep) =>
    rep.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Totals compare the proposed quotas with the last saved quotas
  const currentTotal = repsList.reduce((sum, rep) => sum + rep.currentQuota, 0);
  const proposedTotal = repsList.reduce((sum, rep) => sum + rep.newQuota, 0);
  const variance = proposedTotal - currentTotal;
  const variancePercent = `${variance >= 0 ? "+" : ""}${currentTotal ? ((variance / currentTotal) * 100).toFixed(1) : "0.0"}%`;

  const handleApplyChanges = async () => {
    // Only reps whose quota changes (or who get one for the first time)
    const changed = repsList.filter((row) => row.newQuota !== row.currentQuota || (!row.hasQuota && row.newQuota > 0));
    if (!changed.length) {
      toast.error("No quota changes to apply.");
      return;
    }
    setSaving(true);
    try {
      const target = starting === "next" ? nextMonthKey(month) : month;
      await saveQuotas(changed.map((row) => ({ userId: row.id, quotaCents: row.newQuota * 100 })), target);
      toast.success(`Quotas updated for ${changed.length} rep${changed.length === 1 ? "" : "s"}.`);
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
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
                  {adjustmentType === "Fixed Target Set" ? "TARGET ($)" : "PERCENTAGE VALUE"}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentageValue}
                    onChange={(e) => handlePercentageChange(e.target.value)}
                    disabled={!bulkEnabled}
                    min="0"
                    placeholder="5"
                    className="w-full bg-white px-3.5 py-2 rounded-xl border border-light-gray text-xs font-semibold text-dark-black/85 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 disabled:bg-light-gray/60 pr-8 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-light-black pointer-events-none">
                    {adjustmentType === "Fixed Target Set" ? "$" : "%"}
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
                  {!filteredReps.length && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-light-black">No sales reps found.</td>
                    </tr>
                  )}
                  {filteredReps.map((rep) => (
                    <tr
                      key={rep.id}
                      className="hover:bg-light-gray/30 transition-colors"
                    >
                      {/* Representative */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar name={rep.name} className="w-8 h-8 !text-[11px] shrink-0" />
                          <span className="font-bold text-dark-black/85 text-xs">
                            {rep.name}
                          </span>
                        </div>
                      </td>

                      {/* Current Quota */}
                      <td className="py-3.5 px-4 font-secondary font-semibold text-dark-black/80 text-xs">
                        {rep.hasQuota ? `$${rep.currentQuota.toLocaleString()}` : "Not set"}
                      </td>

                      {/* New Quota Input */}
                      <td className="py-3.5 px-4">
                        <div className="relative max-w-[150px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-light-black">
                            $
                          </span>
                          <input
                            type="text"
                            aria-label={`New quota for ${rep.name}`}
                            inputMode="numeric"
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
                {variance < 0 ? "-" : "+"}${Math.abs(variance).toLocaleString()}{" "}
                <span className="text-xs font-semibold">({variancePercent})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-light-gray flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2 text-xs text-light-black">
            <Info className="w-4 h-4 text-light-black shrink-0" />
            <label htmlFor="quota-start" className="whitespace-nowrap">Applies from</label>
            <select
              id="quota-start"
              value={starting}
              onChange={(event) => setStarting(event.target.value)}
              className="rounded-lg border border-light-gray bg-white px-2 py-1 text-xs text-dark-black cursor-pointer"
            >
              <option value="this">this month</option>
              <option value="next">next month</option>
            </select>
            <span className="hidden sm:inline">and carries forward.</span>
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
