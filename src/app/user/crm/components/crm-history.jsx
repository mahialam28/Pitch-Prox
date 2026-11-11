"use client";

import { usePortal } from "@/components/shared/use-portal";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Archive,
  Search,
  XCircle,
  PhoneCall,
  Pencil,
  Trash2,
  Plus,
  Calendar,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RiArrowLeftLongLine, RiArrowRightLongLine } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { queueCall } from "@/utils.js/start-call";
import ChooseNumberDialog from "@/components/contacts/choose-number-dialog";
import Dropdown from "@/components/shared/dropdown/dropdown";
import AlertModal from "@/components/modals/alert-modal";
import ImportProspectsModal from "./import-prospects-modal";
import BadgeSelect from "@/components/shared/dropdown/badge-select";

const timeFilterOptions = [
  { value: "This Year", label: "This Year" },
  { value: "This Month", label: "This Month" },
  { value: "This Week", label: "This Week" },
  { value: "Today", label: "Today" },
  { value: "Last Month", label: "Last Month" },
  { value: "Last 90 Days", label: "Last 90 Days" },
];

// Real-estate lead types (replaces internal PitchProX sales classifications)
const leadTypeOptions = [
  "Expired Listings",
  "Pre-Expired Listings",
  "FSBO",
  "Absentee Owners",
  "Circle Prospecting",
  "Just Listed",
  "Just Sold",
  "Probate",
  "Trust & Estate",
  "Pre-Foreclosure",
  "Foreclosure / REO",
  "Divorce",
  "Tax Delinquent",
  "Vacant Properties",
  "Investor / Cash Buyers",
  "Past Clients & Sphere",
].map((label) => ({ value: label, label }));

// Lead Stage options (pipeline position)
const stageOptions = [
  {
    value: "New",
    label: "New",
    className: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    dotClass: "bg-blue-500",
  },
  {
    value: "Attempted",
    label: "Attempted",
    className: "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200",
    dotClass: "bg-slate-400",
  },
  {
    value: "Contacted",
    label: "Contacted",
    className: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
    dotClass: "bg-indigo-500",
  },
  {
    value: "In Conversation",
    label: "In Conversation",
    className: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
    dotClass: "bg-purple-500",
  },
  {
    value: "Follow-Up",
    label: "Follow-Up",
    className: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100",
    dotClass: "bg-amber-500",
  },
  {
    value: "Qualified",
    label: "Qualified",
    className: "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100",
    dotClass: "bg-teal-500",
  },
  {
    value: "Appointment Set",
    label: "Appointment Set",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
  {
    value: "Archived",
    label: "Archived",
    className: "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200",
    dotClass: "bg-gray-400",
  },
];

// Status options (lead temperature)
const statusOptions = [
  {
    value: "Hot",
    label: "Hot",
    className: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
    dotClass: "bg-orange-500",
  },
  {
    value: "Warm",
    label: "Warm",
    className: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100",
    dotClass: "bg-amber-500",
  },
  {
    value: "Cold",
    label: "Cold",
    className: "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100",
    dotClass: "bg-sky-500",
  },
  {
    value: "Unknown",
    label: "Unknown",
    className: "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200",
    dotClass: "bg-gray-400",
  },
];

// Outcome options (result of last contact)
const outcomeOptions = [
  {
    value: "Appointment Set",
    label: "Appointment Set",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
  {
    value: "Follow-Up Required",
    label: "Follow-Up Required",
    className: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    dotClass: "bg-blue-500",
  },
  {
    value: "Information Requested",
    label: "Information Requested",
    className: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
    dotClass: "bg-indigo-500",
  },
  {
    value: "Not Interested",
    label: "Not Interested",
    className: "bg-red/10 text-red border-red/20 hover:bg-red/15",
    dotClass: "bg-red",
  },
  {
    value: "Not a Fit",
    label: "Not a Fit",
    className: "bg-light-gray text-medium-black border-light-gray hover:bg-light-gray/80",
    dotClass: "bg-medium-black",
  },
  {
    value: "No Answer",
    label: "No Answer",
    className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
    dotClass: "bg-gray-400",
  },
  {
    value: "Voicemail",
    label: "Voicemail",
    className: "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100",
    dotClass: "bg-yellow-500",
  },
  {
    value: "Wrong Number",
    label: "Wrong Number",
    className: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100",
    dotClass: "bg-orange-500",
  },
  {
    value: "Do Not Contact",
    label: "Do Not Contact",
    className: "bg-rose-50 text-rose-500 border-rose-200 hover:bg-rose-100",
    dotClass: "bg-rose-500",
  },
  {
    value: "Other",
    label: "Other",
    className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
    dotClass: "bg-gray-400",
  },
];

const followUpStatusOptions = [
  { value: "Due Now", label: "Due Now" },
  { value: "Due Soon", label: "Due Soon" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "None", label: "None" },
];

// Build relative mock dates so the Date Range filter demo works
// Sample calls (until calling is connected). A fixed time of day keeps the server's and the
// browser's rendering identical (the server works these out once, when it starts).
const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9, 47, 0, 0);
  return d;
};

