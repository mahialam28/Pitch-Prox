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
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-light-gray shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red/10 text-red flex items-center justify-center shrink-0">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-dark-black tracking-tight flex items-center gap-2">
                  <span>Canceled Accounts — Churn Recovery Queue</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-red/10 text-red border border-red/20">
                    {canceledAccountsData.length} Churned
                  </span>
                </h3>
                <p className="text-xs text-light-black mt-0.5">
                  Reach back out to past subscribers to reconvert with promotional win-back offers.
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
          <div className="px-5 sm:px-6 py-3 border-b border-light-gray bg-light-gray/20">
            <div className="relative max-w-md">
              <Search className="w-3.5 h-3.5 text-light-black absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer, company, or churn reason..."
                className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black"
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="space-y-4">
              {filtered.map((account) => (
                <div
                  key={account.id}
                  className="p-4 sm:p-5 rounded-2xl border border-light-gray hover:border-primary/40 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-dark-black">
                        {account.customer}
                      </h4>
                      <span className="text-xs font-semibold text-light-black">
                        • {account.company}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-light-gray text-medium-black">
                        {account.plan}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mt-2 text-light-black">
                      <div>
                        <span className="font-semibold text-dark-black">Canceled:</span> {account.cancelDate}
                      </div>
                      <div>
                        <span className="font-semibold text-dark-black">LTV:</span> {account.lifetimeValue}
                      </div>
                      <div>
                        <span className="font-semibold text-dark-black">Last Contact:</span> {account.lastContact}
                      </div>
                    </div>

                    <div className="mt-2 text-xs bg-amber-50/70 border border-amber-200/60 rounded-lg p-2 text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span><strong>Reason:</strong> {account.churnReason}</span>
                    </div>
                  </div>

                  {/* Outreach Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleLogCall(account)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray hover:bg-light-gray rounded-xl transition-all cursor-pointer"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-primary" />
                      <span>Log Call</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendRecoveryEmail(account)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray hover:bg-light-gray rounded-xl transition-all cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-light-blue" />
                      <span>Win-Back Offer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleReactivate(account)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reactivate</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-5 border-t border-light-gray bg-light-gray/30 flex items-center justify-between text-xs text-light-black shrink-0">
            <span>{filtered.length} canceled accounts assigned for win-back outreach</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-medium-black bg-white border border-light-gray hover:bg-light-gray rounded-xl transition-colors cursor-pointer"
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
