"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Clock,
  MoreHorizontal,
  Mail,
  Phone,
  BookOpen,
  ShieldAlert,
  Download,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  FileText,
  User,
  X,
  Send,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AuditInfo from "./audit-info";

// ── Mock Support Tickets Data ──
const INITIAL_TICKETS = [
  {
    id: "TKT-78945",
    subject: "Billing discrepancy on invoice",
    snippet: "The invoice for May 2025 shows an extra seat charge that should have been discounted.",
    category: "Billing",
    status: "CLOSED",
    priority: "MEDIUM",
    createdDate: "May 16, 2025",
    createdTime: "10:32 AM",
    updatedDate: "May 16, 2025",
    updatedTime: "2:15 PM",
    agent: "Sarah Johnson",
    customer: "Jennifer Smith",
    messages: [
      {
        sender: "Jennifer Smith",
        role: "Customer",
        time: "May 16, 2025 10:32 AM",
        text: "Hi support team, I noticed our May 2025 invoice has an extra seat charged at standard rate instead of our negotiated rate. Could you please review and issue a credit?",
      },
      {
        sender: "Sarah Johnson",
        role: "Support Specialist",
        time: "May 16, 2025 2:15 PM",
        text: "Hello Jennifer, I have reviewed your billing profile and applied a credit adjustment of $49.00 to your next cycle. The invoice has now been corrected and closed.",
      },
    ],
  },
  {
    id: "TKT-78942",
    subject: "Unable to upload custom script",
    snippet: "Getting an error when trying to upload the custom script CSV file in the calibration tab.",
    category: "Technical",
    status: "IN PROGRESS",
    priority: "HIGH",
    createdDate: "May 16, 2025",
    createdTime: "9:18 AM",
    updatedDate: "May 16, 2025",
    updatedTime: "9:05 AM",
    agent: "Sarah Johnson",
    customer: "Jennifer Smith",
    messages: [
      {
        sender: "Jennifer Smith",
        role: "Customer",
        time: "May 16, 2025 9:18 AM",
        text: "Getting a format error when attempting to upload our newly finalized objection handling script. The file is a standard UTF-8 CSV.",
      },
      {
        sender: "Sarah Johnson",
        role: "Support Specialist",
        time: "May 16, 2025 11:20 AM",
        text: "We are inspecting the encoding on our upload parser. An update is being deployed to resolve the column header delimiter issue.",
      },
    ],
  },
  {
    id: "TKT-78939",
    subject: "Requesting call limit increase",
    snippet: "We have a high volume campaign starting next week and need an increase on simultaneous lines.",
    category: "Usage / Limits",
    status: "RESOLVED",
    priority: "MEDIUM",
    createdDate: "May 16, 2025",
    createdTime: "1:42 PM",
    updatedDate: "May 16, 2025",
    updatedTime: "11:30 AM",
    agent: "Daniel Miller",
    customer: "Jennifer Smith",
    messages: [
      {
        sender: "Jennifer Smith",
        role: "Customer",
        time: "May 16, 2025 1:42 PM",
        text: "Our team is launching a nationwide outreach blitz on Monday. Could we temporarily increase our concurrent calling channels from 5 to 15?",
      },
      {
        sender: "Daniel Miller",
        role: "Technical Lead",
        time: "May 16, 2025 3:10 PM",
        text: "Your concurrent line limit has been increased to 15 channels through the end of next week at no additional provisioning fee.",
      },
    ],
  },
  {
    id: "TKT-78925",
    subject: "AI Calibration voice latency inquiry",
    snippet: "Noticed occasional 250ms latency during complex objection handling tree transitions.",
    category: "Technical",
    status: "OPEN",
    priority: "HIGH",
    createdDate: "May 15, 2025",
    createdTime: "4:15 PM",
    updatedDate: "May 15, 2025",
    updatedTime: "5:30 PM",
    agent: "Sarah Johnson",
    customer: "Jennifer Smith",
    messages: [
      {
        sender: "Jennifer Smith",
        role: "Customer",
        time: "May 15, 2025 4:15 PM",
        text: "Our reps reported slight response delays during live AI pitch assistance. Looking to optimize server latency.",
      },
    ],
  },
  {
    id: "TKT-78912",
    subject: "Update secondary billing contact",
    snippet: "Need to add finance@acme.com as CC recipient for monthly invoices and usage summaries.",
    category: "Billing",
    status: "RESOLVED",
    priority: "LOW",
    createdDate: "May 14, 2025",
    createdTime: "11:00 AM",
    updatedDate: "May 14, 2025",
    updatedTime: "11:45 AM",
    agent: "Sarah Johnson",
    customer: "Jennifer Smith",
    messages: [
      {
        sender: "Jennifer Smith",
        role: "Customer",
        time: "May 14, 2025 11:00 AM",
        text: "Please add finance@acme.com to our automated billing statement email list.",
      },
    ],
  },
  {
    id: "TKT-78898",
    subject: "Webhook endpoint verification error",
    snippet: "CRM payload delivery failed with status 401 on outbound call completion trigger.",
    category: "Technical",
    status: "RESOLVED",
    priority: "MEDIUM",
    createdDate: "May 12, 2025",
    createdTime: "2:15 PM",
    updatedDate: "May 13, 2025",
    updatedTime: "10:00 AM",
    agent: "Alex Turner",
    customer: "Jennifer Smith",
    messages: [
      {
        sender: "Jennifer Smith",
        role: "Customer",
        time: "May 12, 2025 2:15 PM",
        text: "Our webhook endpoint returned a signature mismatch error after the API key rotation.",
      },
    ],
  },
  {
    id: "TKT-78885",
    subject: "Enterprise seat licensing quotation",
    snippet: "Requesting pricing for 20 additional agent seats with custom CRM integration.",
    category: "Billing",
    status: "CLOSED",
    priority: "LOW",
    createdDate: "May 10, 2025",
    createdTime: "3:20 PM",
    updatedDate: "May 11, 2025",
    updatedTime: "9:15 AM",
    agent: "Daniel Miller",
    customer: "Jennifer Smith",
    messages: [
      {
        sender: "Jennifer Smith",
        role: "Customer",
        time: "May 10, 2025 3:20 PM",
        text: "We are planning to expand our sales development team by 20 seats next month. Please send over custom tier pricing.",
      },
    ],
  },
  {
    id: "TKT-78870",
    subject: "Voicemail drop campaign configuration",
    snippet: "Guidance requested on configuring pre-recorded voicemail audio formats and loudness levels.",
    category: "Usage / Limits",
    status: "RESOLVED",
    priority: "MEDIUM",
    createdDate: "May 08, 2025",
    createdTime: "8:45 AM",
    updatedDate: "May 08, 2025",
    updatedTime: "1:30 PM",
    agent: "Sarah Johnson",
    customer: "Jennifer Smith",
    messages: [
      {
        sender: "Jennifer Smith",
        role: "Customer",
        time: "May 08, 2025 8:45 AM",
        text: "What audio bitrate and loudness standard (-16 LUFS vs -23 LUFS) is recommended for crisp voicemail delivery?",
      },
    ],
  },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "OPEN", label: "Open" },
  { value: "IN PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Billing", label: "Billing" },
  { value: "Technical", label: "Technical" },
  { value: "Usage / Limits", label: "Usage / Limits" },
  { value: "Calibration", label: "Calibration" },
  { value: "Account", label: "Account" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 8, label: "8 / page" },
  { value: 10, label: "10 / page" },
  { value: 20, label: "20 / page" },
  { value: 50, label: "50 / page" },
];

