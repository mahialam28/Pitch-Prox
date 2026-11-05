"use client";

import { usePortal } from "@/components/shared/use-portal";
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
  ChevronLeft,
  ChevronRight,
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

export const initialLeadsData = [
  {
    id: "1",
    name: "Ricky Smith",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0141",
    stage: "In Conversation",
    status: "Hot",
    leadType: "Expired Listings",
    outcome: "Appointment Set",
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
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
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
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
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "4",
    name: "Rodger Struck",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0176",
    stage: "Archived",
    status: "Cold",
    leadType: "Pre-Expired Listings",
    outcome: "Not Interested",
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "5",
    name: "Jerry Helfer",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0153",
    stage: "Follow-Up",
    status: "Hot",
    leadType: "Pre-Expired Listings",
    outcome: "Follow-Up Required",
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "6",
    name: "Rhonda Rhodes",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0112",
    stage: "New",
    status: "Warm",
    leadType: "Absentee Owners",
    outcome: "Voicemail",
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
  },
  {
    id: "7",
    name: "Stephanie Sharkey",
    propertyAddress: "1851 Lynch Street, New Be...",
    phoneNumber: "(213) 555-0198",
    stage: "Qualified",
    status: "Hot",
    leadType: "Expired Listings",
    outcome: "Appointment Set",
    lastConnectedDate: "May 19, 2025",
    lastConnectedTime: "10:32 AM",
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
    lastConnectedDate: "May 18, 2025",
    lastConnectedTime: "02:15 PM",
  },
  {
    id: "9",
    name: "Angela Davis",
    propertyAddress: "220 Riverside Dr, New...",
    phoneNumber: "(212) 555-0182",
    stage: "Contacted",
    status: "Warm",
    leadType: "Divorce",
    outcome: "Follow-Up Required",
    lastConnectedDate: "May 18, 2025",
    lastConnectedTime: "11:20 AM",
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
    lastConnectedDate: "May 17, 2025",
    lastConnectedTime: "04:45 PM",
  },
  {
    id: "11",
    name: "Chloe Bennett",
    propertyAddress: "35 Bedford St, New York...",
    phoneNumber: "(212) 555-0163",
    stage: "Follow-Up",
    status: "Warm",
    leadType: "Vacant Properties",
    outcome: "Information Requested",
    lastConnectedDate: "May 17, 2025",
    lastConnectedTime: "01:10 PM",
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
    lastConnectedDate: "May 16, 2025",
    lastConnectedTime: "09:50 AM",
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
    lastConnectedDate: "May 16, 2025",
    lastConnectedTime: "03:30 PM",
  },
  {
    id: "14",
    name: "Lucas Scott",
    propertyAddress: "125 Prince St, New York...",
    phoneNumber: "(212) 555-0139",
    stage: "Archived",
    status: "Cold",
    leadType: "Absentee Owners",
    outcome: "Not a Fit",
    lastConnectedDate: "May 15, 2025",
    lastConnectedTime: "10:15 AM",
  },
];

// Outcome buckets used by the Interested / Not Interested and Not Connected tabs
const INTERESTED_OUTCOMES = [
  "Appointment Set",
  "Follow-Up Required",
  "Information Requested",
];

const NOT_INTERESTED_OUTCOMES = ["Not Interested", "Not a Fit"];

