"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest, formatDate } from "@/lib/client-api";
import { showError } from "@/lib/alerts";

// Fired after an email is saved, so the lists on the page reload
export const MAIL_CHANGED = "pitchprox:mail-changed";

// Shown for emails saved before an email-sending service exists
export const WAITING_LABEL = "Waiting";

const STATUS = {
  queued: { label: WAITING_LABEL, statusBg: "bg-amber-50 text-amber-700 border border-amber-100", dotBg: "bg-amber-500" },
  sent: { label: "Sent", statusBg: "bg-emerald-50 text-emerald-600 border border-emerald-100", dotBg: "bg-emerald-500" },
  opened: { label: "Opened", statusBg: "bg-blue-50 text-blue-600 border border-blue-100", dotBg: "bg-blue-500" },
};

const sameDay = (a, b) => a.toDateString() === b.toDateString();

// API email → the fields the existing mail lists and detail page read
export function toMailView(mail) {
  const created = new Date(mail.createdAt);
  const time = created.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const status = STATUS[mail.status] ?? STATUS.queued;
  return {
    ...mail,
    name: mail.toEmail,
    email: mail.toEmail,
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
    activity: [
      { label: "Saved", date: formatDate(created), time },
      ...(mail.status === "queued" ? [{ label: "Waiting for email service", date: "Not sent yet", time: "" }] : []),
    ],
  };
}

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
