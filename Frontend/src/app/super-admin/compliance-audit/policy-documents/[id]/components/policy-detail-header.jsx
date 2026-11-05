"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Download, Edit3, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function PolicyDetailHeader({
  policy,
  onEditClick,
  onDeleteClick,
}) {
  const handleDownload = () => {
    toast.success(`Downloading ${policy?.name || "Document"}.pdf...`);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-light-black">
        <Link
          href="/super-admin/compliance-audit/policy-documents"
          className="inline-flex items-center gap-1.5 text-primary hover:underline font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Policy Documents
        </Link>
        <span>/</span>
        <span className="text-dark-black/80 font-medium truncate max-w-xs sm:max-w-md">
          {policy?.name}
        </span>
      </div>

      {/* Main Title & Action Buttons Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Title, Badge & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-black/85 font-secondary tracking-tight">
              {policy?.name}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">
              {policy?.status || "Approved"}
            </span>
            <span className="text-xs font-semibold text-light-black">
              Version {policy?.version}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-light-black">
            {policy?.description}
          </p>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Download PDF */}
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl border border-light-gray bg-white hover:bg-light-gray/40 text-xs sm:text-sm font-semibold text-dark-black/85 flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-dark-black/70" />
            Download PDF
          </button>

          {/* Edit Document */}
          <button
            type="button"
            onClick={onEditClick}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-[#0c9593] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            Edit Document
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDeleteClick}
            className="px-3.5 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs sm:text-sm font-semibold text-rose-600 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
