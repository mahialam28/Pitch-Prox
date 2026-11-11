"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Phone, Calendar, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { RiArrowLeftLongLine, RiArrowRightLongLine } from "react-icons/ri";
import Link from "next/link";
import Dropdown from "@/components/shared/dropdown/dropdown";
import BadgeSelect from "@/components/shared/dropdown/badge-select";
import ContactProfileModal from "./contact-profile-modal";
import { apiRequest } from "@/lib/client-api";
import {
  dateRangeOptions,
  leadTypeOptions,
  outcomeOptions,
} from "@/utils.js/lead-options";

const formatDate = (d) =>
  `${d.toLocaleString("en-US", { month: "short" })} ${d.getDate()}, ${d.getFullYear()}`;

const formatTime = (d) =>
  d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

const formatDuration = (seconds) => {
  const total = Math.max(0, Number(seconds) || 0);
  return total >= 60 ? `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, "0")}s` : `${total}s`;
};

// A saved call (GET /api/v1/calls) → a row of this table
const FOLLOW_UP_DISPOSITIONS = ["Follow-Up Required", "Information Requested"];
const rowOf = (call) => {
  const startedAt = new Date(call.startedAt);
  const gain = call.summary?.trust_gain?.value;
  return {
    id: call.id,
    mode: call.mode,
    date: formatDate(startedAt),
    time: formatTime(startedAt),
    dateObj: startedAt,
    name: call.contactName || "Unknown",
    propertyAddress: call.mode === "practice" ? "Practice call" : call.phoneNumber || "—",
    phoneNumber: call.phoneNumber,
    contactKind: call.contactKind,
    contactId: call.contactId,
    leadType: call.leadType || "—",
    trustGain: gain === null || gain === undefined ? null : Math.round(gain),
    outcome: call.disposition || "",
    aiAdherence: call.summary?.adherence_pct ?? null,
    duration: formatDuration(call.durationSeconds),
    followUp: FOLLOW_UP_DISPOSITIONS.includes(call.disposition),
    note: call.summary?.narrative ?? call.summary?.outcome_label ?? "",
  };
};

const TABS = [
  { key: "callHistory", label: "Call History", icon: Phone },
  { key: "followUpQueue", label: "Follow up Queue", icon: Calendar },
];

const PAGE_SIZE = 6;