export const UserSupportHistory = () => {
  const router = useRouter();
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRangeText, setDateRangeText] = useState("May 16, 2024 - May 16, 2025");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Dropdown UI states
  const [openDropdown, setOpenDropdown] = useState(null); // 'status' | 'category' | 'pageSize' | 'date' | ticketId
  const dropdownRef = useRef(null);

  // Modals state
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState(null);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      return true;
    });
  }, [tickets, statusFilter, categoryFilter]);

  // Pagination calculation
  const totalTickets = 24; // Representative total count matching mockup
  const currentCount = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(currentCount / pageSize));
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleClearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setDateRangeText("May 16, 2024 - May 16, 2025");
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  const handleCopyTicketId = (id) => {
    navigator.clipboard.writeText(id);
    toast.success(`Copied ${id} to clipboard!`);
    setOpenDropdown(null);
  };

  const handleExportHistory = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: "Generating support ticket report...",
        success: "Ticket history exported successfully as CSV!",
        error: "Failed to export ticket history",
      }
    );
  };

  // Status Badge Helper (Exact design from internal Support Tickets page)
  const renderStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case "CLOSED":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            Closed
          </span>
        );
      case "IN PROGRESS":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
            In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Resolved
          </span>
        );
      case "OPEN":
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Open
          </span>
        );
    }
  };

  // Priority Badge Helper (Exact design from internal Support Tickets page)
  const renderPriorityBadge = (priority) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-red-50 text-red-500 border border-red-100">
            High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-orange-50 text-orange-600 border border-orange-100">
            Medium
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-600 border border-slate-100">
            Low
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6" ref={dropdownRef}>
      {/* ── Main Responsive Grid: 8 Columns (Left) + 4 Columns (Right) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* ════════════════════════════════════════════════════════════
            LEFT COLUMN: Header, Filters, Tickets Table, Pagination, & Timezone Notice
        ════════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-8 flex flex-col gap-6 w-full min-w-0">
          {/* ── 1. Top Header Card ── */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-dark-black tracking-tight">
                Support Tickets
              </h2>
              <p className="text-xs sm:text-sm text-light-black mt-0.5 font-normal">
                View all support requests and communications for this account.
              </p>
            </div>

            {/* + New Support Ticket Button (Routes directly to Mail & Support page) */}
            <Link
              href="/internal-sales-representative/mail?tab=support-tickets"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Support Ticket</span>
            </Link>
          </div>

          {/* ── 2. Support Tickets Table Card (With Filters & Table Inside One Box) ── */}
          <div className="bg-white rounded-2xl border border-light-gray shadow-xs overflow-hidden flex flex-col">
            {/* Filters Bar Row Inside Table Box */}
            <div className="p-4 sm:p-5 flex flex-wrap items-center gap-3 border-b border-light-gray bg-white">
              {/* Status Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "status" ? null : "status")
                  }
                  className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black hover:border-gray-300 transition-colors cursor-pointer min-w-[125px] shadow-2xs"
                >
                  <span>
                    {STATUS_OPTIONS.find((s) => s.value === statusFilter)?.label ||
                      "All Status"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-light-black" />
                </button>

                <AnimatePresence>
                  {openDropdown === "status" && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-light-gray shadow-lg py-1.5 z-30"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setStatusFilter(option.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-light-gray transition-colors cursor-pointer ${
                            statusFilter === option.value
                              ? "text-primary font-bold bg-teal-50/50"
                              : "text-dark-black font-medium"
                          }`}
                        >
                          <span>{option.label}</span>
                          {statusFilter === option.value && (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "category" ? null : "category")
                  }
                  className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl border border-light-gray bg-white text-xs font-semibold text-dark-black hover:border-gray-300 transition-colors cursor-pointer min-w-[145px] shadow-2xs"
                >
                  <span>
                    {CATEGORY_OPTIONS.find((c) => c.value === categoryFilter)
                      ?.label || "All Categories"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-light-black" />
                </button>

                <AnimatePresence>
                  {openDropdown === "category" && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-light-gray shadow-lg py-1.5 z-30"
                    >
                      {CATEGORY_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setCategoryFilter(option.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-light-gray transition-colors cursor-pointer ${
                            categoryFilter === option.value
                              ? "text-primary font-bold bg-teal-50/50"
                              : "text-dark-black font-medium"
                          }`}
                        >
                          <span>{option.label}</span>
                          {categoryFilter === option.value && (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Date Range Selector Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "date" ? null : "date")
                  }
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-light-gray bg-white text-xs font-medium text-dark-black hover:border-gray-300 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{dateRangeText}</span>
                  <CalendarIcon className="w-3.5 h-3.5 text-light-black/80" />
                </button>

                <AnimatePresence>
                  {openDropdown === "date" && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1.5 w-60 bg-white rounded-xl border border-light-gray shadow-lg p-3 z-30"
                    >
                      <p className="text-2xs font-bold text-light-black uppercase tracking-wider mb-2">
                        Preset Date Ranges
                      </p>
                      <div className="flex flex-col gap-1">
                        {[
                          "May 16, 2024 - May 16, 2025",
                          "Last 30 Days",
                          "Last 90 Days",
                          "Year to Date (2025)",
                          "All Time",
                        ].map((range) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => {
                              setDateRangeText(range);
                              setOpenDropdown(null);
                              toast.success(`Range set to ${range}`);
                            }}
                            className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                              dateRangeText === range
                                ? "bg-teal-50 text-primary font-bold"
                                : "text-dark-black hover:bg-light-gray font-medium"
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Clear Filters Button */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-medium text-light-black hover:text-dark-black transition-colors cursor-pointer ml-auto shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 text-light-black" />
                <span>Clear Filters</span>
              </button>
            </div>

            {/* Scrollable Table Area (Smooth Touch & Drag with min-w-[960px] and table-fixed) */}
            <div className="w-full overflow-x-auto min-w-0 overscroll-x-contain touch-pan-x">
              <table className="w-full min-w-[960px] table-fixed border-collapse text-left">
                <thead>
                  <tr className="border-b border-light-gray text-[11px] font-bold text-light-black uppercase tracking-wider bg-[#FAFAFA]/50">
                    <th className="py-3.5 pl-6 pr-3 font-semibold w-[120px]">TICKET ID</th>
                    <th className="py-3.5 px-3 font-semibold w-[260px]">SUBJECT</th>
                    <th className="py-3.5 px-3 font-semibold w-[130px]">CATEGORY</th>
                    <th className="py-3.5 px-3 font-semibold text-center w-[120px]">STATUS</th>
                    <th className="py-3.5 px-3 font-semibold text-center w-[90px]">PRIORITY</th>
                    <th className="py-3.5 px-3 font-semibold w-[120px]">CREATED</th>
                    <th className="py-3.5 px-3 font-semibold w-[120px]">LAST UPDATED</th>
                    <th className="py-3.5 pr-6 pl-3 font-semibold text-center w-[80px]">ACTIONS</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-light-gray text-xs">
                  {paginatedTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-light-black">
                        <HelpCircle className="w-8 h-8 text-light-black/40 mx-auto mb-2" />
                        <p className="font-semibold text-dark-black">No tickets found</p>
                        <p className="text-2xs text-light-black mt-0.5">
                          Try adjusting or clearing your filters.
                        </p>
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold cursor-pointer"
                        >
                          Reset Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        className="hover:bg-primary/5 transition-colors cursor-pointer group"
                      >
                        {/* Ticket ID */}
                        <td className="py-4 pl-6 pr-3 whitespace-nowrap align-middle w-[120px]">
                          <button
                            type="button"
                            onClick={() => setSelectedTicketForDetail(ticket)}
                            className="text-primary font-bold hover:underline cursor-pointer tracking-tight"
                          >
                            {ticket.id}
                          </button>
                        </td>

                        {/* Subject + Snippet */}
                        <td className="py-4 px-3 align-middle w-[260px] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setSelectedTicketForDetail(ticket)}
                            className="text-left group cursor-pointer block w-full overflow-hidden"
                          >
                            <p className="font-bold text-dark-black text-xs leading-snug group-hover:text-primary transition-colors truncate">
                              {ticket.subject}
                            </p>
                            <p className="text-[11px] text-light-black truncate mt-0.5 font-normal">
                              {ticket.snippet}
                            </p>
                          </button>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-3 whitespace-nowrap align-middle font-medium text-dark-black/90 w-[130px] truncate">
                          {ticket.category}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-3 whitespace-nowrap align-middle text-center w-[120px]">
                          {renderStatusBadge(ticket.status)}
                        </td>

                        {/* Priority */}
                        <td className="py-4 px-3 whitespace-nowrap align-middle text-center w-[90px]">
                          {renderPriorityBadge(ticket.priority)}
                        </td>

                        {/* Created */}
                        <td className="py-4 px-3 whitespace-nowrap align-middle text-light-black w-[120px]">
                          <p className="font-medium text-dark-black/90 text-xs">
                            {ticket.createdDate}
                          </p>
                          <p className="text-[11px] text-light-black">
                            {ticket.createdTime}
                          </p>
                        </td>

                        {/* Last Updated */}
                        <td className="py-4 px-3 whitespace-nowrap align-middle text-light-black w-[120px]">
                          <p className="font-medium text-dark-black/90 text-xs">
                            {ticket.updatedDate}
                          </p>
                          <p className="text-[11px] text-light-black">
                            {ticket.updatedTime}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-6 pl-3 whitespace-nowrap align-middle text-center w-[80px] relative">
                          <div className="relative inline-block">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenDropdown(
                                  openDropdown === ticket.id ? null : ticket.id
                                )
                              }
                              className="w-7 h-7 rounded-lg border border-light-gray hover:bg-light-gray flex items-center justify-center text-light-black hover:text-dark-black transition-colors cursor-pointer shadow-2xs"
                              aria-label="Ticket actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {openDropdown === ticket.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-light-gray shadow-lg py-1.5 z-30 text-left"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTicketForDetail(ticket);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-light-black" />
                                    <span>View Ticket Details</span>
                                  </button>

                                  <Link
                                    href="/internal-sales-representative/mail?tab=support-tickets"
                                    className="w-full px-3.5 py-2 text-xs text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                                    onClick={() => setOpenDropdown(null)}
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-light-black" />
                                    <span>Open in Mail & Support</span>
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => handleCopyTicketId(ticket.id)}
                                    className="w-full px-3.5 py-2 text-xs text-dark-black hover:bg-light-gray flex items-center gap-2 cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-light-black" />
                                    <span>Copy Ticket ID</span>
                                  </button>

                                  <div className="my-1 border-t border-light-gray" />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenDropdown(null);
                                      toast.success(`Ticket ${ticket.id} escalated to supervisor!`);
                                    }}
                                    className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Escalate Ticket</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── 4. Pagination Footer ── */}
            <div className="p-4 border-t border-light-gray flex items-center justify-end gap-4">
              {/* Page Controls & Page Size Dropdown */}
              <div className="flex items-center gap-3">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:text-dark-black hover:bg-light-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Number Pills */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-primary text-white shadow-xs"
                          : "text-dark-black hover:bg-light-gray border border-transparent"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                  disabled={currentPage === 3}
                  className="w-8 h-8 rounded-lg border border-light-gray flex items-center justify-center text-light-black hover:text-dark-black hover:bg-light-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Page Size Dropdown */}
                <div className="relative ml-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === "pageSize" ? null : "pageSize"
                      )
                    }
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-light-gray bg-white text-xs font-medium text-dark-black hover:border-gray-300 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>
                      {PAGE_SIZE_OPTIONS.find((p) => p.value === pageSize)
                        ?.label || `${pageSize} / page`}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-light-black" />
                  </button>

                  <AnimatePresence>
                    {openDropdown === "pageSize" && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 bottom-full mb-1.5 w-32 bg-white rounded-xl border border-light-gray shadow-lg py-1 z-30"
                      >
                        {PAGE_SIZE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setPageSize(opt.value);
                              setOpenDropdown(null);
                            }}
                            className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-light-gray transition-colors cursor-pointer ${
                              pageSize === opt.value
                                ? "text-primary font-bold bg-teal-50/50"
                                : "text-dark-black font-medium"
                            }`}
                          >
                            <span>{opt.label}</span>
                            {pageSize === opt.value && (
                              <Check className="w-3.5 h-3.5 text-primary" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* ── 5. Timezone Callout Notice Card ── */}
          <div className="bg-[#E8F4FD] border border-[#BFDBFE]/60 rounded-2xl p-4 flex items-center gap-3 text-xs text-[#1D4ED8] font-medium shadow-2xs">
            <Clock className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>
              All times are displayed in the account&apos;s time zone: (GMT - 5:00)
              Eastern Time (Us & Canada)
            </span>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            RIGHT COLUMN: Support Summary, Top Contact, Quick Actions
        ════════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-4 flex flex-col gap-6 w-full min-w-0">
          {/* ── Card 1: Support Summary ── */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-bold text-dark-black tracking-tight">
              Support Summary
            </h3>

            <div className="flex flex-col gap-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-light-black font-medium">Total Tickets</span>
                <span className="font-bold text-dark-black text-sm">24</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-light-black font-medium">Open Tickets</span>
                <span className="font-bold text-primary text-sm">3</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-light-black font-medium">Resolved Tickets</span>
                <span className="font-bold text-dark-black text-sm">18</span>
              </div>

              <div className="border-t border-light-gray my-1" />

              <div className="flex items-center justify-between">
                <span className="text-light-black font-medium">Average Response Time</span>
                <span className="font-bold text-dark-black text-sm">2h 18m</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-light-black font-medium">Average Resolution Time</span>
                <span className="font-bold text-dark-black text-sm">1d 6h</span>
              </div>
            </div>
          </div>

          {/* ── Card 2: Top Contact ── */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-bold text-dark-black tracking-tight">
              Top Contact
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                SJ
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-dark-black leading-snug">
                  Sarah Johnson
                </h4>
                <p className="text-xs text-light-black font-medium">
                  Support Specialist
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1 text-xs">
              <a
                href="mailto:sarah.johnson@pitchprox.com"
                className="flex items-center gap-2.5 text-light-black hover:text-primary transition-colors group"
              >
                <Mail className="w-3.5 h-3.5 text-light-black group-hover:text-primary transition-colors shrink-0" />
                <span className="truncate">sarah.johnson@pitchprox.com</span>
              </a>

              <a
                href="tel:5125550190"
                className="flex items-center gap-2.5 text-light-black hover:text-primary transition-colors group"
              >
                <Phone className="w-3.5 h-3.5 text-light-black group-hover:text-primary transition-colors shrink-0" />
                <span>(512) 555-0190</span>
              </a>
            </div>

            {/* Send Message Button */}
            <button
              type="button"
              onClick={() => setIsSendMessageModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2 mt-1 active:scale-[0.98]"
            >
              <Mail className="w-3.5 h-3.5 text-light-black" />
              <span>Send Message</span>
            </button>
          </div>

          {/* ── Card 3: Quick Actions ── */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs flex flex-col gap-3">
            <h3 className="text-base font-bold text-dark-black tracking-tight mb-1">
              Quick Actions
            </h3>

            {/* + Create Support Ticket (Links directly to Mail & Support page) */}
            <Link
              href="/internal-sales-representative/mail?tab=support-tickets"
              className="w-full py-2.5 px-3.5 rounded-xl border border-light-gray hover:border-primary/40 hover:bg-teal-50/30 text-xs font-semibold text-primary transition-all duration-200 flex items-center gap-2.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Support Ticket</span>
            </Link>

            {/* View Knowledge Base */}
            <button
              type="button"
              onClick={() => setIsKnowledgeModalOpen(true)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-medium text-dark-black/90 transition-all duration-200 flex items-center gap-2.5 cursor-pointer shadow-2xs text-left"
            >
              <BookOpen className="w-4 h-4 text-light-black" />
              <span>View Knowledge Base</span>
            </button>

            {/* Escalate to Manager */}
            <button
              type="button"
              onClick={() => setIsEscalateModalOpen(true)}
              className="w-full py-2.5 px-3.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-medium text-dark-black/90 transition-all duration-200 flex items-center gap-2.5 cursor-pointer shadow-2xs text-left"
            >
              <ShieldAlert className="w-4 h-4 text-light-black" />
              <span>Escalate to Manager</span>
            </button>

            {/* Export Ticket History */}
            <button
              type="button"
              onClick={handleExportHistory}
              className="w-full py-2.5 px-3.5 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-medium text-dark-black/90 transition-all duration-200 flex items-center gap-2.5 cursor-pointer shadow-2xs text-left"
            >
              <Download className="w-4 h-4 text-light-black" />
              <span>Export Ticket History</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer Audit Info ── */}
      <AuditInfo />

      {/* ════════════════════════════════════════════════════════════
          MODAL: Ticket Details Dialog
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedTicketForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTicketForDetail(null)}
              className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-light-gray z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 sm:p-6 border-b border-light-gray flex items-start justify-between gap-4 bg-gray-50/50">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-extrabold text-primary bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                      {selectedTicketForDetail.id}
                    </span>
                    {renderStatusBadge(selectedTicketForDetail.status)}
                    <span className="text-2xs text-light-black font-medium">
                      Category: <strong>{selectedTicketForDetail.category}</strong>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-dark-black mt-2">
                    {selectedTicketForDetail.subject}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTicketForDetail(null)}
                  className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:text-dark-black hover:bg-light-gray cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body: Thread History */}
              <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 flex-1">
                <div className="text-xs text-light-black font-semibold uppercase tracking-wider">
                  Conversation Thread
                </div>

                {selectedTicketForDetail.messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex flex-col gap-2 ${
                      msg.role === "Customer"
                        ? "bg-gray-50/70 border-light-gray"
                        : "bg-teal-50/30 border-teal-100"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-dark-black">
                        {msg.sender}{" "}
                        <span className="text-light-black font-normal">
                          ({msg.role})
                        </span>
                      </span>
                      <span className="text-light-black text-[11px]">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-xs text-dark-black/90 leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-light-gray bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyTicketId(selectedTicketForDetail.id)}
                  className="px-3.5 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Ticket ID</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTicketForDetail(null)}
                    className="px-4 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black cursor-pointer"
                  >
                    Close
                  </button>

                  <Link
                    href="/internal-sales-representative/mail?tab=support-tickets"
                    onClick={() => setSelectedTicketForDetail(null)}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Reply in Mail & Support</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════
          MODAL: Send Message to Contact
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isSendMessageModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSendMessageModalOpen(false)}
              className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-light-gray z-50 overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-light-gray flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-dark-black">
                    Send Direct Message
                  </h3>
                  <p className="text-xs text-light-black">
                    Recipient: Sarah Johnson (Support Specialist)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSendMessageModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:text-dark-black hover:bg-light-gray cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-3 text-xs">
                <div>
                  <label className="font-semibold text-dark-black block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    defaultValue="Inquiry regarding Jennifer Smith account"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-dark-black block mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your message to Sarah Johnson..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-light-gray focus:outline-none focus:border-primary text-xs resize-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-light-gray bg-gray-50/50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSendMessageModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-dark-black hover:bg-light-gray cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSendMessageModalOpen(false);
                    toast.success("Message dispatched to Sarah Johnson!");
                  }}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════
          MODAL: Escalate to Manager
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isEscalateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEscalateModalOpen(false)}
              className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-light-gray z-50 overflow-hidden flex flex-col p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-dark-black">
                Escalate Account to Support Manager?
              </h3>
              <p className="text-xs text-light-black mt-1.5 leading-relaxed">
                This will trigger an urgent notification to the shift lead and flag Jennifer Smith&apos;s account for executive review.
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEscalateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-dark-black hover:bg-light-gray cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEscalateModalOpen(false);
                    toast.success("Account escalated to Support Manager successfully!");
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
                >
                  Confirm Escalation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════
          MODAL: View Knowledge Base
      ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isKnowledgeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsKnowledgeModalOpen(false)}
              className="fixed inset-0 bg-dark-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-light-gray z-50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-light-gray flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center border border-teal-100">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-dark-black">
                      Support Knowledge Base
                    </h3>
                    <p className="text-xs text-light-black">
                      Standard operating procedures & troubleshooting articles
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsKnowledgeModalOpen(false)}
                  className="w-8 h-8 rounded-full border border-light-gray flex items-center justify-center text-light-black hover:text-dark-black hover:bg-light-gray cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex flex-col gap-3 text-xs">
                {[
                  {
                    title: "Resolving Webhook Signature & Header Verification Errors",
                    category: "Technical",
                    views: "1.4k views",
                  },
                  {
                    title: "Adjusting Account Credit Adjustments & Seat Billing Invoices",
                    category: "Billing",
                    views: "980 views",
                  },
                  {
                    title: "Best Practices for Concurrent Line Calling Limit Increases",
                    category: "Usage / Limits",
                    views: "2.1k views",
                  },
                  {
                    title: "Audio Encoding & Loudness Standards for Voicemail Drops",
                    category: "Technical",
                    views: "650 views",
                  },
                ].map((article, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-light-gray hover:border-primary/40 hover:bg-teal-50/20 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                    onClick={() => {
                      toast.success(`Opening "${article.title}"`);
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-dark-black group-hover:text-primary transition-colors">
                        {article.title}
                      </span>
                      <span className="text-[11px] text-light-black mt-0.5">
                        {article.category} • {article.views}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-light-black group-hover:text-primary transition-colors shrink-0" />
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-light-gray bg-gray-50/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsKnowledgeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserSupportHistory;
