"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Plus, Trash2, CheckCircle2, Copy } from "lucide-react";
import toast from "react-hot-toast";

const initialPromoCodes = [
  {
    id: "promo-1",
    code: "LAUNCH2024",
    discount: "20% OFF",
    type: "Percentage",
    redemptions: 142,
    maxUses: 200,
    validUntil: "Dec 31, 2026",
    status: "Active",
  },
  {
    id: "promo-2",
    code: "SUMMERGROWTH",
    discount: "$50 OFF",
    type: "Fixed",
    redemptions: 89,
    maxUses: 100,
    validUntil: "Aug 31, 2026",
    status: "Active",
  },
  {
    id: "promo-3",
    code: "REALTORSVIP",
    discount: "25% OFF",
    type: "Percentage",
    redemptions: 64,
    maxUses: 150,
    validUntil: "Nov 15, 2026",
    status: "Active",
  },
  {
    id: "promo-4",
    code: "STARTUP50",
    discount: "50% OFF (1st Month)",
    type: "Trial",
    redemptions: 215,
    maxUses: 300,
    validUntil: "Oct 31, 2026",
    status: "Active",
  },
  {
    id: "promo-5",
    code: "ENTERPRISE10",
    discount: "10% Annual",
    type: "Percentage",
    redemptions: 18,
    maxUses: 50,
    validUntil: "Dec 31, 2026",
    status: "Active",
  },
];

export const PromoCodesModal = ({ isOpen, onClose }) => {
  const [promoCodes, setPromoCodes] = useState(initialPromoCodes);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    discount: "",
    maxUses: "100",
    validUntil: "Dec 31, 2026",
  });

  if (!isOpen) return null;

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Promo code "${code}" copied to clipboard!`);
  };

  const handleAddCode = (e) => {
    e.preventDefault();
    if (!newCode.code.trim() || !newCode.discount.trim()) {
      toast.error("Please fill in code and discount value.");
      return;
    }

    const created = {
      id: `promo-${Date.now()}`,
      code: newCode.code.toUpperCase().replace(/\s+/g, ""),
      discount: newCode.discount,
      type: "Custom",
      redemptions: 0,
      maxUses: parseInt(newCode.maxUses) || 100,
      validUntil: newCode.validUntil,
      status: "Active",
    };

    setPromoCodes([created, ...promoCodes]);
    setIsAddingNew(false);
    setNewCode({
      code: "",
      discount: "",
      maxUses: "100",
      validUntil: "Dec 31, 2026",
    });
    toast.success(`Promo code "${created.code}" created!`);
  };

  const handleDeleteCode = (id, code) => {
    setPromoCodes((prev) => prev.filter((item) => item.id !== id));
    toast.error(`Promo code "${code}" removed.`);
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
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-light-gray flex flex-col max-h-[90vh] overflow-hidden relative"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-light-gray shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-dark-black/80 font-secondary">
                Active Promo Codes ({promoCodes.length})
              </h3>
              <p className="text-xs text-medium-black mt-0.5">
                Manage promotional discount vouchers and coupon campaigns.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Code</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {/* Add New Form Collapse */}
          <AnimatePresence>
            {isAddingNew && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddCode}
                className="p-4 rounded-xl border border-primary/40 bg-primary/5 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                      Coupon Code
                    </label>
                    <input
                      type="text"
                      value={newCode.code}
                      onChange={(e) =>
                        setNewCode({ ...newCode, code: e.target.value })
                      }
                      placeholder="e.g. AUTUMN25"
                      className="w-full text-xs uppercase font-bold px-3 py-2 rounded-lg border border-light-gray bg-white focus:outline-hidden focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                      Discount Value
                    </label>
                    <input
                      type="text"
                      value={newCode.discount}
                      onChange={(e) =>
                        setNewCode({ ...newCode, discount: e.target.value })
                      }
                      placeholder="e.g. 25% OFF or $30 OFF"
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-light-gray bg-white focus:outline-hidden focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                      Max Redemptions
                    </label>
                    <input
                      type="number"
                      value={newCode.maxUses}
                      onChange={(e) =>
                        setNewCode({ ...newCode, maxUses: e.target.value })
                      }
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-light-gray bg-white focus:outline-hidden focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dark-black/80 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="text"
                      value={newCode.validUntil}
                      onChange={(e) =>
                        setNewCode({ ...newCode, validUntil: e.target.value })
                      }
                      className="w-full text-xs font-medium px-3 py-2 rounded-lg border border-light-gray bg-white focus:outline-hidden focus:border-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="px-3 py-1.5 rounded-lg border border-light-gray text-xs font-medium text-medium-black hover:bg-light-gray bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold shadow-2xs hover:bg-primary/90 cursor-pointer"
                  >
                    Save Promo Code
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Promo Codes Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-light-gray text-[10px] sm:text-[11px] font-semibold text-light-black uppercase tracking-wider bg-white">
                  <th className="pb-3 pt-1 pr-4 font-semibold">CODE</th>
                  <th className="pb-3 pt-1 px-3 font-semibold">DISCOUNT</th>
                  <th className="pb-3 pt-1 px-3 font-semibold text-center">USAGE</th>
                  <th className="pb-3 pt-1 px-3 font-semibold">VALID UNTIL</th>
                  <th className="pb-3 pt-1 pl-4 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-gray/60 text-xs">
                {promoCodes.map((item) => (
                  <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                    {/* Code */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-dark-black/85 tracking-wider bg-slate-100 px-2 py-1 rounded-md font-mono text-xs">
                          {item.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.code)}
                          className="p-1 rounded text-light-black hover:text-primary transition-colors cursor-pointer"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-600">
                        {item.discount}
                      </span>
                    </td>

                    {/* Redemptions */}
                    <td className="py-3 px-3 text-center">
                      <span className="font-medium text-dark-black/80">
                        {item.redemptions} / {item.maxUses}
                      </span>
                    </td>

                    {/* Valid Until */}
                    <td className="py-3 px-3">
                      <span className="text-medium-black font-medium text-xs">
                        {item.validUntil}
                      </span>
                    </td>

                    {/* Delete Action */}
                    <td className="py-3 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCode(item.id, item.code)}
                        className="p-1 rounded hover:bg-red/10 text-light-black hover:text-red transition-colors cursor-pointer"
                        title="Delete Code"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PromoCodesModal;
