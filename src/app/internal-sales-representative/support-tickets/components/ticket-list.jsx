"use client";

import { TICKET_CATEGORIES } from "@/utils.js/support";
import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import DatePicker from "@/components/modals/date-picker";

const tabsList = [
  { id: "all", label: "All Tickets" },
  { id: "my-tickets", label: "My Tickets" },
  { id: "waiting", label: "Waiting on Customer" },
  { id: "resolved", label: "Resolved" },
  { id: "closed", label: "Closed" },
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  ...TICKET_CATEGORIES.map((option) => ({ value: option.label, label: option.label })),
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "High", label: "High" },
  { value: "Medium", label: "Medium" },
  { value: "Low", label: "Low" },
  { value: "Urgent", label: "Urgent" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Open", label: "Open" },
  { value: "In Progress", label: "In Progress" },
  { value: "Wait for Client", label: "Wait for Client" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
];



const pageSizeOptions = [
  { value: 10, label: "10 / page" },
  { value: 20, label: "20 / page" },
  { value: 50, label: "50 / page" },
];

// currentAgentName: the signed-in person (My Tickets); agentNames: for the agent filter;
// counts: { mine, waiting } shown on the tabs
export const TicketList = ({ tickets = [], onSelectTicket, currentAgentName, agentNames = [], counts = {} }) => {
  const agentOptions = [{ value: "all", label: "All Agents" }, ...agentNames.map((name) => ({ value: name, label: name }))];
  const tabs = tabsList.map((tab) => ({ ...tab, count: tab.id === "my-tickets" ? counts.mine : tab.id === "waiting" ? counts.waiting : undefined }));
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Active Dropdown state tracking
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const swiperRef = useRef(null);

  const activeTabIndex = tabsList.findIndex((t) => t.id === activeTab);

  // Sync Swiper position on active tab change
  useEffect(() => {
    swiperRef.current?.slideTo(activeTabIndex >= 0 ? activeTabIndex : 0, 300);
  }, [activeTabIndex]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter logic
  const filteredTickets = tickets.filter((ticket) => {
    // Tab filter
    if (activeTab === "my-tickets" && ticket.assignedTo?.name !== currentAgentName) {
      return false;
    }
    if (activeTab === "waiting" && ticket.status !== "Wait for Client") {
      return false;
    }
    if (activeTab === "resolved" && ticket.status !== "Resolved") {
      return false;
    }
    if (activeTab === "closed" && ticket.status !== "Closed") {
      return false;
    }

    // Dropdown filters
    if (categoryFilter !== "all" && ticket.category !== categoryFilter) {
      return false;
    }
    if (
      priorityFilter !== "all" &&
      !ticket.priority.toLowerCase().includes(priorityFilter.toLowerCase())
    ) {
      return false;
    }
    if (
      statusFilter !== "all" &&
      ticket.status.toLowerCase() !== statusFilter.toLowerCase()
    ) {
      return false;
    }
    if (agentFilter !== "all" && ticket.assignedTo?.name !== agentFilter) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTickets = filteredTickets.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  // Render individual tab item
  const renderTab = (tab) => {
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        type="button"
        onClick={() => {
          setActiveTab(tab.id);
          setCurrentPage(1);
        }}
        className={`flex items-center pb-3 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
          isActive
            ? "text-primary border-primary font-bold"
            : "text-light-black border-transparent hover:text-primary"
        }`}
      >
        <span>{tab.label}</span>
        {tab.count !== undefined && (
          <span
            className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isActive
                ? "bg-primary/10 text-primary"
                : "bg-light-gray text-medium-black"
            }`}
          >
            {tab.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="w-full bg-white rounded-2xl border border-light-gray shadow-sm overflow-hidden flex flex-col"
    >
      {/* ── Top Tabs Navigation ── */}
      <div className="border-b border-light-gray">
        {/* Desktop Tabs (md and above) */}
        <div className="hidden md:flex items-center gap-6 sm:gap-8 px-5 sm:px-6 pt-5">
          {tabs.map((tab) => renderTab(tab))}
        </div>

        {/* Mobile / Small Devices Tabs (Swiper Carousel) */}
        <div className="block md:hidden px-4 pt-4">
          <Swiper
            modules={[FreeMode]}
            freeMode
            slidesPerView="auto"
            spaceBetween={20}
            grabCursor
            initialSlide={activeTabIndex >= 0 ? activeTabIndex : 0}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="w-full"
          >
            {tabs.map((tab) => (
              <SwiperSlide key={tab.id} className="!w-auto">
                {renderTab(tab)}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* ── Filters Bar Row ── */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-light-gray/60 bg-white">
        {/* Left Filters Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Category Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "category" ? null : "category")
              }
              className="flex items-center justify-between gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer"
            >
              <span>
                {categoryOptions.find((c) => c.value === categoryFilter)?.label ||
                  "All Categories"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>
            <AnimatePresence>
              {openDropdown === "category" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full mt-1 w-48 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                >
                  {categoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setCategoryFilter(opt.value);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        categoryFilter === opt.value
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-dark-black hover:bg-light-gray"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {categoryFilter === opt.value && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Priority Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "priority" ? null : "priority")
              }
              className="flex items-center justify-between gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer"
            >
              <span>
                {priorityOptions.find((p) => p.value === priorityFilter)?.label ||
                  "All Priorities"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>
            <AnimatePresence>
              {openDropdown === "priority" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full mt-1 w-44 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                >
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setPriorityFilter(opt.value);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        priorityFilter === opt.value
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-dark-black hover:bg-light-gray"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {priorityFilter === opt.value && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Statuses Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "status" ? null : "status")
              }
              className="flex items-center justify-between gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer"
            >
              <span>
                {statusOptions.find((s) => s.value === statusFilter)?.label ||
                  "All Statuses"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>
            <AnimatePresence>
              {openDropdown === "status" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full mt-1 w-44 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                >
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(opt.value);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        statusFilter === opt.value
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-dark-black hover:bg-light-gray"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {statusFilter === opt.value && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Agents Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "agent" ? null : "agent")
              }
              className="flex items-center justify-between gap-1.5 px-3 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer"
            >
              <span>
                {agentOptions.find((a) => a.value === agentFilter)?.label ||
                  "All Agents"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>
            <AnimatePresence>
              {openDropdown === "agent" && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 top-full mt-1 w-44 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                >
                  {agentOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setAgentFilter(opt.value);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                        agentFilter === opt.value
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-dark-black hover:bg-light-gray"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {agentFilter === opt.value && (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── DatePicker with variant="filter" ── */}
          <div className="w-48 sm:w-52 shrink-0">
            <DatePicker
              variant="filter"
              value={dateFilter}
              onChange={(val) => {
                setDateFilter(val);
                setCurrentPage(1);
              }}
              placeholder="May 2, 2024 - May 8, 2024"
              className="w-full"
            />
          </div>
        </div>

        {/* Right Filters Button */}
        <div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 transition-colors shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-light-black" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* ── Table Area (Checkbox Column Removed) ── */}
      <div className="w-full overflow-x-auto min-w-0">
        <table className="w-full text-left border-collapse min-w-[820px]">
          <thead>
            <tr className="border-b border-light-gray text-[11px] font-bold text-light-black uppercase tracking-wider bg-[#FAFAFA]/50">
              <th className="py-3.5 pl-5 sm:pl-6 font-semibold w-[130px]">TICKET ID</th>
              <th className="py-3.5 px-3 font-semibold w-[200px]">
                <div>CUSTOMER</div>
                <div className="text-[10px] text-light-black font-normal mt-0.5">COMPANY</div>
              </th>
              <th className="py-3.5 px-3 font-semibold min-w-[220px]">SUBJECT</th>
              <th className="py-3.5 px-3 font-semibold text-center w-[110px]">PRIORITY</th>
              <th className="py-3.5 px-3 font-semibold text-center w-[120px]">STATUS</th>
              <th className="py-3.5 px-3 font-semibold w-[150px]">ASSIGNED TO</th>
              <th className="py-3.5 px-3 font-semibold w-[140px]">LAST UPDATE</th>
              <th className="py-3.5 pr-5 sm:pr-6 font-semibold w-[90px]">SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray text-xs">
            {paginatedTickets.map((ticket, idx) => (
              <tr
                key={`${ticket.id}-${idx}`}
                onClick={() => onSelectTicket?.(ticket)}
                className="hover:bg-primary/5 transition-colors cursor-pointer group"
              >
                {/* Ticket ID */}
                <td className="py-4 pl-5 sm:pl-6 font-bold text-dark-black whitespace-nowrap">
                  {ticket.id}
                </td>

                {/* Customer / Company */}
                <td className="py-4 px-3">
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className="font-bold text-dark-black truncate">
                      {ticket.customer?.name}
                    </span>
                    <span className="text-[11px] text-light-black truncate mt-0.5">
                      {ticket.customer?.company}
                    </span>
                  </div>
                </td>

                {/* Subject */}
                <td className="py-4 px-3 text-dark-black font-normal">
                  <span className="truncate block max-w-[260px]">
                    {ticket.subject}
                  </span>
                </td>

                {/* Priority */}
                <td className="py-4 px-3 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${ticket.priorityStyle}`}
                  >
                    {ticket.priority}
                  </span>
                </td>

                {/* Status */}
                <td className="py-4 px-3 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${ticket.statusStyle}`}
                  >
                    {ticket.status}
                  </span>
                </td>

                {/* Assigned To */}
                <td className="py-4 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {ticket.assignedTo?.avatar ? (
                      <img
                        src={ticket.assignedTo.avatar}
                        alt={ticket.assignedTo.name}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                        {ticket.assignedTo?.name?.charAt(0) || "A"}
                      </div>
                    )}
                    <span className="font-medium text-dark-black text-xs truncate">
                      {ticket.assignedTo?.name || "Unassigned"}
                    </span>
                  </div>
                </td>

                {/* Last Update */}
                <td className="py-4 px-3 text-light-black text-xs whitespace-nowrap">
                  {ticket.lastUpdate || `${ticket.date}, ${ticket.time}`}
                </td>

                {/* SLA */}
                <td className="py-4 pr-5 sm:pr-6 whitespace-nowrap">
                  <span
                    className={`text-xs font-semibold ${
                      ticket.slaStyle || "text-emerald-600"
                    }`}
                  >
                    {ticket.sla || "On Track"}
                  </span>
                </td>
              </tr>
            ))}

            {paginatedTickets.length === 0 && (
              <tr>
                <td colSpan={8} className="py-14 text-center text-light-black text-xs">
                  No tickets found matching the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Table Footer & Pagination ── */}
      <div className="p-4 sm:p-5 border-t border-light-gray flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-light-black bg-white">
        <div>
          <span>
            Showing{" "}
            {filteredTickets.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to{" "}
            {Math.min(safePage * pageSize, filteredTickets.length)} of{" "}
            {filteredTickets.length} tickets
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
          {/* Page navigation buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  safePage === i + 1
                    ? "bg-primary text-white font-bold shadow-xs"
                    : "border border-light-gray text-medium-black hover:bg-light-gray"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-light-gray hover:bg-light-gray text-medium-black disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page size dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "pageSize" ? null : "pageSize")
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray/40 transition-colors cursor-pointer"
            >
              <span>{pageSize} / page</span>
              <ChevronDown className="w-3 h-3 text-light-black" />
            </button>
            <AnimatePresence>
              {openDropdown === "pageSize" && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 bottom-full mb-1 w-28 bg-white border border-light-gray rounded-xl shadow-lg p-1 z-30 text-xs"
                >
                  {pageSizeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setPageSize(opt.value);
                        setOpenDropdown(null);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                        pageSize === opt.value
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-dark-black hover:bg-light-gray"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketList;
