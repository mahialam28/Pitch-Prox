"use client";

import React from "react";
import { Edit3 } from "lucide-react";

export default function AccountOwner({
  owner = {
    name: "Jennifer Smith",
    email: "jennifer.smith@acme.com",
    phone: "(555) 123-4567",
  },
  onEdit = () => {},
}) {
  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-xs p-5 sm:p-6 flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-light-gray/70">
        <div className="flex flex-col">
          <h3 className="text-base font-bold text-dark-black/85">
            Account Owner
          </h3>
          <p className="text-xs text-light-black font-normal mt-0.5">
            This user is the owner of the account.
          </p>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/85 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5 shrink-0"
        >
          <Edit3 className="w-3.5 h-3.5 text-light-black" />
          <span>Edit Owner</span>
        </button>
      </div>

      {/* 3 Column Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Name
          </span>
          <span className="font-semibold text-dark-black/85 text-sm">
            {owner.name}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Email
          </span>
          <span className="font-semibold text-dark-black/85 text-sm break-all">
            {owner.email}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-light-black">
            Phone
          </span>
          <span className="font-semibold text-dark-black/85 text-sm">
            {owner.phone}
          </span>
        </div>
      </div>
    </div>
  );
}
