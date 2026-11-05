"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Phone, Calendar, XCircle } from "lucide-react";
import { RiArrowLeftLongLine, RiArrowRightLongLine } from "react-icons/ri";
import Link from "next/link";
import Dropdown from "@/components/shared/dropdown/dropdown";
import BadgeSelect from "@/components/shared/dropdown/badge-select";
import Pagination from "@/components/shared/pagination/pagination";
import ContactProfileModal from "./contact-profile-modal";
import {
  dateRangeOptions,
  internalLeadTypeOptions as leadTypeOptions,
  internalOutcomeOptions as outcomeOptions,
} from "@/utils.js/lead-options";

// ── Relative mock dates so filters demo correctly ──
const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

const formatDate = (d) =>
  `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}, ${d.getFullYear()}`;

const formatTime = (d) =>
  d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

const initialCallsData = [
  {
    id: "1",
    date: formatDate(daysFromNow(0)),
    time: formatTime(daysFromNow(0)),
    dateObj: daysFromNow(0),
    name: "Ricky Smith",
    companyName: "Apex Solutions Inc.",
    propertyAddress: "Apex Solutions Inc.",
    leadType: "Solo agent",
    trustGain: 28,
    outcome: "Demo Scheduled",
    aiAdherence: 84,
    duration: "2m 40s",
    tags: ["High Potential", "AI Skeptic"],
    followUpDate: formatDate(daysFromNow(-2)),
    note: "Agent is motivated — mentioned interest in upgrading after the demo.",
  },
  {
    id: "2",
    date: formatDate(daysFromNow(1)),
    time: formatTime(daysFromNow(1)),
    dateObj: daysFromNow(1),
    name: "Kimberly Mastrangelo",
    companyName: "Nexus Dynamics",
    propertyAddress: "Nexus Dynamics",
    leadType: "Micro-Teams",
    trustGain: 28,
    outcome: "Call Back",
    aiAdherence: 84,
    duration: "2m 40s",
    tags: ["Price Sensitive", "Cold Caller"],
    followUpDate: formatDate(daysFromNow(-1)),
    note: "Asked to call back after 6 PM — prefers evening calls.",
  },
  {
    id: "3",
    date: formatDate(daysFromNow(5)),
    time: formatTime(daysFromNow(5)),
    dateObj: daysFromNow(5),
    name: "Daniel Hamilton",
    companyName: "Starlight Media LLC",
    propertyAddress: "Starlight Media LLC",
    leadType: "Assistant to team",
    trustGain: 28,
    outcome: "Demo Requested",
    aiAdherence: 84,
    duration: "2m 40s",
    tags: ["Training Focused", "Warm Referral"],
    followUpDate: formatDate(daysFromNow(3)),
    note: "Requested an in-depth demo for their entire team.",
  },
  {
    id: "4",
    date: formatDate(daysFromNow(20)),
    time: formatTime(daysFromNow(20)),
    dateObj: daysFromNow(20),
    name: "Rodger Struck",
    companyName: "Pinnacle Group",
    propertyAddress: "Pinnacle Group",
    leadType: "Junior agent",
    trustGain: 28,
    outcome: "Follow-Up Set",
    aiAdherence: 84,
    duration: "2m 40s",
    tags: ["AI Skeptic", "Needs Approval"],
    followUpDate: formatDate(daysFromNow(5)),
    note: "Needs managing broker approval before moving forward.",
  },
  {
    id: "5",
    date: formatDate(daysFromNow(45)),
    time: formatTime(daysFromNow(45)),
    dateObj: daysFromNow(45),
    name: "Jerry Helfer",
    companyName: "Horizon Technologies",
    propertyAddress: "Horizon Technologies",
    leadType: "Small Teams",
    trustGain: 28,
    outcome: "Voicemail",
    aiAdherence: 84,
    duration: "2m 40s",
    tags: ["Numbers Driven", "High Potential"],
    followUpDate: formatDate(daysFromNow(2)),
    note: "Left voicemail — follow up on metrics and pricing.",
  },
  {
    id: "6",
    date: formatDate(daysFromNow(90)),
    time: formatTime(daysFromNow(90)),
    dateObj: daysFromNow(90),
    name: "Rhonda Rhodes",
    companyName: "Summit Enterprise",
    propertyAddress: "Summit Enterprise",
    leadType: "Mid-Size Teams",
    trustGain: 28,
    outcome: "Not Interested",
    aiAdherence: 84,
    duration: "2m 40s",
    tags: ["Relationship Driven", "Warm Referral"],
    followUpDate: null,
    note: "Currently using internal tooling, revisit in Q4.",
  },
  {
    id: "7",
    date: formatDate(daysFromNow(150)),
    time: formatTime(daysFromNow(150)),
    dateObj: daysFromNow(150),
    name: "Stephanie Sharkey",
    companyName: "Vanguard Logistics",
    propertyAddress: "Vanguard Logistics",
    leadType: "Large Teams / Brokerages",
    trustGain: 35,
    outcome: "Subscription Secured",
    aiAdherence: 95,
    duration: "4m 15s",
    tags: ["Competitor User", "Past Referral"],
    followUpDate: null,
    note: "Secured enterprise subscription for entire branch.",
  },
  {
    id: "8",
    date: formatDate(daysFromNow(2)),
    time: formatTime(daysFromNow(2)),
    dateObj: daysFromNow(2),
    name: "Kenneth Peterson",
    companyName: "Prime Realty Trust",
    propertyAddress: "Prime Realty Trust",
    leadType: "Top-10 local producer",
    trustGain: 32,
    outcome: "Demo Scheduled",
    aiAdherence: 90,
    duration: "3m 10s",
    tags: ["High Potential"],
    followUpDate: formatDate(daysFromNow(-3)),
    note: "Scheduled in-depth platform overview.",
  },
  {
    id: "9",
    date: formatDate(daysFromNow(3)),
    time: formatTime(daysFromNow(3)),
    dateObj: daysFromNow(3),
    name: "Morgan Reed",
    companyName: "NextWave Capital",
    propertyAddress: "NextWave Capital",
    leadType: "Mega-Teams",
    trustGain: 15,
    outcome: "Voicemail",
    aiAdherence: 70,
    duration: "1m 15s",
    tags: ["Price Sensitive"],
    followUpDate: formatDate(daysFromNow(1)),
    note: "Left voicemail regarding volume discounts.",
  },
  {
    id: "10",
    date: formatDate(daysFromNow(4)),
    time: formatTime(daysFromNow(4)),
    dateObj: daysFromNow(4),
    name: "Brandon Scott",
    companyName: "Pacific Coast Realty",
    propertyAddress: "Pacific Coast Realty",
    leadType: "Small Teams",
    trustGain: 40,
    outcome: "Trial Interested",
    aiAdherence: 92,
    duration: "5m 20s",
    tags: ["Urgent"],
    followUpDate: formatDate(daysFromNow(-2)),
    note: "Requested trial link for whole team.",
  },
  {
    id: "11",
    date: formatDate(daysFromNow(6)),
    time: formatTime(daysFromNow(6)),
    dateObj: daysFromNow(6),
    name: "Rachel Dawson",
    companyName: "Dawson & Co.",
    propertyAddress: "Dawson & Co.",
    leadType: "Micro-Teams",
    trustGain: 25,
    outcome: "Follow-Up Set",
    aiAdherence: 85,
    duration: "3m 00s",
    tags: ["Needs Approval"],
    followUpDate: formatDate(daysFromNow(4)),
    note: "Will check budget with partner on Thursday.",
  },
  {
    id: "12",
    date: formatDate(daysFromNow(8)),
    time: formatTime(daysFromNow(8)),
    dateObj: daysFromNow(8),
    name: "Gregory House",
    companyName: "Diagnostics Realty",
    propertyAddress: "Diagnostics Realty",
    leadType: "Solo agent",
    trustGain: 10,
    outcome: "Call Back",
    aiAdherence: 65,
    duration: "1m 45s",
    tags: ["AI Skeptic"],
    followUpDate: formatDate(daysFromNow(2)),
    note: "Wants a call back during office hours.",
  },
  {
    id: "13",
    date: formatDate(daysFromNow(10)),
    time: formatTime(daysFromNow(10)),
    dateObj: daysFromNow(10),
    name: "Lisa Cuddy",
    companyName: "Plainsboro Holdings",
    propertyAddress: "Plainsboro Holdings",
    leadType: "Broker of Record, Managing Broker",
    trustGain: 45,
    outcome: "Proposal Sent",
    aiAdherence: 96,
    duration: "6m 10s",
    tags: ["High Potential", "Urgent"],
    followUpDate: formatDate(daysFromNow(-1)),
    note: "Reviewed enterprise tier pricing.",
  },
  {
    id: "14",
    date: formatDate(daysFromNow(12)),
    time: formatTime(daysFromNow(12)),
    dateObj: daysFromNow(12),
    name: "James Wilson",
    companyName: "Wilson Oncology Prop",
    propertyAddress: "Wilson Oncology Prop",
    leadType: "Office Manager",
    trustGain: 30,
    outcome: "Demo Scheduled",
    aiAdherence: 88,
    duration: "4m 00s",
    tags: ["Warm Referral"],
    followUpDate: formatDate(daysFromNow(3)),
    note: "Scheduled demo with the managing broker.",
  },
  {
    id: "15",
    date: formatDate(daysFromNow(14)),
    time: formatTime(daysFromNow(14)),
    dateObj: daysFromNow(14),
    name: "Allison Cameron",
    companyName: "Cameron Investments",
    propertyAddress: "Cameron Investments",
    leadType: "New Agents",
    trustGain: 22,
    outcome: "Demo Requested",
    aiAdherence: 82,
    duration: "2m 50s",
    tags: ["Training Focused"],
    followUpDate: formatDate(daysFromNow(5)),
    note: "Asked for simulator onboarding demo.",
  },
  {
    id: "16",
    date: formatDate(daysFromNow(16)),
    time: formatTime(daysFromNow(16)),
    dateObj: daysFromNow(16),
    name: "Robert Chase",
    companyName: "Chase Australian Prop",
    propertyAddress: "Chase Australian Prop",
    leadType: "Luxury Agents",
    trustGain: 38,
    outcome: "Pricing Discussed",
    aiAdherence: 91,
    duration: "4m 45s",
    tags: ["Numbers Driven"],
    followUpDate: formatDate(daysFromNow(2)),
    note: "Discussed custom credits package.",
  },
  {
    id: "17",
    date: formatDate(daysFromNow(18)),
    time: formatTime(daysFromNow(18)),
    dateObj: daysFromNow(18),
    name: "Chris Foreman",
    companyName: "Foreman & Sons Realty",
    propertyAddress: "Foreman & Sons Realty",
    leadType: "Mid-Size Teams",
    trustGain: 33,
    outcome: "Decision Pending",
    aiAdherence: 89,
    duration: "3m 30s",
    tags: ["High Potential"],
    followUpDate: formatDate(daysFromNow(-2)),
    note: "Final contract review in progress.",
  },
  {
    id: "18",
    date: formatDate(daysFromNow(22)),
    time: formatTime(daysFromNow(22)),
    dateObj: daysFromNow(22),
    name: "Remy Hadley",
    companyName: "Thirteen Real Estate",
    propertyAddress: "Thirteen Real Estate",
    leadType: "Top-10 local producer",
    trustGain: 42,
    outcome: "Trial Started",
    aiAdherence: 94,
    duration: "5m 05s",
    tags: ["Past Referral"],
    followUpDate: formatDate(daysFromNow(6)),
    note: "Activated 14-day trial for her agency.",
  },
];

