"use client";

import React, { useState } from "react";
import {
  FiTv,
  FiZap,
  FiBell,
  FiMail,
  FiBellOff,
} from "react-icons/fi";
import Text from "@/components/texts/text";
import SettingsDropdown from "@/components/shared/dropdown/settings-dropdown";
import { showError } from "@/lib/alerts";
import { showSavedToast } from "@/lib/toast";
import { apiRequest } from "@/lib/client-api";

// Channel options shared by every notification type
const channelOptions = [
  {
    value: "in-app-only",
    label: "In-App Only",
    icon: <FiTv className="w-4 h-4" />,
  },
  {
    value: "email-only",
    label: "Email Only",
    icon: <FiMail className="w-4 h-4" />,
  },
  {
    value: "in-app-email",
    label: "In-App and Email",
    icon: <FiBell className="w-4 h-4" />,
  },
  {
    value: "off",
    label: "Off",
    icon: <FiBellOff className="w-4 h-4 text-red-500" />,
  },
];

const NotificationsPage = () => {
  const [channels, setChannels] = useState({
    inAppNotifications: "in-app-email",
    aiInsightAlerts: "in-app-only",
  });
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    apiRequest("/api/v1/settings/notifications")
      .then((data) => setChannels(data.notifications))
      .catch((error) => showError("Notifications not loaded", error.message));
  }, []);

  const handleChannelChange = (key, value) => {
    setChannels((prev) => ({ ...prev, [key]: value }));
  };

  const saveNotifications = async () => {
    try {
      await apiRequest("/api/v1/settings/notifications", { method: "PUT", body: channels });
      setMessage("Preferences saved.");
      showSavedToast("Changes saved", "Your settings were updated successfully.");
    } catch (error) {
      setMessage(error.message);
      await showError("Notifications not saved", error.message);
    }
  };

  const notificationItems = [
    {
      key: "inAppNotifications",
      label: "In-App Notifications",
      description:
        "Receive important updates, reports, and announcements inside PitchProX.",
      icon: FiTv,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      key: "aiInsightAlerts",
      label: "AI Insights",
      description:
        "Get notified when PitchProX AI detects important opportunities or trends.",
      icon: FiZap,
      iconBg: "bg-emerald-50 text-emerald-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-light-gray shadow-sm">
      {/* Header */}
      <div className="p-6 md:p-8 pb-6 border-b border-light-gray">
        <Text variant="regular" className="font-bold">
          Notification Preferences
        </Text>
        <Text variant="smaller" className="mt-1">
          Manage how each notification reaches you — in-app, email, or both.
        </Text>
      </div>

      {/* Channel Selector List */}
      <div className="divide-y divide-light-gray px-6 md:px-8">
        {notificationItems.map((item) => {
          const Icon = item.icon;
          const selectedValue = channels[item.key];
          const isOff = selectedValue === "off";

          return (
            <div
              key={item.key}
              className="py-5 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4"
            >
              {/* Left Content (Icon + Labels) */}
              <div
                className={`flex items-start gap-4 max-w-xl transition-opacity duration-200 ${
                  isOff ? "opacity-50" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 transition-colors duration-200 ${
                    isOff ? "bg-light-gray text-light-black" : item.iconBg
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <Text variant="small" className="font-bold">
                    {item.label}
                  </Text>
                  <Text variant="smaller" className="mt-1">
                    {item.description}
                  </Text>
                </div>
              </div>

              {/* Right Content (Channel Selector) */}
              <div className="w-full 2xl:w-auto">
                <SettingsDropdown
                  label="Select Channel"
                  items={channelOptions}
                  selected={selectedValue}
                  onSelect={(value) => handleChannelChange(item.key, value)}
                  className="w-full sm:w-[220px]"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button Footer Bar */}
      <div className="p-6 md:p-8 bg-light-gray/50 border-t border-light-gray flex items-center justify-end gap-3 rounded-b-2xl">
        {message && <span className="text-xs font-medium text-primary">{message}</span>}
        <button
          type="button"
          onClick={saveNotifications}
          className="px-6 py-2.5 bg-primary hover:bg-medium-teal text-white text-xs font-semibold rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;
