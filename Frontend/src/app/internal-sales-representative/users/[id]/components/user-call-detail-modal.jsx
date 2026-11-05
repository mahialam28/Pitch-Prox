"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PENDING_CALL_KEY } from "@/utils.js/call-constants";
import {
  X,
  Phone,
  Home,
  Tag,
  Clock,
  Timer,
  TrendingUp,
  ShieldCheck,
  Calendar,
} from "lucide-react";

const UserCallDetailModal = ({ isOpen = false, onClose, call = null }) => {
  const router = useRouter();

  const handleCallNow = () => {
    try {
      sessionStorage.setItem(
        PENDING_CALL_KEY,
        JSON.stringify({
          leadName: call?.name || "",
          phoneNumber: call?.phoneNumber || "(555) 234-5678",
          leadType: call?.leadType || "",
          address: call?.propertyAddress || "",
          playbook: "PitchProx Standard",
        })
      );
    } catch {
      /* sessionStorage unavailable — continue without prefill */
    }
    router.push("/internal-sales-representative/live-calling");
  };

  if (!isOpen || !call) return null;

  const callName = call?.name || "Stephanie Sharkey";
  const leadType = call?.leadType || "Past Clients & Sphere";
  const outcome = call?.outcome || "No Answer";
  const propertyAddress =
    call?.propertyAddress || "1851 Lynch Street, Ne...";
  const callDate = call?.date || "Apr 11, 2026";
  const callTime = call?.time || "9:48 AM";
  const duration = call?.duration || "2m 40s";
  const trustGain = call?.trustGain ?? 6;
  const aiAdherence = call?.aiAdherence ?? 0;
  const note =
    call?.note || "Past client — asked to be notified of new listings.";

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
        <div className="p-6 sm:p-8 pb-5 flex items-start justify-between border-b border-light-gray">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-dark-black tracking-tight">
                {callName}
              </h1>
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
          <div className="bg-light-gray/50 rounded-2xl p-6 border border-light-gray grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Home className="h-4 w-4 text-light-black shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px] mb-0.5">
                    Property Address
                  </span>
                  <span className="font-semibold text-dark-black">
                    {propertyAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 text-light-black shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px] mb-0.5">
                    Lead Type
                  </span>
                  <span className="font-semibold text-dark-black">
                    {leadType}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-light-black shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px] mb-0.5">
                    Last Call
                  </span>
                  <span className="font-semibold text-dark-black">
                    {callDate} · {callTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-light-black shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px] mb-0.5">
                    Duration
                  </span>
                  <span className="font-semibold text-dark-black">
                    {duration}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <TrendingUp className="h-4 w-4 text-light-black shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px] mb-0.5">
                    Trust Gain
                  </span>
                  <span className="font-bold text-emerald-600">
                    +{trustGain}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="h-4 w-4 text-light-black shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="text-light-black block text-[10px] mb-0.5">
                    AI Adherence
                  </span>
                  <span
                    className={`font-bold ${
                      aiAdherence === 0 ? "text-red" : "text-emerald-600"
                    }`}
                  >
                    {aiAdherence}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Note Card */}
          <div className="border border-light-gray rounded-2xl p-6 bg-white shadow-2xs">
            <h2 className="text-xs font-bold text-dark-black mb-2">Note</h2>
            <p className="text-xs text-medium-black italic">
              {note}
            </p>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div className="p-4 sm:px-8 border-t border-light-gray bg-white flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/internal-sales-representative/calls/report"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-primary border border-primary/40 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Timer className="h-3.5 w-3.5" />
            <span>View Full Report</span>
          </Link>

          <button
            onClick={handleCallNow}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-primary rounded-xl hover:bg-medium-teal transition-colors shadow-sm cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCallDetailModal;
