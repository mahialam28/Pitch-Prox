"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Paperclip, Send, Check, Mail, FileText } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import { apiRequest } from "@/lib/client-api";
import { toMailView } from "../../mail-view";
import { usePortal } from "@/components/shared/use-portal";

const activityIcons = {
  Sent: Send,
  Delivered: Check,
  Opened: Mail,
  "Saved as draft": FileText,
};

export default function EmailDetailPage() {
  const portal = usePortal();
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [mail, setMail] = useState(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    let active = true;
    apiRequest(`/api/v1/mail/messages/${encodeURIComponent(id)}`)
      .then((data) => { if (active) { setMail(toMailView(data.message)); setState("ready"); } })
      .catch(() => active && setState("missing"));
    return () => { active = false; };
  }, [id]);

  if (state === "loading") {
    return <div className="w-full bg-white rounded-2xl border border-light-gray p-10 text-center text-sm text-light-black">Loading email…</div>;
  }

  if (!mail) {
    return (
      <div className="w-full flex flex-col gap-4 sm:gap-6">
        <Link
          href={`${portal.mailBase}/emails`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to emails
        </Link>
        <div className="bg-white rounded-2xl border border-light-gray p-10 text-center">
          <Text variant="small" className="text-light-black">
            Email not found.
          </Text>
          <Link
            href={`${portal.mailBase}/emails`}
            className="inline-block mt-4 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-medium-teal rounded-xl transition-all duration-200 shadow-sm"
          >
            View all emails
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* ── Header ── */}
      <div className="w-full flex flex-col gap-3">
        <Link
          href={`${portal.mailBase}/emails`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-medium-teal transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to emails
        </Link>

        <div className="flex flex-col gap-1 min-w-0">
          <Title variant="small" className="!text-dark-black/80 font-bold">
            {mail.subject}
          </Title>
          <Text variant="small" className="text-medium-black">
            Full preview of the email sent to {mail.name}.
          </Text>
        </div>
      </div>

      {/* ── Main Grid Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column: Email Reader View */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-light-gray shadow-sm flex flex-col justify-between min-h-[620px]">
          <div>
            {/* Metadata Header */}
            <div className="space-y-3 text-xs sm:text-sm text-light-black pb-6 border-b border-light-gray">
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3 sm:col-span-2 font-medium">From:</span>
                <span className="col-span-9 sm:col-span-10 font-semibold text-dark-black">
                  {mail.sender.name}{" "}
                  <span className="text-light-black font-normal">
                    &lt;{mail.sender.email}&gt;
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3 sm:col-span-2 font-medium">To:</span>
                <span className="col-span-9 sm:col-span-10 font-semibold text-dark-black">
                  {mail.name}{" "}
                  <span className="text-light-black font-normal">
                    &lt;{mail.email}&gt;
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3 sm:col-span-2 font-medium">CC/BCC:</span>
                <span className="col-span-9 sm:col-span-10 text-light-black/70">—</span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3 sm:col-span-2 font-medium">Subject:</span>
                <span className="col-span-9 sm:col-span-10 font-bold text-dark-black">
                  {mail.subject}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-3 sm:col-span-2 font-medium">Date:</span>
                <span className="col-span-9 sm:col-span-10 font-semibold text-medium-black">
                  {mail.dateFull} at {mail.time}
                </span>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="pt-6 space-y-4 text-xs sm:text-sm text-medium-black leading-relaxed font-normal">
              {Array.isArray(mail.body) ? (
                mail.body.map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p className="whitespace-pre-wrap">{mail.body}</p>
              )}
              <div className="pt-2">
                <p>Best,</p>
                <p className="font-semibold text-dark-black">{mail.sender.name}</p>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="mt-8 pt-6">
            {mail.attachments && mail.attachments.length > 0 ? (
              <div className="space-y-2">
                {mail.attachments.map((att, i) => (
                  <div
                    key={i}
                    className="w-full px-4 py-3 border border-light-gray rounded-2xl flex items-center gap-3 bg-light-gray/50"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-light-gray text-primary shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-dark-black truncate">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-light-black">{att.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full py-4 border-2 border-dashed border-light-gray rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-light-black bg-light-gray/50">
                <Paperclip className="w-4 h-4" />
                <span>No attachments</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Activity */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          {/* Email Details Box */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm">
            <h3 className="text-sm font-bold text-dark-black mb-4">Email Details</h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-4 text-light-black font-medium">From</span>
                <div className="col-span-8 font-medium text-dark-black leading-tight">
                  {mail.sender.name}
                  <br />
                  <span className="text-light-black font-normal">
                    &lt;{mail.sender.email}&gt;
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-4 text-light-black font-medium">To</span>
                <div className="col-span-8 font-medium text-dark-black leading-tight">
                  {mail.name}
                  <br />
                  <span className="text-light-black font-normal">
                    &lt;{mail.email}&gt;
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <span className="col-span-4 text-light-black font-medium">CC/BCC</span>
                <span className="col-span-8 text-light-black">—</span>
              </div>

              <div className="grid grid-cols-12 gap-2 pt-1">
                <span className="col-span-4 text-light-black font-medium">Message ID</span>
                <span className="col-span-8 font-mono text-[10px] text-medium-black break-all leading-tight">
                  {mail.messageId}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Activity Box */}
          <div className="bg-white rounded-2xl p-6 border border-light-gray shadow-sm">
            <h3 className="text-sm font-bold text-dark-black mb-6">Delivery Activity</h3>

            <div className="relative pl-2 space-y-6">
              {/* Vertical Connector Line */}
              <div className="absolute left-[19px] top-3 bottom-3 w-[2px] bg-primary z-0" />

              {mail.activity &&
                mail.activity.map((step, i) => {
                  const Icon = activityIcons[step.label] || Send;
                  return (
                    <div
                      key={i}
                      className="relative z-10 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 ring-4 ring-white shadow-xs">
                          <Icon
                            className={
                              step.label === "Sent"
                                ? "w-4 h-4 -rotate-12"
                                : "w-4 h-4"
                            }
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-dark-black leading-tight">
                            {step.label}
                          </h4>
                          <p className="text-[11px] font-medium text-light-black mt-0.5">
                            {step.date}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-light-black whitespace-nowrap">
                        {step.time}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