const formatDate = (d) =>
  `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}, ${d.getFullYear()}`;

const formatTime = (d) =>
  d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

export const initialProspectsData = [
  {
    id: "1",
    name: "Ricky Smith",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0141",
    stage: "In Conversation",
    status: "Hot",
    leadType: "Expired Listings",
    outcome: "Appointment Set",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(1)),
    lastConnectedTime: formatTime(daysFromNow(1)),
  },
  {
    id: "2",
    name: "Kimberly Mastrangelo",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0127",
    stage: "Attempted",
    status: "Unknown",
    leadType: "FSBO",
    outcome: "No Answer",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(3)),
    lastConnectedTime: formatTime(daysFromNow(3)),
  },
  {
    id: "3",
    name: "Daniel Hamilton",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0189",
    stage: "Contacted",
    status: "Warm",
    leadType: "Pre-Expired Listings",
    outcome: "Information Requested",
    followUpStatus: "Due Now",
    lastConnectedDate: formatDate(daysFromNow(12)),
    lastConnectedTime: formatTime(daysFromNow(12)),
  },
  {
    id: "4",
    name: "Rodger Struck",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0176",
    stage: "Archived",
    status: "Cold",
    leadType: "Absentee Owners",
    outcome: "Not Interested",
    followUpStatus: "None",
    lastConnectedDate: formatDate(daysFromNow(60)),
    lastConnectedTime: formatTime(daysFromNow(60)),
  },
  {
    id: "5",
    name: "Jerry Helfer",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0153",
    stage: "Follow-Up",
    status: "Hot",
    leadType: "Circle Prospecting",
    outcome: "Follow-Up Required",
    followUpStatus: "Due Now",
    lastConnectedDate: formatDate(daysFromNow(20)),
    lastConnectedTime: formatTime(daysFromNow(20)),
  },
  {
    id: "6",
    name: "Rhonda Rhodes",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0112",
    stage: "New",
    status: "Warm",
    leadType: "Investor / Cash Buyers",
    outcome: "Voicemail",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(90)),
    lastConnectedTime: formatTime(daysFromNow(90)),
  },
  {
    id: "7",
    name: "Stephanie Sharkey",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0198",
    stage: "Qualified",
    status: "Hot",
    leadType: "Past Clients & Sphere",
    outcome: "Appointment Set",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(150)),
    lastConnectedTime: formatTime(daysFromNow(150)),
  },
  {
    id: "8",
    name: "Marcus Vance",
    propertyAddress: "744 Park Ave, New York...",
    phoneNumber: "(212) 555-0194",
    stage: "In Conversation",
    status: "Hot",
    leadType: "Pre-Foreclosure",
    outcome: "Appointment Set",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(4)),
    lastConnectedTime: formatTime(daysFromNow(4)),
  },
  {
    id: "9",
    name: "Angela Davis",
    propertyAddress: "220 Riverside Dr, New...",
    phoneNumber: "(212) 555-0182",
    stage: "Contacted",
    status: "Warm",
    leadType: "Divorce",
    outcome: "Follow-Up Set",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(7)),
    lastConnectedTime: formatTime(daysFromNow(7)),
  },
  {
    id: "10",
    name: "Tyler Jenkins",
    propertyAddress: "910 5th Avenue, New Yo...",
    phoneNumber: "(212) 555-0177",
    stage: "Attempted",
    status: "Unknown",
    leadType: "Tax Delinquent",
    outcome: "Wrong Number",
    followUpStatus: "None",
    lastConnectedDate: formatDate(daysFromNow(15)),
    lastConnectedTime: formatTime(daysFromNow(15)),
  },
  {
    id: "11",
    name: "Chloe Bennett",
    propertyAddress: "35 Bedford St, New York...",
    phoneNumber: "(212) 555-0163",
    stage: "Follow-Up",
    status: "Warm",
    leadType: "Vacant Properties",
    outcome: "Requested Information",
    followUpStatus: "Due Now",
    lastConnectedDate: formatDate(daysFromNow(25)),
    lastConnectedTime: formatTime(daysFromNow(25)),
  },
  {
    id: "12",
    name: "David Miller",
    propertyAddress: "105 Duane St, New York...",
    phoneNumber: "(212) 555-0155",
    stage: "Qualified",
    status: "Hot",
    leadType: "Probate",
    outcome: "Appointment Set",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(32)),
    lastConnectedTime: formatTime(daysFromNow(32)),
  },
  {
    id: "13",
    name: "Elena Rostova",
    propertyAddress: "640 Broadway, New York...",
    phoneNumber: "(212) 555-0142",
    stage: "Attempted",
    status: "Cold",
    leadType: "FSBO",
    outcome: "Voicemail",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(40)),
    lastConnectedTime: formatTime(daysFromNow(40)),
  },
  {
    id: "14",
    name: "Lucas Scott",
    propertyAddress: "125 Prince St, New York...",
    phoneNumber: "(212) 555-0139",
    stage: "Archived",
    status: "Cold",
    leadType: "Absentee Owners",
    outcome: "Not Interested",
    followUpStatus: "None",
    lastConnectedDate: formatDate(daysFromNow(110)),
    lastConnectedTime: formatTime(daysFromNow(110)),
  },
];

