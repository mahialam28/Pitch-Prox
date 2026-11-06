"use client";

import React, { useState } from "react";
import { Plus, Send } from "lucide-react";
import toast from "react-hot-toast";
import Dropdown from "@/components/shared/dropdown/dropdown";
import { campaignApi, useApi } from "../campaign-api";

// Broadcast Campaign = a one-time or scheduled send to a segment of PitchProX users (items 295–298).
// Only Active Marketing / Lifecycle templates can be broadcast; Transactional ones go out on system events.
export default function CreateCampaignSection({ onCreated, canManage = true }) {
  const segments = useApi("/api/v1/campaigns/segments");
  const templates = useApi("/api/v1/campaigns/templates");
  const segmentOptions = (segments.data?.segments ?? []).map((segment) => ({ value: segment.id, label: `${segment.name} (${segment.memberCount} users)` }));
  const templateOptions = (templates.data?.results ?? [])
    .filter((template) => template.status === "Active" && template.emailType !== "Transactional")
    .map((template) => ({ value: template.id, label: `${template.name} · ${template.emailType}` }));

  const [campaignName, setCampaignName] = useState("");
  const [targetSegment, setTargetSegment] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("");
  const [sendOption, setSendOption] = useState("Send Now");
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLaunch = async (e) => {
    e.preventDefault();
    if (!campaignName.trim()) return toast.error("Please enter a campaign name");
    if (!targetSegment) return toast.error("Choose a target segment");
    if (!emailTemplate) return toast.error("Choose an email template");
    if (sendOption === "Schedule" && !scheduleDateTime) return toast.error("Choose the date and time to send");
    setSaving(true);
    try {
      const { campaign } = await campaignApi.createCampaign({
        name: campaignName.trim(),
        segmentId: targetSegment,
        templateId: emailTemplate,
        sendOption: sendOption === "Schedule" ? "schedule" : "now",
        ...(sendOption === "Schedule" && { scheduledAt: new Date(scheduleDateTime).toISOString() }),
      });
      toast.success(
        campaign.status === "scheduled"
          ? `Campaign "${campaign.name}" is scheduled.`
          : `"${campaign.name}" went to ${campaign.recipients} user${campaign.recipients === 1 ? "" : "s"}. Emails are delivered once an email service is connected.`,
        { duration: 6000 }
      );
      setCampaignName("");
      setScheduleDateTime("");
      onCreated?.(campaign);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!canManage) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full text-sm text-medium-black">
        Only a Super Admin or Admin Manager can send campaigns.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full flex flex-col justify-between">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-2xs">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-dark-black/80 tracking-tight">Create Campaign</h3>
      </div>

      <form onSubmit={handleLaunch} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-dark-black/80">Campaign Name</span>
            <input
              type="text"
              placeholder="e.g. Q4 Growth Sprint"
              value={campaignName}
              maxLength={160}
              onChange={(e) => setCampaignName(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-light-gray text-xs text-dark-black/80 placeholder:text-light-black bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-dark-black/80">Target Segment</span>
            <Dropdown label={segments.data ? "Choose a segment" : "Loading…"} items={segmentOptions} selected={targetSegment} onSelect={setTargetSegment} variant="small" className="w-full" buttonClassName="w-full justify-between" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-dark-black/80">Email Template</span>
          <Dropdown label={templates.data ? (templateOptions.length ? "Choose a template" : "No Active templates yet") : "Loading…"} items={templateOptions} selected={emailTemplate} onSelect={setEmailTemplate} variant="small" className="w-full" buttonClassName="w-full justify-between" />
          <span className="text-[11px] text-light-black">Only Active Marketing and Lifecycle templates are listed.</span>
        </div>

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

        {/* Send-time optimization: optional and never applied automatically (items 297–298); not built yet */}
        <label className="bg-[#F8FAFC] p-3.5 rounded-xl border border-light-gray/80 flex items-start gap-3 my-1 opacity-60 cursor-not-allowed">
          <input type="checkbox" disabled checked={false} readOnly className="mt-0.5 accent-primary w-4 h-4" />
          <span className="flex flex-col">
            <span className="text-xs font-bold text-dark-black/80">Optimize Send Time</span>
            <span className="text-[11px] text-light-black leading-relaxed mt-0.5">Coming later. It will be an opt-in per campaign once open data is available.</span>
          </span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
            <span>{saving ? "Working…" : sendOption === "Schedule" ? "Schedule Campaign" : "Send Now"}</span>
            <Send className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </form>
    </div>
  );
}
