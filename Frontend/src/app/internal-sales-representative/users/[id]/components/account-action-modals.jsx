"use client";

import React, { useState } from "react";
import { Bold, Check, ChevronDown, Info, Italic, Link2, List, Mail, Send, Star, CircleCheck } from "lucide-react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import { showSavedToast } from "@/lib/toast";

// Design-only dialogs for the Users → account page. Submitting closes the
// dialog and shows a confirmation; nothing is sent or charged.

const SAMPLE_USER = {
  name: "Jennifer Smith",
  initials: "JS",
  company: "Acme Inc.",
  email: "jennifer.smith@acme.com",
  plan: "Premium",
  avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
  price: "$499.00",
};

const labelClass = "block text-xs font-semibold uppercase tracking-wide text-medium-black mb-2";
const inputClass =
  "w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-dark-black placeholder:text-gray-500 outline-none focus:border-primary transition-colors";

const Select = ({ id, value, onChange, children, placeholder }) => (
  <div className="relative">
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10 cursor-pointer ${value ? "" : "text-gray-500"}`}>
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
    <ChevronDown className="w-4 h-4 text-dark-black/60 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
  </div>
);

const Checkbox = ({ checked, onChange, children }) => (
  <label className="flex items-center gap-2.5 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="sr-only peer" />
    <span className="w-5 h-5 rounded-md border border-gray-300 flex items-center justify-center peer-checked:bg-primary peer-checked:border-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
      {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
    </span>
    <span className="text-sm text-dark-black">{children}</span>
  </label>
);

// ── Send Notification ────────────────────────────────────────────────────────

export const SendNotificationModal = ({ isOpen, onClose, user = SAMPLE_USER }) => {
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [urgent, setUrgent] = useState(false);

  const close = () => {
    setSubject("");
    setMessage("");
    setUrgent(false);
    onClose();
  };

  const send = () => {
    close();
    showSavedToast("Notification sent", `${user.name} will see it in their PitchProX dashboard.`);
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={close}
      title={
        <span className="flex items-center gap-2.5">
          <Mail className="w-6 h-6 text-primary" /> Send Notification
        </span>
      }
      size="lg"
      footer={
        <>
          <DialogButton onClick={close}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={send} disabled={!subject.trim() || !message.trim() || (!inApp && !email)}>
            <Send className="w-4 h-4" /> Send Notification
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4 bg-light-gray rounded-xl p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-dark-black leading-6">{user.name}</p>
            <p className="text-xs text-medium-black truncate">
              {user.company} • {user.email}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
            <Star className="w-3 h-3 fill-current" /> {user.plan} Plan
          </span>
        </div>

        <div>
          <p className={labelClass}>Delivery channel</p>
          <div className="flex items-center gap-6">
            <Checkbox checked={inApp} onChange={setInApp}>In-App</Checkbox>
            <Checkbox checked={email} onChange={setEmail}>Email</Checkbox>
          </div>
        </div>

        <div>
          <label htmlFor="notification-subject" className={labelClass}>Message subject</label>
          <input
            id="notification-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Enter notification subject..."
            className={`${inputClass} bg-light-gray/60`}
          />
        </div>

        <div>
          <label htmlFor="notification-message" className={labelClass}>Message content</label>
          <div className="rounded-xl border border-gray-300 overflow-hidden focus-within:border-primary transition-colors">
            <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-300 bg-light-gray/60 text-dark-black">
              <Bold className="w-4 h-4" />
              <Italic className="w-4 h-4" />
              <span className="w-px h-4 bg-gray-300" />
              <Link2 className="w-4 h-4" />
              <List className="w-4 h-4" />
            </div>
            <textarea
              id="notification-message"
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Compose your message here..."
              className="w-full px-4 py-3 text-sm text-dark-black placeholder:text-gray-500 bg-light-gray/40 outline-none resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border border-gray-300 rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-lg font-bold shrink-0">!</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark-black">Send as Urgent Priority</p>
            <p className="text-xs text-medium-black">Will bypass silent modes and appear at the top of feeds.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={urgent}
            aria-label="Send as urgent priority"
            onClick={() => setUrgent((value) => !value)}
            className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${urgent ? "bg-primary" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${urgent ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <p className="flex items-start gap-2 text-xs text-medium-black">
          <Info className="w-4 h-4 shrink-0" />
          <span>
            Delivery Confirmation: This will be sent to <span className="text-primary">{user.email}</span> and displayed in their PitchProX Dashboard.
          </span>
        </p>
      </div>
    </DialogModal>
  );
};

// ── Issue Refund ─────────────────────────────────────────────────────────────

export const IssueRefundModal = ({ isOpen, onClose, user = SAMPLE_USER }) => {
  const [method, setMethod] = useState("");
  const [type, setType] = useState("full");
  const [amount, setAmount] = useState(user.price.replace("$", ""));
  const [reason, setReason] = useState("customer_request");
  const [notes, setNotes] = useState("");

  const isFull = type === "full";
  const shownAmount = `$${Number(isFull ? user.price.replace("$", "") : amount || 0).toFixed(2)}`;

  const close = () => {
    setMethod("");
    setType("full");
    setAmount(user.price.replace("$", ""));
    setNotes("");
    onClose();
  };

  const proceed = () => {
    close();
    showSavedToast("Refund requested", `${shownAmount} refund for ${user.name} is being processed.`);
  };

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={close}
      title="Issue Refund"
      size="md"
      footer={
        <>
          <DialogButton onClick={close} className="font-semibold">Cancel</DialogButton>
          <DialogButton variant="primary" onClick={proceed} disabled={!method || (!isFull && !(Number(amount) > 0))} className="font-semibold">
            Proceed Refund
          </DialogButton>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4 bg-light-gray rounded-xl border border-gray-200 p-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center font-bold">{user.initials}</div>
          <div>
            <p className="text-base font-semibold text-dark-black">{user.name}</p>
            <p className="text-xs text-medium-black">
              {user.company} • {user.plan} Subscription
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1 bg-secondary/40 text-dark-teal text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
              <CircleCheck className="w-3 h-3" /> Account active
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="refund-method" className={labelClass}>Refund method</label>
          <Select id="refund-method" value={method} onChange={setMethod} placeholder="Select method">
            <option value="original">Original payment method</option>
            <option value="credit">Account credit</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="refund-type" className={labelClass}>Refund type</label>
            <Select id="refund-type" value={type} onChange={setType}>
              <option value="full">Full Refund</option>
              <option value="partial">Partial Refund</option>
            </Select>
          </div>
          <div>
            <label htmlFor="refund-amount" className={labelClass}>Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-dark-black">$</span>
              <input
                id="refund-amount"
                inputMode="decimal"
                disabled={isFull}
                value={isFull ? user.price.replace("$", "") : amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
                className={`${inputClass} pl-8 font-mono disabled:bg-white`}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="refund-reason" className={labelClass}>Reason for refund</label>
          <Select id="refund-reason" value={reason} onChange={setReason}>
            <option value="customer_request">Customer Request</option>
            <option value="billing_error">Billing Error</option>
            <option value="service_issue">Service Issue</option>
            <option value="duplicate">Duplicate Charge</option>
          </Select>
        </div>

        <div>
          <label htmlFor="refund-notes" className={labelClass}>
            Internal notes <span className="normal-case font-normal text-light-black">(optional)</span>
          </label>
          <textarea
            id="refund-notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Provide additional context for this refund request..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="rounded-xl border border-primary/30 bg-light-teal/30 p-4 space-y-2.5">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-dark-teal">
            <Info className="w-4 h-4" /> Refund impact summary
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-medium-black">Amount to be credited</span>
            <span className="font-bold text-dark-black">{shownAmount}</span>
          </div>
          <div className="flex items-center justify-between text-sm border-b border-gray-300 pb-2.5">
            <span className="text-medium-black">Impact on Next Invoice</span>
            <span className={isFull ? "text-red-600" : "text-dark-black"}>{isFull ? "Subscription Cancelled" : "Reduced by refund amount"}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-dark-black">Processing time: 5-10 business days</span>
            <span className="font-semibold text-dark-teal">Standard Priority</span>
          </div>
        </div>
      </div>
    </DialogModal>
  );
};