const TABS = [
  { key: "allProspects", label: "All Prospects", icon: Users },
  { key: "archived", label: "Archived", icon: Archive, iconColor: "text-slate-500" },
];

const PAGE_SIZE = 6;

export const CrmHistory = ({ onSelectProspect, prospects, onUpdateProspect, onDeleteProspect, onImportProspects }) => {
  const portal = usePortal();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("allProspects");
  const [timeFilter, setTimeFilter] = useState("This Year");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // ── Filter state (sits above the table) ──
  const [searchQuery, setSearchQuery] = useState("");
  const [leadTypeFilter, setLeadTypeFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [followUpFilter, setFollowUpFilter] = useState("");

  const headerRef = useRef(null);
  const bodyWrapperRef = useRef(null);
  const [importOpen, setImportOpen] = useState(false);

  // The page number belongs to the current filters, so changing a filter or tab starts back at page 1
  const filterKey = [activeTab, timeFilter, searchQuery, leadTypeFilter, stageFilter, followUpFilter].join("|");
  const [pageState, setPageState] = useState({ filterKey, page: 1 });
  const currentPage = pageState.filterKey === filterKey ? pageState.page : 1;
  const setCurrentPage = (next) => setPageState({ filterKey, page: typeof next === "function" ? next(currentPage) : next });

  // Hand the prospect over to the live-calling page (same bridge the header
  // uses: sessionStorage + navigate). The call auto-starts there with this info.
  // Hand the prospect to Live Calling on its first callable number; the call remembers which one
  const handleStartCall = (prospect) => {
    queueCall(prospect, "prospect");
    router.push(`${portal.base}/live-calling`);
  };

  const handleStageChange = (prospectId, newStage) => onUpdateProspect?.(prospectId, { stage: newStage });
  const handleStatusChange = (prospectId, newStatus) => onUpdateProspect?.(prospectId, { status: newStatus });
  // "Wrong Number" is about one number: with several, ask which (the others stay callable)
  const [wrongNumberFor, setWrongNumberFor] = useState(null);
  const handleOutcomeChange = (prospectId, newOutcome) => {
    const contact = (prospects ?? []).find((item) => item.id === prospectId);
    if (newOutcome === "Wrong Number" && contact?.phones?.length > 1) return setWrongNumberFor(contact);
    return onUpdateProspect?.(prospectId, { outcome: newOutcome });
  };

  const tabScrollRef = useRef(null);
  const activeTabIndex = TABS.findIndex((t) => t.key === activeTab);

  const [tabCanScrollLeft, setTabCanScrollLeft] = useState(false);
  const [tabCanScrollRight, setTabCanScrollRight] = useState(false);

  const updateTabArrows = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    setTabCanScrollLeft(el.scrollLeft > 4);
    setTabCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scrollTabs = useCallback(
    (direction) => {
      const el = tabScrollRef.current;
      if (!el) return;
      el.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
      setTimeout(updateTabArrows, 350);
    },
    [updateTabArrows]
  );

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el || activeTabIndex < 0) return;
    const child = el.children[activeTabIndex];
    if (child) {
      child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    setTimeout(updateTabArrows, 400);
  }, [activeTabIndex, updateTabArrows]);

  useEffect(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    updateTabArrows();
    const observer = new ResizeObserver(() => updateTabArrows());
    observer.observe(el);
    el.addEventListener("scroll", updateTabArrows, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateTabArrows);
    };
  }, [updateTabArrows]);

  const handleBodyScroll = useCallback(() => {
    if (headerRef.current && bodyWrapperRef.current) {
      headerRef.current.scrollLeft = bodyWrapperRef.current.scrollLeft;
    }
  }, []);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    leadTypeFilter !== "" ||
    stageFilter !== "" ||
    followUpFilter !== "" ||
    timeFilter !== "This Year";

  const clearFilters = () => {
    setSearchQuery("");
    setLeadTypeFilter("");
    setStageFilter("");
    setFollowUpFilter("");
    setTimeFilter("This Year");
  };

  // ── Export prospects to a CSV file ──
  const handleExport = () => {
    const headers = [
      "Name",
      "Property Address",
      "Phone Number",
      "Lead Stage",
      "Status",
      "Lead Type",
      "Outcome",
      "Follow-Up Status",
      "Last Connected Date",
      "Last Connected Time",
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredProspects.map((p) => [
      p.name,
      p.propertyAddress,
      p.phoneNumber || "",
      p.stage,
      p.status,
      p.leadType,
      p.outcome,
      p.followUpStatus,
      p.lastConnectedDate,
      p.lastConnectedTime,
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((r) => r.map(escapeCsv).join(",")),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const now = new Date();
    const dateStamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    link.setAttribute("download", `pitchprox-crm-prospects-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Check whether a date like "May 19, 2025" falls inside the selected range
  const isDateInRange = (dateStr, range) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    let start;
    switch (range) {
      case "This Month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "Last Month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case "This Week":
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        break;
      case "Last 90 Days":
        start = new Date(now);
        start.setDate(now.getDate() - 90);
        break;
      case "Today":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        break;
      case "This Year":
      default:
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }
    return d >= start;
  };

  const filteredProspects = prospects.filter((prospect) => {
    // Tab filter (All / Archived)
    if (activeTab === "archived" && prospect.stage !== "Archived") {
      return false;
    }
    // Search across name + property address
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      if (
        !prospect.name.toLowerCase().includes(q) &&
        !prospect.propertyAddress.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (leadTypeFilter && prospect.leadType !== leadTypeFilter) return false;
    if (stageFilter && prospect.stage !== stageFilter) return false;
    if (followUpFilter && prospect.followUpStatus !== followUpFilter) return false;
    if (!isDateInRange(prospect.lastConnectedDate, timeFilter)) return false;
    return true;
  });

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProspects.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProspects = filteredProspects.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-sm w-full p-4 sm:p-6">
      {wrongNumberFor && (
        <ChooseNumberDialog
          contact={wrongNumberFor}
          onClose={() => setWrongNumberFor(null)}
          onChoose={(phoneId) => {
            onUpdateProspect?.(wrongNumberFor.id, { outcome: "Wrong Number", phoneId });
            setWrongNumberFor(null);
          }}
        />
      )}
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-light-gray pb-4">
        {/* Navigation Tabs */}
        <div className="relative flex-1 min-w-0">
          {tabCanScrollLeft && (
            <button
              onClick={() => scrollTabs("left")}
              className="absolute left-0 top-1/2 z-20 -translate-y-1/2 w-9 h-10 flex items-center justify-center bg-gradient-to-r from-white via-white/90 to-transparent rounded-r-xl cursor-pointer group"
              aria-label="Scroll tabs left"
            >
              <RiArrowLeftLongLine className="w-5 h-5 text-slate-500 group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
            </button>
          )}
          {tabCanScrollRight && (
            <button
              onClick={() => scrollTabs("right")}
              className="absolute right-0 top-1/2 z-20 -translate-y-1/2 w-9 h-10 flex items-center justify-center bg-gradient-to-l from-white via-white/90 to-transparent rounded-l-xl cursor-pointer group"
              aria-label="Scroll tabs right"
            >
              <RiArrowRightLongLine className="w-5 h-5 text-slate-500 group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
            </button>
          )}
          <nav
            ref={tabScrollRef}
            className="flex items-center gap-6 overflow-hidden snap-x snap-mandatory pt-2 sm:pt-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-4 text-sm font-semibold relative transition-colors whitespace-nowrap cursor-pointer snap-start shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? "text-primary"
                      : "text-light-black hover:text-medium-black"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${tab.iconColor || ""}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="crm-tab-indicator"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Time dropdown, Import, Export, Add */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-end lg:self-auto shrink-0">
          <Dropdown
            label="This Year"
            items={timeFilterOptions}
            selected={timeFilter}
            onSelect={setTimeFilter}
            variant="default"
            className="w-[140px]"
          />

          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray transition-colors cursor-pointer"
            title="Import prospects from CSV or JSON"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray transition-colors cursor-pointer"
            title="Export filtered prospects to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <Link
            href={`${portal.base}/crm/add`}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-primary border border-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="whitespace-nowrap">Add Prospect</span>
          </Link>
        </div>
      </div>

      {/* ── Filter Bar above table ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative w-full sm:w-[260px] md:w-[280px] shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-black pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or address..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black placeholder:text-light-black"
            />
          </div>

          {/* Lead Type filter */}
          <Dropdown
            label="Lead Type"
            items={portal.leadTypes}
            selected={leadTypeFilter}
            onSelect={(val) => setLeadTypeFilter(val === leadTypeFilter ? "" : val)}
            variant="compact"
            className="w-full sm:w-[160px]"
          />

          {/* Stage filter */}
          <Dropdown
            label="Lead Stage"
            items={stageOptions.map((s) => ({ value: s.value, label: s.label }))}
            selected={stageFilter}
            onSelect={(val) => setStageFilter(val === stageFilter ? "" : val)}
            variant="compact"
            className="w-full sm:w-[150px]"
          />

          {/* Follow-up filter */}
          <Dropdown
            label="Follow-Up"
            items={followUpStatusOptions}
            selected={followUpFilter}
            onSelect={(val) => setFollowUpFilter(val === followUpFilter ? "" : val)}
            variant="compact"
            className="w-full sm:w-[145px]"
          />

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black hover:text-red hover:bg-red/5 rounded-xl border border-light-gray transition-colors cursor-pointer shrink-0"
            >
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Table */}
      <div
        ref={headerRef}
        className="w-full overflow-hidden"
        onScroll={handleBodyScroll}
      >
        <table className="w-full border-collapse text-left min-w-[1340px] table-fixed">
          <thead>
            <tr className="border-b border-light-gray">
              <th className="p-4 pl-6 text-[11px] font-bold text-light-black tracking-wider uppercase w-[150px]">
                NAME
              </th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[180px]">
                {portal.addressLabel.toUpperCase()}
              </th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[170px]">
                LEAD STAGE
              </th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[120px]">
                STATUS
              </th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[170px]">
                LEAD TYPE
              </th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[190px]">
                OUTCOME
              </th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[140px]">
                LAST CONNECTED
              </th>
              {portal.canCall && (
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase text-left w-[130px]">
                MAKE CALL
              </th>
              )}
              <th className="p-4 pr-6 text-[11px] font-bold text-light-black tracking-wider uppercase text-right w-[100px]">
                ACTIONS
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body Table */}
      <div
        ref={bodyWrapperRef}
        className="w-full overflow-x-auto"
        onScroll={handleBodyScroll}
      >
        <table className="w-full border-collapse text-left min-w-[1340px] table-fixed">
          <tbody className="divide-y divide-light-gray/60">
            {paginatedProspects.map((prospect) => (
              <tr
                key={prospect.id}
                onClick={() => onSelectProspect?.(prospect)}
                className="hover:bg-primary/5 transition-colors group cursor-pointer"
              >
                <td className="p-4 pl-6 text-sm font-bold text-dark-black/90 truncate w-[150px]">
                  {prospect.name}
                </td>
                <td className="p-4 text-sm font-medium text-medium-black truncate w-[180px]">
                  {prospect.propertyAddress}
                </td>
                <td className="p-4 w-[170px]" onClick={(e) => e.stopPropagation()}>
                  <BadgeSelect
                    value={prospect.stage}
                    onChange={(val) => handleStageChange(prospect.id, val)}
                    options={stageOptions}
                    placeholder="Set Stage"
                  />
                </td>
                <td className="p-4 w-[120px]" onClick={(e) => e.stopPropagation()}>
                  <BadgeSelect
                    value={prospect.status}
                    onChange={(val) => handleStatusChange(prospect.id, val)}
                    options={statusOptions}
                    placeholder="Set Status"
                  />
                </td>
                <td className="p-4 text-sm font-medium text-medium-black w-[170px] truncate">
                  {prospect.leadType}
                </td>
                <td className="p-4 w-[190px]" onClick={(e) => e.stopPropagation()}>
                  <BadgeSelect
                    value={prospect.outcome}
                    onChange={(val) => handleOutcomeChange(prospect.id, val)}
                    options={portal.outcomes}
                    placeholder="Select Outcome"
                  />
                </td>
                <td className="p-4 align-middle w-[140px]">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-dark-black/90">
                      {prospect.lastConnectedDate}
                    </span>
                    <span className="text-[11px] font-semibold text-light-black mt-0.5">
                      {prospect.lastConnectedTime}
                    </span>
                  </div>
                </td>
                {portal.canCall && (
                <td className="p-4 w-[130px]" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleStartCall(prospect)}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-primary text-primary rounded-xl hover:bg-primary/5 transition-colors shadow-sm cursor-pointer"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    <span>Call</span>
                  </button>
                </td>
                )}
                <td className="p-4 pr-6 w-[100px]" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`${portal.base}/crm/edit?id=${prospect.id}`}
                      className="p-1.5 text-light-black hover:text-blue-500 hover:bg-blue-50 rounded-lg transition cursor-pointer inline-flex items-center justify-center"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(prospect);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-light-black hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredProspects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-sm font-semibold text-medium-black">
            No prospects found
          </span>
          <span className="text-xs text-light-black mt-1">
            Try adjusting your search or filters.
          </span>
        </div>
      )}

      {/* ── Table Footer & Pagination ── */}
      {filteredProspects.length > 0 && (
        <div className="p-4 sm:p-5 border-t border-light-gray flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-light-black bg-white rounded-b-2xl mt-4">
          <div>
            <span>
              Showing{" "}
              <span className="font-semibold text-dark-black">
                {(safePage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-dark-black">
                {Math.min(safePage * PAGE_SIZE, filteredProspects.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-dark-black">
                {filteredProspects.length}
              </span>{" "}
              prospects
            </span>
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Prev Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Page Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  safePage === page
                    ? "bg-primary text-white font-bold shadow-xs"
                    : "border border-light-gray text-medium-black hover:bg-light-gray"
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <ImportProspectsModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        existingProspects={prospects}
        onImport={onImportProspects}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        type="warning"
        title="Delete Prospect"
        message={`Are you sure you want to delete ${itemToDelete?.name || "this prospect"}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteProspect?.(itemToDelete);
          }
          setItemToDelete(null);
          setDeleteModalOpen(false);
        }}
      />
    </div>
  );
};

export default CrmHistory;
