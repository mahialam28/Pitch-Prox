"use client";

import React from "react";
import { Edit3 } from "lucide-react";

export default function CompanyProfile({
  company = {
    name: "Acme Inc.",
    website: "www.acme.com",
    industry: "Real Estate",
    size: "11-50 employees",
    phone: "(512) 555-0198",
    address: "123 Main Street, Suite 400\nAustin, TX 78701, USA",
    timeZone: "(GMT-05:00) Eastern Time (US & Canada)",
    language: "English (US)",
    dateFormat: "MM/DD/YYYY",
  },
  onEdit = () => {},
}) {
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-light-gray/70">
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-dark-black/85">
            Company Profile
          </h3>
          <p className="text-xs text-light-black font-normal mt-0.5">
            View and manage the company information for this account.
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5 text-light-black" />
          <span>Edit</span>
        </button>
      </div>

      {/* 3x3 Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Row 1 */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Company Name
          </span>
          <span className="font-semibold text-dark-black/85 text-sm">
            {company.name}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Website
          </span>
          <a
            href={`https://${company.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-600 hover:underline text-sm"
          >
            {company.website}
          </a>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Industry
          </span>
          <span className="font-semibold text-dark-black/85 text-sm">
            {company.industry}
          </span>
        </div>

        {/* Row 2 */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Company Size
          </span>
          <span className="font-semibold text-dark-black/85 text-sm">
            {company.size}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Phone
          </span>
          <span className="font-semibold text-dark-black/85 text-sm">
            {company.phone}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Address
          </span>
          <span className="font-semibold text-dark-black/85 whitespace-pre-line leading-relaxed">
            {company.address}
          </span>
        </div>

        {/* Row 3 */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Time Zone
          </span>
          <span className="font-semibold text-dark-black/85">
            {company.timeZone}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Default Language
          </span>
          <span className="font-semibold text-dark-black/85">
            {company.language}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Date Format
          </span>
          <span className="font-semibold text-dark-black/85">
            {company.dateFormat}
          </span>
        </div>
      </div>
    </div>
  );
}
