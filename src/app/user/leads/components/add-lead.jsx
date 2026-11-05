"use client";

import React, { useState } from "react";
import { Trash2, ChevronDown, Check } from "lucide-react";
import { leadTypeOptions } from "@/utils.js/lead-options";
import { formatPhoneNumber } from "@/utils.js/phone";

const MAX_PHONE_NUMBERS = 6;

const AddNewLead = () => {
  // --- Form State ---
  const [fullName, setFullName] = useState("");
  const [phoneNumbers, setPhoneNumbers] = useState([
    "",
    "",
    "",
    "",
  ]);
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
  const [addToFollowUp, setAddToFollowUp] = useState(true);

  // --- Handlers ---
  const handlePhoneChange = (index, value) => {
    const updated = [...phoneNumbers];
    updated[index] = formatPhoneNumber(value);
    setPhoneNumbers(updated);
  };

  const handleRemovePhone = (index) => {
    if (phoneNumbers.length > 1) {
      setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
    }
  };

  const handleAddPhone = () => {
    if (phoneNumbers.length >= MAX_PHONE_NUMBERS) return;
    setPhoneNumbers([...phoneNumbers, ""]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      fullName,
      phoneNumbers,
      email,
      propertyAddress,
      city,
      state,
      zipCode,
      leadType,
      leadStage,
      status,
      outcome,
      notes,
      addToFollowUp,
    };
    console.log("Submitted Lead Data:", formData);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
        <span>Leads</span>
        <span>&rsaquo;</span>
        <span className="font-medium text-gray-800">Add New Lead</span>
      </div>

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
        <p className="text-xs text-gray-500 mt-1">
          Enter the details of the new prospect to start tracking their progress.
        </p>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* ================= Contact Information ================= */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-gray-900 tracking-tight">
            Contact Information
          </h2>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-800 placeholder-gray-400"
              required
            />
          </div>

          {/* Phone Numbers Row */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              {phoneNumbers.map((phone, idx) => (
                <div key={idx} className="space-y-1.5 w-full">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">
                      Phone Number {idx + 1}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemovePhone(idx)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove phone"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="(213) 555-1234"
                    value={phone}
                    onChange={(e) => handlePhoneChange(idx, e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-800 placeholder-gray-400"
                  />
                </div>
              ))}

              {/* Add More Phone Button */}
              <div className="w-full">
                <button
                  type="button"
                  onClick={handleAddPhone}
                  disabled={phoneNumbers.length >= MAX_PHONE_NUMBERS}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-teal-600"
                >
                  Add more
                </button>
                {phoneNumbers.length >= MAX_PHONE_NUMBERS && (
                  <p className="mt-2 text-[10px] font-medium text-gray-400">
                    Maximum {MAX_PHONE_NUMBERS} phone numbers
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-800 placeholder-gray-400"
            />
          </div>
        </section>

        {/* ================= Property Information ================= */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xs font-bold text-gray-900 tracking-tight">
            Property Information
          </h2>

          {/* Property Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Property Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter property address"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-800 placeholder-gray-400"
              required
            />
          </div>

          {/* City, State, Zip Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                City
              </label>
              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                State
              </label>
              <div className="relative">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-400 appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  <option value="NY" className="text-gray-800">New York</option>
                  <option value="CA" className="text-gray-800">California</option>
                  <option value="FL" className="text-gray-800">Florida</option>
                  <option value="TX" className="text-gray-800">Texas</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Zip Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Zip Code
              </label>
              <input
                type="text"
                placeholder="Enter zip code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Lead Type */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-gray-700">
              Lead Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={leadType}
                onChange={(e) => setLeadType(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-400 appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>
                  Select lead type
                </option>
                {leadTypeOptions.map((type) => (
                  <option key={type.value} value={type.value} className="text-gray-800">
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ================= Lead Classification ================= */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xs font-bold text-gray-900 tracking-tight">
            Lead Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Lead Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Lead Stage
              </label>
              <div className="relative">
                <select
                  value={leadStage}
                  onChange={(e) => setLeadStage(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Attempted">Attempted</option>
                  <option value="Contacted">Contacted</option>
                  <option value="In Conversation">In Conversation</option>
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Appointment Set">Appointment Set</option>
                  <option value="Archived">Archived</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-800 appearance-none cursor-pointer"
                >
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                  <option value="Unknown">Unknown</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Outcome */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                Outcome
              </label>
              <div className="relative">
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-400 appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select outcome
                  </option>
                  <option value="Appointment Set" className="text-gray-800">Appointment Set</option>
                  <option value="Follow-Up Required" className="text-gray-800">Follow-Up Required</option>
                  <option value="Information Requested" className="text-gray-800">Information Requested</option>
                  <option value="Not Interested" className="text-gray-800">Not Interested</option>
                  <option value="Not a Fit" className="text-gray-800">Not a Fit</option>
                  <option value="No Answer" className="text-gray-800">No Answer</option>
                  <option value="Voicemail" className="text-gray-800">Voicemail</option>
                  <option value="Wrong Number" className="text-gray-800">Wrong Number</option>
                  <option value="Do Not Contact" className="text-gray-800">Do Not Contact</option>
                  <option value="Other" className="text-gray-800">Other</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ================= Additional Information ================= */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xs font-bold text-gray-900 tracking-tight">
            Additional Information
          </h2>

          {/* Notes Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Notes
            </label>
            <div className="relative">
              <textarea
                rows={4}
                maxLength={500}
                placeholder="Add any notes about this lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors text-gray-800 placeholder-gray-400 resize-none"
              />
              <span className="absolute right-3 bottom-3 text-[10px] text-gray-400">
                {notes.length} / 500
              </span>
            </div>
          </div>

          {/* Checkbox: Add to follow-up queue */}
          <div className="flex items-start gap-3 pt-2">
            <button
              type="button"
              onClick={() => setAddToFollowUp(!addToFollowUp)}
              className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                addToFollowUp
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {addToFollowUp && <Check className="h-3 w-3 stroke-[3]" />}
            </button>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-800">
                Add to follow-up queue
              </span>
              <span className="text-[11px] text-gray-400">
                This lead will be added to your follow-up queue.
              </span>
            </div>
          </div>
        </section>

        {/* ================= Form Footer Buttons ================= */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            className="px-5 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddNewLead;