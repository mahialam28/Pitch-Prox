"use client";

import { usePortal } from "@/components/shared/use-portal";
import PhoneNumbersEditor, { phoneRowsFrom, phonesPayload } from "@/components/contacts/phone-numbers-editor";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, User, Mail, MapPin, Home, FileText } from "lucide-react";
import Title from "@/components/texts/title";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import DashboardButton from "@/components/buttons/dashboardButton";
import { leadTypeOptions } from "@/utils.js/lead-options";
import { showError, showSuccess } from "@/lib/alerts";
import { apiRequest } from "@/lib/client-api";

const stateOptions = [
  { value: "NY", label: "New York" },
  { value: "CA", label: "California" },
  { value: "FL", label: "Florida" },
  { value: "TX", label: "Texas" },
];


export default function AddLeadPage() {
  const portal = usePortal();
  const router = useRouter();
  // ── Form State ──
  const [fullName, setFullName] = useState("");
  const [phones, setPhones] = useState([{ number: "", label: "Mobile" }]);
  const [email, setEmail] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [leadType, setLeadType] = useState("");
  const [notes, setNotes] = useState("");
  const [addToFollowUp, setAddToFollowUp] = useState(true);

  // ── Handlers ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      fullName, phones: phonesPayload(phones), email, propertyAddress,
      city, state, zipCode, leadType, notes, addToFollowUp,
    };
    try {
      await apiRequest("/api/v1/leads", { method: "POST", body: formData });
    } catch (error) {
      await showError("Lead not saved", error.message);
      return;
    }
    await showSuccess("Lead saved", "The new lead has been added to your workspace.");
    router.push(`${portal.base}/leads`);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Title variant="small" className="!text-dark-black/80">
            Add New Lead
          </Title>
          <Text variant="small">
            Enter the details of the new prospect to start tracking their progress.
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
                Basic details about your new lead.
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
          <DashboardButton type="submit">
            Save Lead
          </DashboardButton>
        </div>
      </form>
    </div>
  );
}