const NOT_CONNECTED_OUTCOMES = [
  "No Answer",
  "Voicemail",
  "Wrong Number",
  "Do Not Contact",
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

const PAGE_SIZE = 6;

const LeadsHistory = ({ onSelectLead, leads, onUpdateLead, onDeleteLead }) => {
  const portal = usePortal();
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
          address: lead.propertyAddress || "",
          playbook: "PitchProx Standard",
        })
      );
    } catch {
      /* sessionStorage unavailable — continue without prefill */
    }
    router.push(`${portal.base}/live-calling`);
  };

  const [activeTab, setActiveTab] = useState("allLeads");
  const [timeFilter, setTimeFilter] = useState("This Month");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Dropdown filter state (above table)
  const [stageFilter, setStageFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [leadFilter, setLeadFilter] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("");

  // Refs without HTML element types
  const headerRef = useRef(null);
  const bodyWrapperRef = useRef(null);
  const tabScrollRef = useRef(null);
  const swiperRef = useRef(null);

  // The page number belongs to the current filters, so changing a filter or tab starts back at page 1
  const filterKey = [activeTab, timeFilter, stageFilter, statusFilter, leadFilter, outcomeFilter].join("|");
  const [pageState, setPageState] = useState({ filterKey, page: 1 });
  const currentPage = pageState.filterKey === filterKey ? pageState.page : 1;
  const setCurrentPage = (next) => setPageState({ filterKey, page: typeof next === "function" ? next(currentPage) : next });

  // Functions without parameter types
  const handleStageChange = (leadId, newStage) => onUpdateLead?.(leadId, { stage: newStage });
  const handleStatusChange = (leadId, newStatus) => onUpdateLead?.(leadId, { status: newStatus });
  const handleOutcomeChange = (leadId, newOutcome) => onUpdateLead?.(leadId, { outcome: newOutcome });

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

  useEffect(() => {
    if (swiperRef.current && activeTabIndex >= 0) {
      swiperRef.current.slideTo(activeTabIndex);
    }
  }, [activeTabIndex]);

  const handleBodyScroll = useCallback(() => {
    if (headerRef.current && bodyWrapperRef.current) {
      headerRef.current.scrollLeft = bodyWrapperRef.current.scrollLeft;
    }
  }, []);

  // Time filter logic — based on when the lead was last updated
  const isLeadInTimeRange = (lead, filter) => {
    const date = new Date(lead?.updatedAt);
    if (Number.isNaN(date.getTime())) return true;
    const now = new Date();
    const start = new Date(now.getFullYear(), filter === "This Year" ? 0 : now.getMonth(), 1);
    if (filter === "This Week") start.setMonth(now.getMonth(), now.getDate() - now.getDay());
    if (filter === "Today") start.setMonth(now.getMonth(), now.getDate());
    return date >= start;
  };

  const filteredLeads = leads.filter((lead) => {
    // 1. Top bar time filter
    if (!isLeadInTimeRange(lead, timeFilter)) return false;

    // 2. Active Tab filter
    if (activeTab === "hotLeads" && lead.status !== "Hot") return false;
    if (activeTab === "notConnected" && !NOT_CONNECTED_OUTCOMES.includes(lead.outcome)) return false;
    if (activeTab === "interested" && !INTERESTED_OUTCOMES.includes(lead.outcome)) return false;

    // 3. Dropdown filters
    if (stageFilter && lead.stage !== stageFilter) return false;
    if (statusFilter && lead.status !== statusFilter) return false;
    if (leadFilter && lead.leadType !== leadFilter) return false;
    if (outcomeFilter && lead.outcome !== outcomeFilter) return false;

    return true;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLeads = filteredLeads.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const renderTabButton = (tab, layoutId) => {
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
            layoutId={layoutId}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
          />
        )}
      </button>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-sm w-full p-4 sm:p-6">
      {/* Top Bar with Navigation Tabs and Time Dropdown */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-light-gray">
        {/* Desktop Tabs (>1024px) with Scroll Arrows */}
        <div className="hidden lg:block relative flex-1 min-w-0">
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
            {TABS.map((tab) => renderTabButton(tab, "lead-tab-indicator-desktop"))}
          </nav>
        </div>

        {/* Mobile Tabs Slider (<1024px) */}
        <div className="block lg:hidden w-full overflow-hidden">
          <Swiper
            modules={[FreeMode]}
            freeMode={true}
            slidesPerView="auto"
            spaceBetween={20}
            className="w-full !overflow-visible"
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
            label="This Month"
            items={timeFilterOptions}
            selected={timeFilter}
            onSelect={setTimeFilter}
            variant="default"
            className="w-[160px]"
          />

          <Link
            href={`${portal.base}/leads/add`}
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
      >
        <table className="w-full border-collapse text-left min-w-[1320px] table-fixed">
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
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[130px]">
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
      >
        <table className="w-full border-collapse text-left min-w-[1320px] table-fixed">
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
                  {lead.propertyAddress}
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
                <td className="p-4 text-sm font-medium text-medium-black w-[130px]">
                  {lead.leadType}
                </td>
                <td className="p-4 w-[190px]" onClick={(e) => e.stopPropagation()}>
                  <BadgeSelect
                    value={lead.outcome}
                    onChange={(val) => handleOutcomeChange(lead.id, val)}
                    options={portal.outcomes}
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
                        { label: "Edit Lead", icon: Pencil, onClick: () => router.push(`${portal.base}/leads/edit?id=${lead.id}`) },
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

      {/* Empty state */}
      {filteredLeads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-sm font-semibold text-medium-black">
            No leads found
          </span>
          <span className="text-xs text-light-black mt-1">
            Try adjusting your search or filters.
          </span>
        </div>
      )}

      {/* ── Table Footer & Pagination ── */}
      {filteredLeads.length > 0 && (
        <div className="p-4 sm:p-5 border-t border-light-gray flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-light-black bg-white rounded-b-2xl mt-4">
          <div>
            <span>
              Showing{" "}
              <span className="font-semibold text-dark-black">
                {(safePage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-dark-black">
                {Math.min(safePage * PAGE_SIZE, filteredLeads.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-dark-black">
                {filteredLeads.length}
              </span>{" "}
              leads
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
            onDeleteLead?.(itemToDelete);
          }
          setItemToDelete(null);
          setDeleteModalOpen(false);
        }}
      />
    </div>
  );
};

export default LeadsHistory;
