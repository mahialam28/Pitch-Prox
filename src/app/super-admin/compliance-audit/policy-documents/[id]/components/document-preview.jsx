"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Download,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

const zoomOptions = [
  { value: 75, label: "75%" },
  { value: 100, label: "100%" },
  { value: 125, label: "125%" },
  { value: 150, label: "150%" },
];

export default function DocumentPreview({ policy }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isZoomDropdownOpen, setIsZoomDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = policy?.totalPages || 12;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 25, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 25, 75));
  };

  const handleDownload = () => {
    toast.success(`Downloading ${policy?.name || "Document"}.pdf...`);
  };

  return (
    <div className="bg-white rounded-3xl border border-light-gray shadow-xs p-6 sm:p-7 flex flex-col justify-between w-full min-h-[700px]">
      {/* ── Top Card Title ── */}
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-base sm:text-lg font-bold text-dark-black/90 font-secondary tracking-tight">
          Document Preview
        </h2>
      </div>

      {/* ── Gray Canvas Container ── */}
      <div className="flex-1 bg-[#F8FAFA] rounded-2xl border border-light-gray/60 p-6 sm:p-10 lg:p-12 flex flex-col items-center justify-center overflow-y-auto">
        {/* ── Document Paper Sheet (Generous, Clear & Full Sized) ── */}
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: "center center",
            transition: "transform 0.25s ease-out",
          }}
          className="w-full max-w-[620px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-light-gray/80 p-8 sm:p-11 space-y-6"
        >
          {/* Sheet Header: Logo & Page Pill */}
          <div className="flex items-center justify-between">
            {/* PitchProX Logo mark */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-base shadow-sm">
                P
              </div>
              <span className="font-extrabold text-base tracking-tight text-dark-black/90 font-secondary">
                PitchPro<span className="text-primary">X</span>
              </span>
            </div>

            {/* Page Count Pill */}
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-light-gray/60 text-dark-black/75 border border-light-gray">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Sheet Document Title & Subtitle */}
          <div className="space-y-1.5 pt-2">
            <h3 className="text-xl sm:text-2xl font-black text-dark-black/95 font-secondary tracking-tight">
              {policy?.name || "Information Security Policy"}
            </h3>
            <p className="text-xs text-light-black">
              Effective Date: {policy?.effectiveDate || "April 15, 2024"} | Version {policy?.version || "2.1"}
            </p>
          </div>

          {/* Decorative Divider */}
          <div className="w-full h-px bg-light-gray/80 my-2" />

          {/* Section 1: Purpose */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 uppercase tracking-wider font-secondary">
              1. Purpose
            </h4>
            <p className="text-xs text-dark-black/75 leading-relaxed font-normal">
              {policy?.purpose ||
                "The purpose of this Information Security Policy is to establish the framework for protecting company information assets from unauthorized access, disclosure, alteration, or destruction. This policy defines the standards and responsibilities required to ensure the confidentiality, integrity, and availability of information."}
            </p>
          </div>

          {/* Section 2: Scope */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 uppercase tracking-wider font-secondary">
              2. Scope
            </h4>
            <p className="text-xs text-dark-black/75 leading-relaxed font-normal">
              {policy?.scope ||
                "This policy applies to all employees, contractors, interns, and third-party service providers who have access to company information systems, data, or networks, regardless of location or device used."}
            </p>
          </div>

          {/* Section 3: Policy Statements */}
          <div className="space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-dark-black/90 uppercase tracking-wider font-secondary">
              3. Policy Statements
            </h4>
            <p className="text-xs text-dark-black/75 leading-relaxed font-normal">
              {policy?.requirements ||
                "All users are responsible for safeguarding company information by following the security requirements outlined in this policy and related procedures."}
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Floating Zoom Toolbar (Exact Look & Alignment) ── */}
      <div className="pt-4 flex items-center justify-center">
        <div className="bg-white border border-light-gray/90 shadow-md rounded-2xl px-4 py-2 flex items-center gap-4 relative">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 75}
            className="text-light-black hover:text-dark-black disabled:opacity-40 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Level Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsZoomDropdownOpen(!isZoomDropdownOpen)}
              className="flex items-center gap-1 text-xs font-semibold text-dark-black/85 hover:text-primary transition-colors cursor-pointer"
            >
              <span>{zoomLevel}%</span>
              <ChevronDown className="w-3.5 h-3.5 text-light-black" />
            </button>

            {isZoomDropdownOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-light-gray rounded-xl shadow-lg py-1 w-20 z-30">
                {zoomOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setZoomLevel(opt.value);
                      setIsZoomDropdownOpen(false);
                    }}
                    className={`w-full px-2.5 py-1 text-center text-xs font-semibold hover:bg-light-gray/60 transition-colors cursor-pointer ${
                      zoomLevel === opt.value
                        ? "text-primary bg-primary/5"
                        : "text-dark-black/85"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 150}
            className="text-light-black hover:text-dark-black disabled:opacity-40 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Divider */}
          <div className="w-px h-3.5 bg-light-gray" />

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="text-light-black hover:text-primary transition-colors cursor-pointer"
            title="Download Document"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
