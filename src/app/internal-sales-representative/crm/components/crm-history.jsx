"use client";

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
  Eye,
  Plus,
  Calendar,
  Download,
  Upload,
} from "lucide-react";
import { RiArrowLeftLongLine, RiArrowRightLongLine } from "react-icons/ri";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PENDING_CALL_KEY } from "@/utils.js/call-constants";
import Dropdown from "@/components/shared/dropdown/dropdown";
import AlertModal from "@/components/modals/alert-modal";
import ImportProspectsModal from "@/app/user/crm/components/import-prospects-modal";
import BadgeSelect from "@/components/shared/dropdown/badge-select";
import Pagination from "@/components/shared/pagination/pagination";
import ActionMenu from "@/components/shared/dropdown/action-menu";

const timeFilterOptions = [
  { value: "This Year", label: "This Year" },
  { value: "This Month", label: "This Month" },
  { value: "This Week", label: "This Week" },
  { value: "Today", label: "Today" },
  { value: "Last Month", label: "Last Month" },
  { value: "Last 90 Days", label: "Last 90 Days" },
];

// Lead types
const leadTypeOptions = [
  "Solo agent",
  "Micro-Teams",
  "Assistant to team",
  "Junior agent",
  "Small Teams",
  "Mid-Size Teams",
  "Multi-agent brokerage with a General Manager",
  "Large Teams / Brokerages",
  "Top-10 local producer",
  "Mega-Teams",
  "Broker of Record, Managing Broker",
  "Office Manager",
  "e-Agent",
  "Franchise Owners/Broker Owners",
  "New Agents",
  "Luxury Agents",
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
    value: "Disconnected",
    label: "Disconnected",
    className: "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200",
    dotClass: "bg-zinc-400",
  },
  {
    value: "Gatekeeper",
    label: "Gatekeeper",
    className: "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200",
    dotClass: "bg-stone-400",
  },
  {
    value: "Connected",
    label: "Connected",
    className: "bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100",
    dotClass: "bg-sky-500",
  },
  {
    value: "Call Back",
    label: "Call Back",
    className: "bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100",
    dotClass: "bg-cyan-500",
  },
  {
    value: "Follow-Up Set",
    label: "Follow-Up Set",
    className: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
    dotClass: "bg-blue-500",
  },
  {
    value: "Demo Requested",
    label: "Demo Requested",
    className: "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100",
    dotClass: "bg-indigo-500",
  },
  {
    value: "Demo Scheduled",
    label: "Demo Scheduled",
    className: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100",
    dotClass: "bg-purple-500",
  },
  {
    value: "Trial Interested",
    label: "Trial Interested",
    className: "bg-violet-50 text-violet-600 border-violet-200 hover:bg-violet-100",
    dotClass: "bg-violet-500",
  },
  {
    value: "Trial Started",
    label: "Trial Started",
    className: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 hover:bg-fuchsia-100",
    dotClass: "bg-fuchsia-500",
  },
  {
    value: "Pricing Discussed",
    label: "Pricing Discussed",
    className: "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100",
    dotClass: "bg-teal-500",
  },
  {
    value: "Proposal Sent",
    label: "Proposal Sent",
    className: "bg-lime-50 text-lime-600 border-lime-200 hover:bg-lime-100",
    dotClass: "bg-lime-500",
  },
  {
    value: "Decision Pending",
    label: "Decision Pending",
    className: "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100",
    dotClass: "bg-amber-500",
  },
  {
    value: "Subscription Secured",
    label: "Subscription Secured",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100",
    dotClass: "bg-emerald-500",
  },
  {
    value: "Not Interested",
    label: "Not Interested",
    className: "bg-red-50 text-red-500 border-red-200 hover:bg-red-100",
    dotClass: "bg-red-500",
  },
  {
    value: "Lost to Competitor",
    label: "Lost to Competitor",
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

// Follow-up status options
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
    propertyAddress: "Apex Solutions Inc.",
    phoneNumber: "(213) 555-0141",
    stage: "In Conversation",
    status: "Hot",
    leadType: "Solo agent",
    outcome: "Demo Scheduled",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(1)),
    lastConnectedTime: formatTime(daysFromNow(1)),
  },
  {
    id: "2",
    name: "Kimberly Mastrangelo",
    propertyAddress: "Nexus Dynamics",
    phoneNumber: "(213) 555-0127",
    stage: "Attempted",
    status: "Unknown",
    leadType: "Micro-Teams",
    outcome: "No Answer",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(3)),
    lastConnectedTime: formatTime(daysFromNow(3)),
  },
  {
    id: "3",
    name: "Daniel Hamilton",
    propertyAddress: "Starlight Media LLC",
    phoneNumber: "(213) 555-0189",
    stage: "Contacted",
    status: "Warm",
    leadType: "Assistant to team",
    outcome: "Demo Requested",
    followUpStatus: "Due Now",
    lastConnectedDate: formatDate(daysFromNow(12)),
    lastConnectedTime: formatTime(daysFromNow(12)),
  },
  {
    id: "4",
    name: "Rodger Struck",
    propertyAddress: "Pinnacle Group",
    phoneNumber: "(213) 555-0176",
    stage: "Archived",
    status: "Cold",
    leadType: "Junior agent",
    outcome: "Not Interested",
    followUpStatus: "None",
    lastConnectedDate: formatDate(daysFromNow(60)),
    lastConnectedTime: formatTime(daysFromNow(60)),
  },
  {
    id: "5",
    name: "Jerry Helfer",
    propertyAddress: "Horizon Technologies",
    phoneNumber: "(213) 555-0153",
    stage: "Follow-Up",
    status: "Hot",
    leadType: "Small Teams",
    outcome: "Follow-Up Set",
    followUpStatus: "Due Now",
    lastConnectedDate: formatDate(daysFromNow(20)),
    lastConnectedTime: formatTime(daysFromNow(20)),
  },
  {
    id: "6",
    name: "Rhonda Rhodes",
    propertyAddress: "Summit Enterprise",
    phoneNumber: "(213) 555-0112",
    stage: "New",
    status: "Warm",
    leadType: "Mid-Size Teams",
    outcome: "Voicemail",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(90)),
    lastConnectedTime: formatTime(daysFromNow(90)),
  },
  {
    id: "7",
    name: "Stephanie Sharkey",
    propertyAddress: "Vanguard Logistics",
    phoneNumber: "(213) 555-0198",
    stage: "Qualified",
    status: "Hot",
    leadType: "Large Teams / Brokerages",
    outcome: "Subscription Secured",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(150)),
    lastConnectedTime: formatTime(daysFromNow(150)),
  },
  {
    id: "8",
    name: "Kenneth Peterson",
    propertyAddress: "Prime Realty Trust",
    phoneNumber: "(415) 555-0211",
    stage: "New",
    status: "Warm",
    leadType: "Top-10 local producer",
    outcome: "Demo Scheduled",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(2)),
    lastConnectedTime: formatTime(daysFromNow(2)),
  },
  {
    id: "9",
    name: "Morgan Reed",
    propertyAddress: "NextWave Capital",
    phoneNumber: "(212) 555-0222",
    stage: "Attempted",
    status: "Unknown",
    leadType: "Mega-Teams",
    outcome: "No Answer",
    followUpStatus: "None",
    lastConnectedDate: formatDate(daysFromNow(3)),
    lastConnectedTime: formatTime(daysFromNow(3)),
  },
  {
    id: "10",
    name: "Brandon Scott",
    propertyAddress: "Pacific Coast Realty",
    phoneNumber: "(310) 555-0233",
    stage: "In Conversation",
    status: "Hot",
    leadType: "Small Teams",
    outcome: "Trial Interested",
    followUpStatus: "Due Now",
    lastConnectedDate: formatDate(daysFromNow(4)),
    lastConnectedTime: formatTime(daysFromNow(4)),
  },
  {
    id: "11",
    name: "Rachel Dawson",
    propertyAddress: "Dawson & Co.",
    phoneNumber: "(312) 555-0244",
    stage: "Follow-Up",
    status: "Warm",
    leadType: "Micro-Teams",
    outcome: "Follow-Up Set",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(5)),
    lastConnectedTime: formatTime(daysFromNow(5)),
  },
  {
    id: "12",
    name: "Gregory House",
    propertyAddress: "Diagnostics Realty",
    phoneNumber: "(609) 555-0255",
    stage: "Contacted",
    status: "Cold",
    leadType: "Solo agent",
    outcome: "Call Back",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(7)),
    lastConnectedTime: formatTime(daysFromNow(7)),
  },
  {
    id: "13",
    name: "Lisa Cuddy",
    propertyAddress: "Plainsboro Holdings",
    phoneNumber: "(609) 555-0266",
    stage: "Qualified",
    status: "Hot",
    leadType: "Broker of Record, Managing Broker",
    outcome: "Proposal Sent",
    followUpStatus: "Due Now",
    lastConnectedDate: formatDate(daysFromNow(8)),
    lastConnectedTime: formatTime(daysFromNow(8)),
  },
  {
    id: "14",
    name: "James Wilson",
    propertyAddress: "Wilson Oncology Prop",
    phoneNumber: "(609) 555-0277",
    stage: "In Conversation",
    status: "Hot",
    leadType: "Office Manager",
    outcome: "Demo Scheduled",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(10)),
    lastConnectedTime: formatTime(daysFromNow(10)),
  },
  {
    id: "15",
    name: "Allison Cameron",
    propertyAddress: "Cameron Investments",
    phoneNumber: "(312) 555-0288",
    stage: "New",
    status: "Warm",
    leadType: "New Agents",
    outcome: "Connected",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(11)),
    lastConnectedTime: formatTime(daysFromNow(11)),
  },
  {
    id: "16",
    name: "Robert Chase",
    propertyAddress: "Chase Australian Prop",
    phoneNumber: "(415) 555-0299",
    stage: "In Conversation",
    status: "Warm",
    leadType: "Luxury Agents",
    outcome: "Pricing Discussed",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(14)),
    lastConnectedTime: formatTime(daysFromNow(14)),
  },
  {
    id: "17",
    name: "Chris Foreman",
    propertyAddress: "Foreman & Sons Realty",
    phoneNumber: "(212) 555-0301",
    stage: "Follow-Up",
    status: "Hot",
    leadType: "Mid-Size Teams",
    outcome: "Decision Pending",
    followUpStatus: "Due Now",
    lastConnectedDate: formatDate(daysFromNow(15)),
    lastConnectedTime: formatTime(daysFromNow(15)),
  },
  {
    id: "18",
    name: "Remy Hadley",
    propertyAddress: "Thirteen Real Estate",
    phoneNumber: "(702) 555-0312",
    stage: "Qualified",
    status: "Hot",
    leadType: "Top-10 local producer",
    outcome: "Trial Started",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(18)),
    lastConnectedTime: formatTime(daysFromNow(18)),
  },
  {
    id: "19",
    name: "Lawrence Kutner",
    propertyAddress: "Kutner Dynamics",
    phoneNumber: "(206) 555-0323",
    stage: "Attempted",
    status: "Unknown",
    leadType: "Solo agent",
    outcome: "Voicemail",
    followUpStatus: "None",
    lastConnectedDate: formatDate(daysFromNow(21)),
    lastConnectedTime: formatTime(daysFromNow(21)),
  },
  {
    id: "20",
    name: "Amber Volakis",
    propertyAddress: "Cutthroat Living",
    phoneNumber: "(305) 555-0334",
    stage: "Archived",
    status: "Cold",
    leadType: "e-Agent",
    outcome: "Lost to Competitor",
    followUpStatus: "None",
    lastConnectedDate: formatDate(daysFromNow(40)),
    lastConnectedTime: formatTime(daysFromNow(40)),
  },
  {
    id: "21",
    name: "Martha Masters",
    propertyAddress: "Masters Analytics Realty",
    phoneNumber: "(617) 555-0345",
    stage: "New",
    status: "Warm",
    leadType: "New Agents",
    outcome: "Connected",
    followUpStatus: "Due Soon",
    lastConnectedDate: formatDate(daysFromNow(24)),
    lastConnectedTime: formatTime(daysFromNow(24)),
  },
  {
    id: "22",
    name: "Jessica Adams",
    propertyAddress: "Adams Legal & Realty",
    phoneNumber: "(213) 555-0356",
    stage: "Contacted",
    status: "Hot",
    leadType: "Franchise Owners/Broker Owners",
    outcome: "Demo Requested",
    followUpStatus: "Due Now",
    lastConnectedDate: formatDate(daysFromNow(25)),
    lastConnectedTime: formatTime(daysFromNow(25)),
  },
  {
    id: "23",
    name: "Dominika Petrova",
    propertyAddress: "Petrova Global Realty",
    phoneNumber: "(415) 555-0367",
    stage: "Follow-Up",
    status: "Warm",
    leadType: "Small Teams",
    outcome: "Follow-Up Set",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(28)),
    lastConnectedTime: formatTime(daysFromNow(28)),
  },
  {
    id: "24",
    name: "Lucas Douglas",
    propertyAddress: "Douglas Private Investigations",
    phoneNumber: "(212) 555-0378",
    stage: "Qualified",
    status: "Hot",
    leadType: "Large Teams / Brokerages",
    outcome: "Subscription Secured",
    followUpStatus: "Scheduled",
    lastConnectedDate: formatDate(daysFromNow(30)),
    lastConnectedTime: formatTime(daysFromNow(30)),
  },
];

