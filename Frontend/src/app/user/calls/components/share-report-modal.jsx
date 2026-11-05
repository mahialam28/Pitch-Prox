"use client";

import React, { useState } from "react";
import { Check, ChevronDown, Copy } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { showError } from "@/lib/alerts";

const emailPattern = /^\S+@\S+\.\S+$/;
const inputClass =
  "w-full min-h-[44px] px-4 py-3 rounded-xl border border-gray-300 bg-white text-base text-dark-black placeholder:text-gray-500 outline-none focus:border-primary transition-colors";
const labelClass = "block text-xs font-medium leading-4 text-medium-black mb-2";

// onShare overrides the default "not available yet" message (e.g. design-only previews)
const ShareReportModal = ({ isOpen, onClose, onShare }) => {
  const [emails, setEmails] = useState("");
  const [visibility, setVisibility] = useState("people");
  const [includeInsights, setIncludeInsights] = useState(true);
  const [copied, setCopied] = useState(false);
  const link = typeof window === "undefined" ? "" : window.location.href;

  const recipients = emails.split(/[\s,;]+/).filter(Boolean);
  const invalid = recipients.filter((email) => !emailPattern.test(email));

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showError("Couldn't copy", "Select the link and copy it manually.");
    }
  };

  const share = () => {
    onClose();
    if (onShare) return onShare({ recipients, visibility, includeInsights });
    showError("Not available yet", "Emailing reports starts once calls are recorded and saved. For now, copy the link and send it yourself.");
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Report"
      subtitle="Share this call report with your team."
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={share} disabled={!recipients.length || invalid.length > 0}>Share</DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="share-emails" className={labelClass}>Add people</label>
          <input
            id="share-emails"
            type="text"
            value={emails}
            onChange={(event) => setEmails(event.target.value)}
            placeholder="Enter email addresses"
            className={inputClass}
          />
          {invalid.length > 0 && <p className="text-xs text-red-600 mt-1.5">Check this address: {invalid[0]}</p>}
        </div>

        <div>
          <label htmlFor="share-link" className={labelClass}>Report link</label>
          <div className="flex gap-2">
            <input id="share-link" readOnly value={link} onFocus={(event) => event.target.select()} className={`${inputClass} bg-[#f2f4f6] text-sm text-medium-black`} />
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 px-4 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 whitespace-nowrap cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="share-visibility" className={labelClass}>Who can view</label>
          <div className="relative">
            <select
              id="share-visibility"
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              className={`${inputClass} appearance-none pr-10 cursor-pointer`}
            >
              <option value="people">Only people added</option>
              <option value="team">Anyone on my team</option>
            </select>
            <ChevronDown className="w-[18px] h-[18px] text-dark-black/70 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={includeInsights} onChange={(event) => setIncludeInsights(event.target.checked)} className="sr-only peer" />
          <span className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
            {includeInsights && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
          </span>
          <span className="text-sm text-medium-black">Include coaching insights</span>
        </label>
      </div>
    </DialogModal>
  );
};

export default ShareReportModal;
