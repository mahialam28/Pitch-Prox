"use client";

import React, { useState } from "react";
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
import Tooltip from "@/components/modals/tooltip";
import { apiRequest } from "@/lib/client-api";
import { MAIL_CHANGED } from "../mail-view";

// initialTemplate: a template, an after-call draft, or a saved draft (draftId) being edited
export default function SendEmailForm({ initialTemplate }) {
  const [draftId, setDraftId] = useState(initialTemplate?.draftId ?? null);
  const [toEmail, setToEmail] = useState(initialTemplate?.to || "");
  const [subject, setSubject] = useState(
    initialTemplate?.subject || initialTemplate?.title || ""
  );
  const [message, setMessage] = useState(
    initialTemplate?.body || initialTemplate?.content || initialTemplate?.preview || ""
  );
  const [showCC, setShowCC] = useState(Boolean(initialTemplate?.cc));
  const [showBCC, setShowBCC] = useState(Boolean(initialTemplate?.bcc));
  const [ccEmail, setCcEmail] = useState(initialTemplate?.cc || "");
  const [bccEmail, setBccEmail] = useState(initialTemplate?.bcc || "");
  const [trackEmail, setTrackEmail] = useState(initialTemplate?.trackOpens ?? true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [saving, setSaving] = useState(false);

  const handleGenerateAi = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const generated = `Hi {First Name},\n\nFollowing up regarding our discussion! Our team reviewed your requirements and prepared tailored recommendations ready for review this week.\n\nWould you be open for a brief 10-minute call this Thursday to go over next steps?\n\nBest regards,\nPitchProX Team`;

    setMessage(generated);
    setSubject("Follow-up: PitchProX Overview & Next Steps");
    setIsAiModalOpen(false);
    setAiPrompt("");
    toast.success("AI draft generated and inserted!");
  };

  const fields = () => ({ to: toEmail, cc: showCC ? ccEmail : "", bcc: showBCC ? bccEmail : "", subject, body: message, trackOpens: trackEmail });

  const reset = () => {
    setDraftId(null);
    setToEmail("");
    setSubject("");
    setMessage("");
    setCcEmail("");
    setBccEmail("");
    setShowCC(false);
    setShowBCC(false);
  };

  // Sent through PitchProX's email service (Postmark) as "Your Name via PitchProX"; replies come to you
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!toEmail.trim()) {
      toast.error("Please enter a recipient email.");
      return;
    }
    setSaving(true);
    let sent;
    try {
      sent = draftId
        ? await apiRequest(`/api/v1/mail/messages/${draftId}`, { method: "PATCH", body: { ...fields(), send: true } })
        : await apiRequest("/api/v1/mail/messages", { method: "POST", body: fields() });
      window.dispatchEvent(new Event(MAIL_CHANGED));
    } catch (error) {
      toast.error(error.message);
      return;
    } finally {
      setSaving(false);
    }
    toast.success(
      sent.message.status === "waiting" ? `Saved. It goes to ${toEmail} as soon as email sending is switched on.` : `Sending to ${toEmail}.`,
      { duration: 5000 }
    );
    reset();
  };

  // Drafts can be incomplete; they stay private to you until sent
  const saveDraft = async () => {
    setSaving(true);
    try {
      const result = draftId
        ? await apiRequest(`/api/v1/mail/messages/${draftId}`, { method: "PATCH", body: fields() })
        : await apiRequest("/api/v1/mail/messages", { method: "POST", body: { ...fields(), draft: true } });
      setDraftId(result.message.id);
      window.dispatchEvent(new Event(MAIL_CHANGED));
      toast.success("Draft saved. Open it from your emails to finish it later.");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteDraft = async () => {
    if (!draftId || !window.confirm("Delete this draft?")) return;
    setSaving(true);
    try {
      await apiRequest(`/api/v1/mail/messages/${draftId}`, { method: "DELETE" });
      window.dispatchEvent(new Event(MAIL_CHANGED));
      toast.success("Draft deleted.");
      reset();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Form Container */}
      <div className="grow bg-white rounded-2xl border border-light-gray p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-dark-black">{draftId ? "Finish your draft" : "Send email to a prospect"}</h2>
          <p className="text-xs text-light-black mt-0.5">
            Sent by PitchProX as &quot;Your Name via PitchProX&quot;. Replies come straight to your own email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* To Field */}
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
                className="w-full px-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
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
                className="w-full px-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary text-dark-black placeholder:text-light-black transition-colors"
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
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 px-3 py-2 bg-light-gray border-b border-light-gray text-medium-black text-xs flex-wrap">
                <div className="flex items-center gap-3">
                  <button type="button" className="hover:text-dark-black font-bold">
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-dark-black italic">
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-dark-black underline">
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-3 w-[1px] bg-light-black" />
                  <button type="button" className="hover:text-dark-black">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-dark-black">
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="hover:text-dark-black">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-dark-black font-medium cursor-pointer"
                >
                  <span>Merge fields</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>

              {/* Input Area */}
              <textarea
                rows={11}
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3.5 text-sm bg-white focus:outline-none text-dark-black placeholder:text-light-black resize-none"
                required
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs font-semibold text-dark-black/70 hover:text-dark-black cursor-pointer"
              >
                <Paperclip className="w-4 h-4 text-medium-black" />
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
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-dark-black/70 bg-light-gray hover:bg-primary/5 border border-light-gray rounded-xl transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Draft with AI</span>
                </button>
              </Tooltip>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
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

              {draftId && (
                <button
                  type="button"
                  onClick={deleteDraft}
                  disabled={saving}
                  className="text-xs font-semibold text-red hover:underline cursor-pointer disabled:opacity-50"
                >
                  Delete draft
                </button>
              )}
              <button
                type="button"
                onClick={saveDraft}
                disabled={saving}
                className="px-4 py-2.5 text-sm font-semibold text-dark-black/80 bg-white border border-light-gray hover:border-primary/40 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Save draft
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>{saving ? "Working…" : "Send email"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security Note Banner */}
      <div className="shrink-0 bg-light-gray border border-light-gray rounded-2xl p-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-xs text-medium-black leading-relaxed">
          <p className="font-semibold text-dark-black/70">Emails are sent securely through PitchProX&apos;s email service.</p>
          <p>Replies go straight to your own inbox. PitchProX never signs in to your email account.</p>
        </div>
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
}
