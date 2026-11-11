"use client";

import { usePortal } from "@/components/shared/use-portal";
import PhoneNumbersEditor, { phoneRowsFrom, phonesPayload } from "@/components/contacts/phone-numbers-editor";
import React, { useState } from "react";
import Link from "next/link";
import { User, Mail, Home, FileText } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import DashboardButton from "@/components/buttons/dashboardButton";
import { leadStageOptions, leadStatusOptions, userOutcomeOptions } from "@/utils.js/lead-options";

const stateOptions = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const leadTypeOptions = [
  { value: "Expired Listings", label: "Expired Listings" },
  { value: "Pre-Expired Listings", label: "Pre-Expired Listings" },
  { value: "FSBO", label: "FSBO" },
  { value: "Absentee Owners", label: "Absentee Owners" },
  { value: "Circle Prospecting", label: "Circle Prospecting" },
  { value: "Just Listed", label: "Just Listed" },
  { value: "Just Sold", label: "Just Sold" },
  { value: "Probate", label: "Probate" },
  { value: "Trust & Estate", label: "Trust & Estate" },
  { value: "Pre-Foreclosure", label: "Pre-Foreclosure" },
  { value: "Foreclosure / REO", label: "Foreclosure / REO" },
  { value: "Divorce", label: "Divorce" },
  { value: "Tax Delinquent", label: "Tax Delinquent" },
  { value: "Vacant Properties", label: "Vacant Properties" },
  { value: "Investor / Cash Buyers", label: "Investor / Cash Buyers" },
  { value: "Past Clients & Sphere", label: "Past Clients & Sphere" },
];

const statusOptions = leadStatusOptions;
const outcomeOptions = userOutcomeOptions.map(({ value, label }) => ({ value, label }));


// Shared by Add Prospect and Edit Prospect. `onSubmit` receives the form
// values and should throw to keep the user on the page.
export default function ProspectForm({ initialValues = {}, title, description, submitLabel, onSubmit }) {
  const portal = usePortal();
  // ── Form State ──
  const [fullName, setFullName] = useState(initialValues.name || "");
  const [phones, setPhones] = useState(() => phoneRowsFrom(initialValues));
  const [email, setEmail] = useState(initialValues.email || "");
  const [propertyAddress, setPropertyAddress] = useState(initialValues.propertyAddress || "");
  const [city, setCity] = useState(initialValues.city || "");
  const [state, setState] = useState(initialValues.state || "");
  const [zipCode, setZipCode] = useState(initialValues.zipCode || "");
  const [leadType, setLeadType] = useState(initialValues.leadType || "");
  const [leadStage, setLeadStage] = useState(initialValues.stage || "New");
  const [status, setStatus] = useState(initialValues.status || "Unknown");
  const [outcome, setOutcome] = useState(initialValues.outcome || "");
  const [notes, setNotes] = useState(initialValues.notes || "");
  const [saving, setSaving] = useState(false);

  // ── Handlers ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        name: fullName,
        phones: phonesPayload(phones),
        email,
        propertyAddress,
        city,
        state,
        zipCode,
        leadType: leadType || null,
        stage: leadStage,
        status,
        outcome: outcome || null,
        notes,
      });
    } catch {
      /* onSubmit reports its own error */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Title variant="small" className="!text-dark-black/80">
            {title}
          </Title>
          <Text variant="small">
            {description}
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
                Basic details about this prospect.
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

          {/* Email Address */}
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
                Details about the property associated with this prospect.
              </Text>
            </div>
          </div>

          {/* Property Address */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-medium-black">
              {portal.addressLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-light-black pointer-events-none" />
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
                items={leadStageOptions}
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
                Notes about this prospect.
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
        </div>

        {/* Form Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`${portal.base}/crm`}
            className="px-5 py-2.5 text-sm font-semibold text-medium-black hover:text-dark-black transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <DashboardButton type="submit" disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </DashboardButton>
        </div>
      </form>
    </div>
  );
}
