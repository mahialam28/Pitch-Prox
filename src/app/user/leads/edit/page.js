"use client";

import { usePortal } from "@/components/shared/use-portal";
import PhoneNumbersEditor, { phoneRowsFrom, phonesPayload } from "@/components/contacts/phone-numbers-editor";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, User, Mail, MapPin, Home, FileText } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import DashboardButton from "@/components/buttons/dashboardButton";
import { leadStageOptions, leadStatusOptions, leadTypeOptions, userOutcomeOptions } from "@/utils.js/lead-options";
import { apiRequest } from "@/lib/client-api";
import { showError, showSuccess } from "@/lib/alerts";

const stateOptions = [
  { value: "NY", label: "New York" },
  { value: "CA", label: "California" },
  { value: "FL", label: "Florida" },
  { value: "TX", label: "Texas" },
];

const leadStageOptionsList = leadStageOptions;
const statusOptions = leadStatusOptions;
const outcomeOptions = userOutcomeOptions.map(({ value, label }) => ({ value, label }));


function EditLeadForm() {
  const portal = usePortal();
  const router = useRouter();
  const leadId = useSearchParams().get("id");

  // ── Form State (filled from the saved lead) ──
  const [loadState, setLoadState] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phones, setPhones] = useState([{ number: "", label: "Mobile" }]);
  const [email, setEmail] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [leadType, setLeadType] = useState("");
  const [leadStage, setLeadStage] = useState("New");
  const [status, setStatus] = useState("Unknown");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [addToFollowUp, setAddToFollowUp] = useState(false);

  useEffect(() => {
    if (!leadId) return;
    let active = true;
    apiRequest(`/api/v1/leads/${encodeURIComponent(leadId)}`)
      .then(({ lead }) => {
        if (!active) return;
        setFullName(lead.name || "");
        setPhones(phoneRowsFrom(lead));
        setEmail(lead.email || "");
        setPropertyAddress(lead.propertyAddress || "");
        setCity(lead.city || "");
        setState(lead.state || "");
        setZipCode(lead.zipCode || "");
        setLeadType(lead.leadType || "");
        setLeadStage(lead.stage || "New");
        setStatus(lead.status || "Unknown");
        setOutcome(lead.outcome || "");
        setNotes(lead.notes || "");
        setLoadState("ready");
      })
      .catch((error) => active && setLoadState(error.message));
    return () => { active = false; };
  }, [leadId]);

  // ── Handlers ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest(`/api/v1/leads/${encodeURIComponent(leadId)}`, {
        method: "PATCH",
        body: {
          name: fullName,
          phones: phonesPayload(phones),
          email, propertyAddress, city, state, zipCode,
          leadType: leadType || null,
          stage: leadStage,
          status,
          outcome: outcome || null,
          notes,
        },
      });
      await showSuccess("Lead updated", "Your changes have been saved.");
      router.push(`${portal.base}/leads`);
    } catch (error) {
      await showError("Lead not updated", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!leadId || loadState !== "ready") {
    const isLoading = Boolean(leadId) && loadState === "loading";
    const message = !leadId ? "No lead was selected." : isLoading ? "Loading lead…" : loadState;
    return (
      <div className="w-full bg-white rounded-2xl border border-light-gray shadow-sm p-8 flex flex-col items-center text-center gap-3">
        <p className="text-sm font-semibold text-dark-black/80">{message}</p>
        {!isLoading && (
          <Link href={`${portal.base}/leads`} className="text-xs font-semibold text-primary hover:underline">
            Back to leads
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Title variant="small" className="!text-dark-black/80">
            Edit Lead
          </Title>
          <Text variant="small">
            Update the details for this prospect.
          </Text>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
              <User className="w-5 h-5" />
            </div>
            <div>
              <Text variant="regular" className="font-bold">
                Contact Information
              </Text>
              <Text variant="smaller" className="mt-0.5">
                Basic details about this lead.
              </Text>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-medium-black">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black placeholder-light-black"
              required
            />
          </div>

          {/* Phone Numbers: each with a type, and the status it got after calls */}
          <PhoneNumbersEditor value={phones} onChange={setPhones} />

          {/* Email */}
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-semibold text-medium-black">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-black pointer-events-none" />
              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black placeholder-light-black"
              />
            </div>
          </div>
        </div>

        {/* Property Information */}
        <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <Text variant="regular" className="font-bold">
                Property Information
              </Text>
              <Text variant="smaller" className="mt-0.5">
                Details about the property associated with this lead.
              </Text>
            </div>
          </div>

          {/* Property Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-medium-black">
              {portal.addressLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-black pointer-events-none" />
              <input
                type="text"
                placeholder="Enter property address"
                value={propertyAddress}
                onChange={(e) => setPropertyAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black placeholder-light-black"
                required
              />
            </div>
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-medium-black">
                City
              </label>
              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black placeholder-light-black"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-medium-black">
                State
              </label>
              <SettingsDropdown
                label="Select state"
                items={stateOptions}
                selected={state}
                onSelect={setState}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-medium-black">
                Zip Code
              </label>
              <input
                type="text"
                placeholder="Enter zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black placeholder-light-black"
              />
            </div>
          </div>

          {/* Lead Type */}
          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-semibold text-medium-black">
              Lead Type <span className="text-red-500">*</span>
            </label>
            <SettingsDropdown
              label="Select lead type"
              items={portal.leadTypes}
              selected={leadType}
              onSelect={setLeadType}
              className="w-full"
            />
          </div>

          {/* Lead Stage, Status, Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-medium-black">
                Lead Stage
              </label>
              <SettingsDropdown
                label="Select stage"
                items={leadStageOptionsList}
                selected={leadStage}
                onSelect={setLeadStage}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-medium-black">
                Status
              </label>
              <SettingsDropdown
                label="Select status"
                items={statusOptions}
                selected={status}
                onSelect={setStatus}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-medium-black">
                Outcome
              </label>
              <SettingsDropdown
                label="Select outcome"
                items={portal.outcomes.map(({ value, label }) => ({ value, label }))}
                selected={outcome}
                onSelect={setOutcome}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-2xl border border-light-gray shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <Text variant="regular" className="font-bold">
                Additional Information
              </Text>
              <Text variant="smaller" className="mt-0.5">
                Notes and follow-up preferences.
              </Text>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-medium-black">
              Notes
            </label>
            <div className="relative">
              <textarea
                rows={4}
                maxLength={500}
                placeholder="Add any notes about this lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 text-sm bg-white border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-colors text-dark-black placeholder-light-black resize-none"
              />
              <span className="absolute right-3 bottom-3 text-[10px] text-light-black">
                {notes.length} / 500
              </span>
            </div>
          </div>

          {/* Follow-up checkbox */}
          <div className="flex items-start gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddToFollowUp(!addToFollowUp)}
              className={`mt-0.5 h-5 w-5 rounded flex items-center justify-center border-2 transition-colors cursor-pointer shrink-0 ${
                addToFollowUp
                  ? "bg-primary border-primary text-white"
                  : "border-light-gray bg-white"
              }`}
            >
              {addToFollowUp && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-dark-black">
                Add to follow-up queue
              </span>
              <span className="text-xs text-light-black">
                This lead will be added to your follow-up queue.
              </span>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`${portal.base}/leads`}
            className="px-5 py-2.5 text-sm font-semibold text-medium-black hover:text-dark-black transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <DashboardButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Update Lead"}
          </DashboardButton>
        </div>
      </form>
    </div>
  );
}

export default function EditLeadPage() {
  return (
    <Suspense fallback={null}>
      <EditLeadForm />
    </Suspense>
  );
}
