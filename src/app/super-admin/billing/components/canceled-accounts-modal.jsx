"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserX,
  PhoneCall,
  Mail,
  RotateCcw,
  Search,
  Calendar,
  AlertCircle,
  Building,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

const canceledAccountsData = [
  {
    id: "can-1",
    customer: "David Miller",
    company: "Miller Estates",
    plan: "Pro Plan ($199/mo)",
    cancelDate: "Apr 28, 2024",
    churnReason: "Price sensitivity / Budget review",
    lifetimeValue: "$2,388.00",
    phone: "+1 (555) 234-5678",
    email: "david@millerestates.com",
    lastContact: "2 weeks ago",
  },
  {
    id: "can-2",
    customer: "Jonathan Ward",
    company: "Ward & Co Properties",
    plan: "Basic Plan ($99/mo)",
    cancelDate: "Apr 20, 2024",
    churnReason: "Low agent call volume in off-season",
    lifetimeValue: "$891.00",
    phone: "+1 (555) 345-6789",
    email: "jward@wardcoproperties.com",
    lastContact: "3 weeks ago",
  },
  {
    id: "can-3",
    customer: "Chloe Bennett",
    company: "Bennett Luxe Living",
    plan: "ProX Plan ($349/mo)",
    cancelDate: "Apr 15, 2024",
    churnReason: "Competitor trial period",
    lifetimeValue: "$4,188.00",
    phone: "+1 (555) 456-7890",
    email: "chloe@bennettluxe.com",
    lastContact: "1 month ago",
  },
];

export const CanceledAccountsModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);

  if (!isOpen) return null;

  const filtered = canceledAccountsData.filter(
    (acc) =>
      acc.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.churnReason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRecoveryEmail = (account) => {
    toast.success(`Sent 20% Churn Reconversion Discount offer to ${account.email}`);
  };

  const handleLogCall = (account) => {
    toast.success(`Logged churn recovery outreach call with ${account.customer}`);
  };

  const handleReactivate = (account) => {
    toast.success(`Reactivation workflow started for ${account.customer}!`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-dark-black/40 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl border border-light-gray shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-light-gray flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-dark-black tracking-tight">
                    Canceled Accounts & Churn Recovery
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100/60 text-orange-700">
                    {canceledAccountsData.length} Churned
                  </span>
                </div>
                <p className="text-xs text-light-black mt-0.5">
                  Review reasons for cancellation and execute win-back workflows.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-light-gray/60 hover:bg-light-gray text-light-black hover:text-dark-black flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 sm:p-5 border-b border-light-gray/60 bg-white/50 shrink-0">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-light-black" />
              <input
                type="text"
                placeholder="Search by customer, company, or churn reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-light-gray rounded-xl text-dark-black placeholder:text-light-black/60 focus:outline-none focus:border-primary shadow-2xs"
              />
            </div>
          </div>

          {/* List of Canceled Accounts */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-light-gray/60">
            {filtered.map((acc) => (
              <div
                key={acc.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-dark-black text-sm">
                      {acc.customer}
                    </span>
                    <span className="text-xs text-light-black flex items-center gap-1">
                      <Building className="w-3.5 h-3.5" />
                      {acc.company}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-light-gray text-medium-black">
                      {acc.plan}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-light-black flex-wrap">
                    <span className="flex items-center gap-1 text-red font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Reason: {acc.churnReason}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Canceled: {acc.cancelDate}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      LTV: {acc.lifetimeValue}
                    </span>
                  </div>
                </div>

                {/* Winback Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSendRecoveryEmail(acc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-light-gray bg-white hover:bg-light-gray text-dark-black transition-colors cursor-pointer shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    <span>Send Win-Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLogCall(acc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-light-gray bg-white hover:bg-light-gray text-dark-black transition-colors cursor-pointer shadow-2xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-sky-600" />
                    <span>Log Call</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReactivate(acc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary hover:bg-medium-teal text-white transition-colors cursor-pointer shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reactivate</span>
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-xs text-light-black">
                No canceled accounts match your search.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-light-gray bg-white flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl border border-light-gray text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CanceledAccountsModal;
