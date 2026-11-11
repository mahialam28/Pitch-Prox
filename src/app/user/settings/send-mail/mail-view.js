"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest, formatDate } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Fired after an email is saved, so the lists on the page reload
export const MAIL_CHANGED = "pitchprox:mail-changed";

// Shown while email sending (Postmark) isn't switched on yet
export const WAITING_LABEL = "Waiting";

const tone = {
  amber: { statusBg: "bg-amber-50 text-amber-700 border border-amber-100", dotBg: "bg-amber-500" },
  green: { statusBg: "bg-emerald-50 text-emerald-600 border border-emerald-100", dotBg: "bg-emerald-500" },
  blue: { statusBg: "bg-blue-50 text-blue-600 border border-blue-100", dotBg: "bg-blue-500" },
  gray: { statusBg: "bg-light-gray text-medium-black border border-light-gray", dotBg: "bg-light-black" },
  red: { statusBg: "bg-red/10 text-red border border-red/20", dotBg: "bg-red" },
};
// API status → label and colors
export const MAIL_STATUS = {
  draft: { label: "Draft", ...tone.gray },
  waiting: { label: WAITING_LABEL, ...tone.amber },
  sending: { label: "Sending", ...tone.amber },
  sent: { label: "Sent", ...tone.green },
  delivered: { label: "Delivered", ...tone.green },
  opened: { label: "Opened", ...tone.blue },
  bounced: { label: "Bounced", ...tone.red },
  failed: { label: "Not sent", ...tone.red },
};

const sameDay = (a, b) => a.toDateString() === b.toDateString();
const stamp = (value) => {
  const date = new Date(value);
  return { date: formatDate(date), time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) };
};

// API email → the fields the existing mail lists and detail page read
export function toMailView(mail) {
  const created = new Date(mail.updatedAt || mail.createdAt);
  const time = created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const status = MAIL_STATUS[mail.status] ?? MAIL_STATUS.waiting;
  const activity =
    mail.status === "draft"
      ? [{ label: "Saved as draft", ...stamp(created) }]
      : [
          { label: "Written", ...stamp(mail.createdAt) },
          ...(mail.status === "waiting" ? [{ label: "Waiting for email sending to be switched on", date: "Not sent yet", time: "" }] : []),
          ...(mail.sentAt ? [{ label: "Sent", ...stamp(mail.sentAt) }] : []),
          ...(mail.deliveredAt ? [{ label: "Delivered", ...stamp(mail.deliveredAt) }] : []),
          ...(mail.openedAt ? [{ label: "Opened", ...stamp(mail.openedAt) }] : []),
          ...(mail.bouncedAt ? [{ label: "Bounced", ...stamp(mail.bouncedAt) }] : []),
          ...(mail.status === "failed" ? [{ label: "Not sent", date: mail.deliveryNote || "", time: "" }] : []),
        ];
  return {
    ...mail,
    statusKey: mail.status,
    isDraft: mail.status === "draft",
    name: mail.toEmail || "No recipient yet",
    email: mail.toEmail || "No recipient yet",
    subject: mail.subject || "(no subject)",
    sender: { name: mail.senderName, email: mail.senderEmail },
    status: status.label,
    statusBg: status.statusBg,
    dotBg: status.dotBg,
    messageId: mail.id,
    date: sameDay(created, new Date()) ? "Today" : formatDate(created),
    dateFull: formatDate(created),
    time: sameDay(created, new Date()) ? time : formatDate(created),
    body: mail.body.split(/\n{2,}/),
    attachments: [],
    activity,
  };
}

// Where a click on an email goes: drafts open in the compose form, sent ones in the reader
export const mailHref = (mailBase, mail) => (mail.isDraft ? `${mailBase}?edit=${encodeURIComponent(mail.id)}` : `${mailBase}/emails/${mail.id}`);

export function useMail() {
  const [mails, setMails] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const load = useCallback(() => {
    return apiRequest("/api/v1/mail/messages")
      .then((data) => setMails(data.results.map(toMailView)))
      .catch((error) => showError("Emails not loaded", error.message))
      .finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    load();
    window.addEventListener(MAIL_CHANGED, load);
    return () => window.removeEventListener(MAIL_CHANGED, load);
  }, [load]);
  return { mails, loaded };
}

// ?edit=<id>: your saved draft, shaped for the compose form (null until loaded, or if it was already sent)
export function useEditedDraft() {
  const id = useSearchParams()?.get("edit") ?? null;
  const [draft, setDraft] = useState(null);
  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    apiRequest(`/api/v1/mail/messages/${encodeURIComponent(id)}`)
      .then(({ message }) => {
        if (cancelled) return;
        if (message.status !== "draft") return showError("Already sent", "This email was already sent, so it can't be edited.");
        setDraft({ id: `edit-${message.id}`, draftId: message.id, to: message.toEmail, cc: message.cc ?? "", bcc: message.bcc ?? "", subject: message.subject, body: message.body, trackOpens: Boolean(message.trackOpens) });
      })
      .catch((error) => !cancelled && showError("Draft not loaded", error.message));
    return () => {
      cancelled = true;
    };
  }, [id]);
  return id && draft?.draftId === id ? draft : null;
}
