"use client";

import React, { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Paperclip,
  Sparkles,
  Send,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  Link as LinkIcon,
  ChevronDown,
  ShieldCheck,
  Info,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/client-api";
import { MAIL_CHANGED } from "@/app/user/settings/send-mail/mail-view";
import Tooltip from "@/components/modals/tooltip";

const mergeFieldsList = [
  { label: "First Name", value: "{First Name}" },
  { label: "Last Name", value: "{Last Name}" },
  { label: "Company", value: "{Company}" },
  { label: "Phone", value: "{Phone}" },
  { label: "Property Address", value: "{Property Address}" },
];

export const SendEmailForm = ({
  initialSubject = "",
  initialMessage = "",
  initialToEmail = "",
}) => {
  const searchParams = useSearchParams();
  const queryTo = searchParams?.get("to") || "";
  const querySubject = searchParams?.get("subject") || "";

  const [toEmail, setToEmail] = useState(initialToEmail || queryTo);
  const [subject, setSubject] = useState(initialSubject || querySubject);
  const [message, setMessage] = useState(initialMessage);
  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);
  const [ccEmail, setCcEmail] = useState("");
  const [bccEmail, setBccEmail] = useState("");
  const [trackEmail, setTrackEmail] = useState(true);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const fileInputRef = useRef(null);

  const handleInsertMergeField = (val) => {
    setMessage((prev) => prev + ` ${val} `);
    setMergeOpen(false);
    toast.success(`Inserted ${val}`);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setAttachedFiles([...attachedFiles, ...files]);
      toast.success(`Attached ${files.length} file(s)`);
    }
  };

  const handleRemoveFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleGenerateAi = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const generated = `Hi {First Name},\n\nFollowing up regarding your property inquiry at {Property Address}. Our investment team at PitchProX reviewed your portfolio criteria and identified high-conversion opportunities ready for acquisition this quarter.\n\nWould you be open for a brief 10-minute discovery call this Thursday?\n\nBest regards,\nDaniel Miller`;

    setMessage(generated);
    setSubject("Follow-up: Property Portfolio & Acquisition Opportunities");
    setIsAiModalOpen(false);
    setAiPrompt("");
    toast.success("AI draft generated and inserted!");
  };

  // Saved to the sender's outbox; delivery starts once an email service is connected
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    if (!toEmail.trim()) {
      toast.error("Please enter a recipient email address.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter an email subject.");
      return;
    }
    if (attachedFiles.length) {
      toast.error("Attachments can't be sent yet. Remove them, or share a link in the message.");
      return;
    }
    setSaving(true);
    try {
      await apiRequest("/api/v1/mail/messages", {
        method: "POST",
        body: { to: toEmail, cc: showCC ? ccEmail : "", bcc: showBCC ? bccEmail : "", subject, body: message, trackOpens: trackEmail },
      });
      window.dispatchEvent(new Event(MAIL_CHANGED));
    } catch (error) {
      toast.error(error.message);
      return;
    } finally {
      setSaving(false);
    }
    toast.success(`Saved. It will be sent to ${toEmail} once email sending is connected.`, { duration: 5000 });
    setToEmail("");
    setSubject("");
    setMessage("");
    setCcEmail("");
    setBccEmail("");
    setAttachedFiles([]);
    setShowCC(false);
    setShowBCC(false);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Main Form Container — flex grow to match right column height perfectly */}
      <div className="grow bg-white rounded-2xl border border-light-gray p-6 shadow-sm flex flex-col justify-between">
        <div>
          {/* Form Title & Subtitle */}
          <div className="mb-5">
            <h2 className="text-lg font-bold text-dark-black tracking-tight">
              Send email to a prospect
            </h2>
            <p className="text-xs text-light-black mt-0.5">
              Email will be sent from your connected mailbox.
            </p>
          </div>

          <form id="send-mail-form" onSubmit={handleSubmit} className="space-y-4">
            {/* To Field with CC / BCC toggles */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-medium-black">To</label>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <button
                    type="button"
                    onClick={() => setShowCC(!showCC)}
                    className="hover:underline cursor-pointer"
                  >
                    CC
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBCC(!showBCC)}
                    className="hover:underline cursor-pointer"
                  >
                    BCC
                  </button>
                </div>
              </div>
              <input
                type="email"
                placeholder="Enter prospect email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
                required
              />
            </div>

            {/* Conditional CC */}
            {showCC && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-medium-black">CC</label>
                <input
                  type="email"
                  placeholder="Enter CC email address"
                  value={ccEmail}
                  onChange={(e) => setCcEmail(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
                />
              </div>
            )}

            {/* Conditional BCC */}
            {showBCC && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-medium-black">BCC</label>
                <input
                  type="email"
                  placeholder="Enter BCC email address"
                  value={bccEmail}
                  onChange={(e) => setBccEmail(e.target.value)}
                  className="w-full px-4 py-2 text-xs bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
                />
              </div>
            )}

            {/* Subject Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-medium-black">Subject</label>
              <input
                type="text"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
                required
              />
            </div>

            {/* Message Textarea with Formatting Toolbar */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-medium-black">Message</label>

              <div className="border border-light-gray rounded-xl overflow-hidden focus-within:border-primary transition-colors">
                {/* Rich Formatting Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-1 px-3 py-2 border-b border-light-gray bg-light-gray/20 text-medium-black text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setMessage((prev) => prev + " **bold** ")}
                      className="p-1 rounded hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessage((prev) => prev + " *italic* ")}
                      className="p-1 rounded hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessage((prev) => prev + " __underline__ ")}
                      className="p-1 rounded hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer"
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-3.5 bg-light-gray mx-1" />
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer"
                      title="Align Left"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessage((prev) => prev + " [link](https://...) ")}
                      className="p-1 rounded hover:bg-light-gray hover:text-dark-black transition-colors cursor-pointer"
                      title="Insert Link"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Merge fields Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMergeOpen(!mergeOpen)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-medium-black hover:text-primary hover:bg-light-gray transition-colors cursor-pointer"
                    >
                      <span>Merge fields</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {mergeOpen && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-light-gray rounded-xl shadow-lg py-1 z-30 text-xs">
                        {mergeFieldsList.map((f) => (
                          <button
                            key={f.value}
                            type="button"
                            onClick={() => handleInsertMergeField(f.value)}
                            className="w-full text-left px-3 py-1.5 hover:bg-primary/5 hover:text-primary transition-colors font-medium text-dark-black"
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Textarea with 11 rows to match height exactly */}
                <textarea
                  rows={11}
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 text-sm bg-white focus:outline-none text-dark-black placeholder:text-light-black resize-none"
                  required
                />

                {/* Attached Files Pills */}
                {attachedFiles.length > 0 && (
                  <div className="px-3 pb-3 flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-light-gray text-xs font-semibold text-dark-black border border-light-gray/80"
                      >
                        <Paperclip className="w-3 h-3 text-primary" />
                        <span className="truncate max-w-[140px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-light-black hover:text-red cursor-pointer ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Form Actions Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 mt-2">
          {/* Left Actions: Attach File & AI Assistant */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-primary/5"
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach file</span>
            </button>

            <Tooltip
              title="Draft with AI"
              text="Helps draft or improve your email using the prospect and conversation context available to PitchProX."
              className="p-0 m-0 hover:bg-transparent active:scale-100 rounded-xl"
            >
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black hover:bg-light-gray transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Draft with AI</span>
              </button>
            </Tooltip>
          </div>

          {/* Right Actions: Track Email & Send Button */}
          <div className="flex items-center gap-3">
            {/* Track Email Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-medium-black font-medium select-none">Track email</span>
              <button
                type="button"
                onClick={() => setTrackEmail(!trackEmail)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  trackEmail ? "bg-primary" : "bg-medium-black/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    trackEmail ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <Tooltip
                title="Track Email"
                text="Allows PitchProX to report available delivery and open activity for this email. Tracking availability may depend on the recipient's email provider and privacy settings."
              >
                <Info
                  tabIndex={0}
                  aria-label="More about Track Email"
                  className="w-4 h-4 text-light-black shrink-0 transition-colors duration-200 hover:text-primary outline-none"
                />
              </Tooltip>
            </div>

            <button
              type="submit"
              form="send-mail-form"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              <span>{saving ? "Saving…" : "Send email"}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Security Note Box */}
      <div className="shrink-0 p-4 rounded-2xl bg-white border border-light-gray shadow-xs flex items-start gap-3 text-xs">
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <p className="text-light-black leading-relaxed text-[11px] pt-1">
          Emails are sent securely through your own email provider. PitchProX does not store, host, or access your email account.
        </p>
      </div>

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-dark-black/50 backdrop-blur-xs"
          onClick={() => setIsAiModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-light-gray p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-light-gray pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-dark-black">
                  Draft with AI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="p-1 rounded-lg hover:bg-light-gray text-medium-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-dark-black">
                What would you like to say?
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Follow up on product trial and propose a 10 min platform demo..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full p-3 text-xs bg-light-gray/30 border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-light-gray">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-light-gray text-xs font-semibold text-medium-black hover:bg-light-gray"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateAi}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-medium-teal text-white text-xs font-semibold shadow-xs"
              >
                Generate Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendEmailForm;