const CallHistory = () => {
  const [calls, setCalls] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    apiRequest("/api/v1/calls?limit=200")
      .then((result) => {
        if (cancelled) return;
        setCalls(result.results.map(rowOf));
        setLoadState("ready");
      })
      .catch(() => !cancelled && setLoadState("error"));
    return () => {
      cancelled = true;
    };
  }, []);
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

  // Page resets to 1 when filters or tabs change (the page is remembered per filter combination)
  const filterKey = [activeTab, dateRange, leadFilter, outcomeFilter, customFrom, customTo].join("|");
  const [pageState, setPageState] = useState({ filterKey, page: 1 });
  const currentPage = pageState.filterKey === filterKey ? pageState.page : 1;
  const setCurrentPage = (next) => setPageState({ filterKey, page: typeof next === "function" ? next(currentPage) : next });

  // Tab scroll state
  const [tabCanScrollLeft, setTabCanScrollLeft] = useState(false);
  const [tabCanScrollRight, setTabCanScrollRight] = useState(false);

  const updateTabArrows = useCallback(() => {
    const el = tabScrollRef.current;
    if (!el) return;
    setTabCanScrollLeft(el.scrollLeft > 4);
    setTabCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollTabs = (dir) => {
    const el = tabScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
    setTimeout(updateTabArrows, 250);
  };

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

  // The outcome is saved on the call (and drives the follow-up queue)
  const handleOutcomeChange = (callId, newOutcome) => {
    setCalls((prev) => prev.map((call) => (call.id === callId ? { ...call, outcome: newOutcome, followUp: FOLLOW_UP_DISPOSITIONS.includes(newOutcome) } : call)));
    apiRequest(`/api/v1/calls/${encodeURIComponent(callId)}`, { method: "PATCH", body: { disposition: newOutcome || null } }).catch(() => {});
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
        call.followUp &&
        isDateInRange(call.dateObj, dateRange) &&
        (!leadFilter || call.leadType === leadFilter) &&
        (!outcomeFilter || call.outcome === outcomeFilter)
    )
    .sort((a, b) => b.dateObj - a.dateObj);

  const visibleCalls = activeTab === "followUpQueue" ? followUpCalls : filteredCalls;

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(visibleCalls.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCalls = visibleCalls.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 pb-4 text-sm font-semibold transition-colors shrink-0 cursor-pointer ${
                    isActive ? "text-primary" : "text-medium-black hover:text-dark-black"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-light-black"}`} />
                  <span>{tab.label}</span>
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="activeCallTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Date Range Dropdown */}
        <div className="flex items-center gap-3 self-end lg:self-auto shrink-0">
          <Dropdown
            items={dateRangeOptions}
            selected={dateRange}
            onSelect={(val) => setDateRange(val)}
            variant="small"
            className="w-[160px]"
          />
        </div>
      </div>

      {/* --- Custom Date Range Inputs (when Custom Date Range is selected) --- */}
      {dateRange === "Custom Date Range" && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-light-gray/40 rounded-xl border border-light-gray">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-medium-black">From:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-light-gray rounded-lg text-dark-black focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-medium-black">To:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-light-gray rounded-lg text-dark-black focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* --- Dropdown Filters Bar --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Lead Type Filter */}
          <div className="w-[190px]">
            <Dropdown
              label="Lead Type"
              items={leadTypeOptions}
              selected={leadFilter}
              onSelect={(val) => setLeadFilter(val === leadFilter ? "" : val)}
              variant="small"
              className="w-full"
            />
          </div>

          {/* Outcome Filter */}
          <div className="w-[190px]">
            <Dropdown
              label="Outcome"
              items={outcomeOptions.map((o) => ({ value: o.value, label: o.label }))}
              selected={outcomeFilter}
              onSelect={(val) => setOutcomeFilter(val === outcomeFilter ? "" : val)}
              variant="small"
              className="w-full"
            />
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black hover:text-red hover:bg-red/5 rounded-xl border border-light-gray transition-colors cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

      {/* --- Scrollable Header Table (scrolls in sync with body) --- */}
      <div
        ref={headerRef}
        className="w-full overflow-hidden"
        onScroll={handleBodyScroll}
      >
        <table className="w-full border-collapse text-left min-w-[1190px] table-fixed">
          <thead>
            <tr className="border-b border-light-gray">
              <th className="p-4 pl-6 text-[11px] font-bold text-light-black tracking-wider uppercase w-[130px]">
                DATE & TIME
              </th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[160px]">
                NAME
              </th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[160px]">
                PROPERTY ADDRESS
              </th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[150px]">
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
      >
        <table className="w-full border-collapse text-left min-w-[1190px] table-fixed">
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
                    <span className="text-sm font-bold text-dark-black/90" suppressHydrationWarning>
                      {call.date}
                    </span>
                    <span className="text-[11px] font-semibold text-light-black mt-0.5" suppressHydrationWarning>
                      {call.time}
                    </span>
                    {activeTab === "followUpQueue" && call.followUp && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-md px-1.5 py-0.5 w-fit">
                        <Calendar className="h-3 w-3" />
                        {call.outcome}
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

                {/* Property Address */}
                <td className="p-4 text-sm font-medium text-medium-black truncate w-[160px]">
                  {call.propertyAddress}
                </td>

                {/* Lead Type */}
                <td className="p-4 text-sm font-medium text-medium-black w-[150px] truncate">
                  {call.leadType}
                </td>

                {/* Trust Gain */}
                <td className={`p-4 text-sm font-bold w-[100px] ${call.trustGain === null ? "text-light-black" : call.trustGain < 0 ? "text-red" : "text-emerald-600"}`}>
                  {call.trustGain === null ? "—" : `${call.trustGain > 0 ? "+" : ""}${call.trustGain}`}
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
                    call.aiAdherence === null ? "text-light-black" : call.aiAdherence === 0 ? "text-red" : "text-emerald-600"
                  }`}
                >
                  {call.aiAdherence === null ? "—" : `${call.aiAdherence}%`}
                </td>

                {/* Duration */}
                <td className="p-4 text-sm font-medium text-medium-black text-center w-[100px]">
                  {call.duration}
                </td>

                {/* Action — View Report */}
                <td className="p-4 pr-6 text-right w-[140px]" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/user/calls/report?id=${encodeURIComponent(call.id)}`}
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

      {/* Empty state */}
      {visibleCalls.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="text-sm font-semibold text-medium-black">
            {loadState === "loading" ? "Loading calls…" : loadState === "error" ? "Calls couldn't be loaded." : calls.length === 0 ? "No calls yet" : "No calls found"}
          </span>
          <span className="text-xs text-light-black mt-1">
            {loadState !== "ready" ? "" : calls.length === 0 ? "Calls you make (and practice calls) appear here with their reports." : "Try adjusting your date range, lead type, or outcome filters."}
          </span>
        </div>
      )}

      {/* ── Table Footer & Pagination ── */}
      {visibleCalls.length > 0 && (
        <div className="p-4 sm:p-5 border-t border-light-gray flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-light-black bg-white rounded-b-2xl mt-4">
          <div>
            <span>
              Showing{" "}
              <span className="font-semibold text-dark-black">
                {(safePage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-dark-black">
                {Math.min(safePage * PAGE_SIZE, visibleCalls.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-dark-black">
                {visibleCalls.length}
              </span>{" "}
              calls
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