const TABS = [
  { key: "allProspects", label: "All Prospects", icon: Users },
  { key: "archived", label: "Archived", icon: Archive, iconColor: "text-slate-500" },
];

// basePath: portal the links point to; canCall: false hides calling (admin portals don't place calls)
export const CrmHistory = ({ onSelectProspect, prospects, setProspects, basePath = "/internal-sales-representative", canCall = true }) => {
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

  // Hand the prospect over to the live-calling page (same bridge the header
  // uses: sessionStorage + navigate). The call auto-starts there with this info.
  const handleStartCall = (prospect) => {
    try {
      sessionStorage.setItem(
        PENDING_CALL_KEY,
        JSON.stringify({
          leadName: prospect.name || "",
          phoneNumber: prospect.phoneNumber || "",
          leadType: prospect.leadType || "",
          address: prospect.propertyAddress || "",
          playbook: "PitchProx Standard",
        })
      );
    } catch {
      /* sessionStorage unavailable — continue without prefill */
    }
    router.push(`${basePath}/live-calling`);
  };

  const handleStageChange = (prospectId, newStage) => {
    setProspects((prev) =>
      prev.map((item) =>
        item.id === prospectId ? { ...item, stage: newStage } : item
      )
    );
  };

  const handleStatusChange = (prospectId, newStatus) => {
    setProspects((prev) =>
      prev.map((item) =>
        item.id === prospectId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleOutcomeChange = (prospectId, newOutcome) => {
    setProspects((prev) =>
      prev.map((item) =>
        item.id === prospectId ? { ...item, outcome: newOutcome } : item
      )
    );
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

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const clearFilters = () => {
    setSearchQuery("");
    setLeadTypeFilter("");
    setStageFilter("");
    setFollowUpFilter("");
    setTimeFilter("This Year");
    setCurrentPage(1);
  };

  // ── Export prospects to a CSV file ──
  const handleExport = () => {
    const headers = [
      "Name",
      "Company Name",
      "Lead Stage",
      "Status",
      "Lead Type",
      "Outcome",
      "Follow-Up Status",
      "Last Connected Date",
      "Last Connected Time",
    ];
    const rows = prospects.map((p) => [
      p.name,
      p.companyName || p.propertyAddress,
      p.stage,
      p.status,
      p.leadType,
      p.outcome,
      p.followUpStatus,
      p.lastConnectedDate,
      p.lastConnectedTime,
    ]);
    const escapeCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pitchprox-prospects.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ── Imported rows → table rows ──
  const normalizeImported = (item, idx) => ({
    id: `imported-${Date.now()}-${idx}`,
    name: item.name || item.Name || "",
    propertyAddress:
      item.companyName ||
      item.company_name ||
      item.company ||
      item.propertyAddress ||
      item.property_address ||
      item.propertyaddress ||
      "—",
    stage: item.stage || item.Stage || "New",
    status: item.status || item.Status || "Unknown",
    leadType:
      item.leadType || item.lead_type || item.leadtype || "Solo agent",
    outcome: item.outcome || item.Outcome || "No Answer",
    followUpStatus:
      item.followUpStatus ||
      item.follow_up_status ||
      item.followupstatus ||
      "None",
    lastConnectedDate:
      item.lastConnectedDate ||
      item.last_connected_date ||
      item.lastconnecteddate ||
      "—",
    lastConnectedTime:
      item.lastConnectedTime ||
      item.last_connected_time ||
      item.lastconnectedtime ||
      "—",
  });

  // Design only: imported rows are added to the on-screen list, nothing is saved
  const handleImport = async (rows) => {
    const imported = rows.map((row, idx) => normalizeImported(row, idx)).filter((item) => item.name);
    if (imported.length) setProspects((prev) => [...imported, ...prev]);
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
    // Search across name + company name
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const company = (prospect.companyName || prospect.propertyAddress || "").toLowerCase();
      if (
        !prospect.name?.toLowerCase().includes(q) &&
        !company.includes(q)
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

  const startProspectIndex = (currentPage - 1) * pageSize;
  const paginatedProspects = filteredProspects.slice(startProspectIndex, startProspectIndex + pageSize);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-sm w-full p-4 sm:p-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-light-gray pb-4">
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
            className="flex items-center gap-3 xs:gap-4 sm:gap-6 overflow-hidden snap-x snap-mandatory px-4 sm:px-0 pt-2 sm:pt-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`pb-3 text-sm font-semibold relative transition-colors whitespace-nowrap cursor-pointer snap-start shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? "text-primary"
                      : "text-light-black hover:text-medium-black"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${tab.iconColor || ""}`} />
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

        {/* Actions Right Side */}
        <div className="flex items-center gap-3 flex-wrap">
          <Dropdown
            label="This Year"
            icon={<Calendar className="h-4 w-4" />}
            items={timeFilterOptions}
            selected={timeFilter}
            onSelect={(val) => {
              setTimeFilter(val);
              setCurrentPage(1);
            }}
            className="w-[150px]"
          />
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 w-[150px] px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-primary transition-all duration-200 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span className="whitespace-nowrap">Export</span>
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex items-center justify-center gap-1.5 w-[150px] px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-primary transition-all duration-200 cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span className="whitespace-nowrap">Import</span>
          </button>
          <Link
            href={`${basePath}/crm/add`}
            className="flex items-center justify-center gap-1.5 w-[160px] px-4 py-2.5 text-sm font-semibold text-white bg-primary border border-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="whitespace-nowrap">Add New Prospect</span>
          </Link>
        </div>
      </div>

      {/* Filters Row (above the table) */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-3 mb-4 p-3 bg-light-gray/40 border border-light-gray rounded-xl">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-light-black pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or company name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black placeholder-light-black"
          />
        </div>

        <Dropdown
          label="All Lead Types"
          items={leadTypeOptions}
          selected={leadTypeFilter}
          onSelect={(val) => {
            setLeadTypeFilter(val);
            setCurrentPage(1);
          }}
          variant="default"
          className="w-full xl:w-[190px]"
        />
        <Dropdown
          label="All Lead Stages"
          items={stageOptions}
          selected={stageFilter}
          onSelect={(val) => {
            setStageFilter(val);
            setCurrentPage(1);
          }}
          variant="default"
          className="w-full xl:w-[170px]"
        />
        <Dropdown
          label="Follow-Up Status"
          items={followUpStatusOptions}
          selected={followUpFilter}
          onSelect={(val) => {
            setFollowUpFilter(val);
            setCurrentPage(1);
          }}
          variant="default"
          className="w-full xl:w-[170px]"
        />
        <Dropdown
          label="Date Range"
          items={timeFilterOptions}
          selected={timeFilter}
          onSelect={(val) => {
            setTimeFilter(val);
            setCurrentPage(1);
          }}
          variant="default"
          className="w-full xl:w-[150px]"
        />

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-red-500 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            <XCircle className="h-4 w-4" />
            Clear Filters
          </button>
        )}
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
                COMPANY NAME
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
              {canCall && (
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
                  {prospect.companyName || prospect.propertyAddress}
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
                    options={outcomeOptions}
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
                {canCall && (
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
                <td className="p-4 pr-6 w-[100px] text-right" onClick={(e) => e.stopPropagation()}>
                  <ActionMenu
                    label={`Actions for ${prospect.name}`}
                    items={[
                      { label: "View Details", icon: Eye, onClick: () => onSelectProspect?.(prospect) },
                      { label: "Edit Lead", icon: Pencil, onClick: () => router.push(`${basePath}/crm/edit?id=${prospect.id}`) },
                      { divider: true },
                      {
                        label: "Delete Lead",
                        icon: Trash2,
                        danger: true,
                        onClick: () => {
                          setItemToDelete(prospect);
                          setDeleteModalOpen(true);
                        },
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredProspects.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredProspects.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="prospects"
        />
      )}

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

      <ImportProspectsModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        existingProspects={prospects}
        onImport={handleImport}
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
            setProspects((prev) => prev.filter((p) => p.id !== itemToDelete.id));
          }
          setItemToDelete(null);
          setDeleteModalOpen(false);
        }}
      />
    </div>
  );
};

export default CrmHistory;
