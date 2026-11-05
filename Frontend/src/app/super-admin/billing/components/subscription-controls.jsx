"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  PauseCircle,
  RotateCcw,
  XCircle,
  ArrowLeftRight,
  Calendar,
  X,
  CalendarDays,
} from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import AlertModal from "@/components/modals/alert-modal";
import DatePicker from "@/components/modals/date-picker";
import toast from "react-hot-toast";

const customerOptions = [
  {
    value: "jennifer-smith",
    label: "Jennifer Smith (Acme Inc.)",
    desc: "Pro Plan • Active",
  },
  {
    value: "john-smith",
    label: "John Smith (Smith Realty Group)",
    desc: "Pro Plan • Past Due",
  },
  {
    value: "sarah-johnson",
    label: "Sarah Johnson (Johnson Properties)",
    desc: "ProX Plan • Failed Payment",
  },
  {
    value: "mike-davis",
    label: "Mike Davis (Davis Investments)",
    desc: "Basic Plan • Active",
  },
  {
    value: "emily-wilson",
    label: "Emily Wilson (Wilson & Co Real Estate)",
    desc: "Pro Plan • Active",
  },
  {
    value: "robert-chen",
    label: "Robert Chen (Chen Capital Properties)",
    desc: "ProX Plan • Active",
  },
];

const controlActions = [
  {
    id: "upgrade-downgrade",
    title: "Upgrade / Downgrade",
    subtitle: "Change plan",
    icon: ArrowUpDown,
  },
  {
    id: "pause-subscription",
    title: "Pause Subscription",
    subtitle: "Hold subscription",
    icon: PauseCircle,
  },
  {
    id: "resume-subscription",
    title: "Resume Subscription",
    subtitle: "Reactivate account",
    icon: RotateCcw,
  },
  {
    id: "cancel-subscription",
    title: "Cancel Subscription",
    subtitle: "End subscription",
    icon: XCircle,
  },
  {
    id: "change-billing-cycle",
    title: "Change Billing Cycle",
    subtitle: "Monthly / Annual",
    icon: ArrowLeftRight,
  },
  {
    id: "change-renewal-date",
    title: "Change Renewal Date",
    subtitle: "Set custom date",
    icon: Calendar,
  },
];

