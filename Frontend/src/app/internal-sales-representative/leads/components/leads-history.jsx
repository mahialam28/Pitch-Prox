"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Flame,
  ThumbsUp,
  PhoneMissed,
  PhoneCall,
  Pencil,
  Trash2,
  Plus,
  Eye,
} from "lucide-react";
import { RiArrowLeftLongLine, RiArrowRightLongLine } from "react-icons/ri";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PENDING_CALL_KEY } from "@/utils.js/call-constants";
import Dropdown from "@/components/shared/dropdown/dropdown";
import AlertModal from "@/components/modals/alert-modal";
import BadgeSelect from "@/components/shared/dropdown/badge-select";
import ActionMenu from "@/components/shared/dropdown/action-menu";
import Pagination from "@/components/shared/pagination/pagination";

const timeFilterOptions = [
  { value: "This Year", label: "This Year" },
  { value: "This Month", label: "This Month" },
  { value: "This Week", label: "This Week" },
  { value: "Today", label: "Today" },
];

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

export const initialLeadsData = [
  {
    id: "1",
    name: "Ricky Smith",
    companyName: "Apex Solutions Inc.",
    propertyAddress: "Apex Solutions Inc.",
    phoneNumber: "(213) 555-0141",
    stage: "In Conversation",
    status: "Hot",
    leadType: "Solo agent",
    outcome: "Demo Scheduled",
    tags: ["High Potential", "AI Skeptic"],
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "2",
    name: "Kimberly Mastrangelo",
    companyName: "Nexus Dynamics",
    propertyAddress: "Nexus Dynamics",
    phoneNumber: "(213) 555-0127",
    stage: "Attempted",
    status: "Unknown",
    leadType: "Micro-Teams",
    outcome: "No Answer",
    tags: ["Price Sensitive", "Cold Caller"],
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "3",
    name: "Daniel Hamilton",
    companyName: "Starlight Media LLC",
    propertyAddress: "Starlight Media LLC",
    phoneNumber: "(213) 555-0189",
    stage: "Contacted",
    status: "Warm",
    leadType: "Assistant to team",
    outcome: "Demo Requested",
    tags: ["Training Focused", "Warm Referral"],
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "4",
    name: "Rodger Struck",
    companyName: "Pinnacle Group",
    propertyAddress: "Pinnacle Group",
    phoneNumber: "(213) 555-0176",
    stage: "Archived",
    status: "Cold",
    leadType: "Junior agent",
    outcome: "Not Interested",
    tags: ["AI Skeptic", "Needs Approval"],
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "5",
    name: "Jerry Helfer",
    companyName: "Horizon Technologies",
    propertyAddress: "Horizon Technologies",
    phoneNumber: "(213) 555-0153",
    stage: "Follow-Up",
    status: "Hot",
    leadType: "Small Teams",
    outcome: "Follow-Up Set",
    tags: ["Numbers Driven", "High Potential"],
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "6",
    name: "Rhonda Rhodes",
    companyName: "Summit Enterprise",
    propertyAddress: "Summit Enterprise",
    phoneNumber: "(213) 555-0112",
    stage: "New",
    status: "Warm",
    leadType: "Mid-Size Teams",
    outcome: "Voicemail",
    tags: ["Relationship Driven", "Warm Referral"],
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "7",
    name: "Stephanie Sharkey",
    companyName: "Vanguard Logistics",
    propertyAddress: "Vanguard Logistics",
    phoneNumber: "(213) 555-0198",
    stage: "Qualified",
    status: "Hot",
    leadType: "Large Teams / Brokerages",
    outcome: "Subscription Secured",
    tags: ["Competitor User", "Past Referral"],
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "8",
    name: "Kenneth Peterson",
    companyName: "Prime Realty Trust",
    propertyAddress: "Prime Realty Trust",
    phoneNumber: "(415) 555-0211",
    stage: "New",
    status: "Warm",
    leadType: "Top-10 local producer",
    outcome: "Demo Scheduled",
    tags: ["High Potential", "Referral"],
    lastConnectedDate: "May 18, 2025",
    lastConnectedTime: "2:15 PM",
  },
  {
    id: "9",
    name: "Morgan Reed",
    companyName: "NextWave Capital",
    propertyAddress: "NextWave Capital",
    phoneNumber: "(212) 555-0222",
    stage: "Attempted",
    status: "Unknown",
    leadType: "Mega-Teams",
    outcome: "No Answer",
    tags: ["Price Sensitive"],
    lastConnectedDate: "May 18, 2025",
    lastConnectedTime: "11:45 AM",
  },
  {
    id: "10",
    name: "Brandon Scott",
    companyName: "Pacific Coast Realty",
    propertyAddress: "Pacific Coast Realty",
    phoneNumber: "(310) 555-0233",
    stage: "In Conversation",
    status: "Hot",
    leadType: "Small Teams",
    outcome: "Trial Interested",
    tags: ["Training Focused", "Urgent"],
    lastConnectedDate: "May 18, 2025",
    lastConnectedTime: "9:30 AM",
  },
  {
    id: "11",
    name: "Rachel Dawson",
    companyName: "Dawson & Co.",
    propertyAddress: "Dawson & Co.",
    phoneNumber: "(312) 555-0244",
    stage: "Follow-Up",
    status: "Warm",
    leadType: "Micro-Teams",
    outcome: "Follow-Up Set",
    tags: ["Needs Approval"],
    lastConnectedDate: "May 17, 2025",
    lastConnectedTime: "4:10 PM",
  },
  {
    id: "12",
    name: "Gregory House",
    companyName: "Diagnostics Realty",
    propertyAddress: "Diagnostics Realty",
    phoneNumber: "(609) 555-0255",
    stage: "Contacted",
    status: "Cold",
    leadType: "Solo agent",
    outcome: "Call Back",
    tags: ["AI Skeptic"],
    lastConnectedDate: "May 17, 2025",
    lastConnectedTime: "1:20 PM",
  },
  {
    id: "13",
    name: "Lisa Cuddy",
    companyName: "Plainsboro Holdings",
    propertyAddress: "Plainsboro Holdings",
    phoneNumber: "(609) 555-0266",
    stage: "Qualified",
    status: "Hot",
    leadType: "Broker of Record, Managing Broker",
    outcome: "Proposal Sent",
    tags: ["High Potential", "Urgent"],
    lastConnectedDate: "May 16, 2025",
    lastConnectedTime: "3:45 PM",
  },
  {
    id: "14",
    name: "James Wilson",
    companyName: "Wilson Oncology Prop",
    propertyAddress: "Wilson Oncology Prop",
    phoneNumber: "(609) 555-0277",
    stage: "In Conversation",
    status: "Hot",
    leadType: "Office Manager",
    outcome: "Demo Scheduled",
    tags: ["Warm Referral"],
    lastConnectedDate: "May 16, 2025",
    lastConnectedTime: "11:00 AM",
  },
  {
    id: "15",
    name: "Allison Cameron",
    companyName: "Cameron Investments",
    propertyAddress: "Cameron Investments",
    phoneNumber: "(312) 555-0288",
    stage: "New",
    status: "Warm",
    leadType: "New Agents",
    outcome: "Connected",
    tags: ["Training Focused"],
    lastConnectedDate: "May 15, 2025",
    lastConnectedTime: "10:15 AM",
  },
  {
    id: "16",
    name: "Robert Chase",
    companyName: "Chase Australian Prop",
    propertyAddress: "Chase Australian Prop",
    phoneNumber: "(415) 555-0299",
    stage: "In Conversation",
    status: "Warm",
    leadType: "Luxury Agents",
    outcome: "Pricing Discussed",
    tags: ["Numbers Driven"],
    lastConnectedDate: "May 15, 2025",
    lastConnectedTime: "2:30 PM",
  },
  {
    id: "17",
    name: "Chris Foreman",
    companyName: "Foreman & Sons Realty",
    propertyAddress: "Foreman & Sons Realty",
    phoneNumber: "(212) 555-0301",
    stage: "Follow-Up",
    status: "Hot",
    leadType: "Mid-Size Teams",
    outcome: "Decision Pending",
    tags: ["High Potential"],
    lastConnectedDate: "May 14, 2025",
    lastConnectedTime: "4:00 PM",
  },
  {
    id: "18",
    name: "Remy Hadley",
    companyName: "Thirteen Real Estate",
    propertyAddress: "Thirteen Real Estate",
    phoneNumber: "(702) 555-0312",
    stage: "Qualified",
    status: "Hot",
    leadType: "Top-10 local producer",
    outcome: "Trial Started",
    tags: ["Past Referral"],
    lastConnectedDate: "May 14, 2025",
    lastConnectedTime: "1:15 PM",
  },
  {
    id: "19",
    name: "Lawrence Kutner",
    companyName: "Kutner Dynamics",
    propertyAddress: "Kutner Dynamics",
    phoneNumber: "(206) 555-0323",
    stage: "Attempted",
    status: "Unknown",
    leadType: "Solo agent",
    outcome: "Voicemail",
    tags: ["Cold Caller"],
    lastConnectedDate: "May 13, 2025",
    lastConnectedTime: "11:30 AM",
  },
  {
    id: "20",
    name: "Amber Volakis",
    companyName: "Cutthroat Living",
    propertyAddress: "Cutthroat Living",
    phoneNumber: "(305) 555-0334",
    stage: "Archived",
    status: "Cold",
    leadType: "e-Agent",
    outcome: "Lost to Competitor",
    tags: ["Lost to Competitor"],
    lastConnectedDate: "May 13, 2025",
    lastConnectedTime: "9:00 AM",
  },
  {
    id: "21",
    name: "Martha Masters",
    companyName: "Masters Analytics Realty",
    propertyAddress: "Masters Analytics Realty",
    phoneNumber: "(617) 555-0345",
    stage: "New",
    status: "Warm",
    leadType: "New Agents",
    outcome: "Connected",
    tags: ["Training Focused"],
    lastConnectedDate: "May 12, 2025",
    lastConnectedTime: "3:10 PM",
  },
  {
    id: "22",
    name: "Jessica Adams",
    companyName: "Adams Legal & Realty",
    propertyAddress: "Adams Legal & Realty",
    phoneNumber: "(213) 555-0356",
    stage: "Contacted",
    status: "Hot",
    leadType: "Franchise Owners/Broker Owners",
    outcome: "Demo Requested",
    tags: ["High Potential"],
    lastConnectedDate: "May 12, 2025",
    lastConnectedTime: "10:45 AM",
  },
  {
    id: "23",
    name: "Dominika Petrova",
    companyName: "Petrova Global Realty",
    propertyAddress: "Petrova Global Realty",
    phoneNumber: "(415) 555-0367",
    stage: "Follow-Up",
    status: "Warm",
    leadType: "Small Teams",
    outcome: "Follow-Up Set",
    tags: ["Needs Approval"],
    lastConnectedDate: "May 11, 2025",
    lastConnectedTime: "1:50 PM",
  },
  {
    id: "24",
    name: "Lucas Douglas",
    companyName: "Douglas Private Investigations",
    propertyAddress: "Douglas Private Investigations",
    phoneNumber: "(212) 555-0378",
    stage: "Qualified",
    status: "Hot",
    leadType: "Large Teams / Brokerages",
    outcome: "Subscription Secured",
    tags: ["Competitor User"],
    lastConnectedDate: "May 11, 2025",
    lastConnectedTime: "11:20 AM",
  },
];

