"use client";

import React, { useState } from "react";
import { Plus, Send } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { SAVED_SEGMENTS, membersOf } from "../user-segments";
import { CAMPAIGN_TEMPLATES } from "../templates-data";

// Broadcast Campaign = a one-time or scheduled send to a segment of PitchProX users
const segmentOptions = SAVED_SEGMENTS.map((segment) => ({ value: segment.name, label: `${segment.name} (${membersOf(segment).length} users)` }));
const templateOptions = CAMPAIGN_TEMPLATES.filter((template) => template.status !== "ARCHIVED").map((template) => ({ value: template.title, label: `${template.title} · ${template.emailType}` }));

export default function CreateCampaignSection() {
  const [campaignName, setCampaignName] = useState("");
  const [targetSegment, setTargetSegment] = useState(segmentOptions[1]?.value ?? "");
  const [emailTemplate, setEmailTemplate] = useState(templateOptions[0]?.value ?? "");
  const [sendOption, setSendOption] = useState("Send Now");
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  // Optional; never applied automatically
  const [optimizeSendTime, setOptimizeSendTime] = useState(false);

  const handleLaunch = (e) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }
    if (sendOption === "Schedule" && !scheduleDateTime) {
      toast.error("Choose the date and time to send");
      return;
    }
    toast.success(sendOption === "Schedule" ? `Campaign "${campaignName}" scheduled.` : `Campaign "${campaignName}" is sending now.`);
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

        {/* Row 3: Send Option & Date / Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-dark-black/80">Send Option</span>
            <div className="flex items-center bg-light-gray p-1 rounded-xl" role="radiogroup" aria-label="Send Option">
              {["Send Now", "Schedule"].map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={sendOption === option}
                  onClick={() => setSendOption(option)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${sendOption === option ? "bg-white text-primary shadow-xs" : "text-medium-black"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-dark-black/80">Date / Time</span>
            <input
              type="datetime-local"
              disabled={sendOption !== "Schedule"}
              value={scheduleDateTime}
              onChange={(e) => setScheduleDateTime(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-light-gray/50 disabled:text-light-black"
            />
          </label>
        </div>

        {/* Optional send-time optimization (off unless turned on for this campaign) */}
        <label className="bg-[#F8FAFC] p-3.5 rounded-xl border border-light-gray/80 flex items-start gap-3 my-1 cursor-pointer">
          <input type="checkbox" checked={optimizeSendTime} onChange={(e) => setOptimizeSendTime(e.target.checked)} className="mt-0.5 accent-primary w-4 h-4" />
          <span className="flex flex-col">
            <span className="text-xs font-bold text-dark-black/80">Optimize Send Time</span>
            <span className="text-[11px] text-light-black leading-relaxed mt-0.5">
              Deliver to each user at the hour they usually open emails. Off by default.
            </span>
          </span>
        </label>

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
            <span>{sendOption === "Schedule" ? "Schedule Campaign" : "Send Now"}</span>
            <Send className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </form>
    </div>
  );
}