export const SubscriptionControls = () => {
  const [selectedCustomer, setSelectedCustomer] = useState("jennifer-smith");

  // Alert Modal State
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: () => {},
  });

  // Date / Schedule Modals State
  const [billingCycleModalOpen, setBillingCycleModalOpen] = useState(false);
  const [renewalDateModalOpen, setRenewalDateModalOpen] = useState(false);

  // Billing Cycle Form State
  const [selectedCycle, setSelectedCycle] = useState("annual");
  const [cycleEffectiveDate, setCycleEffectiveDate] = useState("2024-06-01");

  // Renewal Date Form State
  const [newRenewalDate, setNewRenewalDate] = useState("2024-06-15");

  const currentCustomerLabel =
    customerOptions.find((c) => c.value === selectedCustomer)?.label ||
    "Jennifer Smith (Acme Inc.)";

  const handleActionClick = (action) => {
    switch (action.id) {
      case "upgrade-downgrade":
        setAlertConfig({
          isOpen: true,
          type: "info",
          title: "Upgrade / Downgrade Plan",
          message: `Are you sure you want to change the subscription tier for ${currentCustomerLabel}? This will calculate prorated charges automatically on the next invoice.`,
          confirmLabel: "Proceed to Upgrade",
          onConfirm: () => {
            toast.success(`Upgrade initiated for ${currentCustomerLabel}`);
          },
        });
        break;

      case "pause-subscription":
        setAlertConfig({
          isOpen: true,
          type: "warning",
          title: "Pause Subscription",
          message: `This will place ${currentCustomerLabel}'s subscription on hold until reactivated. No automated billing or usage charges will occur.`,
          confirmLabel: "Pause Subscription",
          onConfirm: () => {
            toast.success(`Subscription paused for ${currentCustomerLabel}`);
          },
        });
        break;

      case "resume-subscription":
        setAlertConfig({
          isOpen: true,
          type: "success",
          title: "Resume Subscription",
          message: `Reactivate ${currentCustomerLabel}'s subscription immediately and resume regular scheduled billing cycles?`,
          confirmLabel: "Resume Subscription",
          onConfirm: () => {
            toast.success(`Subscription resumed for ${currentCustomerLabel}`);
          },
        });
        break;

      case "cancel-subscription":
        setAlertConfig({
          isOpen: true,
          type: "error",
          title: "Cancel Subscription",
          message: `Warning: This will terminate the subscription for ${currentCustomerLabel} at the end of the current period. Are you sure you want to proceed?`,
          confirmLabel: "Cancel Subscription",
          onConfirm: () => {
            toast.error(`Subscription cancelled for ${currentCustomerLabel}`);
          },
        });
        break;

      case "change-billing-cycle":
        setBillingCycleModalOpen(true);
        break;

      case "change-renewal-date":
        setRenewalDateModalOpen(true);
        break;

      default:
        break;
    }
  };

  const handleSaveBillingCycle = (e) => {
    e.preventDefault();
    const cycleName = selectedCycle === "annual" ? "Annual ($990/year)" : "Monthly ($99/month)";
    toast.success(`Billing cycle updated to ${cycleName} starting ${cycleEffectiveDate} for ${currentCustomerLabel}`);
    setBillingCycleModalOpen(false);
  };

  const handleSaveRenewalDate = (e) => {
    e.preventDefault();
    if (!newRenewalDate) {
      toast.error("Please pick a valid renewal date.");
      return;
    }
    toast.success(`Renewal date changed to ${newRenewalDate} for ${currentCustomerLabel}`);
    setRenewalDateModalOpen(false);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-light-gray shadow-sm p-4 sm:p-6 flex flex-col gap-6">
      {/* Header with Title and Customer Search Dropdown */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-light-gray/60">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
            5. Subscription Controls
          </h2>
          <p className="text-xs text-medium-black mt-0.5">
            Quick actions to manage customer subscriptions.
          </p>
        </div>

        {/* Customer Search Dropdown */}
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <span className="text-[11px] font-medium text-medium-black">
            Search and select a customer
          </span>
          <Dropdown
            label="Search and select a customer"
            items={customerOptions}
            selected={selectedCustomer}
            onSelect={(val) => setSelectedCustomer(val)}
            icon={<Search className="w-4 h-4 text-light-black" />}
            placement="top"
            className="w-full sm:w-[290px]"
          />
        </div>
      </div>

      {/* 6 Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {controlActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleActionClick(action)}
              className="bg-white border border-light-gray rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center shadow-xs hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm transition-all duration-200 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full border border-light-gray bg-light-gray/40 text-dark-black/80 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              </div>

              <span className="text-xs font-bold text-dark-black/80 mt-3 leading-tight group-hover:text-primary transition-colors">
                {action.title}
              </span>

              <span className="text-[11px] font-medium text-light-black mt-1">
                {action.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shared AlertModal for Upgrade, Pause, Resume, Cancel */}
      <AlertModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmLabel={alertConfig.confirmLabel}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={alertConfig.onConfirm}
      />

      {/* 1. Change Billing Cycle Modal with DatePicker */}
      <AnimatePresence>
        {billingCycleModalOpen && (
          <div
            className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-dark-black/50 backdrop-blur-xs"
            onClick={() => setBillingCycleModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-light-gray flex flex-col justify-between overflow-visible relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-light-gray flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark-black">
                      Change Billing Cycle
                    </h3>
                    <p className="text-xs text-medium-black mt-0.5">
                      {currentCustomerLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBillingCycleModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveBillingCycle} className="p-4 sm:p-6 flex-1 flex flex-col justify-between gap-5">
                <div className="flex flex-col gap-4">
                  {/* Frequency Radio Cards */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-dark-black">
                      Select New Cycle Frequency
                    </label>

                    {/* Monthly Option */}
                    <label
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedCycle === "monthly"
                          ? "border-primary bg-primary/5 shadow-2xs"
                          : "border-light-gray hover:bg-light-gray/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="cycle"
                          value="monthly"
                          checked={selectedCycle === "monthly"}
                          onChange={() => setSelectedCycle("monthly")}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <div>
                          <span className="text-xs font-bold text-dark-black block">
                            Monthly Billing
                          </span>
                          <span className="text-[11px] text-medium-black">
                            $99.00 billed every month
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-dark-black">
                        $99 / mo
                      </span>
                    </label>

                    {/* Annual Option */}
                    <label
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedCycle === "annual"
                          ? "border-primary bg-primary/5 shadow-2xs"
                          : "border-light-gray hover:bg-light-gray/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="cycle"
                          value="annual"
                          checked={selectedCycle === "annual"}
                          onChange={() => setSelectedCycle("annual")}
                          className="text-primary focus:ring-primary h-4 w-4"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-dark-black">
                              Annual Billing
                            </span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded-md">
                              SAVE 20%
                            </span>
                          </div>
                          <span className="text-[11px] text-medium-black">
                            $990.00 billed once per year
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-dark-black">
                        $990 / yr
                      </span>
                    </label>
                  </div>

                  {/* Effective Date Picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-dark-black">
                      Effective Date
                    </label>
                    <DatePicker
                      value={cycleEffectiveDate}
                      onChange={setCycleEffectiveDate}
                      placeholder="Select effective date"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-light-gray flex-shrink-0 mt-2">
                  <button
                    type="button"
                    onClick={() => setBillingCycleModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Update Cycle
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Change Renewal Date Modal using Theme DatePicker */}
      <AnimatePresence>
        {renewalDateModalOpen && (
          <div
            className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-dark-black/50 backdrop-blur-xs"
            onClick={() => setRenewalDateModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-light-gray overflow-visible relative"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-light-gray">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark-black">
                      Change Renewal Date
                    </h3>
                    <p className="text-xs text-medium-black mt-0.5">
                      {currentCustomerLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRenewalDateModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-light-gray text-medium-black transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form with custom Theme DatePicker */}
              <form onSubmit={handleSaveRenewalDate} className="p-4 sm:p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-xs font-semibold text-dark-black">
                    Select New Next Renewal Date
                  </label>

                  {/* Custom Theme DatePicker Component */}
                  <DatePicker
                    value={newRenewalDate}
                    onChange={setNewRenewalDate}
                    placeholder="Select next renewal date"
                    className="w-full"
                  />

                  <span className="text-[10px] text-light-black mt-1 font-medium">
                    Current active schedule: May 15, 2024
                  </span>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-light-gray">
                  <button
                    type="button"
                    onClick={() => setRenewalDateModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Apply New Date
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SubscriptionControls;