// Outcome buckets used by the Interested / Not Interested and Not Connected tabs
const INTERESTED_OUTCOMES = [
  "Follow-Up Set",
  "Demo Requested",
  "Demo Scheduled",
  "Trial Interested",
  "Trial Started",
  "Pricing Discussed",
  "Proposal Sent",
  "Decision Pending",
  "Subscription Secured",
  "Connected",
  "Call Back",
];

const NOT_INTERESTED_OUTCOMES = ["Not Interested", "Lost to Competitor"];

const NOT_CONNECTED_OUTCOMES = [
  "No Answer",
  "Voicemail",
  "Wrong Number",
  "Disconnected",
  "Gatekeeper",
];

const TABS = [
  { key: "allLeads", label: "All Leads", icon: Users },
  {
    key: "hotLeads",
    label: "Hot Leads",
    icon: Flame,
    iconColor: "text-orange-500",
  },
  {
    key: "interested",
    label: "Interested / Not Interested",
    icon: ThumbsUp,
    iconColor: "text-emerald-500",
  },
  {
    key: "notConnected",
    label: "Not Connected",
    icon: PhoneMissed,
    iconColor: "text-slate-500",
  },
];

const LeadsHistory = ({ onSelectLead, leads, setLeads }) => {
  const router = useRouter();

  // Hand the lead over to the live-calling page (same bridge the CRM table and
  // app header use: sessionStorage + navigate). The call auto-starts there.
  const handleStartCall = (lead) => {
    try {
      sessionStorage.setItem(
        PENDING_CALL_KEY,
        JSON.stringify({
          leadName: lead.name || "",
          phoneNumber: lead.phoneNumber || "",
          leadType: lead.leadType || "",
          address: lead.companyName || lead.propertyAddress || "",
          playbook: "PitchProx Standard",
        })
      );
    } catch {
      /* sessionStorage unavailable — continue without prefill */
    }
    router.push("/internal-sales-representative/live-calling");
  };

  const [activeTab, setActiveTab] = useState("allLeads");
  const [timeFilter, setTimeFilter] = useState("This Year");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Refs without HTML element types
  const headerRef = useRef(null);
  const bodyWrapperRef = useRef(null);

  // Functions without parameter types
  const handleStageChange = (leadId, newStage) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, stage: newStage } : lead
      )
    );
  };

  const handleStatusChange = (leadId, newStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );
  };

  const handleOutcomeChange = (leadId, newOutcome) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, outcome: newOutcome } : lead
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

  const scrollTabs = useCallback((direction) => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" });
    setTimeout(updateTabArrows, 350);
  }, [updateTabArrows]);

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

  const swiperRef = useRef(null);

  useEffect(() => {
    swiperRef.current?.slideTo(activeTabIndex, 300);
  }, [activeTabIndex]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getFilteredLeads = () => {
    if (activeTab === "hotLeads") {
      return leads.filter((lead) => lead.status === "Hot");
    }
    if (activeTab === "interested") {
      return leads.filter((lead) =>
        [...INTERESTED_OUTCOMES, ...NOT_INTERESTED_OUTCOMES].includes(
          lead.outcome
        )
      );
    }
    if (activeTab === "notConnected") {
      return leads.filter((lead) =>
        NOT_CONNECTED_OUTCOMES.includes(lead.outcome)
      );
    }
    return leads;
  };

  const filteredLeads = getFilteredLeads();
  const startLeadIndex = (currentPage - 1) * pageSize;
  const paginatedLeads = filteredLeads.slice(startLeadIndex, startLeadIndex + pageSize);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  const renderTabButton = (tab, indicatorId) => {
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
            layoutId={indicatorId}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          />
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-sm w-full p-4 sm:p-6">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-light-gray pb-4">
        <div className="relative flex-1 min-w-0 hidden lg:block">
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
          {TABS.map((tab) => renderTabButton(tab, "lead-tab-indicator"))}
        </nav>
        </div>

        {/* Mobile tabs (below lg) — swipeable carousel, same visual design */}
        <div className="relative flex-1 min-w-0 lg:hidden px-4 sm:px-0 pt-2 sm:pt-0">
          <Swiper
            modules={[FreeMode]}
            freeMode
            slidesPerView="auto"
            spaceBetween={12}
            breakpoints={{ 640: { spaceBetween: 16 } }}
            grabCursor
            initialSlide={activeTabIndex}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {TABS.map((tab) => (
              <SwiperSlide key={tab.key} className="!w-auto">
                {renderTabButton(tab, "lead-tab-indicator-mobile")}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="flex items-center gap-3">
          <Dropdown
            label="This Year"
            items={timeFilterOptions}
            selected={timeFilter}
            onSelect={(val) => {
              setTimeFilter(val);
              setCurrentPage(1);
            }}
            variant="default"
            className="w-[160px]"
          />

          <Link
            href="/internal-sales-representative/leads/add"
            className="flex items-center justify-center gap-1.5 w-[160px] px-4 py-2.5 text-sm font-semibold text-white bg-primary border border-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="whitespace-nowrap">Add New Lead</span>
          </Link>
        </div>
      </div>

      {/* Header Table */}
      <div
        ref={headerRef}
        className="w-full overflow-hidden"
        onScroll={handleBodyScroll}
      >          <table className="w-full border-collapse text-left min-w-[1360px] table-fixed">
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
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase text-left w-[120px]">
                  MAKE CALL
                </th>
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
      >          <table className="w-full border-collapse text-left min-w-[1360px] table-fixed">
            <tbody className="divide-y divide-light-gray/60">
              {paginatedLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => onSelectLead?.(lead)}
                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  <td className="p-4 pl-6 text-sm font-bold text-dark-black/90 truncate w-[150px]">
                    {lead.name}
                  </td>
                  <td className="p-4 text-sm font-medium text-medium-black truncate w-[180px]">
                    {lead.companyName || lead.propertyAddress}
                  </td>
                  <td className="p-4 w-[170px]" onClick={(e) => e.stopPropagation()}>
                    <BadgeSelect
                      value={lead.stage}
                      onChange={(val) => handleStageChange(lead.id, val)}
                      options={stageOptions}
                      placeholder="Set Stage"
                    />
                  </td>
                  <td className="p-4 w-[120px]" onClick={(e) => e.stopPropagation()}>
                    <BadgeSelect
                      value={lead.status}
                      onChange={(val) => handleStatusChange(lead.id, val)}
                      options={statusOptions}
                      placeholder="Set Status"
                    />
                  </td>
                  <td className="p-4 text-sm font-medium text-medium-black w-[170px] truncate">
                    {lead.leadType}
                  </td>
                  <td className="p-4 w-[190px]" onClick={(e) => e.stopPropagation()}>
                    <BadgeSelect
                      value={lead.outcome}
                      onChange={(val) => handleOutcomeChange(lead.id, val)}
                      options={outcomeOptions}
                      placeholder="Select Outcome"
                    />
                  </td>
                  <td className="p-4 align-middle w-[140px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-dark-black/90">
                        {lead.lastConnectedDate}
                      </span>
                      <span className="text-[11px] font-semibold text-light-black mt-0.5">
                        {lead.lastConnectedTime}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 w-[120px]" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleStartCall(lead)}
                      className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-primary text-primary rounded-xl hover:bg-primary/5 transition-colors shadow-sm cursor-pointer"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Call</span>
                    </button>
                  </td>
                  <td className="p-4 pr-6 w-[100px]" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end">
                      <ActionMenu
                        label={`Actions for ${lead.name}`}
                        items={[
                          { label: "View Details", icon: Eye, onClick: () => onSelectLead?.(lead) },
                          { label: "Edit Lead", icon: Pencil, onClick: () => router.push(`/internal-sales-representative/leads/edit?id=${lead.id}`) },
                          { divider: true },
                          {
                            label: "Delete Lead",
                            icon: Trash2,
                            danger: true,
                            onClick: () => {
                              setItemToDelete(lead);
                              setDeleteModalOpen(true);
                            },
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredLeads.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="leads"
        />
      )}
      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        type="warning"
        title="Delete Lead"
        message={`Are you sure you want to delete ${itemToDelete?.name || "this lead"}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (itemToDelete) {
            setLeads((prev) => prev.filter((l) => l.id !== itemToDelete.id));
          }
          setItemToDelete(null);
          setDeleteModalOpen(false);
        }}
      />
    </div>
  );
};

export default LeadsHistory;
