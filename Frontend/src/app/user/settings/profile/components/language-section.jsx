"use client";

import React, { useState, useMemo } from "react";
import { FiGlobe } from "react-icons/fi";
import { Compass } from "lucide-react";
import DashboardButton from "@/components/buttons/dashboardButton";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import Text from "@/components/texts/text";

// -- Language --
// PitchProX currently supports English only, so the dropdown stays locked
// until additional languages are added.
const languageOptions = [{ value: "en-US", label: "English (United States)" }];

// -- Timezone --
const US_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "America/Phoenix", label: "Arizona Time" },
];

const detectTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
};

const gmtOffset = (timeZone) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || "GMT";
  } catch {
    return "GMT";
  }
};

const LanguageSection = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [selectedTimezone, setSelectedTimezone] = useState("auto-detect");

  const timezoneItems = useMemo(() => {
    const detected = detectTimezone();
    const items = [
      {
        value: "auto-detect",
        label: detected
          ? `Auto-detect timezone (${detected})`
          : "Auto-detect timezone",
        icon: <Compass className="w-4 h-4" />,
      },
      { type: "divider" },
      ...US_TIMEZONES.map((tz) => ({
        value: tz.value,
        label: `${tz.label} (${gmtOffset(tz.value)})`,
      })),
    ];

    // Full IANA list under "More Timezones"
    let allTimezones = [];
    try {
      allTimezones = Intl.supportedValuesOf("timeZone");
    } catch {
      allTimezones = [];
    }
    const excluded = new Set([
      "auto-detect",
      ...US_TIMEZONES.map((tz) => tz.value),
    ]);
    const moreTimezones = allTimezones.filter((tz) => !excluded.has(tz));

    if (moreTimezones.length > 0) {
      items.push({ type: "header", label: "More Timezones" });
      moreTimezones.forEach((tz) =>
        items.push({ value: tz, label: `${tz} (${gmtOffset(tz)})` })
      );
    }

    return items;
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-light-gray p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
          <FiGlobe className="w-5 h-5" />
        </div>
        <div>
          <Text variant="regular" className="font-bold">Language & Region</Text>
          <Text variant="smaller" className="mt-0.5">
            Customize your language and regional settings.
          </Text>
        </div>
      </div>

      {/* Select Options — top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-medium-black mb-1.5">
            Language
          </label>
          <SettingsDropdown
            label="Select Language"
            items={languageOptions}
            selected={selectedLanguage}
            onSelect={setSelectedLanguage}
            className="w-full"
            disabled
          />
          <p className="mt-1.5 text-[11px] font-medium text-light-black">
            Only English is supported at this time - more languages coming soon.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-medium-black mb-1.5">
            Timezone
          </label>
          <SettingsDropdown
            label="Select Timezone"
            items={timezoneItems}
            selected={selectedTimezone}
            onSelect={setSelectedTimezone}
            className="w-full"
          />
        </div>
      </div>

      {/* Save Button — bottom-right */}
      <div className="flex justify-end">
        <DashboardButton className="whitespace-nowrap w-full sm:w-auto">
          Save Changes
        </DashboardButton>
      </div>
    </div>
  );
};

export default LanguageSection;