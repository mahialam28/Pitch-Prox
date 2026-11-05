"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Phone, ChevronLeft, ChevronRight } from "lucide-react";
import Title from "@/components/texts/title";
import BadgeSelect from "@/components/shared/dropdown/badge-select";
import ContactProfileModal from "../../calls/components/contact-profile-modal";
import NoCallData from "./no-call-data";

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
    className: "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100",
    dotClass: "bg-rose-500",
  },
  {
    value: "Other",
    label: "Other",
    className: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
    dotClass: "bg-gray-400",
  },
];

const PAGE_SIZE = 5;

const RecentCalls = () => {
  // Populated from call history once calling is connected
  const [calls, setCalls] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const headerRef = useRef(null);
  const bodyWrapperRef = useRef(null);

  const totalPages = Math.max(1, Math.ceil(calls.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedCalls = calls.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleRowKeyDown = (e, call) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedCall(call);
    }
  };

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

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-sm w-full">
      {/* --- Card Header --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-light-gray border border-light-gray flex items-center justify-center text-light-black">
            <Phone className="h-5 w-5" />
          </div>
          <Title variant="small" className="!text-lg !text-dark-black/80 !font-bold">
            Recent Calls
          </Title>
        </div>

        <Link
          href="/user/calls"
          className="px-4 py-2 text-xs font-semibold text-medium-black bg-white border border-light-gray rounded-xl hover:bg-light-gray transition-colors cursor-pointer"
        >
          View all calls
        </Link>
      </div>

      {calls.length === 0 && <NoCallData message="Your most recent calls and their outcomes will be listed here." className="border-t border-light-gray" />}

      {calls.length > 0 && (
      <>
      {/* --- Scrollable Header Table (scrolls in sync with body) --- */}
      <div
        ref={headerRef}
        className="w-full overflow-hidden"
        onScroll={handleBodyScroll}
      >
        <table className="w-full border-collapse text-left min-w-[1050px] table-fixed">
          <thead>
            <tr className="border-b border-light-gray">
              <th className="p-4 pl-6 text-[11px] font-bold text-light-black tracking-wider uppercase w-[160px]">Date & Time</th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[220px]">Property Address</th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[140px]">Lead Type</th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[100px]">Trust Gain</th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase w-[180px]">Outcome</th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase text-center w-[120px]">AI Adherence</th>
              <th className="p-4 text-[11px] font-bold text-light-black tracking-wider uppercase text-center w-[100px]">Duration</th>
              <th className="p-4 pr-6 text-[11px] font-bold text-light-black tracking-wider uppercase text-right w-[130px]">Actions</th>
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
        <table className="w-full border-collapse text-left min-w-[1050px] table-fixed">
          <tbody className="divide-y divide-light-gray/60">
            {paginatedCalls.map((call) => (
              <tr
                key={call.id}
                onClick={() => setSelectedCall(call)}
                onKeyDown={(e) => handleRowKeyDown(e, call)}
                role="button"
                tabIndex={0}
                aria-label={`View call details for ${call.propertyAddress}`}
                className="transition-colors group cursor-pointer hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary/50 focus-visible:outline-offset-[-2px]"
              >
                {/* Date & Time */}
                <td className="p-4 pl-6 align-middle w-[160px]">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-dark-black/90">{call.date}</span>
                    <span className="text-[11px] font-semibold text-light-black mt-0.5">{call.time}</span>
                  </div>
                </td>

                {/* Property Address */}
                <td className="p-4 text-sm font-medium text-medium-black truncate w-[220px]">
                  {call.propertyAddress}
                </td>

                {/* Lead Type */}
                <td className="p-4 w-[140px]">
                  <span className="text-sm font-medium text-medium-black">{call.leadType}</span>
                </td>

                {/* Trust Gain */}
                <td className="p-4 w-[100px]">
                  <span className="text-sm font-bold text-emerald-600">+{call.trustGain}</span>
                </td>

                {/* Outcome Badge Dropdown */}
                <td className="p-4 w-[180px]" onClick={(e) => e.stopPropagation()}>
                  <BadgeSelect
                    value={call.outcome}
                    onChange={(val) => handleOutcomeChange(call.id, val)}
                    options={outcomeOptions}
                    placeholder="Select Outcome"
                  />
                </td>

                {/* AI Adherence Level */}
                <td className={`p-4 text-sm font-bold text-center w-[120px] ${call.aiAdherence === 0 ? 'text-red' : 'text-emerald-600'}`}>
                  {call.aiAdherence}%
                </td>

                {/* Duration */}
                <td className="p-4 text-sm font-medium text-medium-black text-center w-[100px]">
                  {call.duration}
                </td>

                {/* Action — View Report */}
                <td className="p-4 pr-6 text-right w-[130px]" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href="/user/calls/report"
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

      </>
      )}

      {/* ── Table Footer & Pagination ── */}
      {calls.length > 0 && (
        <div className="p-4 sm:p-5 border-t border-light-gray flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-light-black bg-white rounded-b-2xl">
          <div>
            <span>
              Showing{" "}
              <span className="font-semibold text-dark-black">
                {(safePage - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-dark-black">
                {Math.min(safePage * PAGE_SIZE, calls.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-dark-black">{calls.length}</span>{" "}
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

export default RecentCalls;
