"use client";

import React, { useState } from "react";
import { Edit2, CheckCircle2 } from "lucide-react";
import Dropdown from "@/components/shared/dropdown/dropdown";
import toast from "react-hot-toast";

const languageOptions = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
];

const ownerOptions = [
  { value: "Daniel Miller (Admin)", label: "Daniel Miller (Admin)" },
  { value: "Robert Chen", label: "Robert Chen" },
  { value: "Jessica Williams", label: "Jessica Williams" },
  { value: "Brian Thompson", label: "Brian Thompson" },
];

const AccountInfo = ({
  initialData = {
    fullName: "Jennifer Smith",
    email: "jennifer.smith@acme.com",
    phone: "(555) 123-4567",
    company: "Acme Inc.",
    industry: "Real Estate",
    timeZone: "(GMT-05:00) Eastern Time (US & Canada)",
    language: "English",
    accountOwner: "Daniel Miller (Admin)",
  },
}) => {
  const [data, setData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(data.language);
  const [selectedOwner, setSelectedOwner] = useState(data.accountOwner);

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Account information updated!");
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full h-full flex flex-col">
      {/* ── Header: Title & Edit Button ── */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight">
          Account Information
        </h3>
        <button
          type="button"
          onClick={() => {
            if (isEditing) handleSave();
            else setIsEditing(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs"
        >
          <Edit2 className="w-3 h-3 text-light-black" />
          <span>{isEditing ? "Done" : "Edit"}</span>
        </button>
      </div>

      {/* ── Fields List: Comfortable, well-balanced line spacing ── */}
      <div className="space-y-4 text-xs">
        {/* Full Name */}
        <div className="grid grid-cols-12 gap-3 items-center py-0.5">
          <span className="col-span-4 text-light-black font-medium">Full Name</span>
          <div className="col-span-8 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => setData({ ...data, fullName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black focus:outline-none focus:border-primary"
              />
            ) : (
              <span className="font-semibold text-dark-black/85">{data.fullName}</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="grid grid-cols-12 gap-3 items-center py-0.5">
          <span className="col-span-4 text-light-black font-medium">Email</span>
          <div className="col-span-8 flex items-center gap-1.5 min-w-0">
            {isEditing ? (
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black focus:outline-none focus:border-primary"
              />
            ) : (
              <>
                <span className="font-semibold text-dark-black/85">{data.email}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0" />
              </>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="grid grid-cols-12 gap-3 items-center py-0.5">
          <span className="col-span-4 text-light-black font-medium">Phone</span>
          <div className="col-span-8 flex items-center gap-1.5 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black focus:outline-none focus:border-primary"
              />
            ) : (
              <>
                <span className="font-semibold text-dark-black/85">{data.phone}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0" />
              </>
            )}
          </div>
        </div>

        {/* Company */}
        <div className="grid grid-cols-12 gap-3 items-center py-0.5">
          <span className="col-span-4 text-light-black font-medium">Company</span>
          <div className="col-span-8 flex items-center gap-2 min-w-0">
            <span className="font-semibold text-dark-black/85">{data.company}</span>
            <button
              type="button"
              onClick={() => toast("Editing company details...")}
              className="text-primary hover:underline font-semibold text-[11px] cursor-pointer shrink-0"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Industry */}
        <div className="grid grid-cols-12 gap-3 items-center py-0.5">
          <span className="col-span-4 text-light-black font-medium">Industry</span>
          <div className="col-span-8 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={data.industry}
                onChange={(e) => setData({ ...data, industry: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black focus:outline-none focus:border-primary"
              />
            ) : (
              <span className="font-semibold text-dark-black/85">{data.industry}</span>
            )}
          </div>
        </div>

        {/* Time Zone */}
        <div className="grid grid-cols-12 gap-3 items-center py-0.5">
          <span className="col-span-4 text-light-black font-medium">Time Zone</span>
          <div className="col-span-8 min-w-0">
            <span className="font-semibold text-dark-black/85 text-[11px] sm:text-xs leading-tight block">
              {data.timeZone}
            </span>
          </div>
        </div>

        {/* Language */}
        <div className="grid grid-cols-12 gap-3 items-center py-0.5">
          <span className="col-span-4 text-light-black font-medium">Language</span>
          <div className="col-span-8 w-full max-w-[220px]">
            <Dropdown
              items={languageOptions}
              selected={selectedLanguage}
              onSelect={setSelectedLanguage}
              variant="small"
              className="w-full"
            />
          </div>
        </div>

        {/* Account Owner */}
        <div className="grid grid-cols-12 gap-3 items-center py-0.5">
          <span className="col-span-4 text-light-black font-medium">Account Owner</span>
          <div className="col-span-8 w-full max-w-[220px]">
            <Dropdown
              items={ownerOptions}
              selected={selectedOwner}
              onSelect={setSelectedOwner}
              variant="small"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;
