"use client";

import React, { useState } from "react";
import DialogModal, { DialogButton } from "@/components/modals/dialog-modal";
import PhoneStatusBadge from "./phone-status-badge";

// "Wrong Number" for a contact with several numbers: which one? Only that number is marked; the
// contact keeps its other numbers (client, Nov 9). Render only while open.
export default function ChooseNumberDialog({ contact, onClose, onChoose, title = "Which number is wrong?" }) {
  const [phoneId, setPhoneId] = useState(contact?.phones?.find((phone) => phone.callable)?.id ?? contact?.phones?.[0]?.id ?? "");
  return (
    <DialogModal
      isOpen
      onClose={onClose}
      title={title}
      subtitle={`${contact?.name ?? "This contact"} has several numbers. Only the one you choose is marked; the others can still be called.`}
      size="md"
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" disabled={!phoneId} onClick={() => onChoose(phoneId)}>
            Mark as wrong number
          </DialogButton>
        </>
      }
    >
      <div className="space-y-2" role="radiogroup" aria-label="Phone numbers">
        {(contact?.phones ?? []).map((phone) => (
          <label key={phone.id} className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 cursor-pointer ${phone.id === phoneId ? "border-primary bg-primary/5" : "border-light-gray"}`}>
            <span className="flex items-center gap-2.5">
              <input type="radio" name="wrong-number" value={phone.id} checked={phone.id === phoneId} onChange={() => setPhoneId(phone.id)} className="accent-primary" />
              <span className="text-sm font-semibold text-dark-black">{phone.number}</span>
              <span className="text-xs text-light-black">{phone.label}</span>
            </span>
            <PhoneStatusBadge status={phone.status} />
          </label>
        ))}
      </div>
    </DialogModal>
  );
}
