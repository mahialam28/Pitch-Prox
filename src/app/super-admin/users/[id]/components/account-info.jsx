"use client";

import React, { useState } from "react";
import { Edit2, CheckCircle2, Clock } from "lucide-react";

// Account Information (Overview). `account` is the live customer detail; `onSave(owner, profile)`
// saves what changed. Without `account` (sample screens) it shows the design's example values.
const SAMPLE = {
  fullName: "Jennifer Smith",
  email: "jennifer.smith@acme.com",
  activated: true,
  phone: "(555) 123-4567",
  company: "Acme Inc.",
  industry: "Real Estate",
  timeZone: "(GMT-05:00) Eastern Time (US & Canada)",
  rep: "Daniel Miller",
};

const fromAccount = (account) =>
  account
    ? {
        fullName: account.owner?.name ?? "",
        email: account.owner?.email ?? "",
        activated: Boolean(account.owner?.activated),
        phone: account.profile.phone ?? "",
        company: account.company,
        industry: account.profile.industry ?? "",
        timeZone: account.profile.timezone ?? "",
        rep: account.rep?.name ?? "Self sign-up (no rep)",
      }
    : SAMPLE;

const inputClass = "w-full px-3 py-1.5 rounded-xl border border-light-gray text-xs font-semibold text-dark-black focus:outline-none focus:border-primary";

const Row = ({ label, children }) => (
  <div className="grid grid-cols-12 gap-3 items-center py-0.5">
    <span className="col-span-4 text-light-black font-medium">{label}</span>
    <div className="col-span-8 flex items-center gap-1.5 min-w-0">{children}</div>
  </div>
);

const AccountInfo = ({ account = null, canEdit = true, onSave }) => {
  const [data, setData] = useState(() => fromAccount(account));
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  // Show fresh values whenever the page reloads the account (and we're not mid-edit)
  const [shown, setShown] = useState(account);
  if (shown !== account && !isEditing) {
    setShown(account);
    setData(fromAccount(account));
  }

  const handleSave = async () => {
    if (!onSave) return setIsEditing(false);
    setSaving(true);
    try {
      const base = fromAccount(account);
      const ownerChanged = data.fullName !== base.fullName || data.email !== base.email;
      const profileChanged = data.phone !== base.phone || data.industry !== base.industry || data.timeZone !== base.timeZone || data.company !== base.company;
      await onSave(
        ownerChanged ? { name: data.fullName, email: data.email } : null,
        profileChanged ? { phone: data.phone, industry: data.industry, timezone: data.timeZone, company: data.company } : null
      );
      setIsEditing(false);
    } catch {
      /* reported by the caller; stay in edit mode */
    } finally {
      setSaving(false);
    }
  };

  const field = (key, type = "text") =>
    isEditing ? (
      <input type={type} value={data[key]} onChange={(event) => setData({ ...data, [key]: event.target.value })} aria-label={key} className={inputClass} />
    ) : (
      <span className="font-semibold text-dark-black/85 truncate">{data[key] || "—"}</span>
    );

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-light-gray shadow-xs w-full h-full flex flex-col">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="text-base font-bold text-dark-black/85 tracking-tight">Account Information</h3>
        {canEdit && (
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setData(fromAccount(account));
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-light-black hover:text-dark-black cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-light-gray bg-white hover:bg-light-gray text-xs font-semibold text-dark-black/80 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <Edit2 className="w-3 h-3 text-light-black" />
              <span>{isEditing ? (saving ? "Saving…" : "Save") : "Edit"}</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 text-xs">
        <Row label="Full Name">{field("fullName")}</Row>
        <Row label="Email">
          {field("email", "email")}
          {!isEditing &&
            (data.activated ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 shrink-0" aria-label="Activated" />
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 shrink-0">
                <Clock className="w-3 h-3" /> Not activated
              </span>
            ))}
        </Row>
        <Row label="Phone">{field("phone")}</Row>
        <Row label="Company">{field("company")}</Row>
        <Row label="Industry">{field("industry")}</Row>
        <Row label="Time Zone">{field("timeZone")}</Row>
        <Row label="Account Rep">
          <span className="font-semibold text-dark-black/85">{data.rep}</span>
        </Row>
      </div>
    </div>
  );
};

export default AccountInfo;
