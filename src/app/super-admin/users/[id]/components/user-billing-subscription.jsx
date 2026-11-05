"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Phone,
  FileText,
  Tag,
  Info,
  Check,
  X,
  CreditCard,
  Download,
  Trash2,
  Receipt,
  Layers,
  HelpCircle,
  Printer,
  Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AuditInfo from "./audit-info";
import ChangePlanModal from "./change-plan-modal";
import ExtendSubscriptionModal from "./extend-subscription-modal";
import AlertModal from "@/components/modals/alert-modal";
import { ChangePlanDialog, DowngradePlanModal, CancelSubscriptionModal } from "./account-dialogs";
import Dropdown from "@/components/shared/dropdown/dropdown";

const INITIAL_INVOICES = [
  {
    id: "INV-2025-0515",
    date: "May 15, 2025",
    amount: "$499.00",
    rawAmount: 499.0,
    status: "Paid",
    period: "May 15, 2025 - Jun 15, 2025",
    pdfName: "invoice_may_2025.pdf",
  },
  {
    id: "INV-2025-0415",
    date: "Apr 15, 2025",
    amount: "$499.00",
    rawAmount: 499.0,
    status: "Paid",
    period: "Apr 15, 2025 - May 15, 2025",
    pdfName: "invoice_apr_2025.pdf",
  },
  {
    id: "INV-2025-0315",
    date: "Mar 15, 2025",
    amount: "$499.00",
    rawAmount: 499.0,
    status: "Paid",
    period: "Mar 15, 2025 - Apr 15, 2025",
    pdfName: "invoice_mar_2025.pdf",
  },
  {
    id: "INV-2025-0215",
    date: "Feb 15, 2025",
    amount: "$499.00",
    rawAmount: 499.0,
    status: "Paid",
    period: "Feb 15, 2025 - Mar 15, 2025",
    pdfName: "invoice_feb_2025.pdf",
  },
  {
    id: "INV-2025-0115",
    date: "Jan 15, 2025",
    amount: "$499.00",
    rawAmount: 499.0,
    status: "Paid",
    period: "Jan 15, 2025 - Feb 15, 2025",
    pdfName: "invoice_jan_2025.pdf",
  },
];

const FREQUENCY_OPTIONS = [
  { value: "One-time", label: "One-time" },
  { value: "Recurring", label: "Recurring" },
];

const APPLY_TO_OPTIONS = [
  { value: "Next Invoice", label: "Next Invoice" },
  { value: "Current Balance", label: "Current Balance" },
  { value: "All Future Invoices", label: "All Future Invoices" },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: "Call Credit", label: "Call Credit" },
  { value: "Report Credit", label: "Report Credit" },
  { value: "Goodwill Credit", label: "Goodwill Credit" },
  { value: "Promotional Discount", label: "Promotional Discount" },
];

