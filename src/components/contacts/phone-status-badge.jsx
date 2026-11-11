"use client";

import React from "react";
import { PHONE_STATUSES } from "@/utils.js/phone-status";

const TONES = {
  gray: "bg-light-gray text-medium-black border-light-gray",
  green: "bg-emerald-50 text-emerald-700 border-emerald-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  red: "bg-red/10 text-red border-red/20",
};

export default function PhoneStatusBadge({ status, className = "" }) {
  const option = PHONE_STATUSES.find((item) => item.value === status) ?? PHONE_STATUSES[0];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${TONES[option.tone]} ${className}`}>{option.label}</span>;
}
