"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PENDING_CALL_KEY } from "@/utils.js/call-constants";
import {
  X,
  Phone,
  Building2,
  Tag,
  Calendar,
  Clock,
  Timer,
  TrendingUp,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

const ContactProfileModal = ({ isOpen = false, onClose, call = null }) => {
  const router = useRouter();

  // Hand the contact to the live-calling page (same bridge the CRM/Leads tables
  // and app header use: sessionStorage + navigate). The call auto-starts there
  // without the pre-call setup popup.
  const handleCallNow = () => {
    try {
      sessionStorage.setItem(
        PENDING_CALL_KEY,
        JSON.stringify({
          leadName: call?.name || "",
          phoneNumber: call?.phoneNumber || "",
          leadType: call?.leadType || "",
          address: call?.companyName || call?.propertyAddress || "",
          playbook: "PitchProx Standard",
        })
      );
    } catch {
      /* sessionStorage unavailable — continue without prefill */
    }
    router.push("/internal-sales-representative/live-calling");
  };

  if (!isOpen) return null;

  const callName = call?.name || "Devon Lane";
  const leadType = call?.leadType || "Solo agent";
  const outcome = call?.outcome || "Demo Scheduled";
  const companyName =
    call?.companyName || call?.propertyAddress || "Apex Solutions Inc.";
  const tags = call?.tags || ["High Potential", "AI Skeptic"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-light-gray overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div className="p-6 sm:p-8 pb-4 flex items-start justify-between border-b border-light-gray">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-dark-black">{callName}</h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-light-blue bg-light-blue/10 border border-light-blue/20">
                {leadType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100">
                {outcome}
              </span>
            </div>
            <p className="text-xs text-light-black mt-2">
              Contact profile · call details
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-light-black hover:text-medium-black rounded-full hover:bg-light-gray transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Quick Info Card */}
          <div className="bg-light-gray/60 rounded-2xl p-5 border border-light-gray grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 text-light-black shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px]">
                    Company Name
                  </span>
                  <span className="font-semibold text-dark-black">
                    {companyName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-light-black shrink-0" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px]">
                    Lead Type
                  </span>
                  <span className="font-semibold text-dark-black">
                    {leadType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 text-light-black shrink-0" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px]">
                    Last Call
                  </span>
                  <span className="font-semibold text-dark-black">
                    {call?.date || "May 19, 2025"} · {call?.time || "10:32 AM"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-light-black shrink-0" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px]">
                    Duration
                  </span>
                  <span className="font-semibold text-dark-black">
                    {call?.duration || "2m 40s"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-light-black shrink-0" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px]">
                    Trust Gain
                  </span>
                  <span className="font-semibold text-emerald-600">
                    +{call?.trustGain ?? 28}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-light-black shrink-0" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px]">
                    AI Adherence
                  </span>
                  <span
                    className={`font-semibold ${
                      call?.aiAdherence === 0 ? "text-red" : "text-emerald-600"
                    }`}
                  >
                    {call?.aiAdherence ?? 84}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="border border-light-gray rounded-2xl p-5 bg-white shadow-xs">
            <h2 className="text-xs font-bold text-dark-black mb-2.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span>Tags</span>
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {tags.map((tagItem) => (
                <span
                  key={tagItem}
                  className="px-2.5 py-1 text-[11px] font-medium text-light-blue bg-light-blue/10 border border-light-blue/20 rounded-lg"
                >
                  {tagItem}
                </span>
              ))}
            </div>
          </div>

          {/* Follow-up Due Card */}
          {call?.followUpDate && (
            <div className="flex items-center gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50">
              <div className="p-2.5 rounded-xl bg-white text-amber-600">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <span className="text-amber-600 block text-[10px] font-bold uppercase tracking-wider">
                  Follow-Up Due
                </span>
                <span className="font-bold text-dark-black">
                  {call.followUpDate}
                </span>
              </div>
            </div>
          )}

          {/* Note Card */}
          {call?.note && (
            <div className="border border-light-gray rounded-2xl p-5 bg-white shadow-xs">
              <h2 className="text-xs font-bold text-dark-black mb-2">Note</h2>
              <p className="text-xs text-medium-black italic">{call.note}</p>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 sm:px-8 border-t border-light-gray bg-white flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/internal-sales-representative/calls/report"
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Timer className="h-3.5 w-3.5" />
            <span>View Full Report</span>
          </Link>

          <button
            onClick={handleCallNow}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-medium-teal transition-colors shadow-sm cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactProfileModal;