export default function UserBillingSubscription({ onBack = () => {}, focus = null }) {
  // Opened from an Overview card: scroll to the section it refers to ("usage" | "invoices")
  useEffect(() => {
    if (!focus) return undefined;
    const timer = setTimeout(() => document.getElementById(`billing-${focus}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    return () => clearTimeout(timer);
  }, [focus]);
  // User Data Context
  const [userData, setUserData] = useState({
    name: "Jennifer Smith",
    company: "Acme Inc.",
    plan: "Premium Plan",
    currentPlan: "Premium",
    price: "$499.00",
    currentPrice: 499,
    initials: "JS",
    currentExpiration: "June 15, 2025",
    daysRemaining: 30,
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160",
  });

  const [planPrice, setPlanPrice] = useState(499);
  const [autoRenew, setAutoRenew] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);

  // Calls Credit State (Capped at 50)
  const [addCallsAmount, setAddCallsAmount] = useState("50");
  const [callsFrequency, setCallsFrequency] = useState("One-time");
  const [callBalance, setCallBalance] = useState({ used: 142, total: 500 });

  // Report Credit State (Capped at 50)
  const [addReportsAmount, setAddReportsAmount] = useState("10");
  const [reportsFrequency, setReportsFrequency] = useState("One-time");
  const [reportBalance, setReportBalance] = useState({ used: 18, total: 50 });

  // Discount / Adjustment State (Capped at 50)
  const [applyTo, setApplyTo] = useState("Next Invoice");
  const [discountType, setDiscountType] = useState("Call Credit");
  const [discountAmount, setDiscountAmount] = useState("50.00");
  const [discountNote, setDiscountNote] = useState("Goodwill credit");
  const [appliedAdjustment, setAppliedAdjustment] = useState(-50.0);

  // Billing Contact State
  const [billingContact] = useState({
    name: "Jennifer Smith",
    email: "jennifer.smith@acme.com",
    phone: "(555) 123-4567",
    address: "123 Main Street, Suite 400, Austin, TX 78701 USA",
  });

  // Invoice Recipients State
  const [invoiceSettings, setInvoiceSettings] = useState({
    primary: "jennifer.smith@acme.com",
    additional: "jennifer.smith@acme.com",
  });
  const [editInvoiceForm, setEditInvoiceForm] = useState({
    primary: "jennifer.smith@acme.com",
    additional: "jennifer.smith@acme.com",
  });

  // --- Modals State ---
  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
  const [planDialog, setPlanDialog] = useState(null);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isConfirmAddCallsOpen, setIsConfirmAddCallsOpen] = useState(false);
  const [isConfirmAddReportsOpen, setIsConfirmAddReportsOpen] = useState(false);
  const [isConfirmApplyCreditOpen, setIsConfirmApplyCreditOpen] = useState(false);
  const [isEditInvoiceSettingsOpen, setIsEditInvoiceSettingsOpen] = useState(false);

  // Calculations
  const calculatedCallsCost = (parseFloat(addCallsAmount || "0") * 0.08).toFixed(2);
  const calculatedReportsCost = (parseFloat(addReportsAmount || "0") * 5.0).toFixed(2);
  const nextInvoiceTotal = Math.max(0, planPrice + appliedAdjustment).toFixed(2);

  // Input Setters (No cap)
  const handleCallsInputChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setAddCallsAmount("");
      return;
    }
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 0) return;
    setAddCallsAmount(parsed.toString());
  };

  const handleReportsInputChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setAddReportsAmount("");
      return;
    }
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 0) return;
    setAddReportsAmount(parsed.toString());
  };

  const handleDiscountInputChange = (e) => {
    const val = e.target.value;
    if (val === "") {
      setDiscountAmount("");
      return;
    }
    const parsed = parseFloat(val);
    if (isNaN(parsed) || parsed < 0) return;
    setDiscountAmount(val);
  };

  // Handlers requesting confirmation
  const handleAddCalls = (e) => {
    e?.preventDefault?.();
    const count = parseInt(addCallsAmount, 10);
    if (isNaN(count) || count <= 0) {
      toast.error("Please enter a valid call amount.");
      return;
    }
    setIsConfirmAddCallsOpen(true);
  };

  const handleConfirmAddCallsAction = () => {
    const count = parseInt(addCallsAmount, 10);
    setCallBalance((prev) => ({ ...prev, total: prev.total + count }));
    setIsConfirmAddCallsOpen(false);
    toast.success(`Successfully added ${count} calls ($${calculatedCallsCost})!`);
  };

  const handleAddReports = (e) => {
    e?.preventDefault?.();
    const count = parseInt(addReportsAmount, 10);
    if (isNaN(count) || count <= 0) {
      toast.error("Please enter a valid report amount.");
      return;
    }
    setIsConfirmAddReportsOpen(true);
  };

  const handleConfirmAddReportsAction = () => {
    const count = parseInt(addReportsAmount, 10);
    setReportBalance((prev) => ({ ...prev, total: prev.total + count }));
    setIsConfirmAddReportsOpen(false);
    toast.success(`Successfully added ${count} report credits ($${calculatedReportsCost})!`);
  };

  const handleApplyCredit = (e) => {
    e?.preventDefault?.();
    const amount = parseFloat(discountAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid discount or credit amount.");
      return;
    }
    setIsConfirmApplyCreditOpen(true);
  };

  const handleConfirmApplyCreditAction = () => {
    const amount = parseFloat(discountAmount);
    setAppliedAdjustment(-amount);
    setIsConfirmApplyCreditOpen(false);
    toast.success(`Applied $${amount.toFixed(2)} ${discountType} to ${applyTo}!`);
  };

  const handleSaveInvoiceSettings = (e) => {
    e?.preventDefault?.();
    if (!editInvoiceForm.primary || !editInvoiceForm.primary.includes("@")) {
      toast.error("Please enter a valid primary email address.");
      return;
    }
    setInvoiceSettings({
      primary: editInvoiceForm.primary.trim(),
      additional: editInvoiceForm.additional.trim(),
    });
    setIsEditInvoiceSettingsOpen(false);
    toast.success("Invoice settings updated successfully!");
  };

  const handleToggleAutoRenew = () => {
    const nextVal = !autoRenew;
    setAutoRenew(nextVal);
    toast.success(nextVal ? "Auto-renew enabled." : "Auto-renew disabled.");
  };

  const handleToggleEmailInvoices = () => {
    const nextVal = !emailInvoices;
    setEmailInvoices(nextVal);
    toast.success(nextVal ? "Invoice emails enabled." : "Invoice emails paused.");
  };

  const handleDownloadInvoice = (invoice) => {
    toast.success(`Downloading ${invoice.id} (${invoice.pdfName})...`);
  };

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 pb-6">
      {/* ── Main 2-Column Responsive Layout ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN: Current Sub, Manage Usage & Next Invoice (8 cols) */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-8 flex flex-col gap-6 w-full min-w-0">
          {/* ── 1. CURRENT SUBSCRIPTION CARD ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-5">
            <h2 className="text-xs font-bold text-dark-black tracking-wider uppercase">
              CURRENT SUBSCRIPTION
            </h2>

            {/* 3 Metric Sub-Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Box 1: Plan Details */}
              <div className="p-4 rounded-xl border border-light-gray/80 bg-light-gray/20 flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-dark-black">
                        {userData.plan}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200">
                        ACTIVE
                      </span>
                    </div>
                    <span className="text-xs text-light-black font-medium mt-0.5">
                      ${planPrice} / month
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-light-gray/60 flex flex-col gap-1">
                  <span className="text-[11px] text-light-black">
                    Renews on Jun 15, 2025{" "}
                    <span className="text-medium-black font-medium">(in 30 days)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChangePlanModalOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 w-fit mt-1 cursor-pointer"
                  >
                    <span>View Plan Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Box 2: Monthly Calls */}
              <div className="p-4 rounded-xl border border-light-gray/80 bg-light-gray/20 flex flex-col justify-between">
                <span className="text-xs text-light-black font-medium">
                  Monthly Calls
                </span>
                <div className="my-2">
                  <span className="text-3xl font-bold text-dark-black tracking-tight">
                    {callBalance.total}
                  </span>
                </div>
                <span className="text-xs text-light-black italic">Included</span>
              </div>

              {/* Box 3: Reports / Month */}
              <div className="p-4 rounded-xl border border-light-gray/80 bg-light-gray/20 flex flex-col justify-between">
                <span className="text-xs text-light-black font-medium">
                  Reports / Month
                </span>
                <div className="my-2">
                  <span className="text-3xl font-bold text-dark-black tracking-tight">
                    {reportBalance.total}
                  </span>
                </div>
                <span className="text-xs text-light-black italic">Included</span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setPlanDialog("change")}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/90 transition-all cursor-pointer shadow-2xs text-center"
              >
                Change Plan
              </button>
              <button
                type="button"
                onClick={() => setPlanDialog("downgrade")}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/90 transition-all cursor-pointer shadow-2xs text-center"
              >
                Downgrade Subscription
              </button>
              <button
                type="button"
                onClick={() => setIsCancelAlertOpen(true)}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs font-semibold text-red-600 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cancel Subscription</span>
              </button>
            </div>
          </div>

          {/* ── 2. MANAGE SUBSCRIPTION USAGE & CREDITS ── */}
          <div id="billing-usage" className="flex flex-col gap-4 scroll-mt-24">
            <h2 className="text-xs font-bold text-dark-black tracking-wider uppercase">
              MANAGE SUBSCRIPTION USAGE & CREDITS
            </h2>

            {/* 3 Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Add Calls / Credits */}
              <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-50 text-primary border border-teal-100 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-dark-black">
                        Add Calls / Credits
                      </h3>
                      <p className="text-[11px] text-light-black mt-0.5">
                        Add additional calls to this account.
                      </p>
                    </div>
                  </div>

                  {/* Usage Balance */}
                  <div className="mt-1 flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-light-black tracking-wider">
                      Current Balance
                    </span>
                    <div className="flex items-baseline gap-1 text-xs">
                      <strong className="text-sm font-bold text-dark-black">
                        {callBalance.used}
                      </strong>
                      <span className="text-light-black">
                        / {callBalance.total} calls used
                      </span>
                    </div>
                    <div className="w-full bg-light-gray rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (callBalance.used / callBalance.total) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Add Calls Inputs */}
                  <div className="flex flex-col gap-2 mt-1">
                    <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                      ADD CALLS
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="1"
                        value={addCallsAmount}
                        onChange={handleCallsInputChange}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                      />
                      <Dropdown
                        items={FREQUENCY_OPTIONS}
                        selected={callsFrequency}
                        onSelect={(val) => setCallsFrequency(val)}
                        variant="small"
                        className="w-full"
                      />
                    </div>

                    <div className="text-[11px] text-light-black mt-1 flex flex-col gap-0.5">
                      <span>Price: $0.08 per call</span>
                      <span className="font-semibold text-dark-black">
                        Total: ${calculatedCallsCost}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCalls}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer text-center"
                >
                  Add Calls
                </button>
              </div>

              {/* Card 2: Add Report Credits */}
              <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-dark-black">
                        Add Report Credits
                      </h3>
                      <p className="text-[11px] text-light-black mt-0.5">
                        Add additional report credits.
                      </p>
                    </div>
                  </div>

                  {/* Usage Balance */}
                  <div className="mt-1 flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-light-black tracking-wider">
                      Current Balance
                    </span>
                    <div className="flex items-baseline gap-1 text-xs">
                      <strong className="text-sm font-bold text-dark-black">
                        {reportBalance.used}
                      </strong>
                      <span className="text-light-black">
                        / {reportBalance.total} reports used
                      </span>
                    </div>
                    <div className="w-full bg-light-gray rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            (reportBalance.used / reportBalance.total) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Add Reports Inputs */}
                  <div className="flex flex-col gap-2 mt-1">
                    <span className="text-[10px] font-bold text-light-black uppercase tracking-wider">
                      ADD REPORTS
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min="1"
                        value={addReportsAmount}
                        onChange={handleReportsInputChange}
                        className="w-full px-3 py-2 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                      />
                      <Dropdown
                        items={FREQUENCY_OPTIONS}
                        selected={reportsFrequency}
                        onSelect={(val) => setReportsFrequency(val)}
                        variant="small"
                        className="w-full"
                      />
                    </div>

                    <div className="text-[11px] text-light-black mt-1 flex flex-col gap-0.5">
                      <span>Price: $5.00 per report</span>
                      <span className="font-semibold text-dark-black">
                        Total: ${calculatedReportsCost}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddReports}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer text-center"
                >
                  Add Reports
                </button>
              </div>

              {/* Card 3: Apply Discount / Credit */}
              <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-dark-black">
                        Apply Discount / Credit
                      </h3>
                      <p className="text-[11px] text-light-black mt-0.5">
                        Apply a discount or one-time credit.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-1">
                    <div>
                      <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block mb-1">
                        APPLY TO
                      </span>
                      <Dropdown
                        items={APPLY_TO_OPTIONS}
                        selected={applyTo}
                        onSelect={(val) => setApplyTo(val)}
                        variant="small"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block mb-1">
                        TYPE
                      </span>
                      <Dropdown
                        items={DISCOUNT_TYPE_OPTIONS}
                        selected={discountType}
                        onSelect={(val) => setDiscountType(val)}
                        variant="small"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block mb-1">
                        AMOUNT ($)
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={discountAmount}
                        onChange={handleDiscountInputChange}
                        className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-light-black uppercase tracking-wider block mb-1">
                        NOTE (OPTIONAL)
                      </span>
                      <input
                        type="text"
                        value={discountNote}
                        onChange={(e) => setDiscountNote(e.target.value)}
                        placeholder="e.g. Goodwill credit"
                        className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyCredit}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0E4F4F] hover:bg-[#093838] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer text-center"
                >
                  Apply Credit
                </button>
              </div>
            </div>

            {/* Info Notice Banner */}
            <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-blue-800">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Credits added here are applied immediately and reflected in the user&apos;s usage.
              </span>
            </div>
          </div>

          {/* ── 3. NEXT INVOICE PREVIEW CARD ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-dark-black tracking-wider uppercase">
              NEXT INVOICE PREVIEW
            </h2>

            {/* 4-Item Metric Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-light-gray/20 border border-light-gray/60">
              <div className="flex flex-col">
                <span className="text-[11px] text-light-black font-medium">
                  Due Date
                </span>
                <span className="text-sm font-bold text-dark-black mt-1">
                  Jun 15, 2025
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-light-black font-medium">
                  Plan Amount
                </span>
                <span className="text-sm font-bold text-dark-black mt-1">
                  ${planPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-light-black font-medium">
                  Adjustments / Credits
                </span>
                <span className="text-sm font-bold text-emerald-600 mt-1">
                  {appliedAdjustment < 0 ? `-$${Math.abs(appliedAdjustment).toFixed(2)}` : "$0.00"}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-light-black font-medium">
                  Total
                </span>
                <span className="text-base font-bold text-dark-black mt-1">
                  ${nextInvoiceTotal}
                </span>
              </div>
            </div>

            {/* Action button */}
            <div className="flex justify-center sm:justify-start pt-1">
              <button
                type="button"
                onClick={() => setIsInvoicePreviewOpen(true)}
                className="px-6 py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black transition-colors shadow-2xs cursor-pointer flex items-center gap-2"
              >
                <Receipt className="w-3.5 h-3.5 text-light-black" />
                <span>Preview Invoice</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN: Sidebar Summary Cards (4 cols)             */}
        {/* ══════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full min-w-0">
          {/* ── 4. SUBSCRIPTION SUMMARY CARD ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-dark-black tracking-wider uppercase">
              SUBSCRIPTION SUMMARY
            </h2>

            <div className="divide-y divide-light-gray/60 text-xs">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-light-black">Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-light-black">Plan</span>
                <strong className="text-dark-black font-bold">Premium</strong>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-light-black">
                  <span>Billing Cycle</span>
                  <HelpCircle className="w-3 h-3 text-light-black/60" />
                </div>
                <strong className="text-dark-black font-bold">Monthly</strong>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-light-black">Amount</span>
                <strong className="text-dark-black font-bold">
                  ${planPrice.toFixed(2)} / month
                </strong>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-light-black">Next Invoice</span>
                <strong className="text-dark-black font-bold">Jun 15, 2025</strong>
              </div>

              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-light-black">Payment method</span>
                <div className="flex items-center gap-1.5 font-medium text-dark-black">
                  <CreditCard className="w-3.5 h-3.5 text-light-black" />
                  <span>VISA • • • • 4242</span>
                </div>
              </div>

              <div className="pt-2.5 flex items-center justify-between gap-2">
                <span className="text-light-black">Auto Renew</span>
                <button
                  type="button"
                  onClick={handleToggleAutoRenew}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    autoRenew
                      ? "bg-emerald-500 text-white"
                      : "bg-light-gray text-light-black"
                  }`}
                >
                  {autoRenew ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>

          {/* ── 5. BILLING INFORMATION CARD ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-dark-black tracking-wider uppercase">
              BILLING INFORMATION
            </h2>

            <div className="divide-y divide-light-gray/60 text-xs">
              <div className="py-2 flex flex-col gap-0.5">
                <span className="text-[11px] text-light-black">Billing Contact</span>
                <span className="font-semibold text-dark-black">
                  {billingContact.name}
                </span>
              </div>

              <div className="py-2 flex flex-col gap-0.5">
                <span className="text-[11px] text-light-black">Email</span>
                <span className="font-medium text-dark-black break-all">
                  {billingContact.email}
                </span>
              </div>

              <div className="py-2 flex flex-col gap-0.5">
                <span className="text-[11px] text-light-black">Phone</span>
                <span className="font-medium text-dark-black">
                  {billingContact.phone}
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-0.5">
                <span className="text-[11px] text-light-black">Billing Address</span>
                <span className="font-medium text-dark-black leading-relaxed">
                  {billingContact.address}
                </span>
              </div>
            </div>
          </div>

          {/* ── 6. BILLING HISTORY CARD (invoice management) ── */}
          <div id="billing-invoices" className="scroll-mt-24 bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-dark-black tracking-wider uppercase">
              BILLING HISTORY
            </h2>

            <div className="divide-y divide-light-gray/60 text-xs">
              {INITIAL_INVOICES.slice(0, 4).map((inv) => (
                <div
                  key={inv.id}
                  className="py-2.5 flex items-center justify-between gap-2 hover:bg-light-gray/30 px-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="font-medium text-dark-black">
                      {inv.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-dark-black">{inv.amount}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-600 bg-gray-100">
                      {inv.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv)}
                      className="p-1 text-light-black hover:text-primary rounded-md transition-colors cursor-pointer"
                      title="Download Invoice"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 7. INVOICE SETTINGS CARD ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-dark-black tracking-wider uppercase">
                INVOICE SETTINGS
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditInvoiceForm({
                    primary: invoiceSettings.primary,
                    additional: invoiceSettings.additional,
                  });
                  setIsEditInvoiceSettingsOpen(true);
                }}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="divide-y divide-light-gray/60 text-xs">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-light-black">Email Invoices</span>
                <button
                  type="button"
                  onClick={handleToggleEmailInvoices}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    emailInvoices
                      ? "bg-emerald-500 text-white"
                      : "bg-light-gray text-light-black"
                  }`}
                >
                  {emailInvoices ? "ON" : "OFF"}
                </button>
              </div>

              <div className="py-2 flex flex-col gap-0.5">
                <span className="text-[11px] text-light-black">
                  Invoice Recipients
                </span>
                <span className="font-medium text-dark-black break-all">
                  {invoiceSettings.primary}
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-0.5">
                <span className="text-[11px] text-light-black">
                  Additional Recipients
                </span>
                <span className="font-medium text-dark-black break-all">
                  {invoiceSettings.additional}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Audit Info ── */}
      <AuditInfo />

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                       */}
      {/* ═════════════════════════════════════════════════════════════ */}

      {/* 1. Change Plan Modal (Quick Actions Overview Modal) */}
      <ChangePlanModal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        user={userData}
        onConfirm={(planData) => {
          if (planData?.name) {
            setUserData((prev) => ({
              ...prev,
              plan: `${planData.name} Plan`,
              currentPlan: planData.name,
              currentPrice: planData.price,
            }));
            setPlanPrice(planData.price);
          }
        }}
      />

      {/* 2. Extend Subscription Modal (Quick Actions Overview Modal) */}
      <ExtendSubscriptionModal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        user={userData}
        onConfirm={() => {
          toast.success("Subscription extension confirmed.");
        }}
      />

      {/* 3. Cancel Subscription */}
      <CancelSubscriptionModal isOpen={isCancelAlertOpen} onClose={() => setIsCancelAlertOpen(false)} onConfirm={() => setAutoRenew(false)} />

      <ChangePlanDialog key={`change-${planDialog === "change"}`} isOpen={planDialog === "change"} onClose={() => setPlanDialog(null)} />
      <DowngradePlanModal isOpen={planDialog === "downgrade"} onClose={() => setPlanDialog(null)} />

      {/* 4. Confirm Add Calls Modal */}
      <AlertModal
        isOpen={isConfirmAddCallsOpen}
        onClose={() => setIsConfirmAddCallsOpen(false)}
        type="info"
        title="Confirm Adding Calls"
        message={`Please confirm this action before it automatically adds to the balance. Are you sure you want to add ${addCallsAmount} calls ($${calculatedCallsCost}) to ${userData.name}'s balance?`}
        confirmLabel="Confirm & Add Calls"
        onConfirm={handleConfirmAddCallsAction}
      />

      {/* 5. Confirm Add Reports Modal */}
      <AlertModal
        isOpen={isConfirmAddReportsOpen}
        onClose={() => setIsConfirmAddReportsOpen(false)}
        type="info"
        title="Confirm Adding Reports"
        message={`Please confirm this action before it automatically adds to the balance. Are you sure you want to add ${addReportsAmount} report credits ($${calculatedReportsCost}) to ${userData.name}'s balance?`}
        confirmLabel="Confirm & Add Reports"
        onConfirm={handleConfirmAddReportsAction}
      />

      {/* 6. Confirm Apply Credit Modal */}
      <AlertModal
        isOpen={isConfirmApplyCreditOpen}
        onClose={() => setIsConfirmApplyCreditOpen(false)}
        type="info"
        title="Confirm Applying Credit"
        message={`Please confirm this action before it automatically adds to the balance. Are you sure you want to apply a $${parseFloat(discountAmount || "0").toFixed(2)} ${discountType} to ${applyTo}?`}
        confirmLabel="Confirm & Apply Credit"
        onConfirm={handleConfirmApplyCreditAction}
      />

      {/* 7. Edit Invoice Settings Modal */}
      <AnimatePresence>
        {isEditInvoiceSettingsOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setIsEditInvoiceSettingsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-light-gray flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-50 text-primary border border-teal-100">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark-black">
                      Edit Invoice Settings
                    </h3>
                    <p className="text-xs text-light-black">
                      Configure recipient email addresses for invoices
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditInvoiceSettingsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveInvoiceSettings} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-dark-black uppercase tracking-wider mb-1.5">
                    Primary Invoice Recipient Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editInvoiceForm.primary}
                    onChange={(e) =>
                      setEditInvoiceForm((prev) => ({
                        ...prev,
                        primary: e.target.value,
                      }))
                    }
                    placeholder="e.g. accounting@company.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary font-medium"
                  />
                  <span className="text-[11px] text-light-black mt-1 block">
                    All primary monthly billing receipts will be sent to this email.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-dark-black uppercase tracking-wider mb-1.5">
                    Additional Recipients Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={editInvoiceForm.additional}
                    onChange={(e) =>
                      setEditInvoiceForm((prev) => ({
                        ...prev,
                        additional: e.target.value,
                      }))
                    }
                    placeholder="e.g. finance-copy@company.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-light-gray rounded-xl text-dark-black focus:outline-none focus:border-primary font-medium"
                  />
                  <span className="text-[11px] text-light-black mt-1 block">
                    CC or secondary recipient for payment notifications.
                  </span>
                </div>

                <div className="pt-3 border-t border-light-gray flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditInvoiceSettingsOpen(false)}
                    className="px-4 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Invoice Preview Modal */}
      <AnimatePresence>
        {isInvoicePreviewOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={() => setIsInvoicePreviewOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 sm:p-8 pb-4 border-b border-light-gray flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-teal-50 text-primary border border-teal-100">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-black">
                      Upcoming Invoice Preview
                    </h3>
                    <p className="text-xs text-light-black">
                      Invoice #INV-2025-0615 (Draft)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInvoicePreviewOpen(false)}
                  className="p-1.5 rounded-full hover:bg-light-gray text-light-black hover:text-dark-black transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-light-gray/30 border border-light-gray text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-light-black tracking-wider block mb-1">
                      Billed To
                    </span>
                    <p className="font-bold text-dark-black">{billingContact.name}</p>
                    <p className="text-light-black">{userData.company}</p>
                    <p className="text-light-black">{billingContact.address}</p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase text-light-black tracking-wider block mb-1">
                      Invoice Summary
                    </span>
                    <p className="text-light-black">
                      Issue Date: <strong className="text-dark-black">Jun 15, 2025</strong>
                    </p>
                    <p className="text-light-black">
                      Due Date: <strong className="text-dark-black">Jun 15, 2025</strong>
                    </p>
                    <p className="text-light-black">
                      Payment Method: <strong className="text-dark-black">VISA •••• 4242</strong>
                    </p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="border border-light-gray rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-light-gray/40 border-b border-light-gray text-[10px] font-bold uppercase tracking-wider text-light-black">
                      <tr>
                        <th className="p-3.5 pl-4">Description</th>
                        <th className="p-3.5 text-center">Period</th>
                        <th className="p-3.5 text-right pr-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-gray">
                      <tr>
                        <td className="p-3.5 pl-4">
                          <span className="font-bold text-dark-black block">
                            PitchProx {userData.plan} Subscription
                          </span>
                          <span className="text-[11px] text-light-black">
                            500 calls, 50 reports included
                          </span>
                        </td>
                        <td className="p-3.5 text-center text-light-black">
                          Jun 15 - Jul 15, 2025
                        </td>
                        <td className="p-3.5 text-right pr-4 font-bold text-dark-black">
                          ${planPrice.toFixed(2)}
                        </td>
                      </tr>
                      {appliedAdjustment < 0 && (
                        <tr>
                          <td className="p-3.5 pl-4">
                            <span className="font-bold text-emerald-600 block">
                              Applied Credit / Adjustment
                            </span>
                            <span className="text-[11px] text-light-black">
                              {discountNote} ({discountType})
                            </span>
                          </td>
                          <td className="p-3.5 text-center text-light-black">
                            One-time
                          </td>
                          <td className="p-3.5 text-right pr-4 font-bold text-emerald-600">
                            -${Math.abs(appliedAdjustment).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-light-gray/20 border-t border-light-gray font-bold">
                      <tr>
                        <td colSpan={2} className="p-3.5 pl-4 text-dark-black">
                          Total Due
                        </td>
                        <td className="p-3.5 text-right pr-4 text-sm text-dark-black">
                          ${nextInvoiceTotal}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:px-8 border-t border-light-gray bg-white flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Printing invoice draft...");
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Invoice PDF downloaded.");
                    setIsInvoicePreviewOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