const TABS = [
  { key: "callHistory", label: "Call History", icon: Phone },
  { key: "followUpQueue", label: "Follow up Queue", icon: Calendar },
];

const CallHistory = () => {
  const [calls, setCalls] = useState(initialCallsData);
  const [activeTab, setActiveTab] = useState("callHistory");
  const [selectedCall, setSelectedCall] = useState(null);

  // Filter States
  const [dateRange, setDateRange] = useState("Last 6 Months");
  const [leadFilter, setLeadFilter] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const headerRef = useRef(null);
  const bodyWrapperRef = useRef(null);
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

  const handleOutcomeChange = (callId, newOutcome) => {
    setCalls((prev) =>
      prev.map((call) =>
        call.id === callId ? { ...call, outcome: newOutcome } : call
      )
    );
  };

  const handleBodyScroll = useCallback(() => {
    if (headerRef.current && bodyWrapperRef.current) {
      headerRef.current.scrollLeft = bodyWrapperRef.current.scrollLeft;
    }
  }, []);

  // ── Date range filtering ──
  const isDateInRange = (dateObj, range) => {
    if (!dateObj) return true;
    const now = new Date();
    let start;
    switch (range) {
      case "Today":
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return dateObj >= start;
      case "Yesterday": {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(todayStart.getDate() - 1);
        return dateObj >= yesterdayStart && dateObj < todayStart;
      }
      case "This Week": {
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        return dateObj >= start;
      }
      case "Last 7 Days":
        return dateObj >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "This Month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        return dateObj >= start;
      case "Last 30 Days":
        return dateObj >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "Last 3 Months":
        return dateObj >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case "Last 6 Months":
        return dateObj >= new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      case "Year to Date":
        start = new Date(now.getFullYear(), 0, 1);
        return dateObj >= start;
      case "Custom Date Range": {
        const from = customFrom ? new Date(customFrom) : null;
        const to = customTo ? new Date(customTo) : null;
        if (from && dateObj < from) return false;
        if (to) {
          const toEnd = new Date(to);
          toEnd.setHours(23, 59, 59, 999);
          if (dateObj > toEnd) return false;
        }
        return true;
      }
      default:
        return true;
    }
  };

  const hasActiveFilters =
    dateRange !== "Last 6 Months" ||
    leadFilter !== "" ||
    outcomeFilter !== "" ||
    customFrom !== "" ||
    customTo !== "";

  const clearFilters = () => {
    setDateRange("Last 6 Months");
    setLeadFilter("");
    setOutcomeFilter("");
    setCustomFrom("");
    setCustomTo("");
    setCurrentPage(1);
  };

  const filteredCalls = calls.filter((call) => {
    if (!isDateInRange(call.dateObj, dateRange)) return false;
    if (leadFilter && call.leadType !== leadFilter) return false;
    if (outcomeFilter && call.outcome !== outcomeFilter) return false;
    return true;
  });

  // Follow-up queue: calls with a follow-up due, sorted by due date, honoring active filters
  const followUpCalls = calls
    .filter(
      (call) =>
        call.followUpDate &&
        isDateInRange(call.dateObj, dateRange) &&
        (!leadFilter || call.leadType === leadFilter) &&
        (!outcomeFilter || call.outcome === outcomeFilter)
    )
    .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const visibleCalls = activeTab === "followUpQueue" ? followUpCalls : filteredCalls;
  const startCallIndex = (currentPage - 1) * pageSize;
  const paginatedCalls = visibleCalls.slice(startCallIndex, startCallIndex + pageSize);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-sm w-full p-4 sm:p-6">
      {/* --- Top Navigation & Filters Bar --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-light-gray pb-4">
        {/* Left: Navigation Tabs */}
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
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="call-tab-indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
        </div>

        {/* Right: Dropdown Filters */}
        <div className="flex items-center flex-wrap gap-3">
          <Dropdown
            label="Last 6 Months"
            items={dateRangeOptions}
            selected={dateRange}
            onSelect={(val) => {
              setDateRange(val);
              setCurrentPage(1);
            }}
            variant="default"
            className="w-[170px]"
          />

          <Dropdown
            label="All Lead Types"
            items={leadTypeOptions}
            selected={leadFilter}
            onSelect={(val) => {
              setLeadFilter(val);
              setCurrentPage(1);
            }}
            variant="default"
            className="w-[190px]"
          />

          <Dropdown
            label="All Outcomes"
            items={outcomeOptions}
            selected={outcomeFilter}
            onSelect={(val) => {
              setOutcomeFilter(val);
              setCurrentPage(1);
            }}
            variant="default"
            className="w-[180px]"
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold text-red-500 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
            >
              <XCircle className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range inputs */}
      {dateRange === "Custom Date Range" && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 p-3 bg-light-gray/40 border border-light-gray rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-medium-black whitespace-nowrap">
              From
            </span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-medium-black whitespace-nowrap">
              To
            </span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black"
            />
          </div>
          <span className="text-[11px] font-medium text-light-black">
            Filter calls between these dates.
          </span>
        </div>
      )}

      {/* --- Scrollable Header Table --- */}
      <div
        ref={headerRef}
        className="w-full overflow-hidden"
        onScroll={handleBodyScroll}
      >          <table className="w-full border-collapse text-left min-w-[1240px] table-fixed">
            <thead>
              <tr className="border-b border-light-gray">
                <th className="p-4 pl-6 text-[11px] font-bold text-light-black tracking-wider uppercase w-[130px]">
                  DATE &TIME
                </th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[160px]">
                  NAME
                </th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[180px]">
                  COMPANY NAME
                </th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[170px]">
                  LEAD TYPE
                </th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[100px]">
                  TRUST GAIN
                </th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[160px]">
                  OUTCOME
                </th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase text-center w-[120px]">
                  AI ADHERENCE
                </th>
                <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase text-center w-[100px]">
                  DURATION
                </th>
                <th className="p-4 pr-6 text-[11px] font-bold text-light-black tracking-wider uppercase text-right w-[140px]">
                  ACTIONS
                </th>
              </tr>
            </thead>
          </table>
      </div>

      {/* --- Scrollable Body Table --- */}
      <div
        ref={bodyWrapperRef}
        className="w-full overflow-x-auto"
        onScroll={handleBodyScroll}
      >          <table className="w-full border-collapse text-left min-w-[1240px] table-fixed">
            <tbody className="divide-y divide-light-gray/60">
              {paginatedCalls.map((call) => (
                <tr
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className="hover:bg-primary/5 transition-colors group cursor-pointer"
                >
                  {/* Date & Time */}
                  <td className="p-4 pl-6 align-middle w-[130px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-dark-black/90">
                        {call.date}
                      </span>
                      <span className="text-[11px] font-semibold text-light-black mt-0.5">
                        {call.time}
                      </span>
                      {activeTab === "followUpQueue" && call.followUpDate && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5 w-fit">
                          <Calendar className="h-3 w-3" />
                          Due {call.followUpDate}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Name (clickable) */}
                  <td className="p-4 w-[160px]">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCall(call);
                      }}
                      className="text-sm font-bold text-primary hover:underline cursor-pointer"
                    >
                      {call.name}
                    </span>
                  </td>

                  {/* Company Name */}
                  <td className="p-4 text-sm font-medium text-medium-black truncate w-[180px]">
                    {call.companyName || call.propertyAddress}
                  </td>

                  {/* Lead Type */}
                  <td className="p-4 text-sm font-medium text-medium-black w-[170px] truncate">
                    {call.leadType}
                  </td>

                  {/* Trust Gain */}
                  <td className="p-4 text-sm font-bold text-emerald-600 w-[100px]">
                    +{call.trustGain}
                  </td>

                  {/* Outcome Badge Dropdown */}
                  <td className="p-4 w-[160px]" onClick={(e) => e.stopPropagation()}>
                    <BadgeSelect
                      value={call.outcome}
                      onChange={(val) => handleOutcomeChange(call.id, val)}
                      options={outcomeOptions}
                      placeholder="Select Outcome"
                    />
                  </td>

                  {/* AI Adherence Level */}
                  <td
                    className={`p-4 text-sm font-bold text-center w-[120px] ${
                      call.aiAdherence === 0 ? "text-red" : "text-emerald-600"
                    }`}
                  >
                    {call.aiAdherence}%
                  </td>

                  {/* Duration */}
                  <td className="p-4 text-sm font-medium text-medium-black text-center w-[100px]">
                    {call.duration}
                  </td>

                  {/* Action — View Report */}
                  <td className="p-4 pr-6 text-right w-[140px]" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href="/internal-sales-representative/calls/report"
                      className="inline-block px-4 py-2 text-xs font-semibold whitespace-nowrap border border-primary text-primary rounded-xl hover:bg-primary/5 transition-colors shadow-sm cursor-pointer"
                    >
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      {/* Pagination */}
      {visibleCalls.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={visibleCalls.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="calls"
        />
      )}

      {/* Empty state */}
      {visibleCalls.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-sm font-semibold text-medium-black">
            No calls found
          </span>
          <span className="text-xs text-light-black mt-1">
            Try adjusting your date range, lead type, or outcome filters.
          </span>
        </div>
      )}

      {/* Contact Profile Modal */}
      <ContactProfileModal
        isOpen={!!selectedCall}
        call={selectedCall}
        onClose={() => setSelectedCall(null)}
      />
    </div>
  );
};

export default CallHistory;
