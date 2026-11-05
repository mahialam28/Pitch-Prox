"use client";

import React, { useState } from "react";
import { Plus, Info, Send } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";

const segmentOptions = [
  { value: "Fortune 500 Leads", label: "Fortune 500 Leads" },
  { value: "All Active Users", label: "All Active Users" },
  { value: "Dormant Accounts", label: "Dormant Accounts" },
  { value: "High Tier Leads", label: "High Tier Leads" },
];

const templateOptions = [
  {
    value: "Executive Outreach - Variant A",
    label: "Executive Outreach - Variant A",
  },
  {
    value: "Product Launch Announcement",
    label: "Product Launch Announcement",
  },
  {
    value: "Weekly Digest Template",
    label: "Weekly Digest Template",
  },
  {
    value: "Holiday Special Offer",
    label: "Holiday Special Offer",
  },
];

export default function CreateCampaignSection() {
  const [campaignName, setCampaignName] = useState("");
  const [targetSegment, setTargetSegment] = useState("Fortune 500 Leads");
  const [emailTemplate, setEmailTemplate] = useState(
    "Executive Outreach - Variant A"
  );
  const [scheduleDateTime, setScheduleDateTime] = useState("");

  const handleLaunch = (e) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    toast.success(`Campaign "${campaignName}" launched successfully!`);
    setCampaignName("");
  };

  const handleSaveDraft = () => {
    toast.success("Campaign draft saved!");
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">
          Create Campaign
        </h3>
      </div>

      {/* Form */}
      <form onSubmit={handleLaunch} className="flex flex-col gap-4">
        {/* Row 1: Campaign Name & Target Segment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-dark-black/80">
              Campaign Name
            </label>
            <input
              type="text"
              placeholder="e.g. Q4 Growth Sprint"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-dark-black/80">
              Target Segment
            </label>
            <Dropdown
              items={segmentOptions}
              selected={targetSegment}
              onSelect={setTargetSegment}
              variant="small"
              className="w-full"
              buttonClassName="w-full justify-between"
            />
          </div>
        </div>

        {/* Row 2: Email Template */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-dark-black/80">
            Email Template
          </label>
          <Dropdown
            items={templateOptions}
            selected={emailTemplate}
            onSelect={setEmailTemplate}
            variant="small"
            className="w-full"
            buttonClassName="w-full justify-between"
          />
        </div>

        {/* Row 3: Schedule Date/Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-dark-black/80">
            Schedule Date/Time
          </label>
          <input
            type="text"
            placeholder="mm/dd/yyyy, --:-- --"
            value={scheduleDateTime}
            onChange={(e) => setScheduleDateTime(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>

        {/* Info Callout Banner */}
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-light-gray/80 flex items-start gap-3 my-1">
          <div className="w-5 h-5 rounded-full bg-light-teal/50 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-dark-black/80">
              Global Delivery Optimization
            </span>
            <span className="text-[11px] text-light-black leading-relaxed mt-0.5">
              PitchProX will automatically queue these emails to land in top-priority inboxes during peak engagement hours (8:00 AM - 10:00 AM local time).
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-4 py-2 rounded-xl border border-light-gray hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors shadow-2xs cursor-pointer"
          >
            Save Draft
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Campaign</span>
            <Send className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </form>
    </div>
  );
}
